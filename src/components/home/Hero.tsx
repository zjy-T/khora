"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative h-screen min-h-[620px] overflow-hidden">
      {/* Full-bleed image */}
      <img
        src="/hero.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Main overlay — lighter in the middle to show the image */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Dedicated top scrim — always dark enough for navbar legibility */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-36"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)",
        }}
      />

      {/* Bottom-anchored content */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-24 text-center md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.3 }}
          className="mb-8 text-[0.55rem] uppercase tracking-[0.5em] text-white/40"
        >
          {t.home.heroEyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease, delay: 0.45 }}
          className="font-serif text-[3.6rem] font-light leading-[0.93] tracking-[-0.01em] text-white sm:text-[5.5rem] md:text-[7.5rem]"
        >
          {t.home.heroTitle1}
          <br />
          <em className="not-italic" style={{ color: "var(--color-gold)" }}>
            {t.home.heroTitle2}
          </em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.85 }}
          className="mt-12 flex items-center gap-5"
        >
          <Link
            href="/builder"
            className="border border-white/60 px-8 py-3 text-[0.6rem] uppercase tracking-[0.28em] text-white transition-all duration-500 hover:bg-white hover:text-obsidian"
          >
            {t.home.composePiece}
          </Link>
          <Link
            href="/encyclopedia"
            className="text-[0.6rem] uppercase tracking-[0.28em] text-white/45 transition-colors duration-300 hover:text-white/80"
          >
            {t.home.enterLore}
          </Link>
        </motion.div>
      </div>

      {/* Scroll mark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.4 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2"
        aria-hidden
      >
        <div className="h-9 w-px overflow-hidden bg-white/15">
          <motion.div
            className="h-full w-full bg-white/50"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
