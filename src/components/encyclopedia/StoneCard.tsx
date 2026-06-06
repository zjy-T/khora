"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Hourglass } from "lucide-react";
import { PropertyBadge } from "@/components/ui/PropertyBadge";
import type { Bead } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  bead: Bead;
  index: number;
  onOpen: (bead: Bead) => void;
  onHoverOut?: () => void;
};

export function StoneCard({ bead, index, onOpen, onHoverOut }: Props) {
  const { t, locale } = useI18n();
  const L = localizeBead(bead, locale);

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay: (index % 4) * 0.08 }}
      onMouseEnter={() => onOpen(bead)}
      onMouseLeave={onHoverOut}
      onFocus={() => onOpen(bead)}
      onClick={() => onOpen(bead)}
      className="group relative flex flex-col overflow-hidden border border-hairline-soft text-left transition-colors duration-700 hover:border-gold"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={`/rocks/${bead.slug}.jpg`}
          alt={`${L.title} — natural rock specimen`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1.4s] [transition-timing-function:var(--ease-luxe)] group-hover:scale-[1.07]"
          style={{ filter: "saturate(1.05)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <PropertyBadge property={bead.resonance[0]} />
        </div>
        <ArrowUpRight
          className="absolute right-4 top-4 h-5 w-5 text-gold opacity-0 transition-all duration-500 group-hover:translate-x-0.5 group-hover:opacity-100"
          strokeWidth={1.5}
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="font-serif text-sm tracking-[0.2em] text-faint">
          {L.sub}
        </p>
        <h3 className="mt-1 font-serif text-2xl text-bone md:text-3xl">
          {L.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mist">
          {L.description}
        </p>

        {/* Geological provenance — shown directly on the card */}
        <dl className="mt-5 space-y-3 border-t border-hairline-soft pt-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" strokeWidth={1.5} />
            <div>
              <dt className="text-[0.55rem] uppercase tracking-luxe text-faint">
                {t.lore.physicalOrigin}
              </dt>
              <dd className="mt-0.5 text-xs leading-snug text-mist">{L.origin}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" strokeWidth={1.5} />
            <div>
              <dt className="text-[0.55rem] uppercase tracking-luxe text-faint">
                {t.lore.age}
              </dt>
              <dd className="mt-0.5 text-xs leading-snug text-mist">{L.age}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between border-t border-hairline-soft pt-4">
          <span className="text-[0.62rem] uppercase tracking-luxe text-faint">
            {L.energyAlignment.split("·")[0].trim()}
          </span>
          <span className="font-serif text-lg text-gold">${bead.price}</span>
        </div>
      </div>
    </motion.button>
  );
}
