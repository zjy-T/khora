"use client";

import { useCurrency } from "@/components/i18n/CurrencyProvider";

// Renders a base-currency (CNY) amount in the shopper's selected display
// currency. A client component so it can live inside server-rendered pages too;
// suppresses hydration warnings because the server renders the CNY default and
// the client may switch to a saved currency.
export function Price({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { formatPrice } = useCurrency();
  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(amount)}
    </span>
  );
}
