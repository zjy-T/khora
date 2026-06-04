"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { BEAD_BY_SLUG } from "@/lib/beads";
import type { BeadPlacement } from "./BraceletPreview";

// ─── PBR material configs per stone slug ──────────────────────────────────
// All properties map 1:1 to Three.js MeshPhysicalMaterial.
// Transmission + thickness enables real-time subsurface refraction for crystals.

type MatCfg = {
  color: string;
  roughness: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  thickness?: number;
  ior?: number;
  attenuationColor?: string;
  attenuationDistance?: number;
  iridescence?: number;
  iridescenceIOR?: number;
  envMapIntensity?: number;
};

const MATS: Record<string, MatCfg> = {
  "black-obsidian": {
    color: "#06060a",
    roughness: 0.03,
    metalness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 3.0,
  },
  "gold-sheen-obsidian": {
    color: "#0e0c08",
    roughness: 0.04,
    metalness: 0.10,
    clearcoat: 0.9,
    clearcoatRoughness: 0.03,
    iridescence: 0.7,
    iridescenceIOR: 1.9,
    envMapIntensity: 2.8,
  },
  "amethyst": {
    color: "#6A3C96",
    roughness: 0.03,
    metalness: 0,
    transmission: 0.40,
    thickness: 0.8,
    ior: 1.55,
    clearcoat: 0.8,
    clearcoatRoughness: 0.04,
    attenuationColor: "#B080E0",
    attenuationDistance: 0.6,
    envMapIntensity: 2.2,
  },
  "nephrite-jade": {
    color: "#2A5C36",
    roughness: 0.06,
    metalness: 0,
    transmission: 0.14,
    thickness: 0.5,
    ior: 1.66,
    clearcoat: 0.6,
    clearcoatRoughness: 0.06,
    attenuationColor: "#4A9A5A",
    attenuationDistance: 0.4,
    envMapIntensity: 2.0,
  },
  "rutilated-quartz": {
    color: "#C8A050",
    roughness: 0.03,
    metalness: 0,
    transmission: 0.50,
    thickness: 0.8,
    ior: 1.55,
    clearcoat: 0.8,
    clearcoatRoughness: 0.03,
    attenuationColor: "#FFDA80",
    attenuationDistance: 0.5,
    envMapIntensity: 2.2,
  },
  "citrine": {
    color: "#C48A08",
    roughness: 0.03,
    metalness: 0,
    transmission: 0.45,
    thickness: 0.7,
    ior: 1.55,
    clearcoat: 0.9,
    clearcoatRoughness: 0.03,
    attenuationColor: "#FFC840",
    attenuationDistance: 0.4,
    envMapIntensity: 2.2,
  },
  "clear-quartz": {
    color: "#D8D8E8",
    roughness: 0.01,
    metalness: 0,
    transmission: 0.90,
    thickness: 1.0,
    ior: 1.46,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 3.0,
  },
  "smoky-quartz": {
    color: "#2E2420",
    roughness: 0.04,
    metalness: 0,
    transmission: 0.28,
    thickness: 0.6,
    ior: 1.54,
    clearcoat: 0.7,
    clearcoatRoughness: 0.05,
    attenuationColor: "#6A5040",
    attenuationDistance: 0.5,
    envMapIntensity: 2.0,
  },
  "red-agate": {
    color: "#7A1A1A",
    roughness: 0.07,
    metalness: 0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.8,
  },
  "black-hair-crystal": {
    color: "#18181E",
    roughness: 0.03,
    metalness: 0.02,
    transmission: 0.25,
    thickness: 0.6,
    ior: 1.55,
    clearcoat: 0.9,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.5,
  },
  "rose-quartz": {
    color: "#CC8898",
    roughness: 0.05,
    metalness: 0,
    transmission: 0.30,
    thickness: 0.6,
    ior: 1.54,
    clearcoat: 0.7,
    clearcoatRoughness: 0.05,
    attenuationColor: "#FFB8C8",
    attenuationDistance: 0.7,
    envMapIntensity: 2.0,
  },
  "tiger-eye": {
    color: "#7A5420",
    roughness: 0.13,
    metalness: 0.03,
    clearcoat: 0.35,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.8,
  },
  "lapis-lazuli": {
    color: "#1A3570",
    roughness: 0.09,
    metalness: 0.04,
    clearcoat: 0.4,
    clearcoatRoughness: 0.09,
    envMapIntensity: 1.8,
  },
};

