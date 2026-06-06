"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormulaCard } from "@/components/atelier/FormulaCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import type { BraceletFormula, ResonanceTag } from "@/lib/types";
import { BEAD_BY_SLUG, RESONANCE_ORDER, RESONANCE_COLORS } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";

/** Gather all resonance tags that appear in a formula's bead sequence */
function formulaProperties(formula: BraceletFormula): ResonanceTag[] {
  const props = formula.beadSequence.flatMap(
    (s) => BEAD_BY_SLUG[s]?.resonance ?? [],
  );
  return [...new Set(props)];
}

export function AtelierView({ formulas }: { formulas: BraceletFormula[] }) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<ResonanceTag | null>(null);

  // Collect all resonance tags present across all formulas
  const allProperties = RESONANCE_ORDER.filter((p) =>
    formulas.some((f) => formulaProperties(f).includes(p)),
  );

  const filtered =
    activeFilter === null
      ? formulas
      : formulas.filter((f) => formulaProperties(f).includes(activeFilter));

  const propertyColors: Record<string, string> = RESONANCE_COLORS;

  return (
    <div className="mx-auto max-w-[1760px] px-6 pb-28 pt-32 md:px-10 md:pt-44 2xl:px-16">
      <header className="grid gap-10 border-b border-hairline-soft pb-14 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <SectionLabel ruled>{t.atelier.eyebrow}</SectionLabel>
          <h1 className="display mt-6 text-balance text-5xl text-bone md:text-7xl">
            {t.atelier.title1}
            <br />
            {t.atelier.title2}
            <span className="italic text-gold">{t.atelier.titleEmph}</span>
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-mist">{t.atelier.intro}</p>
      </header>

      {/* Property filter */}
      <div className="flex flex-wrap items-center gap-2 py-8">
        <span className="mr-2 text-[0.65rem] uppercase tracking-luxe text-faint">
          {t.atelier.filterLabel}
        </span>

        <button
          onClick={() => setActiveFilter(null)}
          className={`rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-luxe transition-all duration-300 ${
            activeFilter === null
              ? "border-gold bg-gold text-[#faf8f4]"
              : "border-hairline text-mist hover:border-gold/50 hover:text-bone"
          }`}
        >
          {t.atelier.filterAll}
        </button>

        {allProperties.map((p) => {
          const isActive = activeFilter === p;
          const color = propertyColors[p] ?? "#9c9088";
          return (
            <button
              key={p}
              onClick={() => setActiveFilter(isActive ? null : p)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-luxe transition-all duration-300 ${
                isActive
                  ? "border-transparent text-white"
                  : "border-hairline text-mist hover:border-hairline hover:text-bone"
              }`}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: isActive ? "white" : color }}
              />
              {t.properties[p]}
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter ?? "all"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {filtered.map((f, i) => (
            <FormulaCard key={f.id} formula={f} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-faint">
          No bracelets match this filter yet.
        </p>
      )}

      {/* Invitation to contribute */}
      <div className="mt-20 flex flex-col items-center border-t border-hairline-soft pt-16 text-center">
        <h2 className="display text-3xl text-bone md:text-4xl">
          {t.atelier.inviteTitle}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
          {t.atelier.inviteBody}
        </p>
        <div className="mt-8">
          <ButtonLink href="/builder">{t.atelier.inviteButton}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
