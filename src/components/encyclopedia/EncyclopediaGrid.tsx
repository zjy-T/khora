"use client";

import { useRef, useState } from "react";
import { StoneCard } from "@/components/encyclopedia/StoneCard";
import { BeadLoreSlideOver } from "@/components/builder/BeadLoreSlideOver";
import type { Bead } from "@/lib/types";
import { RESONANCE_ORDER } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

export function EncyclopediaGrid({ beads }: { beads: Bead[] }) {
  const { t } = useI18n();
  const [lore, setLore] = useState<Bead | null>(null);
  const [activeProperty, setActiveProperty] = useState<string | null>(null);

  // Hover-to-open: a short close delay lets the cursor travel from a card
  // into the panel (or between cards) without the panel flickering shut.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openLore = (bead: Bead) => {
    cancelClose();
    setLore(bead);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setLore(null), 180);
  };
  const closeNow = () => {
    cancelClose();
    setLore(null);
  };

  const presentProperties = RESONANCE_ORDER.filter((p) =>
    beads.some((b) => b.resonance.includes(p)),
  );

  const filtered =
    activeProperty === null
      ? beads
      : beads.filter((b) =>
          b.resonance.includes(activeProperty as (typeof RESONANCE_ORDER)[number]),
        );


  return (
    <div className="mx-auto max-w-[1760px] px-6 pb-28 pt-32 md:px-10 md:pt-44 2xl:px-16">
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
          return (
            <button
              key={p}
              onClick={() => setActiveProperty(isActive ? null : p)}
              className={`rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-luxe transition-all duration-300 ${
                isActive
                  ? "border-gold bg-gold text-[#faf8f4]"
                  : "border-hairline text-mist hover:border-gold/50 hover:text-bone"
              }`}
            >
              {t.properties[p]}
            </button>
          );
        })}

        <span className="ml-auto hidden text-[0.65rem] uppercase tracking-luxe text-faint md:inline">
          {t.encyclopedia.propertiesCount(presentProperties.length)}
        </span>
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
              onOpen={openLore}
              onHoverOut={scheduleClose}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-faint">
          No stones found for this property.
        </p>
      )}

      <BeadLoreSlideOver
        bead={lore}
        onClose={closeNow}
        onPanelEnter={cancelClose}
        onPanelLeave={scheduleClose}
      />
    </div>
  );
}
