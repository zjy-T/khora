"use client";

import { BEAD_BY_SLUG } from "@/lib/beads";
import type { BeadPlacement } from "./BraceletPreview";
import { useI18n } from "@/components/i18n/LanguageProvider";

/**
 * BeadPlate — the live bracelet preview.
 *
 * A blank bracelet (a thin cord ring) onto which the chosen stones are strung.
 * No physics, no photographic plate, no SKU images: each bead is a CSS-rendered
 * gemstone sphere placed around the loop. Everything is computed in real
 * millimetres, then scaled to the (square) container — so two 10 mm beads are
 * always the same on-screen size, and the beads pack edge-to-edge with accurate
 * spacing as the strand fills toward the bracelet's capacity.
 *
 * Layout model
 * ────────────
 * The cord forms a circle whose circumference equals the bracelet's inner loop
 * (`circumferenceMm`). Each bead occupies an arc equal to its own diameter, so
 * neighbours touch. The strand is centred at the top of the ring and grows
 * symmetrically; when the total bead diameter reaches the circumference the loop
 * closes. When no circumference is supplied (e.g. an AI-composed sequence) the
 * beads themselves define a closed loop.
 */

const REF_MM = 10; // fallback diameter when a stone has none
const MAX_BEAD_MM = 14; // headroom so the largest bead never clips the canvas
const PAD_MM = 6; // breathing room around the ring (each side)
const TWO_PI = Math.PI * 2;

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  beads: BeadPlacement[];
  /** Bracelet inner-loop circumference in mm. Anchors the visual scale and the
   *  fill fraction. When omitted, the beads define their own closed loop. */
  circumferenceMm?: number | null;
  activeKey?: string | null;
  onSelect?: (p: BeadPlacement, idx: number) => void;
};

// ── CSS gemstone sphere ─────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h.padEnd(6, "0").slice(0, 6);
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function mix([r, g, b]: [number, number, number], t: number, toward: number) {
  const m = (c: number) => Math.round(c + (toward - c) * t);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

/** A polished sphere: top-left specular, all-round rim, shaded body. */
function sphereBackground(color: string): string {
  const rgb = hexToRgb(color);
  const light = mix(rgb, 0.55, 255);
  const mid = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  const dark = mix(rgb, 0.5, 0);
  const deep = mix(rgb, 0.74, 0);
  return [
    // hot specular catch-light
    "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 26%)",
    // edge rim to round the silhouette
    "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.32) 100%)",
    // shaded body, lit from upper-left
    `radial-gradient(circle at 32% 30%, ${light} 0%, ${mid} 46%, ${dark} 82%, ${deep} 100%)`,
  ].join(", ");
}

export function BeadPlate({
  beads,
  circumferenceMm,
  activeKey,
  onSelect,
}: Props) {
  const { t } = useI18n();

  const sized = beads.map((b) => ({
    ...b,
    d: BEAD_BY_SLUG[b.slug]?.diameterMm ?? REF_MM,
    color: BEAD_BY_SLUG[b.slug]?.color ?? "#8c7e6c",
    name: BEAD_BY_SLUG[b.slug]?.westernName ?? b.slug,
  }));

  const usedMm = sized.reduce((s, b) => s + b.d, 0);

  // Circumference that anchors the scale: the real bracelet loop, or — absent a
  // wrist size — the beads' own total so they form a closed ring.
  const circ = Math.max(circumferenceMm ?? usedMm, 1);
  const R = circ / TWO_PI; // cord radius (mm)
  const S = 2 * R + MAX_BEAD_MM + PAD_MM * 2; // design-square side (mm)
  const C = S / 2; // centre of the square (mm)
  const pct = (v: number) => (v / S) * 100;

  // Strand spans an arc proportional to how full the bracelet is, centred on top.
  const fillFrac = Math.min(usedMm / circ, 1);
  const arcTotal = fillFrac * TWO_PI;
  const startAngle = -Math.PI / 2 - arcTotal / 2;

  // Place each bead's centre by cumulative arc length (→ neighbours touch).
  let acc = 0;
  const placed = sized.map((b) => {
    const centerLen = acc + b.d / 2;
    const theta = startAngle + centerLen / R; // arc / radius = angle
    acc += b.d;
    return {
      ...b,
      x: C + R * Math.cos(theta),
      y: C + R * Math.sin(theta),
    };
  });

  const ringDiaPct = pct(2 * R);

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: 1, overflow: "visible" }}
    >
      {/* The bracelet cord — a blank loop the stones are strung onto. */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: `${ringDiaPct}%`,
          height: `${ringDiaPct}%`,
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(122,116,108,0.28)",
          boxShadow: "inset 0 0 0 0.5px rgba(122,116,108,0.12)",
        }}
      />

      {/* Empty-state hint */}
      {placed.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p
            className="text-center uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "rgba(122,116,108,0.55)",
            }}
          >
            {t.builder.circleAwaits}
          </p>
        </div>
      )}

      {/* Strung beads. Pure CSS so rapid adds never leave a bead mis-scaled:
          the positioner handles seating (translate + a left/top transition) and
          an inner sphere plays a one-shot pop-in on mount. */}
      {placed.map((b, idx) => {
        const isActive = activeKey === b.key;
        const dPct = pct(b.d);
        return (
          <button
            key={b.key}
            type="button"
            onClick={() => onSelect?.(b, idx)}
            aria-label={b.name}
            className="absolute"
            style={{
              left: `${pct(b.x)}%`,
              top: `${pct(b.y)}%`,
              width: `${dPct}%`,
              height: `${dPct}%`,
              transform: "translate(-50%, -50%)",
              padding: 0,
              border: "none",
              background: "transparent",
              borderRadius: "50%",
              cursor: onSelect ? "pointer" : "default",
              // Re-seat smoothly as the strand re-centres while filling.
              transition:
                "left 0.45s cubic-bezier(0.22,1,0.36,1), top 0.45s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <span
              aria-hidden
              className="block h-full w-full"
              style={{
                borderRadius: "50%",
                background: sphereBackground(b.color),
                boxShadow: isActive
                  ? "0 3px 8px rgba(0,0,0,0.4), 0 0 0 2px rgba(240,236,228,0.85)"
                  : "0 3px 7px rgba(0,0,0,0.35)",
                animation: "beadPop 0.4s cubic-bezier(0.22,1,0.36,1) both",
                transformOrigin: "center",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
