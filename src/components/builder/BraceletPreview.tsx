"use client";

import { BeadPlate } from "./BeadPlate";

// This type is imported by BuilderShell — keep it here as the canonical source.
export type BeadPlacement = { key: string; slug: string };

type Props = {
  beads: BeadPlacement[];
  activeKey?: string | null;
  onHover?: (p: BeadPlacement | null) => void;
  onSelect?: (p: BeadPlacement, idx: number) => void;
  removable?: boolean;
};

export function BraceletPreview({ beads, activeKey, onSelect }: Props) {
  return (
    <BeadPlate beads={beads} activeKey={activeKey} onSelect={onSelect} />
  );
}
