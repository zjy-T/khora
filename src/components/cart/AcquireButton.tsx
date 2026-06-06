"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart, type CartItem } from "@/components/cart/CartProvider";

/**
 * Adds a catalog piece to the cart and opens the cart drawer.
 * Used on the product detail page; briefly confirms the add.
 */
export function AcquireButton({
  item,
  label,
  className = "",
}: {
  item: Omit<CartItem, "qty">;
  label?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const { addItem, openPanel } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(id);
  }, [added]);

  function handleClick() {
    addItem(item);
    setAdded(true);
    openPanel("cart");
  }

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-center justify-center gap-2 border border-bone bg-bone py-4 font-sans text-[0.65rem] uppercase tracking-luxe text-obsidian transition-colors hover:border-gold hover:bg-gold ${className}`}
    >
      {added && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
      {added ? t.cart.addedNote : label ?? t.builder.acquire}
    </button>
  );
}
