"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { BraceletLoop } from "@/components/ui/BraceletLoop";
import { CURATED_BRACELETS } from "@/lib/presets";
import { BEAD_BY_SLUG, RESONANCE_ORDER } from "@/lib/beads";
import type { Bead, BraceletFormula, ResonanceTag } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBracelet } from "@/lib/presets.i18n";
import { FilterBar, type FilterGroup } from "@/components/builder/FilterBar";

function productSlug(id: string) {
  return id.replace("curated-", "");
}

function dominantProperties(
  beadSequence: string[],
  topN = 3,
): ResonanceTag[] {
  const counts: Partial<Record<ResonanceTag, number>> = {};
  for (const slug of beadSequence) {
    const bead = BEAD_BY_SLUG[slug];
    if (bead) {
      for (const tag of bead.resonance) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
  }
  return (Object.entries(counts) as [ResonanceTag, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([prop]) => prop);
}

function CuratorCard({
  preset,
  index,
}: {
  preset: BraceletFormula;
  index: number;
}) {
  const { t, locale } = useI18n();
  const L = localizeBracelet(preset, locale);
  const slug = productSlug(preset.id);
  const beads = preset.beadSequence
    .map((s) => BEAD_BY_SLUG[s])
    .filter((b): b is Bead => Boolean(b));
  const props = dominantProperties(preset.beadSequence, 3);
  const heroSrc = `/bracelets/${slug}-shot-1.jpg`;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block border border-hairline-soft transition-colors duration-500 hover:border-hairline"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Photo area — BraceletLoop is always visible; real photo layers on top if it exists */}
      <div className="relative aspect-square overflow-hidden bg-obsidian">
        <div className="absolute inset-0 flex items-center justify-center">
          <BraceletLoop beads={beads} size={220} />
        </div>
        <Image
          src={heroSrc}
          alt={L.name}
          fill
          className="relative z-10 object-contain p-6 transition-transform duration-700 group-hover:scale-[1.02]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Text block */}
      <div className="border-t border-hairline-soft p-5">
        <h3 className="font-serif text-xl text-bone transition-colors group-hover:text-gold">
          {L.name}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-mist line-clamp-2">
          {L.description}
        </p>

        {/* Resonance — plain text, no color chips */}
        {props.length > 0 && (
          <p className="mt-3 text-[0.6rem] uppercase tracking-luxe text-faint">
            Key Resonance&nbsp;&nbsp;
            {props.map((p) => t.properties[p]).join(" · ")}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <p className="font-serif text-xl text-gold">
            ${preset.totalPrice.toLocaleString()}
          </p>
          <span className="flex items-center gap-1 text-[0.6rem] uppercase tracking-luxe text-faint transition-colors group-hover:text-gold">
            View piece
            <ArrowRight className="h-2.5 w-2.5" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CuratorPanel() {
  const { t } = useI18n();

  // Per-preset facets, computed once.
  const enriched = useMemo(
    () =>
      CURATED_BRACELETS.map((preset) => ({
        preset,
        props: dominantProperties(preset.beadSequence, 3),
      })),
    [],
  );

  // Resonance options = tags that are dominant in at least one piece.
  const resonanceValues = useMemo(() => {
    const present = new Set<ResonanceTag>();
    enriched.forEach((i) => i.props.forEach((p) => present.add(p)));
    return RESONANCE_ORDER.filter((p) => present.has(p));
  }, [enriched]);

  const [selected, setSelected] = useState<Record<string, string[]>>({
    resonance: [],
  });
  const [sortBy, setSortBy] = useState("featured");

  const toggle = (groupId: string, value: string) =>
    setSelected((prev) => {
      const cur = prev[groupId] ?? [];
      return {
        ...prev,
        [groupId]: cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value],
      };
    });

  const reset = () => {
    setSelected({ resonance: [] });
    setSortBy("featured");
  };

  const sortOptions = [
    { value: "featured", label: t.builder.filters.sortFeatured },
    { value: "price-asc", label: t.builder.filters.sortPriceAsc },
    { value: "price-desc", label: t.builder.filters.sortPriceDesc },
  ];

  const filtered = enriched.filter(({ props }) => {
    const res = selected.resonance;
    return res.length === 0 || props.some((p) => res.includes(p));
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.preset.totalPrice - b.preset.totalPrice;
      case "price-desc":
        return b.preset.totalPrice - a.preset.totalPrice;
      default:
        return 0;
    }
  });

  const groups: FilterGroup[] = [
    {
      id: "resonance",
      label: t.builder.filters.resonance,
      options: resonanceValues.map((p) => ({ value: p, label: t.properties[p] })),
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-mist">{t.builder.curatorIntro}</p>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Optional filter rail — off to the side, not a required step */}
        <aside className="lg:sticky lg:top-28 lg:w-40 lg:shrink-0 lg:self-start">
          <FilterBar
            groups={groups}
            selected={selected}
            onToggle={toggle}
            onReset={reset}
            resultLabel={t.builder.filters.results(filtered.length)}
            resetLabel={t.builder.filters.reset}
            sort={{
              label: t.builder.filters.sortBy,
              options: sortOptions,
              value: sortBy,
              onChange: setSortBy,
            }}
          />
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <p className="border border-dashed border-hairline-soft p-10 text-center text-xs text-faint">
              {t.builder.filters.none}
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map(({ preset }, idx) => (
                <CuratorCard key={preset.id} preset={preset} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
