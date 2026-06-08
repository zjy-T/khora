"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function Footer() {
  const { t, locale } = useI18n();

  const columns = [
    {
      heading: t.footer.house,
      links: [
        { href: "/builder", label: t.nav.builder },
        { href: "/encyclopedia", label: t.nav.lore },
        { href: "/atelier", label: t.nav.atelier },
      ],
    },
    {
      heading: t.footer.philosophy,
      links: [
        { href: "/encyclopedia", label: t.footer.resonance },
        { href: "/builder", label: t.footer.alchemy },
        { href: "/atelier", label: t.footer.collectors },
      ],
    },
  ];

  return (
    <footer className="border-t border-hairline-soft bg-obsidian">
      <div className="mx-auto max-w-[1760px] px-6 py-16 md:px-10 2xl:px-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="font-serif text-xl tracking-[0.25em] text-bone">
              KHORA
            </p>
            <p className="mt-1 font-serif text-[0.7rem] tracking-[0.4em] text-mist">
              衡石
            </p>
            <p className="mt-6 max-w-xs text-xs leading-relaxed text-mist">
              {t.footer.tagline}
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} className="flex flex-col gap-3">
              <p className="eyebrow mb-1">{col.heading}</p>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-xs text-mist transition-colors hover:text-bone"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-hairline-soft pt-7 text-[0.58rem] uppercase tracking-[0.22em] text-faint md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} KHORA</span>
          <Link
            href="/contact"
            className="text-faint transition-colors hover:text-bone"
          >
            {locale === "zh" ? "联系我们" : "Contact"}
          </Link>
          <span>{t.footer.motto}</span>
        </div>
      </div>
    </footer>
  );
}
