"use client";

import { BeadPlate } from "./BeadPlate";

// This type is imported by BuilderShell — keep it here as the canonical source.
export type BeadPlacement = { key: string; slug: string };

type Props = {
  beads: BeadPlacement[];
  /** Bracelet inner-loop circumference in mm — anchors the preview's scale. */
  circumferenceMm?: number | null;
  activeKey?: string | null;
  onHover?: (p: BeadPlacement | null) => void;
  onSelect?: (p: BeadPlacement, idx: number) => void;
  removable?: boolean;
};

export function BraceletPreview({
  beads,
  circumferenceMm,
  activeKey,
  onSelect,
}: Props) {
  return (
    <BeadPlate
      beads={beads}
      circumferenceMm={circumferenceMm}
      activeKey={activeKey}
      onSelect={onSelect}
    />
  );
}
