"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { BEAD_BY_SLUG } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Drawer } from "@/components/cart/Drawer";

/** A small circular bead arrangement for a cart line. */
function MiniLoop({ slugs, size = 64 }: { slugs: string[]; size?: number }) {
  const center = size / 2;
  const bead = Math.max(8, Math.min(14, (size / Math.max(slugs.length, 6)) * 1.6));
  const radius = center - bead / 2 - 1;
  const count = Math.max(slugs.length, 1);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        aria-hidden
        className="absolute rounded-full border border-hairline-soft"
        style={{ inset: bead / 2 }}
      />
      {slugs.map((slug, i) => {
        const stone = BEAD_BY_SLUG[slug];
        if (!stone) return null;
        const theta = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(theta) - bead / 2;
        const y = center + radius * Math.sin(theta) - bead / 2;
        return (
          <span key={`${slug}-${i}`} className="absolute" style={{ left: x, top: y }}>
            <BeadOrb bead={stone} size={bead} />
          </span>
        );
      })}
    </div>
  );
}

export function CartPanel() {
  const { t } = useI18n();
  const { items, subtotal, count, setQty, removeItem, panel, closePanel } = useCart();
  const open = panel === "cart";

  const footer =
    items.length > 0 ? (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.62rem] uppercase tracking-luxe text-faint">
            {t.cart.subtotal}
          </span>
          <span className="font-serif text-2xl text-bone">
            ${subtotal.toLocaleString()}
          </span>
        </div>
        <button className="w-full border border-bone bg-bone py-4 font-sans text-[0.65rem] uppercase tracking-luxe text-obsidian transition-colors hover:border-gold hover:bg-gold">
          {t.cart.checkout}
        </button>
        <p className="text-center text-[0.6rem] uppercase tracking-luxe text-faint">
          {t.cart.shippingNote}
        </p>
      </div>
    ) : undefined;

  return (
    <Drawer
      open={open}
      onClose={closePanel}
      title={`${t.cart.title}${count > 0 ? ` · ${count}` : ""}`}
      footer={footer}
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <ShoppingBag className="h-7 w-7 text-faint" strokeWidth={1} />
          <div>
            <p className="font-serif text-xl text-bone">{t.cart.empty}</p>
            <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-mist">
              {t.cart.emptyHint}
            </p>
          </div>
          <Link
            href="/builder"
            onClick={closePanel}
            className="mt-2 border border-hairline px-6 py-3 text-[0.62rem] uppercase tracking-luxe text-bone transition-colors hover:border-gold hover:text-gold"
          >
            {t.cart.browse}
          </Link>
        </div>
      ) : (
        <ul className="space-y-7">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <MiniLoop slugs={item.beadSequence} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {item.slug ? (
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closePanel}
                        className="truncate font-serif text-lg text-bone transition-colors hover:text-gold"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="truncate font-serif text-lg text-bone">{item.name}</p>
                    )}
                    <p className="mt-0.5 text-[0.6rem] uppercase tracking-luxe text-faint">
                      {t.cart.stones(item.beadSequence.length)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={t.cart.remove}
                    className="shrink-0 text-faint transition-colors hover:text-clay"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-hairline-soft">
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="px-2.5 py-1.5 text-mist transition-colors hover:text-bone"
                    >
                      <Minus className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                    <span className="min-w-[1.75rem] text-center text-xs text-bone">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="px-2.5 py-1.5 text-mist transition-colors hover:text-bone"
                    >
                      <Plus className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                  <span className="font-serif text-lg text-gold">
                    ${(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
