import type { Metadata } from "next";
import { BEADS } from "@/lib/beads";
import { EncyclopediaGrid } from "@/components/encyclopedia/EncyclopediaGrid";

export const metadata: Metadata = {
  title: "The Lore",
  description:
    "An encyclopedia of stones — origin, resonance and energetic alignment, presented as an editorial lookbook.",
};

// The canonical in-code catalog (src/lib/beads.ts) is the source of truth —
// it carries the full resonance + material taxonomy and every new stone.
export default function EncyclopediaPage() {
  return <EncyclopediaGrid beads={BEADS} />;
}
