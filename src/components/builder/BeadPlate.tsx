"use client";

import { useEffect, useRef } from "react";
import { BEAD_BY_SLUG } from "@/lib/beads";
import type { BeadPlacement } from "./BraceletPreview";
import { useI18n } from "@/components/i18n/LanguageProvider";

/**
 * BeadPlate — a real, interactive crafting bench.
 *
 * Beads are a live 2D physics simulation (Matter.js). The carved groove of the
 * wooden board is a collision constraint, not a decoration: beads dropped from
 * above LAND in the channel, then ROLL toward the settling point and physically
 * PUSH their neighbours through contact (no magnetic gliding).
 *
 * Physics runs in a fixed top-down "logical" space (a 500-unit square). For the
 * 45° look we PROJECT every logical point onto the photo's foreshortened ellipse
 * at render time — so collisions stay correct while the strand visually lies in
 * the angled groove of /images/wooden-plate-bench.jpg.
 */

// ───────────────────────────────────────────────────────────────────────────
// TRACK CALIBRATION  ·  align the invisible groove to the photo (500-unit canvas).
//   centerX / centerY → centre of the carved groove on the board
//   radiusX           → groove radius (also the logical physics radius)
//   radiusY           → on-screen vertical radius; radiusY/radiusX = the 45° tilt
//                       (smaller ratio = more foreshortened / steeper angle)
// Nudge these four until the strand sits inside the channel of your board art.
// ───────────────────────────────────────────────────────────────────────────
const TRACK_CALIBRATION = {
  centerX: 245, // groove centre X on the 45° board photo
  centerY: 262, // groove centre Y (a touch low — the tray sits below image centre)
  radiusX: 150, // groove radius
  radiusY: 125, // vertical radius — radiusY/radiusX ≈ 0.83 matches THIS photo's tilt
};

const DESIGN = 500; // logical canvas side (physics + calibration units)
const BEAD_BASE_DIAMETER = 52; // logical Ø of a REF_MM (10 mm) bead
const REF_MM = 10;
const PLATE_ASPECT = 1; // board photo width ÷ height

// Derived logical-space constants (all in the 500-unit canvas).
const LCX = TRACK_CALIBRATION.centerX;
const LCY = TRACK_CALIBRATION.centerY;
const LR = TRACK_CALIBRATION.radiusX; // groove radius (logical)
const FORESHORTEN = TRACK_CALIBRATION.radiusY / TRACK_CALIBRATION.radiusX;

// ── Physics tunables (logical units) ───────────────────────────────────────
const ANCHOR_ANGLE = -Math.PI / 2; // where beads settle: -π/2 = back rim (top) of groove
const K_RADIAL = 0.0022; // pull onto the groove centre-line (the channel walls)
const K_GATHER = 0.0019; // pull along the groove toward the anchor (roll + tight packing)
const MAX_SPEED = 12; // velocity cap (prevents collision blow-ups)
const DROP_MS = 460; // fall-from-sky duration
const LAND_NUDGE = 4.5; // inward speed a landed bead carries → it pushes the pile

// Shadow (blended into the wood via a multiply layer).
const SHADOW_DX = 6;
const SHADOW_DY = 12;
const SHADOW_BLUR = 8;
const SHADOW_OPACITY = 0.5;

type Props = {
  beads: BeadPlacement[];
  activeKey?: string | null;
  onSelect?: (p: BeadPlacement, idx: number) => void;
};

function beadRadiusLogical(slug: string): number {
  const mm = BEAD_BY_SLUG[slug]?.diameterMm ?? REF_MM;
  return ((mm / REF_MM) * BEAD_BASE_DIAMETER) / 2;
}

// Signed smallest difference a−b, wrapped to [−π, π].
function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Logical groove point for an angle.
function groovePoint(angle: number): { x: number; y: number } {
  return { x: LCX + LR * Math.cos(angle), y: LCY + LR * Math.sin(angle) };
}

