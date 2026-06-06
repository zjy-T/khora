"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BEAD_BY_SLUG, RESONANCE_ORDER } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { BeadPlacement } from "@/components/builder/BraceletPreview";

export function BraceletRadar({ beads }: { beads: BeadPlacement[] }) {
  const { t } = useI18n();
  const total = beads.length;

  // Count beads per resonance tag (a bead contributes to each tag it carries)
  const counts = Object.fromEntries(
    RESONANCE_ORDER.map((p) => [p, 0]),
  ) as Record<string, number>;
  for (const { slug } of beads) {
    const b = BEAD_BY_SLUG[slug];
    if (b) b.resonance.forEach((tag) => counts[tag]++);
  }

  const maxCount = Math.max(...Object.values(counts), 1);
  const activeProperties = RESONANCE_ORDER.filter((p) => counts[p] > 0).sort(
    (a, b) => counts[b] - counts[a],
  );
  const hasData = total > 0;

  return (
    <div className="mt-6 border-t border-hairline-soft pt-5">
      <AnimatePresence mode="wait">
        {!hasData ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[0.62rem] uppercase tracking-luxe text-faint"
          >
            {t.builder.addStonesToReveal}
          </motion.p>
        ) : (
          <motion.div
            key="resonance"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-sm border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-transparent p-4"
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-gold/20" />
              <span className="eyebrow text-gold/70">{t.builder.resonanceProfile}</span>
              <span className="h-px flex-1 bg-gold/20" />
            </div>

            {/* Bars */}
            <div className="space-y-3">
              {activeProperties.map((prop, i) => {
                const count = counts[prop];
                const pct = (count / maxCount) * 100;
                return (
                  <div key={prop}>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] uppercase tracking-luxe text-mist">
                        {t.properties[prop as keyof typeof t.properties]}
                      </span>
                      <span className="font-serif text-sm text-bone/50">{count}</span>
                    </div>
                    <div className="relative mt-1.5 h-px w-full bg-hairline">
                      <motion.div
                        className="absolute left-0 top-0 h-full bg-gold/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.55,
                          delay: i * 0.07,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Property descriptions — inline below the bars */}
            <div className="mt-5 space-y-3 border-t border-gold/15 pt-4">
              {activeProperties.map((prop) => (
                <div key={prop} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/50" />
                  <div>
                    <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-bone/80">
                      {t.properties[prop as keyof typeof t.properties]}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-mist">
                      {t.propertyDescriptions[prop as keyof typeof t.propertyDescriptions]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
