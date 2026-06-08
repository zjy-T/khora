"use client";

import { useState } from "react";
import { Price } from "@/components/ui/Price";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { Button } from "@/components/ui/Button";
import { BEADS, BEAD_BY_SLUG } from "@/lib/beads";
import type {
  Bead,
  DesignAgentRequest,
  DesignAgentResponse,
} from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";
import { WRIST_OPTIONS, DEFAULT_WRIST_MM } from "@/lib/wrist";

const VIBES: DesignAgentRequest["vibe"][] = [
  "Grounded",
  "Radiant",
  "Tranquil",
  "Ambitious",
  "Mystical",
];

type Props = {
  onResult: (res: DesignAgentResponse) => void;
  onShowLore: (bead: Bead) => void;
};

export function OraclePanel({ onResult, onShowLore }: Props) {
  const { t, locale } = useI18n();
  const [intention, setIntention] = useState("");
  const [vibe, setVibe] = useState<DesignAgentRequest["vibe"]>("Grounded");
  const [budget, setBudget] = useState(900);
  // Wrist circumference in mm. Required first interaction — starts unselected so
  // the wearer must pick a size before choosing stones or consulting.
  const [wristMm, setWristMm] = useState<number | null>(null);
  const [affinities, setAffinities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DesignAgentResponse | null>(null);

  function toggleAffinity(slug: string) {
    setAffinities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function consult() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const payload: DesignAgentRequest = {
        intention,
        vibe,
        budget,
        affinities,
        wristMm: wristMm ?? DEFAULT_WRIST_MM,
        locale,
      };
      const res = await fetch("/api/design-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.builder.oracleError);
      setResult(data as DesignAgentResponse);
      onResult(data as DesignAgentResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.builder.oracleError);
    } finally {
      setLoading(false);
    }
  }

  const sizeChosen = wristMm !== null;

  return (
    <div className="space-y-7">
      <p className="text-sm leading-relaxed text-mist">{t.builder.oracleIntro}</p>

      {/* Wrist size — the required FIRST interaction (click-select chips,
          same as Custom Build). Everything else stays gated until it's set. */}
      <div>
        <span className="eyebrow">{t.builder.wristSize}</span>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          {t.builder.wristSizeHint}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {WRIST_OPTIONS.map((mm) => {
            const active = wristMm === mm;
            return (
              <button
                key={mm}
                type="button"
                onClick={() => setWristMm(mm)}
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
        </div>
      </div>

      {/* Intention */}
      <label className="block">
        <span className="eyebrow">{t.builder.yourIntention}</span>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          rows={3}
          placeholder={t.builder.intentionPlaceholder}
          className="lux-scroll mt-3 w-full resize-none border border-hairline-soft bg-charcoal/40 p-4 text-sm text-bone placeholder:text-faint focus:border-gold"
        />
      </label>

      {/* Vibe */}
      <div>
        <span className="eyebrow">{t.builder.theCurrent}</span>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          {t.builder.theCurrentHint}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`border px-4 py-2 text-[0.7rem] uppercase tracking-luxe transition-all duration-300 ${
                vibe === v
                  ? "border-gold bg-gold text-[#faf8f4]"
                  : "border-hairline-soft text-mist hover:border-hairline"
              }`}
            >
              {t.vibes[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className="flex items-center justify-between">
          <span className="eyebrow">{t.builder.investment}</span>
          <span className="font-serif text-lg text-gold">
            <Price amount={budget} />
          </span>
        </div>
        <input
          type="range"
          min={400}
          max={1600}
          step={50}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-3 w-full accent-[#D4AF37]"
        />
      </div>

      {/* Affinities — gated: a wrist size must be chosen first */}
      <div>
        <span className="eyebrow">{t.builder.drawnTo}</span>
        {sizeChosen ? (
          <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-8">
            {BEADS.map((bead) => {
              const on = affinities.includes(bead.slug);
              return (
                <button
                  key={bead.slug}
                  onClick={() => toggleAffinity(bead.slug)}
                  title={localizeBead(bead, locale).title}
                  className={`flex items-center justify-center rounded-full p-0.5 transition-all ${
                    on ? "ring-1 ring-gold" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <BeadOrb bead={bead} size={34} active={on} />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 border border-dashed border-hairline-soft p-6 text-center text-xs leading-relaxed text-faint">
            {t.builder.steps.sizeGate}
          </p>
        )}
      </div>

      <Button onClick={consult} disabled={loading || !sizeChosen} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t.builder.consulting}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" strokeWidth={1.5} /> {t.builder.consult}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-clay">{error}</p>}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="border border-gold/40 bg-charcoal/40 p-6"
          >
            <span className="eyebrow">{t.builder.oracleComposes}</span>
            <h3 className="display mt-2 text-3xl text-bone">
              {result.braceletName}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              {result.narrative}
            </p>

            <div className="mt-5 space-y-2.5 border-t border-hairline-soft pt-5">
              {Object.entries(result.rationale).map(([slug, reason]) => {
                const bead = BEAD_BY_SLUG[slug];
                if (!bead) return null;
                return (
                  <button
                    key={slug}
                    onClick={() => onShowLore(bead)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <BeadOrb bead={bead} size={28} />
                    <span className="flex-1 text-xs leading-snug text-mist">
                      {reason}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-hairline-soft pt-4">
              <span className="text-[0.62rem] uppercase tracking-luxe text-faint">
                {t.builder.loadedIntoLoop}
              </span>
              <span className="font-serif text-xl text-gold">
                <Price amount={result.totalPrice} />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
