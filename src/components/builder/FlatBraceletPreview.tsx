"use client";

import { BEAD_BY_SLUG } from "@/lib/beads";
import type { BeadPlacement } from "./BraceletPreview";
import { useI18n } from "@/components/i18n/LanguageProvider";

type Props = {
  beads: BeadPlacement[];
  activeKey?: string | null;
  onSelect?: (p: BeadPlacement, idx: number) => void;
};

type Layout = "spread" | "arc" | "ring";

function getLayout(n: number): Layout {
  if (n <= 2) return "spread";
  if (n <= 5) return "arc";
  return "ring";
}

/**
 * Bead ring geometry: zero-gap touching formula.
 *   d = 100·sin(π/n) / (1 + sin(π/n))
 *   R = 50 / (1 + sin(π/n))
 * Capped so individual beads don't become oversized for small n.
 */
function computePositions(
  n: number,
  layout: Layout,
): { positions: { left: number; top: number }[]; d: number; R: number } {
  if (n === 0) return { positions: [], d: 0, R: 0 };

  if (layout === "spread") {
    const d = n === 1 ? 34 : 24;
    const gap = 3;
    const totalW = n * d + (n - 1) * gap;
    const startX = (100 - totalW) / 2;
    const topY = 50 - d / 2;
    return {
      d,
      R: 0,
      positions: Array.from({ length: n }, (_, i) => ({
        left: startX + i * (d + gap),
        top: topY,
      })),
    };
  }

  if (layout === "arc") {
    const d = 18;
    return {
      d,
      R: 0,
      positions: Array.from({ length: n }, (_, i) => {
        const sweepDeg = 150;
        const R = 34;
        const startDeg = -90 - sweepDeg / 2;
        const deg = startDeg + (sweepDeg / Math.max(n - 1, 1)) * i;
        const rad = (deg * Math.PI) / 180;
        return { left: 50 + R * Math.cos(rad) - d / 2, top: 50 + R * Math.sin(rad) - d / 2 };
      }),
    };
  }

  // Ring: zero-gap
  const sinPN = Math.sin(Math.PI / n);
  const dFill = (100 * sinPN) / (1 + sinPN);
  const d = Math.min(dFill, 22);
  const R = d / (2 * sinPN);

  return {
    d,
    R,
    positions: Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        left: 50 + R * Math.cos(angle) - d / 2,
        top: 50 + R * Math.sin(angle) - d / 2,
      };
    }),
  };
}

// Elastic cord colour — natural hemp/tan
const CORD_COLOR = "rgba(148, 126, 98, 0.72)";
const CORD_WIDTH = 0.9; // % of container (SVG units = 100)

export function FlatBraceletPreview({ beads, activeKey, onSelect }: Props) {
  const { t } = useI18n();
  const count = beads.length;
  const layout = getLayout(count);
  const { positions, d, R } = computePositions(count, layout);

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: "1 / 1", background: "var(--color-obsidian)" }}
    >
      {/* ── Elastic cord layer — rendered BEFORE beads so beads sit on top ── */}
      {layout === "ring" && count > 0 && (
        <svg
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Main cord ring */}
          <circle
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={CORD_COLOR}
            strokeWidth={CORD_WIDTH}
          />
          {/* Subtle inner cord highlight (upper-left) */}
          <circle
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke="rgba(255,245,230,0.28)"
            strokeWidth={CORD_WIDTH * 0.45}
            strokeDasharray={`${R * 1.2} ${R * 5}`}
            strokeDashoffset={`${-R * 0.1}`}
          />
        </svg>
      )}

      {/* ── Bead images — drop shadow traces the actual stone silhouettes ── */}
      <div
        className="absolute inset-0"
        style={{
          filter:
            count > 0
              ? "drop-shadow(0px 4px 12px rgba(26,23,20,0.28)) drop-shadow(0px 1px 4px rgba(26,23,20,0.16))"
              : "none",
        }}
      >
        {beads.map((placement, i) => {
          const stone = BEAD_BY_SLUG[placement.slug];
          if (!stone || !positions[i]) return null;
          const { left, top } = positions[i];
          const isActive = activeKey === placement.key;

          return (
            <button
              key={placement.key}
              onClick={() => onSelect?.(placement, i)}
              aria-label={stone.westernName}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${d}%`,
                height: `${d}%`,
                borderRadius: "50%",
                overflow: "hidden",
                border: "none",
                padding: 0,
                background: "transparent",
                transform: isActive ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.26s cubic-bezier(0.22,1,0.36,1)",
                cursor: "pointer",
              }}
            >
              {/* Original JPG — circular clip via borderRadius + overflow:hidden */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stone.image}
                alt={stone.westernName}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  filter: "saturate(1.1) contrast(1.04)",
                  display: "block",
                }}
              />
              {/* Specular highlight */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at 28% 20%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 44%)",
                  pointerEvents: "none",
                }}
              />
              {/* Inner rim shadow for depth */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at 65% 78%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 52%)",
                  pointerEvents: "none",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Bracelet label — bottom-right corner to distinguish from necklace */}
      {layout === "ring" && count > 0 && (
        <p
          className="pointer-events-none absolute bottom-3 right-4 text-[0.48rem] uppercase tracking-luxe"
          style={{ color: "rgba(110,95,78,0.38)" }}
        >
          Bracelet · {count} stones
        </p>
      )}

      {/* Empty state */}
      {count === 0 && (
        <>
          <svg
            aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx={50} cy={50} r={36}
              fill="none"
              stroke="rgba(26,23,20,0.08)"
              strokeWidth={0.4}
              strokeDasharray="1.8 2.6"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p
              className="text-center uppercase"
              style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(110,95,78,0.34)" }}
            >
              {t.builder.circleAwaits}
            </p>
          </div>
        </>
      )}

      {/* Single-bead caption */}
      {layout === "spread" && count === 1 && (() => {
        const stone = BEAD_BY_SLUG[beads[0].slug];
        return stone ? (
          <div className="pointer-events-none absolute bottom-[18%] left-0 right-0 text-center">
            <p className="font-serif text-sm italic" style={{ color: "rgba(26,23,20,0.45)" }}>
              {stone.westernName}
            </p>
            <p className="mt-0.5 text-[0.52rem] uppercase tracking-luxe" style={{ color: "rgba(26,23,20,0.28)" }}>
              {stone.metaphysicalProperty}
            </p>
          </div>
        ) : null;
      })()}
    </div>
  );
}
