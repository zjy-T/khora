"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BraceletLoop } from "@/components/ui/BraceletLoop";
import { CURATED_BRACELETS } from "@/lib/presets";
import { BEAD_BY_SLUG } from "@/lib/beads";
import type { Bead, BraceletFormula } from "@/lib/types";

// Editorial metadata layered on top of the raw formula data
const EDITORIAL: Record<string, { headline: string; tagline: string }> = {
  "curated-abundance": {
    headline: "The Abundance Alignment",
    tagline: "A composition for those calling prosperity inward",
  },
  "curated-serenity": {
    headline: "The Serenity Sequence",
    tagline: "A quiet arrangement for stillness of mind",
  },
  "curated-vitality": {
    headline: "The Vitality Circle",
    tagline: "A grounding circle for restoration and steady strength",
  },
};

function productSlug(formula: BraceletFormula): string {
  return formula.id.replace("curated-", "");
}

function CollectionCard({
  formula,
  index,
}: {
  formula: BraceletFormula;
  index: number;
}) {
  const ed = EDITORIAL[formula.id];
  const slug = productSlug(formula);
  const beads = formula.beadSequence
    .map((s) => BEAD_BY_SLUG[s])
    .filter((b): b is Bead => Boolean(b));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/products/${slug}`}
        className="group block border border-hairline-soft transition-colors duration-500 hover:border-hairline"
      >
        {/* Bracelet visual */}
        <div className="flex items-center justify-center bg-obsidian p-8">
          <BraceletLoop beads={beads} size={180} />
        </div>

        {/* Text block */}
        <div className="border-t border-hairline-soft p-6">
          <h3 className="font-serif text-xl text-bone transition-colors group-hover:text-gold">
            {ed?.headline ?? formula.name}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-mist line-clamp-2">
            {formula.description}
          </p>

          <div className="mt-5 flex items-end justify-between">
            <p className="font-serif text-2xl text-gold">
              ${formula.totalPrice.toLocaleString()}
            </p>
            <span className="flex items-center gap-1 text-[0.6rem] uppercase tracking-luxe text-faint transition-colors group-hover:text-gold">
              View piece
              <ArrowRight className="h-2.5 w-2.5" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CuratedCollection() {
  return (
    <section className="border-b border-hairline-soft py-20">
      <div className="mb-12">
        <span className="eyebrow">The Atelier Collection</span>
        <h2 className="display mt-4 text-4xl text-bone md:text-5xl">
          Ready-made{" "}
          <span className="italic text-gold">compositions</span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
          Signature pieces composed by the atelier — each arrangement tuned to
          a single intention, strung and ready to wear.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CURATED_BRACELETS.map((formula, i) => (
          <CollectionCard key={formula.id} formula={formula} index={i} />
        ))}
      </div>
    </section>
  );
}
