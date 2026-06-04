"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

const ease = [0.22, 1, 0.36, 1] as const;

const portals = [
  {
    href: "/builder",
    label: "I",
    image: "/portal-builder.jpg",
    imagePosition: "center center",
    span: "md:col-span-7 md:row-span-2",
    minH: "min-h-[34rem]",
  },
  {
    href: "/encyclopedia",
    label: "II",
    image: "/portal-lore.jpg",
    imagePosition: "center center",
    span: "md:col-span-5",
    minH: "min-h-[20rem]",
  },
  {
    href: "/atelier",
    label: "III",
    image: "/portal-atelier.jpg",
    imagePosition: "center 30%",
    span: "md:col-span-5",
    minH: "min-h-[20rem]",
  },
];

export function EntryPortals() {
  const { t } = useI18n();

  const labels = [
    { title: t.nav.builder, sub: t.nav.builderSub },
    { title: t.nav.lore, sub: t.nav.loreSub },
    { title: t.nav.atelier, sub: t.nav.atelierSub },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12">
      <div className="grid auto-rows-[1fr] grid-cols-1 gap-2 md:grid-cols-12">
        {portals.map((p, i) => (
          <motion.div
            key={p.href}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, ease, delay: i * 0.1 }}
            className={p.span}
          >
            <Link
              href={p.href}
              className={`group relative flex ${p.minH} h-full flex-col justify-end overflow-hidden`}
            >
              <img
                src={p.image}
                alt={labels[i].title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
                style={{ objectPosition: p.imagePosition }}
              />

              {/* Persistent gradient */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(14,13,11,0.88) 0%, rgba(14,13,11,0.2) 55%, rgba(14,13,11,0.0) 100%)",
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-7 md:p-9">
                <span className="font-serif text-[0.65rem] text-white/40">{p.label}</span>
                <h3 className="mt-1 font-serif text-2xl font-light tracking-wide text-white md:text-3xl">
                  {labels[i].title}
                </h3>
                <p className="mt-1.5 text-[0.68rem] uppercase tracking-[0.2em] text-white/75">
                  {labels[i].sub}
                </p>
                <div className="mt-5 h-px w-0 bg-white/40 transition-all duration-700 [transition-timing-function:var(--ease-luxe)] group-hover:w-10" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
