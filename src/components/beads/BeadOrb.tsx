import Image from "next/image";
import type { Bead } from "@/lib/types";
import { getBlur } from "@/lib/blur-data";

type Props = {
  bead: Bead;
  /** Diameter in pixels. */
  size?: number;
  /** Highlighted state (selected / active). */
  active?: boolean;
  className?: string;
  priority?: boolean;
};

export function BeadOrb({
  bead,
  size = 72,
  active = false,
  className = "",
  priority = false,
}: Props) {
  const blur = getBlur(bead.image);

  return (
    <span
      className={`relative inline-block shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        outline: active ? `1.5px solid rgba(26,23,20,0.3)` : "none",
        outlineOffset: 2,
      }}
    >
      <Image
        src={bead.image}
        alt={bead.westernName}
        width={size}
        height={size}
        sizes={`${size}px`}
        priority={priority}
        {...(blur ? { placeholder: "blur" as const, blurDataURL: blur } : {})}
        className="h-full w-full rounded-full object-cover"
        style={{ filter: "saturate(1.05) contrast(1.02)" }}
      />
      {/* Glassy specular highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.32), rgba(255,255,255,0) 40%)",
        }}
      />
    </span>
  );
}
