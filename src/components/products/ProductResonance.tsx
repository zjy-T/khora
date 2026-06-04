"use client";

import { BraceletRadar } from "@/components/builder/BraceletRadar";
import type { BeadPlacement } from "@/components/builder/BraceletPreview";

type Props = {
  /** Ordered bead slugs from the formula's beadSequence */
  beadSequence: string[];
};

/**
 * Client wrapper that converts a static beadSequence string[] into the
 * BeadPlacement[] shape that BraceletRadar expects, then renders the radar.
 * Needs to be a client component because BraceletRadar uses useI18n().
 */
export function ProductResonance({ beadSequence }: Props) {
  const placements: BeadPlacement[] = beadSequence.map((slug, i) => ({
    key: `${slug}-${i}`,
    slug,
  }));

  return (
    <div className="border-t border-hairline-soft pt-6">
      <BraceletRadar beads={placements} />
    </div>
  );
}
