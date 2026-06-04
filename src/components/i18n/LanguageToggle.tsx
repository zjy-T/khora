"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { LOCALES, localeLabel } from "@/lib/i18n";

/** A minimal EN / 中文 segmented toggle. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={`inline-flex items-center border border-hairline-soft ${className}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`px-2.5 py-1.5 text-[0.62rem] uppercase tracking-luxe transition-colors duration-300 ${
            locale === l
              ? "bg-gold text-[#faf8f4]"
              : "text-mist hover:text-gold"
          }`}
        >
          {localeLabel[l]}
        </button>
      ))}
    </div>
  );
}
