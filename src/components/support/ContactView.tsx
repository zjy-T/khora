"use client";

import { MessageCircle, Mail } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

// Placeholder support email — the atelier doesn't have a real inbox yet.
const PLACEHOLDER_EMAIL = "hello@khora-studio.com";

const COPY = {
  en: {
    eyebrow: "Concierge",
    title: "Contact us",
    intro:
      "However you reach us, a person — not a script — answers. Choose live chat for an immediate reply, or write to us and we'll respond in kind.",
    liveTitle: "Talk to live support",
    liveBody: "Open a chat with the atelier. We usually reply within a few minutes.",
    liveCta: "Start a chat",
    emailTitle: "Write to us",
    emailBody: "Prefer email? Reach the atelier at the address below.",
    emailNote: "Placeholder — our public address is being finalised.",
  },
  zh: {
    eyebrow: "礼宾",
    title: "联系我们",
    intro:
      "无论以何种方式联系，回应您的都是真人，而非脚本。需要即时答复可选择在线客服，或来信，我们将认真回复。",
    liveTitle: "联系在线客服",
    liveBody: "与工坊开启对话，我们通常会在几分钟内回复。",
    liveCta: "开始对话",
    emailTitle: "给我们写信",
    emailBody: "更习惯邮件？请通过下方地址联系工坊。",
    emailNote: "占位地址 —— 正式邮箱即将公布。",
  },
} as const;

export function ContactView() {
  const { locale } = useI18n();
  const t = COPY[locale] ?? COPY.en;

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <p className="eyebrow mb-4">{t.eyebrow}</p>
      <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-bone">
        {t.title}
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">{t.intro}</p>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {/* Live chat */}
        <div className="flex flex-col border border-hairline p-8 transition-colors hover:border-gold">
          <MessageCircle size={22} className="text-gold" />
          <h2 className="mt-5 font-serif text-2xl text-bone">{t.liveTitle}</h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">
            {t.liveBody}
          </p>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("khora:open-support"))
            }
            className="mt-7 inline-flex w-fit items-center gap-2.5 bg-gold px-7 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[#faf8f4] transition-all duration-500 hover:tracking-[0.22em] hover:opacity-90"
          >
            {t.liveCta}
          </button>
        </div>

        {/* Email */}
        <div className="flex flex-col border border-hairline p-8">
          <Mail size={22} className="text-gold" />
          <h2 className="mt-5 font-serif text-2xl text-bone">{t.emailTitle}</h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">
            {t.emailBody}
          </p>
          <a
            href={`mailto:${PLACEHOLDER_EMAIL}`}
            className="mt-7 inline-flex w-fit items-center gap-2.5 border border-hairline px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.06em] text-bone transition-colors hover:border-gold hover:text-gold"
          >
            {PLACEHOLDER_EMAIL}
          </a>
          <p className="mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-faint">
            {t.emailNote}
          </p>
        </div>
      </div>
    </section>
  );
}
