"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Info, Plus, Trash2, Save, RotateCcw, GripVertical } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { BEADS, BEAD_BY_SLUG, RESONANCE_ORDER, MATERIAL_ORDER } from "@/lib/beads";
import type { Bead, Material, ResonanceTag } from "@/lib/types";
import type { BeadPlacement } from "@/components/builder/BraceletPreview";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";
import { FilterBar, type FilterGroup } from "@/components/builder/FilterBar";
import { WRIST_OPTIONS } from "@/lib/wrist";

type SavedDesign = {
  id: string;
  name: string;
  slugs: string[];
  savedAt: number;
};

const STORAGE_KEY = "mystic-atelier-designs";

function loadSaved(): SavedDesign[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistSaved(designs: SavedDesign[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

/** A numbered step header — guides the user through the 1-2-3 build flow. */
function StepHeading({
  n,
  title,
  hint,
}: {
  n: number;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-serif text-3xl leading-none text-gold/60">{n}</span>
      <div>
        <h3 className="font-serif text-xl text-bone md:text-2xl">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-mist">{hint}</p>
      </div>
    </div>
  );
}

type Props = {
  placements: BeadPlacement[];
  name: string | null;
  wristMm: number | null;
  braceletMm: number | null;
  usedMm: number;
  atCapacity: boolean;
  onSetWristMm: (mm: number) => void;
  onResetWristMm: () => void;
  onAdd: (slug: string) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
  onShowLore: (bead: Bead) => void;
  onLoadDesign: (slugs: string[], name: string) => void;
  onReorder: (fromKey: string, toKey: string) => void;
};

export function AlchemistPanel({
  placements,
  name,
  wristMm,
  braceletMm,
  usedMm,
  atCapacity,
  onSetWristMm,
  onResetWristMm,
  onAdd,
  onRemove,
  onClear,
  onShowLore,
  onLoadDesign,
  onReorder,
}: Props) {
  const { t, locale } = useI18n();
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    resonance: [],
    material: [],
    size: [],
  });
  const [sortBy, setSortBy] = useState("featured");
  const dragKey = useRef<string | null>(null);
  const dragOverKey = useRef<string | null>(null);

  useEffect(() => {
    setSavedDesigns(loadSaved());
  }, []);

  // Filter facets, derived from the catalog so they track the dataset.
  const resonanceValues = RESONANCE_ORDER.filter((p) =>
    BEADS.some((b) => b.resonance.includes(p)),
  ) as ResonanceTag[];
  const materialValues = MATERIAL_ORDER.filter((m) =>
    BEADS.some((b) => b.material === m),
  ) as Material[];
  const sizeValues = [...new Set(BEADS.map((b) => b.diameterMm))].sort(
    (a, b) => a - b,
  );

  const toggleFilter = (groupId: string, value: string) =>
    setFilters((prev) => {
      const cur = prev[groupId] ?? [];
      return {
        ...prev,
        [groupId]: cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value],
      };
    });

  const resetFilters = () => {
    setFilters({ resonance: [], material: [], size: [] });
    setSortBy("featured");
  };

  const sortOptions = [
    { value: "featured", label: t.builder.filters.sortFeatured },
    { value: "price-asc", label: t.builder.filters.sortPriceAsc },
    { value: "price-desc", label: t.builder.filters.sortPriceDesc },
    { value: "size-asc", label: t.builder.filters.sortSizeAsc },
    { value: "size-desc", label: t.builder.filters.sortSizeDesc },
    { value: "name-asc", label: t.builder.filters.sortNameAsc },
  ];

  const filteredBeads = BEADS.filter((bead) => {
    const res = filters.resonance;
    const mat = filters.material;
    const sz = filters.size;
    const okRes = res.length === 0 || bead.resonance.some((r) => res.includes(r));
    const okMat = mat.length === 0 || mat.includes(bead.material);
    const okSize = sz.length === 0 || sz.includes(String(bead.diameterMm));
    return okRes && okMat && okSize;
  });

  const sortedBeads = [...filteredBeads].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "size-asc":
        return a.diameterMm - b.diameterMm;
      case "size-desc":
        return b.diameterMm - a.diameterMm;
      case "name-asc":
        return a.westernName.localeCompare(b.westernName);
      default:
        return 0; // featured = catalog order
    }
  });

  const filterGroups: FilterGroup[] = [
    {
      id: "resonance",
      label: t.builder.filters.resonance,
      options: resonanceValues.map((p) => ({
        value: p,
        label: t.properties[p],
      })),
    },
    {
      id: "material",
      label: t.builder.filters.material,
      options: materialValues.map((m) => ({
        value: m,
        label: t.materials[m],
      })),
    },
    {
      id: "size",
      label: t.builder.filters.size,
      options: sizeValues.map((mm) => ({ value: String(mm), label: `${mm}mm` })),
    },
  ];

  function saveDesign() {
    if (placements.length === 0) return;
    const stones = placements
      .map((p) => BEAD_BY_SLUG[p.slug]?.westernName ?? p.slug)
      .slice(0, 3)
      .join(" · ");
    const designName = `${stones} — ${new Date().toLocaleDateString()}`;
    const newDesign: SavedDesign = {
      id: `design-${Date.now()}`,
      name: designName,
      slugs: placements.map((p) => p.slug),
      savedAt: Date.now(),
    };
    const updated = [newDesign, ...savedDesigns].slice(0, 20);
    setSavedDesigns(updated);
    persistSaved(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  function deleteDesign(id: string) {
    const updated = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(updated);
    persistSaved(updated);
  }

  // ── Capacity bar ────────────────────────────────────────────────────────────
  const capacityPct = braceletMm ? Math.min((usedMm / braceletMm) * 100, 100) : 0;
  const nearLimit = braceletMm && usedMm >= braceletMm - 15 && !atCapacity;

  // Wrist size is the required first interaction: no stones until it's chosen.
  const sizeChosen = wristMm !== null;

  return (
    <div className="space-y-12">
      {/* ── Step 1 · Wrist size (required first step) ───────────────────────────── */}
      <section className="space-y-5">
        <StepHeading
          n={1}
          title={t.builder.steps.sizeTitle}
          hint={t.builder.steps.sizeHint}
        />
        <div className="flex flex-wrap items-center gap-2">
          {WRIST_OPTIONS.map((mm) => {
            const active = wristMm === mm;
            return (
              <button
                key={mm}
                onClick={() => onSetWristMm(mm)}
                aria-pressed={active}
                className={`flex flex-col items-center border px-4 py-2 transition-all duration-300 ${
                  active
                    ? "border-gold bg-charcoal/30"
                    : "border-hairline-soft hover:border-gold/60 hover:bg-charcoal/15"
                }`}
              >
                <span
                  className={`font-serif text-lg transition-colors ${
                    active ? "text-gold" : "text-bone"
                  }`}
                >
                  {mm / 10}
                </span>
                <span className="text-[0.5rem] uppercase tracking-luxe text-faint">
                  cm
                </span>
              </button>
            );
          })}
          {wristMm !== null && (
            <button
              onClick={onResetWristMm}
              className="ml-1 text-[0.55rem] uppercase tracking-luxe text-faint/60 underline decoration-dotted transition-colors hover:text-faint"
            >
              {t.builder.steps.clearSize}
            </button>
          )}
        </div>

        {/* Capacity indicator — appears once a size is chosen */}
        {wristMm !== null && (
          <div className="border border-hairline-soft p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.6rem] uppercase tracking-luxe text-mist">
                {locale === "zh" ? "手腕" : "Wrist"} {wristMm / 10}cm
              </span>
              <span
                className={`text-[0.6rem] uppercase tracking-luxe ${
                  atCapacity ? "text-clay" : nearLimit ? "text-gold" : "text-mist"
                }`}
              >
                {atCapacity
                  ? locale === "zh"
                    ? "已满"
                    : "Full"
                  : `${usedMm} / ${braceletMm}mm`}
              </span>
            </div>
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-hairline">
              <motion.div
                className={`h-full rounded-full transition-colors duration-500 ${
                  atCapacity ? "bg-clay" : nearLimit ? "bg-gold" : "bg-bone/40"
                }`}
                animate={{ width: `${capacityPct}%` }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Step 2 · Add your stones ───────────────────────────────────────────── */}
      <section className="space-y-5">
        <StepHeading
          n={2}
          title={t.builder.steps.stonesTitle}
          hint={t.builder.steps.stonesHint}
        />

        {/* Gate: a wrist size must be chosen before any stone can be added. */}
        {!sizeChosen ? (
          <div className="flex flex-col items-center gap-2 border border-dashed border-hairline-soft p-10 text-center">
            <span className="text-[0.6rem] uppercase tracking-luxe text-gold">
              {locale === "zh" ? "第一步" : "Step One"}
            </span>
            <p className="max-w-xs text-xs leading-relaxed text-faint">
              {t.builder.steps.sizeGate}
            </p>
          </div>
        ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Optional filter rail — off to the side, not a required step */}
          <aside className="lg:sticky lg:top-28 lg:w-36 lg:shrink-0 lg:self-start">
            <FilterBar
              groups={filterGroups}
              selected={filters}
              onToggle={toggleFilter}
              onReset={resetFilters}
              resultLabel={t.builder.filters.stoneResults(filteredBeads.length)}
              resetLabel={t.builder.filters.reset}
              sort={{
                label: t.builder.filters.sortBy,
                options: sortOptions,
                value: sortBy,
                onChange: setSortBy,
              }}
            />
          </aside>

          {/* Inventory */}
          <div className="flex-1">
            {filteredBeads.length === 0 ? (
              <p className="border border-dashed border-hairline-soft p-10 text-center text-xs text-faint">
                {t.builder.filters.noneStones}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {sortedBeads.map((bead) => {
            const L = localizeBead(bead, locale);
            return (
              <div
                key={bead.slug}
                className="group relative flex flex-col items-center gap-3 border border-hairline-soft p-4 transition-colors hover:border-hairline"
              >
                <button
                  onClick={() => onShowLore(bead)}
                  className="absolute right-2 top-2 text-faint transition-colors hover:text-gold"
                  aria-label={t.builder.loreOf(L.title)}
                >
                  <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>

                <BeadOrb bead={bead} size={56} />
                <div className="text-center">
                  <p className="text-xs leading-tight text-bone">{L.title}</p>
                  <p className="mt-1 text-[0.55rem] uppercase tracking-luxe text-mist">
                    {t.properties[bead.resonance[0]]}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <p className="text-[0.55rem] uppercase tracking-luxe text-faint">
                      {bead.diameterMm}mm
                    </p>
                    <span className="text-faint/30">·</span>
                    <p className="text-[0.62rem] text-faint">¥{bead.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => !atCapacity && onAdd(bead.slug)}
                  disabled={atCapacity}
                  className={`flex w-full items-center justify-center gap-1.5 border py-2 text-[0.6rem] uppercase tracking-luxe transition-all ${
                    atCapacity
                      ? "cursor-not-allowed border-hairline-soft text-faint/40"
                      : "border-hairline-soft text-mist hover:border-gold hover:text-gold"
                  }`}
                >
                  <Plus className="h-3 w-3" strokeWidth={2} />
                  {t.builder.add}
                </button>
              </div>
            );
          })}
              </div>
            )}
          </div>
        </div>
        )}
      </section>

      {/* ── Step 3 · Arrange your bracelet ─────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <StepHeading
            n={3}
            title={t.builder.steps.arrangeTitle}
            hint={t.builder.steps.arrangeHint}
          />
          <div className="flex shrink-0 items-center gap-3 pt-1">
            {placements.length > 0 && (
              <>
                <button
                  onClick={saveDesign}
                  className={`flex items-center gap-1.5 text-[0.62rem] uppercase tracking-luxe transition-colors ${
                    justSaved ? "text-gold" : "text-faint hover:text-gold"
                  }`}
                >
                  <Save className="h-3 w-3" strokeWidth={1.5} />
                  {justSaved ? t.builder.designSaved : t.builder.saveDesign}
                </button>
                <button
                  onClick={onClear}
                  className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-luxe text-faint transition-colors hover:text-clay"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                  {t.builder.clear}
                </button>
              </>
            )}
          </div>
        </div>

        {placements.length === 0 ? (
          <p className="mt-4 border border-dashed border-hairline-soft p-6 text-center text-xs text-faint">
            {t.builder.noStones}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {placements.map((p, i) => {
              const bead = BEAD_BY_SLUG[p.slug];
              if (!bead) return null;
              const L = localizeBead(bead, locale);
              return (
                <motion.li
                  key={p.key}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  draggable
                  onDragStart={() => { dragKey.current = p.key; }}
                  onDragOver={(e) => { e.preventDefault(); dragOverKey.current = p.key; }}
                  onDrop={() => {
                    if (dragKey.current && dragOverKey.current && dragKey.current !== dragOverKey.current) {
                      onReorder(dragKey.current, dragOverKey.current);
                    }
                    dragKey.current = null;
                    dragOverKey.current = null;
                  }}
                  onDragEnd={() => { dragKey.current = null; dragOverKey.current = null; }}
                  className="flex cursor-grab items-center gap-3 border border-hairline-soft px-3 py-2 active:cursor-grabbing"
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-faint" strokeWidth={1.5} />
                  <span className="w-5 text-center font-serif text-sm text-gold/60">
                    {i + 1}
                  </span>
                  <BeadOrb bead={bead} size={30} />
                  <span className="flex-1 text-sm text-bone">{L.title}</span>
                  <span className="text-[0.55rem] uppercase tracking-luxe text-faint">{bead.diameterMm}mm</span>
                  <span className="text-xs text-faint">¥{bead.price}</span>
                  <button
                    onClick={() => onRemove(p.key)}
                    className="text-faint transition-colors hover:text-clay"
                    aria-label={t.builder.removeAria(L.title)}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Saved designs */}
      <div>
        <p className="eyebrow">{t.builder.myDesigns}</p>
        {savedDesigns.length === 0 ? (
          <p className="mt-4 border border-dashed border-hairline-soft p-6 text-center text-xs text-faint">
            {t.builder.noSavedDesigns}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {savedDesigns.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 border border-hairline-soft px-4 py-3"
              >
                <div className="flex -space-x-1.5">
                  {d.slugs.slice(0, 5).map((slug, i) => {
                    const bead = BEAD_BY_SLUG[slug];
                    if (!bead) return null;
                    return <BeadOrb key={`${slug}-${i}`} bead={bead} size={22} />;
                  })}
                  {d.slugs.length > 5 && (
                    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-charcoal text-[0.5rem] text-faint">
                      +{d.slugs.length - 5}
                    </span>
                  )}
                </div>
                <span className="flex-1 truncate text-sm text-bone">{d.name}</span>
                <button
                  onClick={() => onLoadDesign(d.slugs, d.name)}
                  className="flex items-center gap-1 text-[0.6rem] uppercase tracking-luxe text-gold transition-colors hover:text-gold-soft"
                >
                  <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
                  {t.builder.loadDesign}
                </button>
                <button
                  onClick={() => deleteDesign(d.id)}
                  className="text-faint transition-colors hover:text-clay"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
