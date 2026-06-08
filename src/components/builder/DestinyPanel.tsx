"use client";

import { useState } from "react";
import { Price } from "@/components/ui/Price";
import { motion, AnimatePresence } from "framer-motion";
import { Stars, Loader2, Users } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { Button } from "@/components/ui/Button";
import { BEAD_BY_SLUG, sequencePrice } from "@/lib/beads";
import { DEFAULT_WRIST_MM, fillLoop } from "@/lib/wrist";
import type { Bead, DesignAgentResponse } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

type ChartMethod = "western" | "chinese" | "purpleStar" | "couple";

type Props = {
  onResult: (res: DesignAgentResponse) => void;
  onShowLore: (bead: Bead) => void;
};

/* ─── Mock destiny calculator ─────────────────────────────────────────────
   Deterministically maps birth-month → a bracelet recommendation.
   Replace with a real astrology/BaZi calculation service as needed.       */
const MONTH_PRESETS: Record<number, { slugs: string[]; element: string; sign: string }> = {
  1:  { slugs: ["amethyst", "clear-quartz", "smoky-quartz"], element: "水 Water", sign: "摩羯 Capricorn" },
  2:  { slugs: ["amethyst", "rose-quartz", "clear-quartz"], element: "水 Water", sign: "水瓶 Aquarius" },
  3:  { slugs: ["rose-quartz", "nephrite-jade", "clear-quartz"], element: "木 Wood", sign: "双鱼 Pisces" },
  4:  { slugs: ["nephrite-jade", "citrine", "rutilated-quartz"], element: "木 Wood", sign: "白羊 Aries" },
  5:  { slugs: ["nephrite-jade", "rose-quartz", "citrine"], element: "木 Wood", sign: "金牛 Taurus" },
  6:  { slugs: ["citrine", "clear-quartz", "rutilated-quartz"], element: "火 Fire", sign: "双子 Gemini" },
  7:  { slugs: ["gold-sheen-obsidian", "citrine", "tiger-eye"], element: "火 Fire", sign: "巨蟹 Cancer" },
  8:  { slugs: ["gold-sheen-obsidian", "tiger-eye", "rutilated-quartz"], element: "火 Fire", sign: "狮子 Leo" },
  9:  { slugs: ["lapis-lazuli", "clear-quartz", "amethyst"], element: "土 Earth", sign: "处女 Virgo" },
  10: { slugs: ["lapis-lazuli", "black-obsidian", "amethyst"], element: "金 Metal", sign: "天秤 Libra" },
  11: { slugs: ["black-obsidian", "black-hair-crystal", "red-agate"], element: "金 Metal", sign: "天蝎 Scorpio" },
  12: { slugs: ["amethyst", "lapis-lazuli", "smoky-quartz"], element: "水 Water", sign: "射手 Sagittarius" },
};

const METHOD_NARRATIVES: Record<ChartMethod, { zh: string; en: string }> = {
  western:    { zh: "根据你的星座盘，以下珠石与你的星座能量最为契合。", en: "Based on your astrological chart, these stones align best with your sign's energy." },
  chinese:    { zh: "根据你的生辰八字，以下配方能调和你命局中的五行偏缺。", en: "Based on your birth chart (BaZi), this bracelet balances your elemental constitution." },
  purpleStar: { zh: "紫微命盘显示，以下珠石有助于激活你的吉星，化解流年煞气。", en: "Your Purple Star chart suggests these stones activate auspicious stars and dissolve annual obstacles." },
  couple:     { zh: "两人命盘合参，以下配方有助于加深彼此的能量共鸣与情感连结。", en: "Your combined charts suggest these stones strengthen your shared energy and emotional bond." },
};

const SHICHEN = [
  "子时 23:00–01:00", "丑时 01:00–03:00", "寅时 03:00–05:00", "卯时 05:00–07:00",
  "辰时 07:00–09:00", "巳时 09:00–11:00", "午时 11:00–13:00", "未时 13:00–15:00",
  "申时 15:00–17:00", "酉时 17:00–19:00", "戌时 19:00–21:00", "亥时 21:00–23:00",
];