const DEFAULT_MAT: MatCfg = {
  color: "#7A6C5E",
  roughness: 0.10,
  metalness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.5,
};

// ─── Ring geometry ─────────────────────────────────────────────────────────
// Zero-gap formula: use chord distance (not arc) for perfect bead abutment.
// chord = 2R × sin(π/n) = diameter  →  R = diameter / (2 × sin(π/n))
// We target a fixed ring radius and derive bead size from it.

const TARGET_RING_R = 1.38; // Three.js units

function computeRing(n: number): { radius: number; beadRadius: number } {
  if (n === 0) return { radius: TARGET_RING_R, beadRadius: 0.24 };
  // Ideal bead radius for this count at the target ring radius
  const rawBR = TARGET_RING_R * Math.sin(Math.PI / n);
  // Clamp to sensible jewelry bead sizes
  const beadRadius = Math.max(0.14, Math.min(0.52, rawBR));
  // If clamped, recompute actual ring radius so beads still touch
  const actualR = beadRadius / Math.sin(Math.PI / n);
  return { radius: actualR, beadRadius };
}

// ─── Camera: adjusts dynamically to the ring's actual size ───────────────

function DynamicCamera({ ringRadius }: { ringRadius: number }) {
  const { camera } = useThree();
  useEffect(() => {
    // Keep the ring filling ~70 % of the viewport regardless of bead count
    const dist  = Math.max(5.0, ringRadius * 3.4);
    const height = dist * 0.82;
    camera.position.set(0, height, dist);
    camera.lookAt(0, 0, 0);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, ringRadius]);
  return null;
}

// ─── Individual bead mesh ─────────────────────────────────────────────────

type BeadProps = {
  position: [number, number, number];
  slug: string;
  radius: number;
  active: boolean;
  accentColor: string;
  onSelect: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
};

function BeadMesh({ position, slug, radius, active, accentColor, onSelect, onHoverIn, onHoverOut }: BeadProps) {
  const cfg = MATS[slug] ?? DEFAULT_MAT;
  const meshRef = useRef<THREE.Mesh>(null);

  // Subtle scale-up on active
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = active ? 1.10 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      Math.min(1, delta * 10),
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerEnter={(e) => { e.stopPropagation(); onHoverIn(); document.body.style.cursor = "pointer"; }}
      onPointerLeave={(e) => { e.stopPropagation(); onHoverOut(); document.body.style.cursor = "auto"; }}
      castShadow
    >
      {/* High-poly sphere so specular highlights read cleanly */}
      <sphereGeometry args={[radius, 128, 128]} />
      <meshPhysicalMaterial
        color={cfg.color}
        roughness={cfg.roughness}
        metalness={cfg.metalness ?? 0}
        clearcoat={cfg.clearcoat ?? 0}
        clearcoatRoughness={cfg.clearcoatRoughness ?? 0.05}
        transmission={cfg.transmission ?? 0}
        thickness={cfg.thickness ?? 0}
        ior={cfg.ior ?? 1.5}
        attenuationColor={cfg.attenuationColor ?? "#ffffff"}
        attenuationDistance={cfg.attenuationDistance ?? Infinity}
        iridescence={cfg.iridescence ?? 0}
        iridescenceIOR={cfg.iridescenceIOR ?? 1.3}
        envMapIntensity={cfg.envMapIntensity ?? 1.5}
        // Active selection: thin luminous ring via emissive
        emissive={active ? new THREE.Color(accentColor) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={active ? 0.35 : 0}
      />
    </mesh>
  );
}

// ─── Bracelet ring with auto-orbit ─────────────────────────────────────────

type SceneProps = {
  beads: BeadPlacement[];
  activeKey?: string | null;
  onHover?: (p: BeadPlacement | null) => void;
  onSelect?: (p: BeadPlacement, idx: number) => void;
};

