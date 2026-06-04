"use client";

import { useEffect, useRef, useState } from "react";
import { BEAD_BY_SLUG } from "@/lib/beads";
import type { BeadPlacement } from "./BraceletPreview";
import { useI18n } from "@/components/i18n/LanguageProvider";

/**
 * BeadPlate — a photoreal wooden display tray (AI-generated background) with
 * a live 2D physics layer (Matter.js). Beads drop in from above, then roll &
 * settle into a bracelet ring under spring attraction + collision.
 *
 * Coordinate space is a virtual 1000×1000 grid mapped to the square container
 * via percentages, so the layout is resolution-independent.
 */

// ── Tunables, in 1000-unit virtual space ───────────────────────────────────
const WORLD = 1000;
const DISH_CX = 500;       // dish centre x  (matches plate-environment.jpg)
const DISH_CY = 500;       // dish centre y
const DISH_INNER_R = 295;  // inner rim radius — beads must stay inside this
const BEAD_MM_SCALE = 9;   // world-units per mm of bead diameter
const SPRING_K = 0.0011;   // attraction strength toward target ring slot
const ENTER_MS = 480;      // drop-in animation duration

type Props = {
  beads: BeadPlacement[];
  activeKey?: string | null;
  onSelect?: (p: BeadPlacement, idx: number) => void;
};

type ExitingBead = { key: string; slug: string; x: number; y: number };

function beadRadius(slug: string): number {
  const mm = BEAD_BY_SLUG[slug]?.diameterMm ?? 10;
  return (mm * BEAD_MM_SCALE) / 2;
}

