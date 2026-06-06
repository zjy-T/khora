"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Compass,
  Gem,
  Hourglass,
  Diamond,
  Layers,
} from "lucide-react";
import { PropertyBadge } from "@/components/ui/PropertyBadge";
import type { Bead } from "@/lib/types";
import { MATERIAL_HARDNESS } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  bead: Bead | null;
  onClose: () => void;
  /** Hover bookkeeping so the cursor can travel from card into the panel. */
  onPanelEnter?: () => void;
  onPanelLeave?: () => void;
};

export function BeadLoreSlideOver({
  bead,
  onClose,
  onPanelEnter,
  onPanelLeave,
}: Props) {
  const { t, locale } = useI18n();

  return (
    <AnimatePresence>
      {bead && (
        <motion.aside
          className="lux-scroll fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-[#111113] shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.6)]"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.55, ease }}
          role="dialog"
          aria-label={localizeBead(bead, locale).title}
          onMouseEnter={onPanelEnter}
          onMouseLeave={onPanelLeave}
        >
          {(() => {
            const L = localizeBead(bead, locale);
            const hardness = MATERIAL_HARDNESS[bead.material];
            return (
              <>
                {/* Replicate-generated bead photograph — the hero image */}
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#efe9e0]">
                  <Image
                    src={bead.image}
                    alt={`${L.title} — polished bead`}
                    fill
                    sizes="448px"
                    className="object-cover"
                    priority
                  />
                  {/* fade the warm photo into the dark panel */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111113] to-transparent" />

                  <button
                    onClick={onClose}
                    className="absolute right-5 top-5 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-gold"
                    aria-label={t.nav.closeMenu}
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="relative -mt-6 flex flex-col p-8 pt-0 md:p-10 md:pt-0">
                  <p className="font-serif text-base tracking-[0.2em] text-[#b6b2aa]">
                    {L.sub}
                  </p>
                  <h2 className="display mt-1 text-4xl text-[#f5f2ec]">
                    {L.title}
                  </h2>

                  {/* Resonance intentions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bead.resonance.map((r) => (
                      <PropertyBadge key={r} property={r} />
                    ))}
                  </div>

                  <div className="my-7 rule-gold opacity-60" />

                  <p className="text-[0.95rem] leading-relaxed text-[#cfcbc3]">
                    {L.description}
                  </p>

                  {/* Expanded lore — geology, history, culture */}
                  {L.loreLong && (
                    <div className="mt-8">
                      <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[#c9b67e]">
                        {t.lore.loreHistory}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#b6b2aa]">
                        {L.loreLong}
                      </p>
                    </div>
                  )}

                  <dl className="mt-9 space-y-6">
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
                      icon={<Hourglass className="h-4 w-4" strokeWidth={1.5} />}
                      term={t.lore.age}
                      detail={L.age}
                    />
                    <LoreRow
                      icon={<Layers className="h-4 w-4" strokeWidth={1.5} />}
                      term={t.lore.material}
                      detail={t.materials[bead.material]}
                    />
                    {hardness && (
                      <LoreRow
                        icon={<Diamond className="h-4 w-4" strokeWidth={1.5} />}
                        term={t.lore.hardness}
                        detail={`${hardness} · Mohs`}
                      />
                    )}
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
    <div className="grid grid-cols-[auto_1fr] gap-4 border-t border-white/10 pt-5">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[#c9b67e]">
          {term}
        </dt>
        <dd className="mt-1.5 text-sm text-[#f5f2ec]">{detail}</dd>
      </div>
    </div>
  );
}
