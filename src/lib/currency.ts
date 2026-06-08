// Multi-currency display for the storefront. All catalog prices are stored and
// reasoned about in the base currency (CNY / RMB) — the atelier buys and sells
// in RMB. Shoppers may switch the *display* currency to a popular one; prices
// are converted with live FX rates (fetched in CurrencyProvider) and rounded UP
// to a clean whole number, then shown as a committed price (no decimals, no "≈").
//
// Why a committed whole number: a payment processor (e.g. Stripe) charges an
// exact integer amount in the chosen currency, so the displayed price must equal
// the charged price. Rounding up also quietly absorbs FX drift and the
// processor's ~1–2% conversion fee.

export const BASE_CURRENCY = "CNY" as const;

export type CurrencyCode =
  | "CNY"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "HKD"
  | "AUD"
  | "CAD"
  | "SGD";

export type CurrencyDef = {
  code: CurrencyCode;
  /** Short label for the selector, e.g. "$ USD". */
  label: string;
  /** Locale used to format the amount (drives grouping + symbol). */
  locale: string;
};

// The base first, then the eight supported display currencies.
export const CURRENCIES: CurrencyDef[] = [
  { code: "CNY", label: "¥ CNY", locale: "zh-CN" },
  { code: "USD", label: "$ USD", locale: "en-US" },
  { code: "EUR", label: "€ EUR", locale: "de-DE" },
  { code: "GBP", label: "£ GBP", locale: "en-GB" },
  { code: "JPY", label: "¥ JPY", locale: "ja-JP" },
  { code: "HKD", label: "HK$ HKD", locale: "en-HK" },
  { code: "AUD", label: "A$ AUD", locale: "en-AU" },
  { code: "CAD", label: "C$ CAD", locale: "en-CA" },
  { code: "SGD", label: "S$ SGD", locale: "en-SG" },
];

export type Rates = Record<CurrencyCode, number>;

// Approximate fallback rates (1 CNY → X), used before live rates load or if the
// FX request fails. Kept deliberately rough; live rates override these.
export const STATIC_RATES: Rates = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.128,
  GBP: 0.108,
  JPY: 21.5,
  HKD: 1.08,
  AUD: 0.21,
  CAD: 0.19,
  SGD: 0.185,
};

export const FX_SYMBOLS = CURRENCIES.filter((c) => c.code !== BASE_CURRENCY).map(
  (c) => c.code,
);

const defByCode = new Map(CURRENCIES.map((c) => [c.code, c]));

/**
 * Convert a base-currency (CNY) amount into the chosen display currency and
 * return the committed, whole-number price the customer will be charged. The
 * base currency is shown as-is; other currencies are converted and rounded up.
 */
export function convertedAmount(
  amountCNY: number,
  currency: CurrencyCode,
  rates: Rates,
): number {
  if (currency === BASE_CURRENCY) return Math.round(amountCNY);
  const rate = rates[currency] ?? STATIC_RATES[currency];
  return Math.ceil(amountCNY * rate);
}

/**
 * Format a base-currency (CNY) amount into a clean, committed price string in the
 * chosen display currency — whole number, no "≈".
 */
export function formatMoney(
  amountCNY: number,
  currency: CurrencyCode,
  rates: Rates,
): string {
  const def = defByCode.get(currency) ?? CURRENCIES[0];
  return new Intl.NumberFormat(def.locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(convertedAmount(amountCNY, currency, rates));
}
