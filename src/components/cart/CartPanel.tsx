"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { BEAD_BY_SLUG } from "@/lib/beads";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { Drawer } from "@/components/cart/Drawer";

/**
 * A small bracelet thumbnail for a cart line. Mirrors the main BeadPlate
 * preview: beads are packed edge-to-edge around a closed loop using their real
 * millimetre diameters, so the thumbnail reads as the actual piece (a full
 * strand) rather than evenly-spaced dots on a fixed ring.
 */
const REF_MM = 10; // fallback diameter
const PAD_PX = 4; // breathing room so beads never clip the thumbnail edge
const TWO_PI = Math.PI * 2;

function MiniLoop({ slugs, size = 72 }: { slugs: string[]; size?: number }) {
  const sized = slugs
    .map((slug) => ({ slug, stone: BEAD_BY_SLUG[slug] }))
    .filter((b) => b.stone)
    .map((b) => ({ slug: b.slug, stone: b.stone!, d: b.stone!.diameterMm ?? REF_MM }));

  // The beads define their own closed loop: circumference = total diameter.
  const circ = Math.max(
    sized.reduce((s, b) => s + b.d, 0),
    1,
  );
  const R = circ / TWO_PI; // loop radius (mm)

  // Place each bead's centre (in mm, around origin) by cumulative arc length so
  // neighbours touch edge-to-edge.
  let acc = 0;
  const pts = sized.map((b) => {
    const theta = -Math.PI / 2 + (acc + b.d / 2) / R;
    acc += b.d;
    return { ...b, mx: R * Math.cos(theta), my: R * Math.sin(theta) };
  });

  // Measure the TRUE bounding box (bead centres ± radii), then scale that to fit
  // the thumbnail. This guarantees nothing clips, whatever the arrangement.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.mx - p.d / 2);
    maxX = Math.max(maxX, p.mx + p.d / 2);
    minY = Math.min(minY, p.my - p.d / 2);
    maxY = Math.max(maxY, p.my + p.d / 2);
  }
  const contentW = Math.max(maxX - minX, 1);
  const contentH = Math.max(maxY - minY, 1);
  const scale = (size - PAD_PX * 2) / Math.max(contentW, contentH);
  const cx = (minX + maxX) / 2; // content centre (mm)
  const cy = (minY + maxY) / 2;
  const toX = (m: number) => (m - cx) * scale + size / 2;
  const toY = (m: number) => (m - cy) * scale + size / 2;
  const ringDia = 2 * R * scale;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Cord loop */}
      <div
        aria-hidden
        className="absolute rounded-full border border-hairline-soft"
        style={{
          left: toX(0),
          top: toY(0),
          width: ringDia,
          height: ringDia,
          transform: "translate(-50%, -50%)",
        }}
      />
      {pts.map((b, i) => {
        const px = b.d * scale;
        return (
          <span
            key={`${b.slug}-${i}`}
            className="absolute block"
            style={{
              left: toX(b.mx),
              top: toY(b.my),
              width: px,
              height: px,
              lineHeight: 0,
              transform: "translate(-50%, -50%)",
            }}
          >
            <BeadOrb bead={b.stone} size={px} />
          </span>
        );
      })}
    </div>
  );
}

/**
 * Cart line thumbnail. Catalog pieces (curated / community) show their real
 * product photo — the same shot as the product page — so the cart matches what
 * the customer saw. Custom builds have no product photo, so they fall back to
 * the rendered bead loop. A missing/failed photo also falls back to the loop.
 */
function CartThumb({ item, size = 72 }: { item: CartItem; size?: number }) {
  const [failed, setFailed] = useState(false);
  const usePhoto = item.kind !== "custom" && !!item.slug && !failed;

  if (usePhoto) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-sm bg-obsidian"
        style={{ width: size, height: size }}
      >
        <Image
          src={`/bracelets/${item.slug}-shot-1.jpg`}
          alt={item.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  return <MiniLoop slugs={item.beadSequence} size={size} />;
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
              <CartThumb item={item} />
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
