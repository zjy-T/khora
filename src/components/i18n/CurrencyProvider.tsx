"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  BASE_CURRENCY,
  CURRENCIES,
  FX_SYMBOLS,
  STATIC_RATES,
  formatMoney,
  type CurrencyCode,
  type CurrencyDef,
  type Rates,
} from "@/lib/currency";

type CurrencyValue = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencies: CurrencyDef[];
  rates: Rates;
  /** Format a base-currency (CNY) amount into the selected display currency. */
  formatPrice: (amountCNY: number) => string;
};

const CurrencyContext = createContext<CurrencyValue | null>(null);

const CURRENCY_KEY = "khora-currency";
const RATES_KEY = "khora-fx";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // refresh live rates twice a day

// Free, no-key, CORS-enabled FX (ECB reference rates via Frankfurter).
const FX_URL = `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${FX_SYMBOLS.join(",")}`;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to the base currency on first paint (matches SSR); hydrate the saved
  // preference + cached/live rates in effects to avoid hydration mismatches.
  const [currency, setCurrencyState] = useState<CurrencyCode>(BASE_CURRENCY);
  const [rates, setRates] = useState<Rates>(STATIC_RATES);

  useEffect(() => {
    const saved = window.localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
    if (saved && CURRENCIES.some((c) => c.code === saved)) {
      setCurrencyState(saved);
    }
  }, []);

  useEffect(() => {
    // Use cached rates immediately if fresh; otherwise fetch live ones.
    try {
      const raw = window.localStorage.getItem(RATES_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { ts: number; rates: Rates };
        if (cached?.rates) setRates({ ...STATIC_RATES, ...cached.rates });
        if (cached?.ts && Date.now() - cached.ts < MAX_AGE_MS) return;
      }
    } catch {
      /* ignore bad cache */
    }

    let cancelled = false;
    fetch(FX_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { rates?: Partial<Rates> }) => {
        if (cancelled || !data?.rates) return;
        const next = { ...STATIC_RATES, ...data.rates, CNY: 1 } as Rates;
        setRates(next);
        window.localStorage.setItem(
          RATES_KEY,
          JSON.stringify({ ts: Date.now(), rates: next }),
        );
      })
      .catch(() => {
        /* keep static/cached rates */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    window.localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  const formatPrice = useCallback(
    (amountCNY: number) => formatMoney(amountCNY, currency, rates),
    [currency, rates],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, currencies: CURRENCIES, rates, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx)
    throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