function BraceletScene({ beads, activeKey, onHover, onSelect }: SceneProps) {
  const groupRef     = useRef<THREE.Group>(null);
  const isOrbiting   = useRef(false);
  const count        = beads.length;

  const { radius, beadRadius } = useMemo(() => computeRing(count), [count]);

  // 3D ring positions: equally spaced on a circle in the XZ plane.
  // Zero-gap guaranteed: positions are separated by exactly one bead diameter.
  const positions = useMemo<[number, number, number][]>(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / Math.max(count, 1)) * Math.PI * 2;
      return [radius * Math.cos(angle), 0, radius * Math.sin(angle)];
    }),
    [count, radius],
  );

  // Auto-orbit: smooth 20 °/s spin, pauses while user drags
  useFrame((_, delta) => {
    if (groupRef.current && !isOrbiting.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <>
      <DynamicCamera ringRadius={radius} />

      {/* Bracelet bead ring */}
      <group ref={groupRef}>
        {beads.map((placement, i) => {
          const stone = BEAD_BY_SLUG[placement.slug];
          if (!stone || !positions[i]) return null;
          return (
            <BeadMesh
              key={placement.key}
              position={positions[i]}
              slug={placement.slug}
              radius={beadRadius}
              active={activeKey === placement.key}
              accentColor={stone.color}
              onSelect={() => onSelect?.(placement, i)}
              onHoverIn={() => onHover?.(placement)}
              onHoverOut={() => onHover?.(null)}
            />
          );
        })}

        {/* Ghost ring when empty */}
        {count === 0 && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[TARGET_RING_R, 0.018, 24, 120]} />
            <meshStandardMaterial color="#C0B090" opacity={0.22} transparent />
          </mesh>
        )}
      </group>

      {/* Soft studio contact shadow on the floor plane */}
      <ContactShadows
        position={[0, -(beadRadius + 0.02), 0]}
        opacity={0.60}
        blur={2.8}
        far={4.0}
        scale={10}
        color="#2A1E10"
      />

      {/* OrbitControls: pause auto-spin during drag, resume on release */}
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI * 0.46}
        enableDamping
        dampingFactor={0.08}
        onStart={() => { isOrbiting.current = true; }}
        onEnd={() => { isOrbiting.current = false; }}
      />
    </>
  );
}

// ─── Exported canvas wrapper ───────────────────────────────────────────────

type Props = SceneProps & { removable?: boolean };

export default function BraceletScene3D({ beads, activeKey, onHover, onSelect }: Props) {
  return (
    <Canvas
      // Shallow default camera — DynamicCamera overrides position after mount
      camera={{ position: [0, 5, 6], fov: 35, near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
        // Needed for correct transmission material rendering
        alpha: false,
      }}
      // No scene background — CSS handles the canvas container colour
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color("#F4F3EF"), 1);
        scene.background = new THREE.Color("#F4F3EF");
      }}
    >
      {/* Studio environment baked entirely in-GPU — no external network request.
          Lightformers are rendered into a 256px equirectangular cube map that
          MeshPhysicalMaterial uses for reflections, specular and transmission. */}
      <Environment resolution={256} background={false}>
        {/* Primary overhead key light — large soft box from above-behind */}
        <Lightformer intensity={3.2} position={[0, 6, -5]} scale={[14, 10, 1]} color="#FFFFFF" />
        {/* Front fill — warm, slightly from below viewer angle */}
        <Lightformer intensity={1.6} position={[0, 1, 7]}  scale={[12, 7, 1]}  color="#FFF6EE" />
        {/* Left rim — cool blue for contrast */}
        <Lightformer intensity={0.9} position={[-6, 3, 0]} scale={[4, 10, 1]} color="#DDE8FF" />
        {/* Right warm accent */}
        <Lightformer intensity={0.7} position={[6, 3, 0]}  scale={[4, 10, 1]} color="#FFE8D8" />
        {/* Ground bounce — lifts the shadow side of transmission stones */}
        <Lightformer intensity={0.45} position={[0, -4, 0]} scale={[14, 1, 14]} color="#EDE8DC" />
      </Environment>

      {/* Minimal supplemental fill lights so shadow sides aren't pure black */}
      <ambientLight intensity={0.12} color="#FFF5E8" />
      <directionalLight position={[3, 5, 3]} intensity={0.25} color="#FFFFFF" />
      <directionalLight position={[-2, 3, -2]} intensity={0.10} color="#D8E8FF" />

      <BraceletScene
        beads={beads}
        activeKey={activeKey}
        onHover={onHover}
        onSelect={onSelect}
      />
    </Canvas>
  );
}