export function BeadPlate({ beads, activeKey, onSelect }: Props) {
  const { t } = useI18n();

  // DOM / physics refs (mutated outside React render).
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const MatterRef = useRef<typeof import("matter-js") | null>(null);
  const engineRef = useRef<import("matter-js").Engine | null>(null);
  const bodiesRef = useRef<Map<string, import("matter-js").Body>>(new Map());
  const droppingRef = useRef<
    Map<string, { start: number; landAngle: number }>
  >(new Map());
  const metaRef = useRef<Map<string, { slug: string; r: number }>>(new Map());
  const entryRef = useRef<Map<string, number>>(new Map());
  const nodeRef = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const shadowRef = useRef<Map<string, HTMLElement | null>>(new Map());
  const rafRef = useRef<number | null>(null);

  // ── Boot the physics engine once. ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (el) sizeRef.current = { w: el.clientWidth, h: el.clientHeight };
    const ro = new ResizeObserver(() => {
      if (el) sizeRef.current = { w: el.clientWidth, h: el.clientHeight };
    });
    if (el) ro.observe(el);

    (async () => {
      const Matter = await import("matter-js");
      if (cancelled) return;
      MatterRef.current = Matter;

      const engine = Matter.Engine.create();
      engine.gravity.x = 0;
      engine.gravity.y = 0; // top-down — no global gravity; we steer with forces
      engineRef.current = engine;

      // Forces: hold beads in the channel + gather them toward the anchor.
      Matter.Events.on(engine, "beforeUpdate", () => {
        for (const [, body] of bodiesRef.current) {
          const dx = body.position.x - LCX;
          const dy = body.position.y - LCY;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const ox = dx / dist;
          const oy = dy / dist;
          // Radial spring → snap onto the groove centre-line.
          const fr = (LR - dist) * K_RADIAL * body.mass;
          // Tangential gather → roll toward the settling anchor.
          const theta = Math.atan2(dy, dx);
          const tx = -Math.sin(theta);
          const ty = Math.cos(theta);
          const fg = -angleDiff(theta, ANCHOR_ANGLE) * K_GATHER * body.mass;
          Matter.Body.applyForce(body, body.position, {
            x: ox * fr + tx * fg,
            y: oy * fr + ty * fg,
          });
        }
      });

      // After integration: cap speed + hard-clamp inside the channel walls.
      Matter.Events.on(engine, "afterUpdate", () => {
        for (const [key, body] of bodiesRef.current) {
          const sp = Math.hypot(body.velocity.x, body.velocity.y);
          if (sp > MAX_SPEED) {
            const s = MAX_SPEED / sp;
            Matter.Body.setVelocity(body, {
              x: body.velocity.x * s,
              y: body.velocity.y * s,
            });
          }
          const r = metaRef.current.get(key)?.r ?? 26;
          const dx = body.position.x - LCX;
          const dy = body.position.y - LCY;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const maxOff = r * 0.9; // groove channel half-width
          if (Math.abs(dist - LR) > maxOff) {
            const target = LR + Math.sign(dist - LR) * maxOff;
            Matter.Body.setPosition(body, {
              x: LCX + (dx / dist) * target,
              y: LCY + (dy / dist) * target,
            });
          }
        }
      });

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      // Promote finished drops into the physics world.
      const promote = (key: string, landAngle: number) => {
        const meta = metaRef.current.get(key);
        if (!meta) return;
        const p = groovePoint(landAngle);
        const body = Matter.Bodies.circle(p.x, p.y, meta.r, {
          restitution: 0.05,
          friction: 0.1,
          frictionAir: 0.06,
          density: 0.001,
        });
        // Carry a little inward speed so it presses (pushes) into the strand.
        const toAnchor = -Math.sign(angleDiff(landAngle, ANCHOR_ANGLE)) || 1;
        const tx = -Math.sin(landAngle) * toAnchor;
        const ty = Math.cos(landAngle) * toAnchor;
        Matter.Body.setVelocity(body, { x: tx * LAND_NUDGE, y: ty * LAND_NUDGE });
        bodiesRef.current.set(key, body);
        entryRef.current.set(key, performance.now());
        Matter.World.add(engine.world, body);
      };

      // ── Per-frame DOM sync (transform only, no React re-render). ────────────
      const sync = () => {
        const { w, h } = sizeRef.current;
        if (w > 0) {
          const sxv = w / DESIGN;
          const syv = h / DESIGN;
          const mean = (sxv + syv) / 2;
          const dropH = h * 0.62;
          const now = performance.now();

          const project = (lx: number, ly: number) => {
            const lyc = LCY + (ly - LCY) * FORESHORTEN; // foreshorten in logical Y
            return { x: lx * sxv, y: lyc * syv };
          };

          const place = (
            key: string,
            cxPx: number,
            cyPx: number,
            r: number,
            scale: number,
            z: number,
          ) => {
            const dPx = 2 * r * mean * scale;
            const node = nodeRef.current.get(key);
            if (node) {
              node.style.width = `${dPx}px`;
              node.style.height = `${dPx}px`;
              node.style.left = `${cxPx}px`;
              node.style.top = `${cyPx}px`;
              node.style.transform = "translate(-50%, -50%)";
              node.style.zIndex = String(z);
              node.style.opacity = "1";
            }
            const sh = shadowRef.current.get(key);
            if (sh) {
              sh.style.width = `${dPx}px`;
              sh.style.height = `${dPx}px`;
              sh.style.left = `${cxPx + SHADOW_DX}px`;
              sh.style.top = `${cyPx + SHADOW_DY}px`;
              sh.style.transform = "translate(-50%, -50%)";
              sh.style.opacity = String(SHADOW_OPACITY);
            }
          };

          // 1) Falling beads (not yet physical).
          for (const [key, d] of droppingRef.current) {
            const tt = (now - d.start) / DROP_MS;
            if (tt >= 1) {
              droppingRef.current.delete(key);
              promote(key, d.landAngle);
              continue;
            }
            const e = easeOutCubic(Math.max(0, tt));
            const meta = metaRef.current.get(key);
            const r = meta?.r ?? 26;
            const land = project(...(Object.values(groovePoint(d.landAngle)) as [number, number]));
            const y = land.y - dropH * (1 - e);
            const scale = 1 + 0.3 * (1 - e);
            place(key, land.x, y, r, scale, 9000);
          }

          // 2) Physical beads.
          for (const [key, body] of bodiesRef.current) {
            const meta = metaRef.current.get(key);
            const r = meta?.r ?? 26;
            const proj = project(body.position.x, body.position.y);
            // Subtle entry pop.
            let scale = 1;
            const en = entryRef.current.get(key);
            if (en !== undefined) {
              const p = Math.min((now - en) / 260, 1);
              scale = 1 + 0.18 * (1 - easeOutCubic(p));
              if (p >= 1) entryRef.current.delete(key);
            }
            // Depth cue: beads nearer the viewer (front) read slightly larger.
            const depth = 1 + ((body.position.y - LCY) / LR) * 0.12;
            const z = 1000 + Math.round(proj.y);
            place(key, proj.x, proj.y, r, scale * depth, z);
          }
        }
        rafRef.current = requestAnimationFrame(sync);
      };
      rafRef.current = requestAnimationFrame(sync);
    })();

    return () => {
      cancelled = true;
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const Matter = MatterRef.current;
      const engine = engineRef.current;
      if (Matter && engine) {
        Matter.Events.off(engine, "beforeUpdate");
        Matter.Events.off(engine, "afterUpdate");
        Matter.World.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      bodiesRef.current.clear();
      droppingRef.current.clear();
    };
  }, []);

  // ── Reconcile physics with the placements array. ───────────────────────────
  useEffect(() => {
    const Matter = MatterRef.current;
    const engine = engineRef.current;
    const live = new Set(beads.map((b) => b.key));

    // Remove bodies/drops for beads that were taken off.
    for (const key of [...bodiesRef.current.keys()]) {
      if (live.has(key)) continue;
      const body = bodiesRef.current.get(key);
      if (Matter && engine && body) Matter.World.remove(engine.world, body);
      bodiesRef.current.delete(key);
      metaRef.current.delete(key);
      entryRef.current.delete(key);
    }
    for (const key of [...droppingRef.current.keys()]) {
      if (!live.has(key)) {
        droppingRef.current.delete(key);
        metaRef.current.delete(key);
      }
    }

    // Decide a landing angle for a newcomer: append to the shorter side of the
    // current strand so it grows symmetrically around the anchor.
    const computeLandAngle = (slug: string): number => {
      const offs: number[] = [];
      for (const b of bodiesRef.current.values())
        offs.push(angleDiff(Math.atan2(b.position.y - LCY, b.position.x - LCX), ANCHOR_ANGLE));
      for (const d of droppingRef.current.values())
        offs.push(angleDiff(d.landAngle, ANCHOR_ANGLE));
      if (offs.length === 0) return ANCHOR_ANGLE;
      const r = beadRadiusLogical(slug);
      const step = 2 * Math.asin(Math.min(r / LR, 0.9));
      const posExt = Math.max(0, ...offs.filter((o) => o >= 0));
      const negExt = Math.min(0, ...offs.filter((o) => o < 0));
      const landOff = posExt <= -negExt ? posExt + step : negExt - step;
      return ANCHOR_ANGLE + landOff;
    };

    // Add newcomers as falling beads.
    for (const b of beads) {
      if (bodiesRef.current.has(b.key) || droppingRef.current.has(b.key)) continue;
      metaRef.current.set(b.key, { slug: b.slug, r: beadRadiusLogical(b.slug) });
      droppingRef.current.set(b.key, {
        start: performance.now(),
        landAngle: computeLandAngle(b.slug),
      });
    }
  }, [beads]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ aspectRatio: PLATE_ASPECT, background: "transparent", overflow: "visible" }}
    >
      {/* Photographic 45° wooden board */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/wooden-plate-bench.jpg"
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: "contain", objectPosition: "center" }}
      />

      {/* Empty-state hint */}
      {beads.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p
            className="text-center uppercase"
            style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(60,44,30,0.45)" }}
          >
            {t.builder.circleAwaits}
          </p>
        </div>
      )}

      {/* Shadow layer — one multiply group so shadows blend into the wood grain. */}
      <div className="pointer-events-none absolute inset-0" style={{ mixBlendMode: "multiply" }} aria-hidden>
        {beads.map((b) => (
          <span
            key={`sh-${b.key}`}
            ref={(el) => {
              shadowRef.current.set(b.key, el);
            }}
            className="absolute left-0 top-0 block"
            style={{
              borderRadius: "50%",
              opacity: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(20,12,4,0.95) 0%, rgba(20,12,4,0.6) 52%, rgba(20,12,4,0) 72%)",
              filter: `blur(${SHADOW_BLUR}px)`,
            }}
          />
        ))}
      </div>

      {/* Beads — positioned every frame by the physics sync loop. */}
      {beads.map((placement, idx) => {
        const stone = BEAD_BY_SLUG[placement.slug];
        if (!stone) return null;
        const isActive = activeKey === placement.key;
        return (
          <button
            key={placement.key}
            ref={(el) => {
              nodeRef.current.set(placement.key, el);
            }}
            type="button"
            onClick={() => onSelect?.(placement, idx)}
            aria-label={stone.westernName}
            className="absolute left-0 top-0"
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: "50%",
              opacity: 0,
              outline: isActive ? "2px solid rgba(255,255,255,0.7)" : "none",
              outlineOffset: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stone.image.replace(".jpg", ".png")}
              alt={stone.westernName}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
                filter: "saturate(1.08) contrast(1.04)",
              }}
            />
            {/* Specular catch-light */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at 32% 26%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 46%)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
