import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BEADS } from "@/lib/beads";
import { EncyclopediaGrid } from "@/components/encyclopedia/EncyclopediaGrid";
import type { Bead, MetaphysicalProperty } from "@/lib/types";

export const metadata: Metadata = {
  title: "The Lore",
  description:
    "An encyclopedia of stones — origin, metaphysical property and energetic alignment, presented as an editorial lookbook.",
};

// Server components read from the database to demonstrate the data layer;
// fall back to the canonical catalog if the DB has not been seeded.
async function loadBeads(): Promise<Bead[]> {
  try {
    const rows = await prisma.bead.findMany({ orderBy: { price: "asc" } });
    if (rows.length === 0) return BEADS;
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      westernName: r.westernName,
      metaphysicalProperty: r.metaphysicalProperty as MetaphysicalProperty,
      description: r.description,
      color: r.color,
      price: r.price,
      image: r.image,
      origin: r.origin,
      energyAlignment: r.energyAlignment,
      // Fall back to catalog value if DB row predates this field
      diameterMm: (r as { diameterMm?: number }).diameterMm ?? 10,
    }));
  } catch {
    return BEADS;
  }
}

export default async function EncyclopediaPage() {
  const beads = await loadBeads();
  return <EncyclopediaGrid beads={beads} />;
}
