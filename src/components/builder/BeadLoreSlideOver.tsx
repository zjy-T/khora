"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Compass, Gem } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { PropertyBadge } from "@/components/ui/PropertyBadge";
import type { Bead } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  bead: Bead | null;
  onClose: () => void;
};

export function BeadLoreSlideOver({ bead, onClose }: Props) {
  const { t, locale } = useI18n();

  return (
    <AnimatePresence>
      {bead && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />

          <motion.aside
            className="lux-scroll fixed inset-y-0 right-0 z-[70] w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#111113]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease }}
            role="dialog"
            aria-label={localizeBead(bead, locale).title}
          >
            {(() => {
              const L = localizeBead(bead, locale);
              return (
                <>
                  {/* Accent wash keyed to the stone */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-30"
                    style={{
                      background: `radial-gradient(circle at 70% 0%, ${bead.color}, transparent 70%)`,
                    }}
                  />

                  <div className="relative p-8 md:p-10">
                    <button
                      onClick={onClose}
                      className="absolute right-6 top-6 text-mist transition-colors hover:text-gold"
                      aria-label={t.nav.closeMenu}
                    >
                      <X strokeWidth={1.5} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                      <BeadOrb bead={bead} size={120} active />
                      <p className="mt-6 font-serif text-base tracking-[0.2em] text-[#b6b2aa]">
                        {L.sub}
                      </p>
                      <h2 className="display mt-1 text-4xl text-[#f5f2ec]">
                        {L.title}
                      </h2>
                      <div className="mt-5">
                        <PropertyBadge property={bead.metaphysicalProperty} />
                      </div>
                    </div>

                    <div className="my-8 rule-gold opacity-60" />

                    <p className="text-[0.95rem] leading-relaxed text-[#b6b2aa]">
                      {L.description}
                    </p>

                    <dl className="mt-10 space-y-7">
                      <LoreRow
                        icon={<Compass className="h-4 w-4" strokeWidth={1.5} />}
                        term={t.lore.energyAlignment}
                        detail={L.energyAlignment}
                      />
                      <LoreRow
                        icon={<MapPin className="h-4 w-4" strokeWidth={1.5} />}
                        term={t.lore.physicalOrigin}
                        detail={L.origin}
                      />
                      <LoreRow
                        icon={<Gem className="h-4 w-4" strokeWidth={1.5} />}
                        term={t.lore.atelierPrice}
                        detail={t.lore.perStone(bead.price)}
                      />
                    </dl>
                  </div>
                </>
              );
            })()}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function LoreRow({
  icon,
  term,
  detail,
}: {
  icon: React.ReactNode;
  term: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 border-t border-white/10 pt-6">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[#c9b67e]">{term}</dt>
        <dd className="mt-1.5 text-sm text-[#f5f2ec]">{detail}</dd>
      </div>
    </div>
  );
}
