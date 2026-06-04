"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Info, Plus, Trash2, Save, RotateCcw, GripVertical } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { BEADS, BEAD_BY_SLUG } from "@/lib/beads";
import type { Bead } from "@/lib/types";
import type { BeadPlacement } from "@/components/builder/BraceletPreview";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";

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

const WRIST_OPTIONS = [140, 150, 160, 170, 180, 190, 200] as const;

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
  const dragKey = useRef<string | null>(null);
  const dragOverKey = useRef<string | null>(null);

  useEffect(() => {
    setSavedDesigns(loadSaved());
  }, []);

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

  // ── Wrist size gate ─────────────────────────────────────────────────────────
  if (wristMm === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[28rem] flex-col items-center justify-center text-center"
      >
        <p className="eyebrow mb-6">Before you begin</p>
        <h2 className="display mb-3 text-3xl text-bone md:text-4xl">
          What is your wrist size?
        </h2>
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-mist">
          We'll use this to tell you exactly how many stones fit your bracelet — and stop you before you go over.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {WRIST_OPTIONS.map((mm) => (
            <button
              key={mm}
              onClick={() => onSetWristMm(mm)}
              className="group flex flex-col items-center border border-hairline-soft px-6 py-4 transition-all duration-300 hover:border-gold hover:bg-charcoal/20"
            >
              <span className="font-serif text-2xl text-bone transition-colors group-hover:text-gold">
                {mm / 10}
              </span>
              <span className="mt-1 text-[0.55rem] uppercase tracking-luxe text-faint">
                cm
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-[0.65rem] text-faint">
          Measure the circumference of your wrist with a soft tape.
        </p>
      </motion.div>
    );
  }

  // ── Capacity bar ────────────────────────────────────────────────────────────
  const capacityPct = braceletMm ? Math.min((usedMm / braceletMm) * 100, 100) : 0;
  const nearLimit = braceletMm && usedMm >= braceletMm - 15 && !atCapacity;

  return (
    <div className="space-y-8">
      {/* Capacity indicator + wrist size */}
      <div className="border border-hairline-soft p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] uppercase tracking-luxe text-mist">
              {locale === "zh" ? "手腕" : "Wrist"} {wristMm! / 10}cm
            </span>
            <button
              onClick={onResetWristMm}
              className="text-[0.55rem] uppercase tracking-luxe text-faint/60 underline decoration-dotted hover:text-faint transition-colors"
            >
              change
            </button>
          </div>
          <span className={`text-[0.6rem] uppercase tracking-luxe ${
            atCapacity ? "text-clay" : nearLimit ? "text-gold" : "text-mist"
          }`}>
            {atCapacity
              ? (locale === "zh" ? "已满" : "Full")
              : `${usedMm} / ${braceletMm}mm`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] w-full bg-hairline rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-500 ${
              atCapacity ? "bg-clay" : nearLimit ? "bg-gold" : "bg-bone/40"
            }`}
            animate={{ width: `${capacityPct}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div>
        <p className="text-sm leading-relaxed text-mist">
          {t.builder.alchemistIntro}
        </p>

        {/* Inventory */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BEADS.map((bead) => {
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
                    {bead.metaphysicalProperty}
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
      </div>

      {/* Current sequence */}
      <div>
        <div className="flex items-center justify-between">
          <p className="eyebrow">
            {t.builder.sequence} · {placements.length}
          </p>
          <div className="flex items-center gap-3">
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
      </div>

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
