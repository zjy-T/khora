"use client";

import { useCurrency } from "@/components/i18n/CurrencyProvider";
import type { CurrencyCode } from "@/lib/currency";

/** Compact display-currency selector (native select, styled to the navbar). */
export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="Currency"
        className="appearance-none cursor-pointer border border-hairline-soft bg-transparent py-1.5 pl-2.5 pr-6 text-[0.62rem] uppercase tracking-luxe text-mist transition-colors duration-300 hover:text-gold focus:outline-none focus:text-gold"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code} className="bg-obsidian text-bone">
            {c.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <svg
        className="pointer-events-none absolute right-2 h-2 w-2 text-mist"
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden
      >
        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </label>
  );
}
