"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";

const OPS_URL = process.env.NEXT_PUBLIC_OPS_URL;

type Order = {
  number: string;
  total: string;
  customerName: string | null;
  shippingAddress: string | null;
  placedAt: string;
  items: { name: string; qty: number }[];
  emailed?: boolean;
  paymentStatus?: string;
  paymentProvider?: string | null;
};

const COPY = {
  en: {
    confirmedTitle: "Order confirmed",
    thanks: "Thank you — your payment was received.",
    finalizing: "Confirming your payment…",
    order: "Order",
    items: "Items",
    total: "Total",
    payment: "Payment",
    paid: "Paid",
    shipTo: "Shipping to",
    emailed: "A confirmation has been sent to your email.",
    continue: "Continue exploring",
    missing: "We couldn't find this order. If you were charged, your confirmation email has the details.",
    nextTitle: "What happens next",
    next1: "Your piece is made to order — we're composing it now.",
    next2: "We'll email a separate shipping confirmation with tracking, usually within 5–7 business days.",
    next3: "Need a change or refund? Request it below — we'll be in touch.",
    requestCta: "Request a change or refund",
    requestPlaceholder: "Tell us what you'd like to change (or why you'd like a refund)…",
    requestSubmit: "Send request",
    requestSent: "Request received — we'll follow up by email or live chat shortly.",
    policies: "Shipping & Returns",
  },
  zh: {
    confirmedTitle: "订单已确认",
    thanks: "感谢您 —— 我们已收到您的付款。",
    finalizing: "正在确认您的付款…",
    order: "订单",
    items: "商品",
    total: "合计",
    payment: "支付",
    paid: "已支付",
    shipTo: "寄送至",
    emailed: "确认邮件已发送至您的邮箱。",
    continue: "继续探索",
    missing: "未能找到此订单。如已扣款，确认邮件中包含详情。",
    nextTitle: "接下来",
    next1: "您的作品为接单定制 —— 我们正在为您编排制作。",
    next2: "发货后我们将另发一封含物流单号的发货确认邮件，通常在 5–7 个工作日内。",
    next3: "需要修改或退款？请在下方提交，我们会尽快与您联系。",
    requestCta: "申请修改或退款",
    requestPlaceholder: "请告诉我们您希望修改的内容（或退款原因）…",
    requestSubmit: "提交申请",
    requestSent: "已收到您的申请 —— 我们将很快通过邮件或在线客服与您联系。",
    policies: "配送与退换",
  },
} as const;

