"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Price } from "@/components/ui/Price";
import { motion } from "framer-motion";
import { TabBar, type BuilderTab } from "@/components/builder/TabBar";
import {
  BraceletPreview,
  type BeadPlacement,
} from "@/components/builder/BraceletPreview";
import { BeadLoreSlideOver } from "@/components/builder/BeadLoreSlideOver";
import { CuratorPanel } from "@/components/builder/CuratorPanel";
import { AlchemistPanel } from "@/components/builder/AlchemistPanel";
import { OraclePanel } from "@/components/builder/OraclePanel";
import { DestinyPanel } from "@/components/builder/DestinyPanel";
import { BraceletRadar } from "@/components/builder/BraceletRadar";
import { Button } from "@/components/ui/Button";
import { BEAD_BY_SLUG, sequencePrice, sequenceDiameterMm } from "@/lib/beads";
import type { Bead, DesignAgentResponse } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { FIT_ALLOWANCE_MM } from "@/lib/wrist";

const ease = [0.22, 1, 0.36, 1] as const;

export function BuilderShell() {
  const { t, locale } = useI18n();
  const { addItem, openPanel } = useCart();
  const [tab, setTab] = useState<BuilderTab>("curator");
  const [placements, setPlacements] = useState<BeadPlacement[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [loreBead, setLoreBead] = useState<Bead | null>(null);
  // null = not yet selected (shows gate in Custom Build)
  const [wristMm, setWristMm] = useState<number | null>(null);
  const resetWristMm = useCallback(() => setWristMm(null), []);

  // Wrist preview (AI generated on-body photo)
  const [previewMode, setPreviewMode] = useState<"ring" | "wrist">("ring");
  const [wristImgUrl, setWristImgUrl] = useState<string | null>(null);
  const [wristImgLoading, setWristImgLoading] = useState(false);
  const wristImgSlugsRef = useRef<string>("");
  const keyCounter = useRef(0);

  const nextKey = useCallback(() => `b${keyCounter.current++}`, []);

  const loadSequence = useCallback(
    (slugs: string[]) =>
      setPlacements(slugs.map((slug) => ({ key: nextKey(), slug }))),
    [nextKey],
  );

  const handleOracle = useCallback(
    (res: DesignAgentResponse) => {
      setName(res.braceletName);
      // Size the preview loop to the wrist the Oracle filled for, so the strand
      // reads as a complete bracelet rather than a small floating cluster.
      if (typeof res.wristMm === "number") setWristMm(res.wristMm);
      loadSequence(res.beads);
    },
    [loadSequence],
  );

  const addBead = useCallback(
    (slug: string) => setPlacements((prev) => [...prev, { key: nextKey(), slug }]),
    [nextKey],
  );

  const removeKey = useCallback(
    (key: string) => setPlacements((prev) => prev.filter((p) => p.key !== key)),
    [],
  );

  const clearAll = useCallback(() => {
    setPlacements([]);
    setName(null);
  }, []);

  const reorderBeads = useCallback((fromKey: string, toKey: string) => {
    setPlacements((prev) => {
      const from = prev.findIndex((p) => p.key === fromKey);
      const to = prev.findIndex((p) => p.key === toKey);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const total = sequencePrice(placements.map((p) => p.slug));

  const handleAcquire = useCallback(() => {
    const slugs = placements.map((p) => p.slug);
    if (slugs.length === 0) return;
    addItem({
      id: `custom-${slugs.join("-")}`,
      kind: "custom",
      name: name ?? t.builder.untitled,
      price: total,
      beadSequence: slugs,
    });
    openPanel("cart");
  }, [placements, name, total, addItem, openPanel, t.builder.untitled]);

  // Bracelet capacity from wrist size
  const braceletMm = wristMm !== null ? wristMm + FIT_ALLOWANCE_MM : null;
  const usedMm = sequenceDiameterMm(placements.map((p) => p.slug));
  const atCapacity = braceletMm !== null && usedMm >= braceletMm;

  const handlePreviewSelect = useCallback(
    (placement: BeadPlacement) => {
      if (tab === "alchemist") {
        removeKey(placement.key);
      } else {
        const bead = BEAD_BY_SLUG[placement.slug];
        if (bead) setLoreBead(bead);
      }
    },
    [tab, removeKey],
  );

  // Generate on-wrist AI photo whenever user switches to wrist mode (or slugs change)
  const generateWristPreview = useCallback(async (slugs: string[]) => {
    if (slugs.length === 0) return;
    const key = slugs.join(",");
    if (wristImgSlugsRef.current === key && wristImgUrl) return; // already generated
    wristImgSlugsRef.current = key;
    setWristImgLoading(true);
    setWristImgUrl(null);
    try {
      const res = await fetch("/api/wrist-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      });
      const data = await res.json();
      if (data.url) setWristImgUrl(data.url);
    } catch {
      // silently fall back to ring view
      setPreviewMode("ring");
    } finally {
      setWristImgLoading(false);
    }
  }, [wristImgUrl]);

  const handleSetPreviewMode = useCallback((mode: "ring" | "wrist") => {
    setPreviewMode(mode);
    if (mode === "wrist") {
      generateWristPreview(placements.map((p) => p.slug));
    }
  }, [placements, generateWristPreview]);

  return (
    <>
      {/* Sub-navigation bar — sits flush beneath the fixed top navbar */}
      <div className="border-b border-hairline-soft pt-24 md:pt-28">
        <div className="mx-auto max-w-[1760px] px-6 md:px-10 2xl:px-16">
          <TabBar active={tab} onChange={setTab} />
        </div>
      </div>

      <div className="mx-auto max-w-[1760px] px-6 pb-28 pt-10 md:px-10 2xl:px-16">
      <div className={`grid gap-10 ${tab === "curator" ? "" : "lg:grid-cols-[1.6fr_1fr] lg:gap-16"}`}>
        <div className="min-h-[30rem]">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            {tab === "curator" && <CuratorPanel />}
            {tab === "alchemist" && (
              <AlchemistPanel
                placements={placements}
                name={name}
                wristMm={wristMm}
                braceletMm={braceletMm}
                usedMm={usedMm}
                atCapacity={atCapacity}
                onSetWristMm={setWristMm}
                onResetWristMm={resetWristMm}
                onAdd={addBead}
                onRemove={removeKey}
                onClear={clearAll}
                onShowLore={setLoreBead}
                onReorder={reorderBeads}
                onLoadDesign={(slugs, designName) => {
                  setName(designName);
                  loadSequence(slugs);
                }}
              />
            )}
            {tab === "oracle" && (
              <OraclePanel onResult={handleOracle} onShowLore={setLoreBead} />
            )}
            {tab === "destiny" && (
              <DestinyPanel onResult={handleOracle} onShowLore={setLoreBead} />
            )}
          </motion.div>
        </div>

        {tab !== "curator" && (
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="border border-hairline-soft bg-charcoal/30 p-8">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <span className="eyebrow">{t.builder.livePreview}</span>
                <div className="flex items-center gap-3">
                  {tab === "alchemist" && placements.length > 0 && previewMode === "ring" && (
                    <span className="text-[0.62rem] uppercase tracking-luxe text-faint">
                      {t.builder.tapToRemove}
                    </span>
                  )}
                  {placements.length > 0 && previewMode === "ring" && (
                    <button
                      onClick={clearAll}
                      className="text-[0.6rem] uppercase tracking-luxe text-faint transition-colors hover:text-clay"
                    >
                      Remove All
                    </button>
                  )}
                </div>
              </div>

              {/* Preview mode toggle — only when stones are placed */}
              {placements.length > 0 && (
                <div className="mt-4 inline-flex border border-hairline-soft">
                  {(["ring", "wrist"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleSetPreviewMode(mode)}
                      className={`px-4 py-1.5 text-[0.6rem] uppercase tracking-luxe transition-colors duration-200 ${
                        mode === "ring" ? "" : "border-l border-hairline-soft"
                      } ${previewMode === mode ? "bg-bone/10 text-bone" : "text-mist hover:text-bone/60"}`}
                    >
                      {mode === "ring" ? "Bracelet" : "On Wrist"}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Ring preview ── */}
              {previewMode === "ring" && (
                <div className="-mx-8 mt-6 mb-0">
                  <BraceletPreview
                    beads={placements}
                    circumferenceMm={braceletMm}
                    onSelect={handlePreviewSelect}
                    removable={tab === "alchemist"}
                  />
                </div>
              )}

              {/* ── On-wrist AI preview ── */}
              {previewMode === "wrist" && (
                <div className="-mx-8 mt-6 mb-0 relative" style={{ aspectRatio: "1/1" }}>
                  {wristImgLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-charcoal/20">
                      <div className="h-px w-12 animate-pulse bg-gold/60" />
                      <p className="text-[0.6rem] uppercase tracking-luxe text-faint">
                        Generating your bracelet…
                      </p>
                    </div>
                  )}
                  {wristImgUrl && !wristImgLoading && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={wristImgUrl}
                      alt="Bracelet on wrist"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  )}
                  {!wristImgUrl && !wristImgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-[0.6rem] uppercase tracking-luxe text-faint">
                        Preview unavailable
                      </p>
                    </div>
                  )}
                </div>
              )}

              <BraceletRadar beads={placements} />

              <div className="border-t border-hairline-soft pt-6">
                {tab !== "alchemist" && (
                  <p className="font-serif text-2xl text-bone">
                    {name ?? t.builder.untitled}
                  </p>
                )}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-luxe text-faint">
                      {placements.length} {t.builder.stonesLower(placements.length)}
                    </p>
                    <p className="mt-1 font-serif text-3xl text-gold">
                      <Price amount={total} />
                    </p>
                  </div>
                  <Button
                    onClick={handleAcquire}
                    disabled={placements.length === 0}
                    variant={placements.length ? "solid" : "outline"}
                  >
                    {t.builder.acquire}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BeadLoreSlideOver bead={loreBead} onClose={() => setLoreBead(null)} />
      </div>
    </>
  );
}
