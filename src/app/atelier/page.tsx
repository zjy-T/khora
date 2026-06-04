import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { COMMUNITY_BRACELETS } from "@/lib/presets";
import { AtelierView } from "@/components/atelier/AtelierView";
import type { BraceletFormula } from "@/lib/types";

export const metadata: Metadata = {
  title: "The Atelier",
  description:
    "A gallery of bracelet formulas composed by the collector community — each a piece of wearable art with its own name and intention.",
};

async function loadCommunity(): Promise<BraceletFormula[]> {
  try {
    const rows = await prisma.bracelet.findMany({
      where: { isCommunity: true },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) return COMMUNITY_BRACELETS;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      beadSequence: r.beadSequence as string[],
      totalPrice: r.totalPrice,
      isCommunity: r.isCommunity,
      creatorName: r.creatorName,
    }));
  } catch {
    return COMMUNITY_BRACELETS;
  }
}

export default async function AtelierPage() {
  const formulas = await loadCommunity();
  return <AtelierView formulas={formulas} />;
}