// Compute the ideal ring slot (world coords) for bead i of n.
function ringSlot(i: number, n: number, avgR: number): { x: number; y: number } {
  if (n === 1) return { x: DISH_CX, y: DISH_CY };
  const sinPN = Math.sin(Math.PI / n);
  // Radius that makes beads of radius avgR just touch around the ring …
  let R = avgR / Math.max(sinPN, 0.0001);
  // … but never let them spill past the dish rim.
  R = Math.min(R, DISH_INNER_R - avgR - 6);
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: DISH_CX + R * Math.cos(angle), y: DISH_CY + R * Math.sin(angle) };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function BeadPlate({ beads, activeKey, onSelect }: Props) {
  const { t } = useI18n();
  const count = beads.length;

  // Physics + DOM refs that live across renders (never trigger re-render).
  const engineRef = useRef<import("matter-js").Engine | null>(null);
  const MatterRef = useRef<typeof import("matter-js") | null>(null);
  const bodiesRef = useRef<Map<string, import("matter-js").Body>>(new Map());
  const targetsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const entryRef = useRef<Map<string, number>>(new Map());
  const nodeRef = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const rafRef = useRef<number | null>(null);
  const readyRef = useRef(false);

  // Beads currently animating *out* (removed from physics, fading via CSS).
  const [exiting, setExiting] = useState<ExitingBead[]>([]);

  // ── 1. Boot the physics engine once (client-only, dynamic import). ─────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const Matter = await import("matter-js");
      if (cancelled) return;
      MatterRef.current = Matter;

      const engine = Matter.Engine.create();
      engine.gravity.x = 0;
      engine.gravity.y = 0; // top-down: no global gravity
      engineRef.current = engine;

      // Spring toward target slot + soft circular dish wall, each tick.
      Matter.Events.on(engine, "beforeUpdate", () => {
        for (const [key, body] of bodiesRef.current) {
          const target = targetsRef.current.get(key);
          if (target) {
            const dx = target.x - body.position.x;
            const dy = target.y - body.position.y;
            Matter.Body.applyForce(body, body.position, {
              x: dx * SPRING_K * body.mass,
              y: dy * SPRING_K * body.mass,
            });
          }
          // Keep beads inside the dish rim.
          const r = body.circleRadius ?? 30;
          const ox = body.position.x - DISH_CX;
          const oy = body.position.y - DISH_CY;
          const dist = Math.hypot(ox, oy);
          const maxDist = DISH_INNER_R - r;
          if (dist > maxDist && dist > 0) {
            const push = (dist - maxDist) * 0.02 * body.mass;
            Matter.Body.applyForce(body, body.position, {
              x: (-ox / dist) * push,
              y: (-oy / dist) * push,
            });
          }
        }
      });

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);
      readyRef.current = true;

      // Sync DOM to physics every frame (transform-only, no React re-render).
      const sync = () => {
        const now = performance.now();
        for (const [key, body] of bodiesRef.current) {
          const node = nodeRef.current.get(key);
          if (!node) continue;

          let scale = 1;
          let yOff = 0;
          const entry = entryRef.current.get(key);
          if (entry !== undefined) {
            const p = Math.min((now - entry) / ENTER_MS, 1);
            const e = easeOutCubic(p);
            scale = 1 + 0.55 * (1 - e); // 1.55 → 1.0 (drop toward plate)
            yOff = -130 * (1 - e);      // fall from above
            if (p >= 1) entryRef.current.delete(key);
          }

          const x = body.position.x;
          const y = body.position.y + yOff;
          node.style.left = `${(x / WORLD) * 100}%`;
          node.style.top = `${(y / WORLD) * 100}%`;
          node.style.transform =
            `translate(-50%, -50%) rotate(${body.angle}rad) scale(${scale})`;
          node.style.zIndex = String(Math.round(1000 + scale * 100));
        }
        rafRef.current = requestAnimationFrame(sync);
      };
      rafRef.current = requestAnimationFrame(sync);
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const Matter = MatterRef.current;
      const engine = engineRef.current;
      if (Matter && engine) {
        Matter.Events.off(engine, "beforeUpdate");
        Matter.World.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      bodiesRef.current.clear();
      readyRef.current = false;
    };
  }, []);

  // ── 2. Reconcile physics bodies with the placements array. ────────────────
  useEffect(() => {
    const Matter = MatterRef.current;
    const engine = engineRef.current;
    if (!Matter || !engine) return;

    const liveKeys = new Set(beads.map((b) => b.key));

    // Average radius drives the ring size.
    const avgR =
      beads.reduce((s, b) => s + beadRadius(b.slug), 0) / Math.max(count, 1);

    // (a) Recompute target slots for everyone (order = ring position).
    targetsRef.current.clear();
    beads.forEach((b, i) => {
      targetsRef.current.set(b.key, ringSlot(i, count, avgR));
    });

    // (b) Add bodies for new beads — spawned at their ring slot (pulled inward
    //     a touch) so they drop in and roll outward into final position.
    beads.forEach((b) => {
      if (bodiesRef.current.has(b.key)) return;
      const r = beadRadius(b.slug);
      const slot = targetsRef.current.get(b.key) ?? { x: DISH_CX, y: DISH_CY };
      // Start nearer the centre than the slot → bead rolls outward to settle.
      const sx = DISH_CX + (slot.x - DISH_CX) * 0.55 + (Math.random() - 0.5) * 30;
      const sy = DISH_CY + (slot.y - DISH_CY) * 0.55 + (Math.random() - 0.5) * 30;
      const body = Matter.Bodies.circle(sx, sy, r, {
        restitution: 0.35,
        friction: 0.1,
        frictionAir: 0.07,
        density: 0.001,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);
      bodiesRef.current.set(b.key, body);
      entryRef.current.set(b.key, performance.now());
      Matter.World.add(engine.world, body);
    });

    // (c) Remove bodies for beads that were taken off — animate them out.
    const removed: ExitingBead[] = [];
    for (const [key, body] of bodiesRef.current) {
      if (liveKeys.has(key)) continue;
      const slug =
        // find slug from the last-known node dataset
        nodeRef.current.get(key)?.dataset.slug ?? "";
      removed.push({
        key,
        slug,
        x: (body.position.x / WORLD) * 100,
        y: (body.position.y / WORLD) * 100,
      });
      Matter.World.remove(engine.world, body);
      bodiesRef.current.delete(key);
      targetsRef.current.delete(key);
      entryRef.current.delete(key);
    }
    if (removed.length) {
      setExiting((prev) => [...prev, ...removed]);
      removed.forEach((r) => {
        setTimeout(() => {
          setExiting((prev) => prev.filter((e) => e.key !== r.key));
        }, 360);
      });
    }
  }, [beads, count]);

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* AI-generated wooden plate environment */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/plate-environment.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Empty-state hint */}
      {count === 0 && exiting.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p
            className="text-center uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "rgba(60,44,30,0.42)",
            }}
          >
            {t.builder.circleAwaits}
          </p>
        </div>
      )}

      {/* Live physics beads */}
      {beads.map((placement, idx) => {
        const stone = BEAD_BY_SLUG[placement.slug];
        if (!stone) return null;
        const r = beadRadius(placement.slug);
        const sizePct = (r * 2 / WORLD) * 100;
        const isActive = activeKey === placement.key;

        return (
          <button
            key={placement.key}
            ref={(el) => {
              nodeRef.current.set(placement.key, el);
            }}
            data-slug={placement.slug}
            onClick={() => onSelect?.(placement, idx)}
            aria-label={stone.westernName}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: `${sizePct}%`,
              height: `${sizePct}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              filter:
                "drop-shadow(0px 3px 6px rgba(40,28,16,0.45)) drop-shadow(0px 1px 2px rgba(40,28,16,0.3))",
              outline: isActive ? "2px solid rgba(255,255,255,0.6)" : "none",
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
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 46%)",
                pointerEvents: "none",
              }}
            />
          </button>
        );
      })}

      {/* Exiting beads — fade + lift out */}
      {exiting.map((e) => {
        const stone = BEAD_BY_SLUG[e.slug];
        if (!stone) return null;
        const r = beadRadius(e.slug);
        const sizePct = (r * 2 / WORLD) * 100;
        return (
          <span
            key={`exit-${e.key}`}
            aria-hidden
            className="bead-exit absolute"
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: `${sizePct}%`,
              height: `${sizePct}%`,
              borderRadius: "50%",
              filter: "drop-shadow(0px 3px 6px rgba(40,28,16,0.4))",
              zIndex: 2000,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stone.image.replace(".jpg", ".png")}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
