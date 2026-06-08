import type { CartItem } from "@/components/cart/CartProvider";
import type { CurrencyCode } from "@/lib/currency";

// Kicks off checkout: POST the cart + chosen currency to the ops platform, which
// creates a Stripe Checkout Session and returns its hosted URL to redirect to.

const OPS_URL = process.env.NEXT_PUBLIC_OPS_URL;

function sessionId(): string | undefined {
  try {
    let id = localStorage.getItem("khora_sid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("khora_sid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export type CheckoutResult = { ok: true } | { ok: false; reason: "unconfigured" | "error" };

export async function startCheckout(
  items: CartItem[],
  currency: CurrencyCode,
): Promise<CheckoutResult> {
  if (!OPS_URL || items.length === 0) return { ok: false, reason: "error" };
  try {
    const res = await fetch(`${OPS_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({
        currency,
        sessionId: sessionId(),
        items: items.map((i) => ({
          id: i.id,
          kind: i.kind,
          name: i.name,
          slug: i.slug,
          price: i.price,
          beadSequence: i.beadSequence,
          qty: i.qty,
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url as string;
      return { ok: true };
    }
    if (res.status === 503 || data.error === "payments_unconfigured") {
      return { ok: false, reason: "unconfigured" };
    }
    return { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
