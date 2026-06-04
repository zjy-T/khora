"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

const ease = [0.22, 1, 0.36, 1] as const;

export function Philosophy() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed editorial image */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <img
          src="/editorial.jpg"
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,248,244,0) 0%, rgba(250,248,244,0) 60%, rgba(250,248,244,1) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(250,248,244,0.6) 0%, rgba(250,248,244,0) 50%)",
          }}
        />

        {/* Editorial label over image */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 md:left-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease }}
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/60" />
              <span className="eyebrow">{t.home.philosophyEyebrow}</span>
            </div>
            <h2 className="display mt-4 text-balance text-4xl leading-tight text-bone md:text-[3.5rem]">
              {t.home.philosophyTitle1}
              <br />
              {t.home.philosophyTitle2}
              <br />
              <span className="italic text-gold">
                {t.home.philosophyTitleEmph}
              </span>
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Tenets */}
      <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-16 md:px-10">
        <div className="grid gap-0 md:grid-cols-3">
          {t.home.tenets.map((tenet, i) => (
            <motion.div
              key={tenet.term}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease, delay: i * 0.12 }}
              className="border-t border-hairline-soft py-8 pr-10 first:border-t-0 md:border-l md:border-t-0 md:pl-10 md:pr-0 md:first:border-l-0 md:first:pl-0"
            >
              <span className="font-serif text-4xl text-gold/20">0{i + 1}</span>
              <h3 className="mt-4 font-serif text-xl text-bone">{tenet.term}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                {tenet.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