export function DestinyPanel({ onResult, onShowLore }: Props) {
  const { t, locale } = useI18n();
  const [method, setMethod] = useState<ChartMethod>("western");
  const [birthDate, setBirthDate] = useState("");
  const [birthDate2, setBirthDate2] = useState("");
  const [shichen, setShichen] = useState(SHICHEN[6]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    res: DesignAgentResponse;
    element: string;
    sign: string;
    narrative: string;
  } | null>(null);

  const methods: { id: ChartMethod; label: string; sub: string }[] = [
    { id: "western",    label: t.builder.destiny.methodWestern,    sub: t.builder.destiny.methodWesternSub },
    { id: "chinese",    label: t.builder.destiny.methodChinese,    sub: t.builder.destiny.methodChineseSub },
    { id: "purpleStar", label: t.builder.destiny.methodPurpleStar, sub: t.builder.destiny.methodPurpleStarSub },
    { id: "couple",     label: t.builder.destiny.methodCouple,     sub: t.builder.destiny.methodCoupleSub },
  ];

  async function calculate() {
    if (!birthDate) return;
    setLoading(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 1200));

    const month = new Date(birthDate).getMonth() + 1;
    const preset = MONTH_PRESETS[month] ?? MONTH_PRESETS[1];

    // For couple mode, mix both people's months
    let slugs = preset.slugs;
    if (method === "couple" && birthDate2) {
      const month2 = new Date(birthDate2).getMonth() + 1;
      const preset2 = MONTH_PRESETS[month2] ?? MONTH_PRESETS[6];
      slugs = [preset.slugs[0], preset2.slugs[0], preset.slugs[1], preset2.slugs[1], preset.slugs[0]];
    }

    // Fill the whole bracelet (default 15 cm wrist) by tiling the chart's
    // stones around the loop, rather than a fixed 8 beads. Uses the shared
    // fillLoop so Destiny and the Oracle behave identically.
    const beadsInLoop = fillLoop(slugs, DEFAULT_WRIST_MM);
    const rationale: Record<string, string> = {};
    slugs.forEach((slug) => {
      const bead = BEAD_BY_SLUG[slug];
      if (bead) {
        rationale[slug] = locale === "zh"
          ? `与你${preset.element}的五行能量相合，有助于${bead.name.replace("手串", "")}的功效显现。`
          : `Resonates with your ${preset.element} element, amplifying the stone's core energy.`;
      }
    });

    const braceletName = locale === "zh"
      ? `${preset.sign.split(" ")[0]}专属手串`
      : `${preset.sign.split(" ")[1] ?? preset.sign} Destiny Bracelet`;

    const narrative = METHOD_NARRATIVES[method][locale === "zh" ? "zh" : "en"];

    const response: DesignAgentResponse = {
      braceletName,
      narrative,
      beads: beadsInLoop,
      totalPrice: sequencePrice(beadsInLoop),
      wristMm: DEFAULT_WRIST_MM,
      rationale,
    };

    setResult({ res: response, element: preset.element, sign: preset.sign, narrative });
    onResult(response);
    setLoading(false);
  }

  const needsShichen = method === "chinese" || method === "purpleStar";

  return (
    <div className="space-y-7">
      <p className="text-sm leading-relaxed text-mist">{t.builder.destiny.intro}</p>

      {/* Chart method selector */}
      <div>
        <span className="eyebrow">{t.builder.destiny.method}</span>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-col border p-4 text-left transition-all duration-300 ${
                method === m.id
                  ? "border-gold bg-charcoal/60"
                  : "border-hairline-soft hover:border-hairline"
              }`}
            >
              <span
                className={`text-sm font-medium transition-colors ${
                  method === m.id ? "text-gold" : "text-bone"
                }`}
              >
                {m.label}
              </span>
              <span className="mt-0.5 text-[0.6rem] text-faint">{m.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Birth info inputs */}
      {method === "couple" ? (
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="eyebrow">{t.builder.destiny.person1} · {t.builder.destiny.birthDate}</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-2 w-full border border-hairline-soft bg-charcoal/40 px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="eyebrow">{t.builder.destiny.person2} · {t.builder.destiny.birthDate}</span>
            <input
              type="date"
              value={birthDate2}
              onChange={(e) => setBirthDate2(e.target.value)}
              className="mt-2 w-full border border-hairline-soft bg-charcoal/40 px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="eyebrow">{t.builder.destiny.birthDate}</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-2 w-full border border-hairline-soft bg-charcoal/40 px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
            />
          </label>
          {needsShichen && (
            <label className="block">
              <span className="eyebrow">{t.builder.destiny.birthHour}</span>
              <select
                value={shichen}
                onChange={(e) => setShichen(e.target.value)}
                className="mt-2 w-full border border-hairline-soft bg-charcoal/40 px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
              >
                {SHICHEN.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          )}
          {method === "western" && (
            <label className="block">
              <span className="eyebrow">{t.builder.destiny.birthTime}</span>
              <input
                type="time"
                className="mt-2 w-full border border-hairline-soft bg-charcoal/40 px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
              />
            </label>
          )}
        </div>
      )}

      <Button
        onClick={calculate}
        disabled={loading || !birthDate}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.builder.destiny.calculating}
          </>
        ) : (
          <>
            <Stars className="h-4 w-4" strokeWidth={1.5} />
            {t.builder.destiny.calculate}
          </>
        )}
      </Button>

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
            <div className="flex items-center gap-3">
              {method === "couple" && <Users className="h-4 w-4 text-gold/70" strokeWidth={1.5} />}
              <span className="eyebrow">{t.builder.destiny.result}</span>
            </div>
            <h3 className="display mt-2 text-3xl text-bone">
              {result.res.braceletName}
            </h3>

            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <span className="rounded border border-hairline-soft px-3 py-1 text-mist">
                {t.builder.destiny.yourElement}: <span className="text-gold">{result.element}</span>
              </span>
              <span className="rounded border border-hairline-soft px-3 py-1 text-mist">
                {t.builder.destiny.yourSign}: <span className="text-gold">{result.sign}</span>
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-mist">
              {result.narrative}
            </p>

            <div className="mt-5 space-y-2.5 border-t border-hairline-soft pt-5">
              {Object.entries(result.res.rationale).map(([slug, reason]) => {
                const bead = BEAD_BY_SLUG[slug];
                if (!bead) return null;
                return (
                  <button
                    key={slug}
                    onClick={() => onShowLore(bead)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <BeadOrb bead={bead} size={28} />
                    <span className="flex-1 text-xs leading-snug text-mist">{reason}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-hairline-soft pt-4">
              <span className="text-[0.62rem] uppercase tracking-luxe text-faint">
                {t.builder.loadedIntoLoop}
              </span>
              <span className="font-serif text-xl text-gold">
                <Price amount={result.res.totalPrice} />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
