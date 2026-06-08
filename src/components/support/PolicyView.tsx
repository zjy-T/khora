"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";

// Shipping & Returns policy. Draft copy — edit the numbers/terms to match your
// actual fulfilment. Bilingual via the existing locale.

const COPY = {
  en: {
    eyebrow: "The Atelier",
    title: "Shipping & Returns",
    sections: [
      {
        h: "Made to order",
        p: "Every KHORA piece is composed by hand after you order. Please allow 5–7 business days for your bracelet to be made before it ships.",
      },
      {
        h: "Shipping",
        p: "We ship worldwide with tracked courier. You'll receive a separate email with a tracking number once your order is on its way. Delivery typically takes 5–10 business days depending on destination. Any customs duties or import taxes are the recipient's responsibility.",
      },
      {
        h: "Returns & exchanges",
        p: "If something isn't right, contact us within 14 days of delivery. Unworn pieces in original condition may be returned for a refund or exchange. Made-to-order and custom compositions are final sale unless they arrive faulty or damaged.",
      },
      {
        h: "Faulty or damaged items",
        p: "If your piece arrives damaged or develops a fault, reach out with your order number and a photo — we'll make it right with a repair, replacement, or full refund.",
      },
      {
        h: "How to start a return",
        p: "Use the 'Request a change or refund' option on your order confirmation, reply to your confirmation email, or contact us via live chat with your order number.",
      },
    ],
    note: "These terms are a starting point — adjust them to your final policy.",
  },
  zh: {
    eyebrow: "工坊",
    title: "配送与退换",
    sections: [
      {
        h: "接单定制",
        p: "每一件 KHORA 作品均在您下单后手工编排制作，发货前请预留 5–7 个工作日的制作时间。",
      },
      {
        h: "配送",
        p: "我们提供全球可追踪快递配送。订单发出后，您将收到另一封含物流单号的邮件。配送通常需 5–10 个工作日，视目的地而定。任何关税或进口税由收件人承担。",
      },
      {
        h: "退货与换货",
        p: "如有任何不满意，请在签收后 14 天内联系我们。未佩戴且保持原状的作品可退款或换货。接单定制与自由编排之作除到货存在瑕疵或损坏外，恕不退换。",
      },
      {
        h: "瑕疵或损坏",
        p: "若作品到货损坏或出现质量问题，请提供订单号与照片联系我们 —— 我们将以维修、补发或全额退款妥善处理。",
      },
      {
        h: "如何申请退换",
        p: "您可在订单确认页使用「申请修改或退款」、回复确认邮件，或通过在线客服提供订单号联系我们。",
      },
    ],
    note: "以上条款为初始模板，请按您的最终政策进行调整。",
  },
} as const;

export function PolicyView() {
  const { locale } = useI18n();
  const t = COPY[locale] ?? COPY.en;

  return (
    <section className="mx-auto max-w-[820px] px-6 py-24 md:px-10 md:py-32">
      <p className="eyebrow mb-4">{t.eyebrow}</p>
      <h1 className="font-serif text-5xl tracking-tight text-bone md:text-6xl">
        {t.title}
      </h1>

      <div className="mt-14 space-y-10">
        {t.sections.map((s) => (
          <div key={s.h}>
            <h2 className="font-serif text-2xl text-bone">{s.h}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">{s.p}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 border-t border-hairline-soft pt-6 text-[0.7rem] uppercase tracking-[0.18em] text-faint">
        {t.note}
      </p>
    </section>
  );
}
