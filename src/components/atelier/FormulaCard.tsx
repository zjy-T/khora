"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, ShoppingCart, Send, X } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { BEAD_BY_SLUG } from "@/lib/beads";
import type { BraceletFormula } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { localizeBead } from "@/lib/beads.i18n";
import { localizeBracelet } from "@/lib/presets.i18n";

const ease = [0.22, 1, 0.36, 1] as const;

/** A compact, still circular arrangement of the formula's stones. */
function MiniLoop({ slugs }: { slugs: string[] }) {
  const size = 150;
  const center = size / 2;
  const bead = 30;
  const radius = center - bead / 2 - 4;
  const count = slugs.length;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        aria-hidden
        className="absolute rounded-full border border-hairline-soft"
        style={{ inset: bead / 2 }}
      />
      {slugs.map((slug, i) => {
        const stone = BEAD_BY_SLUG[slug];
        if (!stone) return null;
        const theta = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(theta) - bead / 2;
        const y = center + radius * Math.sin(theta) - bead / 2;
        return (
          <span
            key={`${slug}-${i}`}
            className="absolute"
            style={{ left: x, top: y }}
          >
            <BeadOrb bead={stone} size={bead} />
          </span>
        );
      })}
    </div>
  );
}

type Comment = { id: number; author: string; text: string; ts: string };

export function FormulaCard({
  formula,
  index,
}: {
  formula: BraceletFormula;
  index: number;
}) {
  const { t, locale } = useI18n();
  const L = localizeBracelet(formula, locale);
  const stones = formula.beadSequence
    .map((s) => BEAD_BY_SLUG[s])
    .filter(Boolean);
  const uniqueNames = [
    ...new Set(stones.map((s) => localizeBead(s, locale).title)),
  ];

  // Deterministic seed from formula.id to avoid SSR hydration mismatch
  const seedLikes = formula.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 20 + 3;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(seedLikes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, author: "Luna", text: "这串太美了！配色很有层次感 ✨", ts: "2天前" },
  ]);
  const [draft, setDraft] = useState("");

  function handleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
  }

  function postComment() {
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), author: "你", text: draft.trim(), ts: "刚刚" },
    ]);
    setDraft("");
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay: (index % 3) * 0.1 }}
      className="flex flex-col border border-hairline-soft bg-obsidian transition-colors duration-700 hover:border-gold/50 hover:shadow-sm"
    >
      {/* Card body */}
      <div className="p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow">{formula.creatorName ?? t.atelier.anonymous}</p>
            <h3 className="mt-3 font-serif text-3xl text-bone">{L.name}</h3>
          </div>
          <div className="shrink-0">
            <MiniLoop slugs={formula.beadSequence} />
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-mist">{L.description}</p>

        {/* The formula */}
        <div className="mt-6 border-t border-hairline-soft pt-5">
          <p className="text-[0.62rem] uppercase tracking-luxe text-faint">
            {t.atelier.theFormula}
          </p>
          <p className="mt-2 text-sm text-bone">{uniqueNames.join(" · ")}</p>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-[0.62rem] uppercase tracking-luxe text-faint">
              {t.atelier.stonesLabel(formula.beadSequence.length)}
            </p>
            <p className="mt-1 font-serif text-3xl text-gold">
              ${formula.totalPrice.toLocaleString()}
            </p>
          </div>
          <button className="inline-flex items-center gap-2.5 border border-hairline px-6 py-3.5 text-[0.7rem] uppercase tracking-luxe text-gold transition-all duration-500 hover:bg-gold hover:text-[#faf8f4]">
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t.atelier.purchase}
          </button>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-1 border-t border-hairline-soft px-6 py-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded px-3 py-2 text-[0.68rem] uppercase tracking-luxe transition-all duration-300 ${
            liked
              ? "text-red-500"
              : "text-faint hover:text-mist"
          }`}
        >
          <Heart
            className="h-3.5 w-3.5"
            strokeWidth={1.5}
            fill={liked ? "currentColor" : "none"}
          />
          {t.atelier.likes(likeCount)}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded px-3 py-2 text-[0.68rem] uppercase tracking-luxe text-faint transition-colors hover:text-mist"
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t.atelier.comments} ({comments.length})
        </button>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden border-t border-hairline-soft"
          >
            <div className="px-6 py-5 space-y-4">
              {/* Existing comments */}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-charcoal text-[0.6rem] font-bold text-mist">
                    {c.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-bone">{c.author}</span>
                      <span className="text-[0.6rem] text-faint">{c.ts}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-mist">{c.text}</p>
                  </div>
                </div>
              ))}

              {/* Add comment */}
              <div className="flex items-center gap-2 border-t border-hairline-soft pt-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                  placeholder={t.atelier.addComment}
                  className="flex-1 bg-transparent text-sm text-bone placeholder:text-faint focus:outline-none"
                />
                <button
                  onClick={postComment}
                  disabled={!draft.trim()}
                  className="flex items-center justify-center rounded-full p-1.5 text-gold transition-colors hover:text-gold-soft disabled:text-faint"
                >
                  <Send className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