export function OrderSuccess() {
  const { locale } = useI18n();
  const t = COPY[locale] ?? COPY.en;
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "done" | "missing">("loading");
  const [reqOpen, setReqOpen] = useState(false);
  const [reqText, setReqText] = useState("");
  const [reqSent, setReqSent] = useState(false);
  const [reqSending, setReqSending] = useState(false);

  async function submitRequest() {
    const reason = reqText.trim();
    if (!reason || !OPS_URL || !sessionId) return;
    setReqSending(true);
    let khoraSid: string | undefined;
    try {
      khoraSid = localStorage.getItem("khora_sid") ?? undefined;
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch(`${OPS_URL}/api/order/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ stripeSessionId: sessionId, sessionId: khoraSid, reason }),
      });
      if (res.ok) {
        setReqSent(true);
        setReqOpen(false);
      }
    } catch {
      /* leave form open to retry */
    } finally {
      setReqSending(false);
    }
  }

  useEffect(() => {
    if (!sessionId || !OPS_URL) {
      setState("missing");
      return;
    }
    let tries = 0;
    let stop = false;
    // The cart has been paid — clear it so it doesn't linger.
    clear();

    async function poll() {
      tries += 1;
      try {
        const res = await fetch(
          `${OPS_URL}/api/order?session_id=${encodeURIComponent(sessionId!)}`,
          { mode: "cors" },
        );
        const data = await res.json();
        if (stop) return;
        if (data.ready && data.order) {
          setOrder(data.order as Order);
          setState("done");
          return;
        }
      } catch {
        /* retry */
      }
      if (tries >= 12) {
        if (!stop) setState("missing");
        return;
      }
      if (!stop) setTimeout(poll, 2000);
    }
    poll();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <section className="mx-auto max-w-[680px] px-6 py-24 md:py-32">
      {state === "loading" && (
        <div className="text-center">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-hairline border-t-gold" />
          <p className="text-sm text-mist">{t.finalizing}</p>
        </div>
      )}

      {state === "missing" && (
        <div className="text-center">
          <h1 className="font-serif text-4xl text-bone">{t.confirmedTitle}</h1>
          <p className="mt-5 text-sm leading-relaxed text-mist">{t.missing}</p>
          <Link
            href="/"
            className="mt-8 inline-block border border-hairline px-7 py-3.5 text-[0.78rem] uppercase tracking-[0.18em] text-bone transition-colors hover:border-gold hover:text-gold"
          >
            {t.continue}
          </Link>
        </div>
      )}

      {state === "done" && order && (
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-[#faf8f4]">
              <Check size={18} />
            </span>
            <h1 className="font-serif text-4xl tracking-tight text-bone">
              {t.confirmedTitle}
            </h1>
          </div>
          <p className="mt-4 text-sm text-mist">
            {t.thanks} {order.emailed ? t.emailed : ""}
          </p>

          <div className="mt-10 border border-hairline">
            <div className="flex items-baseline justify-between border-b border-hairline px-6 py-4">
              <span className="eyebrow">{t.order}</span>
              <span className="font-serif text-lg text-bone">{order.number}</span>
            </div>
            <div className="px-6 py-4">
              <p className="eyebrow mb-3">{t.items}</p>
              <ul className="space-y-2">
                {order.items.map((it, i) => (
                  <li key={i} className="flex justify-between text-sm text-bone">
                    <span>
                      {it.name} <span className="text-mist">× {it.qty}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-baseline justify-between border-t border-hairline px-6 py-4">
              <span className="eyebrow">{t.total}</span>
              <span className="font-serif text-2xl text-bone">{order.total}</span>
            </div>
            <div className="flex items-center justify-between border-t border-hairline px-6 py-4">
              <span className="eyebrow">{t.payment}</span>
              <span className="text-sm text-bone">
                <span className="text-positive">● </span>
                {t.paid}
                {order.paymentProvider
                  ? ` · ${order.paymentProvider[0].toUpperCase()}${order.paymentProvider.slice(1)}`
                  : ""}
              </span>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="mt-6 border border-hairline">
              <div className="px-6 py-4">
                <p className="eyebrow mb-2">{t.shipTo}</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-bone">
                  {order.shippingAddress}
                </p>
              </div>
              <iframe
                title="Shipping location"
                className="h-48 w-full border-0 border-t border-hairline"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  order.shippingAddress.replace(/\n/g, ", "),
                )}&z=15&output=embed`}
              />
            </div>
          )}

          <div className="mt-6 border border-hairline px-6 py-5">
            <p className="eyebrow mb-3">{t.nextTitle}</p>
            <ul className="space-y-2 text-sm leading-relaxed text-mist">
              <li>— {t.next1}</li>
              <li>— {t.next2}</li>
              <li>— {t.next3}</li>
            </ul>

            {/* Request a change / refund */}
            <div className="mt-5 border-t border-hairline pt-4">
              {reqSent ? (
                <p className="text-sm text-positive">{t.requestSent}</p>
              ) : !reqOpen ? (
                <button
                  type="button"
                  onClick={() => setReqOpen(true)}
                  className="text-[0.7rem] uppercase tracking-luxe text-bone underline-offset-4 hover:text-gold hover:underline"
                >
                  {t.requestCta}
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={reqText}
                    onChange={(e) => setReqText(e.target.value)}
                    rows={3}
                    placeholder={t.requestPlaceholder}
                    className="w-full resize-none border border-hairline bg-transparent px-3 py-2 text-sm text-bone placeholder:text-faint focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={reqSending || !reqText.trim()}
                    className="bg-bone px-6 py-2.5 text-[0.65rem] uppercase tracking-luxe text-obsidian transition-colors hover:bg-gold disabled:opacity-50"
                  >
                    {t.requestSubmit}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <Link
              href="/"
              className="inline-block bg-gold px-8 py-3.5 text-[0.78rem] uppercase tracking-[0.18em] text-[#faf8f4] transition-all hover:tracking-[0.22em]"
            >
              {t.continue}
            </Link>
            <Link
              href="/shipping-returns"
              className="text-[0.7rem] uppercase tracking-luxe text-mist transition-colors hover:text-gold"
            >
              {t.policies}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
