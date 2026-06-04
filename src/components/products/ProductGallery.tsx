"use client";

import { useState } from "react";
import Image from "next/image";
import { BraceletLoop } from "@/components/ui/BraceletLoop";
import type { Bead } from "@/lib/types";

type Shot = {
  src: string;
  label: string;
};

type Props = {
  slug: string;
  /** Bead objects used to render the SVG fallback if photos are missing */
  beads: Bead[];
};

const SHOTS: { key: string; label: string }[] = [
  { key: "shot-1", label: "Overhead" },
  { key: "shot-2", label: "Angled" },
  { key: "shot-3", label: "Detail" },
  { key: "shot-4", label: "Editorial" },
  { key: "wrist",  label: "On Wrist" },
];

export function ProductGallery({ slug, beads }: Props) {
  const shots: Shot[] = SHOTS.map(({ key, label }) => ({
    src: `/bracelets/${slug}-${key}.jpg`,
    label,
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());

  const active = shots[activeIndex];
  const isFailed = failedSrcs.has(active.src);

  function markFailed(src: string) {
    setFailedSrcs((prev) => new Set([...prev, src]));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Primary image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-obsidian">
        {!isFailed ? (
          <Image
            key={active.src}
            src={active.src}
            alt={`${slug} bracelet — ${active.label}`}
            fill
            className="object-cover"
            priority
            onError={() => markFailed(active.src)}
          />
        ) : (
          /* SVG fallback when photo isn't available yet */
          <BraceletLoop beads={beads} size={320} />
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2">
        {shots.map((shot, i) => {
          const failed = failedSrcs.has(shot.src);
          return (
            <button
              key={shot.src}
              onClick={() => setActiveIndex(i)}
              className={`relative flex aspect-square flex-1 items-center justify-center overflow-hidden border transition-colors ${
                i === activeIndex
                  ? "border-gold"
                  : "border-hairline-soft hover:border-hairline"
              }`}
              aria-label={shot.label}
            >
              {!failed ? (
                <Image
                  src={shot.src}
                  alt={shot.label}
                  fill
                  className="object-cover"
                  onError={() => markFailed(shot.src)}
                />
              ) : (
                <span className="flex items-center justify-center p-1">
                  <BraceletLoop beads={beads} size={48} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
