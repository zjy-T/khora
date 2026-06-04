"use client";

import { useState } from "react";
import { StoneCard } from "@/components/encyclopedia/StoneCard";
import { BeadLoreSlideOver } from "@/components/builder/BeadLoreSlideOver";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Bead } from "@/lib/types";
import { PROPERTY_ORDER, PROPERTY_COLORS } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

export function EncyclopediaGrid({ beads }: { beads: Bead[] }) {
  const { t } = useI18n();
  const [lore, setLore] = useState<Bead | null>(null);
  const [activeProperty, setActiveProperty] = useState<string | null>(null);

  const presentProperties = PROPERTY_ORDER.filter((p) =>
    beads.some((b) => b.metaphysicalProperty === p),
  );

  const filtered =
    activeProperty === null
      ? beads
      : beads.filter((b) => b.metaphysicalProperty === activeProperty);


  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-32 md:px-10 md:pt-44">
      {/* Editorial header */}
      <header className="grid gap-10 border-b border-hairline-soft pb-14 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <SectionLabel ruled>{t.encyclopedia.eyebrow}</SectionLabel>
          <h1 className="display mt-6 text-balance text-5xl text-bone md:text-7xl">
            {t.encyclopedia.title1}
            <br />
            <span className="italic text-gold">{t.encyclopedia.titleEmph}</span>
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-mist">
          {t.encyclopedia.intro}
        </p>
      </header>

      {/* Interactive property filter */}
      <div className="flex flex-wrap items-center gap-2 py-8">
        <span className="mr-2 text-[0.65rem] uppercase tracking-luxe text-faint">
          {t.encyclopedia.stonesCount(beads.length)}
        </span>

        <button
          onClick={() => setActiveProperty(null)}
          className={`rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-luxe transition-all duration-300 ${
            activeProperty === null
              ? "border-gold bg-gold text-[#faf8f4]"
              : "border-hairline text-mist hover:border-gold/50 hover:text-bone"
          }`}
        >
          全部 / All
        </button>

        {presentProperties.map((p) => {
          const isActive = activeProperty === p;
          const color = PROPERTY_COLORS[p as keyof typeof PROPERTY_COLORS] ?? "#9c9088";
          return (
            <button
              key={p}
              onClick={() => setActiveProperty(isActive ? null : p)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-luxe transition-all duration-300 ${
                isActive
                  ? "border-transparent text-white"
                  : "border-hairline text-mist hover:border-hairline hover:text-bone"
              }`}
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color }
                  : {}
              }
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full transition-colors"
                style={{ backgroundColor: isActive ? "white" : color }}
              />
              {t.properties[p]}
            </button>
          );
        })}

        <span className="ml-auto hidden text-[0.65rem] uppercase tracking-luxe text-faint md:inline">
          {t.encyclopedia.propertiesCount(presentProperties.length)}
        </span>
      </div>

      {/* Property guide */}
      <div className="mb-12 grid grid-cols-2 gap-px border border-hairline-soft bg-hairline-soft sm:grid-cols-4">
        {PROPERTY_ORDER.map((prop) => {
          const color = PROPERTY_COLORS[prop as keyof typeof PROPERTY_COLORS];
          const isHighlighted = activeProperty === prop || activeProperty === null;
          return (
            <button
              key={prop}
              onClick={() => setActiveProperty(activeProperty === prop ? null : prop)}
              className={`group bg-obsidian p-5 text-left transition-opacity duration-300 hover:bg-charcoal ${
                isHighlighted ? "opacity-100" : "opacity-40"
              }`}
            >
              <span
                className="mb-3 block h-1 w-8 rounded-full transition-all duration-300 group-hover:w-12"
                style={{ backgroundColor: color }}
              />
              <p
                className="mb-1 text-[0.62rem] font-semibold uppercase tracking-luxe"
                style={{ color }}
              >
                {t.properties[prop as keyof typeof t.properties]}
              </p>
              <p className="text-[0.68rem] leading-relaxed text-mist">
                {t.propertyDescriptions[prop as keyof typeof t.propertyDescriptions]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProperty ?? "all"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {filtered.map((bead, i) => (
            <StoneCard
              key={bead.slug}
              bead={bead}
              index={i}
              onOpen={setLore}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-faint">
          No stones found for this property.
        </p>
      )}

      <BeadLoreSlideOver bead={lore} onClose={() => setLore(null)} />
    </div>
  );
}
