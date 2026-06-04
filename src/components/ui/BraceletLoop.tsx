import type { Bead } from "@/lib/types";

type Props = {
  beads: Bead[];
  size?: number;
  className?: string;
};

/**
 * Renders a circular bracelet as inline SVG using bead accent colors.
 * Used as a visual placeholder wherever a bracelet illustration is needed.
 */
export function BraceletLoop({ beads, size = 300, className = "" }: Props) {
  const center = size / 2;
  const beadR = Math.max(size * 0.072, 8);
  const loopR = center - beadR - size * 0.04;
  const count = beads.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      suppressHydrationWarning
    >
      {/* Cord ring */}
      <circle
        cx={center}
        cy={center}
        r={loopR}
        fill="none"
        stroke="rgba(28,24,20,0.12)"
        strokeWidth={size * 0.008}
        strokeDasharray={`${size * 0.018} ${size * 0.012}`}
      />

      {beads.map((bead, i) => {
        const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
        // Round to 4 dp to eliminate SSR/CSR floating-point mismatch
        const x = Math.round((center + loopR * Math.cos(angle)) * 1e4) / 1e4;
        const y = Math.round((center + loopR * Math.sin(angle)) * 1e4) / 1e4;
        const gradId = `bg-${i}`;
        const hiId = `hi-${i}`;

        return (
          <g key={`${bead.slug}-${i}`}>
            <defs>
              <radialGradient id={gradId} cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor={bead.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={bead.color} />
              </radialGradient>
              <radialGradient id={hiId} cx="35%" cy="28%" r="35%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            {/* Bead body */}
            <circle cx={x} cy={y} r={beadR} fill={`url(#${gradId})`} suppressHydrationWarning />
            {/* Specular highlight */}
            <circle cx={x} cy={y} r={beadR} fill={`url(#${hiId})`} suppressHydrationWarning />
            {/* Inner shadow rim */}
            <circle
              cx={x}
              cy={y}
              r={beadR}
              fill="none"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={beadR * 0.15}
              suppressHydrationWarning
            />
          </g>
        );
      })}
    </svg>
  );
}
