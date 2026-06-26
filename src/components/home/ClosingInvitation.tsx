"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { blurData } from "@/lib/blur-data";

const ease = [0.22, 1, 0.36, 1] as const;

export function ClosingInvitation() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <Image
        src="/closing.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        placeholder="blur"
        blurDataURL={blurData["/closing.jpg"]}
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "rgba(14,13,11,0.72)" }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 py-44 text-center md:py-56">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease }}
          className="font-serif text-4xl font-light text-white md:text-6xl"
        >
          {t.home.ctaTitle1}
          <br />
          {t.home.ctaTitle2}
          <em className="not-italic" style={{ color: "var(--color-gold)" }}>
            {t.home.ctaTitleEmph}
          </em>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease, delay: 0.25 }}
          className="mt-12"
        >
          <Link
            href="/builder"
            className="border border-white/50 px-10 py-3.5 text-[0.6rem] uppercase tracking-[0.28em] text-white transition-all duration-500 hover:bg-white hover:text-obsidian"
          >
            {t.home.ctaButton}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
