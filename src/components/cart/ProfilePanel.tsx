"use client";

import { useState } from "react";
import { Package, LogOut, User } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useCustomer } from "@/components/account/CustomerProvider";
import { Drawer } from "@/components/cart/Drawer";

const COPY = {
  en: {
    title: "Account",
    signInTitle: "Sign in or create an account",
    signInSub:
      "Enter your email and we'll send a 6-digit code — no password needed.",
    email: "Email",
    emailPlaceholder: "you@email.com",
    namePlaceholder: "Your name (optional)",
    sendCode: "Send code",
    sending: "Sending…",
    codeSent: "We emailed a 6-digit code to",
    code: "Code",
    codePlaceholder: "6-digit code",
    verify: "Verify & sign in",
    verifying: "Verifying…",
    badCode: "That code didn't match. Try again or resend.",
    resend: "Resend code",
    noEmail: "Email isn't set up yet, so the code can't be delivered.",
    greeting: "Welcome",
    orders: "Your orders",
    ordersEmpty: "No orders yet.",
    signOut: "Sign out",
    placed: "Placed",
    tracking: "Tracking",
  },
  zh: {
    title: "账户",
    signInTitle: "登录或创建账户",
    signInSub: "输入邮箱，我们将发送 6 位验证码 —— 无需密码。",
    email: "邮箱",
    emailPlaceholder: "you@email.com",
    namePlaceholder: "您的称呼（选填）",
    sendCode: "发送验证码",
    sending: "发送中…",
    codeSent: "验证码已发送至",
    code: "验证码",
    codePlaceholder: "6 位验证码",
    verify: "验证并登录",
    verifying: "验证中…",
    badCode: "验证码不正确，请重试或重新发送。",
    resend: "重新发送",
    noEmail: "邮箱服务尚未配置，暂时无法发送验证码。",
    greeting: "欢迎",
    orders: "我的订单",
    ordersEmpty: "暂无订单。",
    signOut: "退出登录",
    placed: "下单于",
    tracking: "物流单号",
  },
} as const;

export function ProfilePanel() {
  const { locale } = useI18n();
  const t = COPY[locale] ?? COPY.en;
  const { panel, closePanel } = useCart();
  const { customer, orders, requestCode, verifyCode, signOut } = useCustomer();
  const open = panel === "profile";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await requestCode(email.trim());
    setBusy(false);
    if (res.ok) {
      setStep("code");
      if (res.sent === false) setNotice(t.noEmail);
    } else {
      setError(t.badCode);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim()) || busy) return;
    setBusy(true);
    setError(null);
    const res = await verifyCode(email.trim(), code.trim(), name.trim() || undefined);
    setBusy(false);
    if (!res.ok) setError(t.badCode);
    else {
      setStep("email");
      setCode("");
    }
  }

  return (
    <Drawer open={open} onClose={closePanel} title={t.title}>
      {!customer ? (
        <div>
          <h3 className="font-serif text-2xl text-bone">{t.signInTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">{t.signInSub}</p>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="mt-8 space-y-6">
              <label className="block">
                <span className="text-[0.6rem] uppercase tracking-luxe text-faint">
                  {t.email}
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="mt-2 w-full border-b border-hairline bg-transparent py-2 text-sm text-bone placeholder:text-faint focus:border-gold focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[0.6rem] uppercase tracking-luxe text-faint">
                  {t.namePlaceholder}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border-b border-hairline bg-transparent py-2 text-sm text-bone placeholder:text-faint focus:border-gold focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full border border-bone bg-bone py-3.5 font-sans text-[0.65rem] uppercase tracking-luxe text-obsidian transition-colors hover:border-gold hover:bg-gold disabled:opacity-50"
              >
                {busy ? t.sending : t.sendCode}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="mt-8 space-y-6">
              <p className="text-sm text-mist">
                {t.codeSent} <span className="text-bone">{email}</span>.
              </p>
              {notice && <p className="text-xs text-gold">{notice}</p>}
              <label className="block">
                <span className="text-[0.6rem] uppercase tracking-luxe text-faint">
                  {t.code}
                </span>
                <input
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t.codePlaceholder}
                  className="mt-2 w-full border-b border-hairline bg-transparent py-2 text-lg tracking-[0.4em] text-bone placeholder:text-faint placeholder:tracking-normal focus:border-gold focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full border border-bone bg-bone py-3.5 font-sans text-[0.65rem] uppercase tracking-luxe text-obsidian transition-colors hover:border-gold hover:bg-gold disabled:opacity-50"
              >
                {busy ? t.verifying : t.verify}
              </button>
              <button
                type="button"
                onClick={(e) => handleSendCode(e)}
                className="block w-full text-center text-[0.6rem] uppercase tracking-luxe text-faint transition-colors hover:text-mist"
              >
                {t.resend}
              </button>
            </form>
          )}
          {error && <p className="mt-4 text-xs text-clay">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 border-b border-hairline-soft pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-mist">
              <User className="h-5 w-5" strokeWidth={1.25} />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-xl text-bone">
                {t.greeting}
                {customer.name ? `, ${customer.name}` : ""}
              </p>
              <p className="truncate text-[0.65rem] uppercase tracking-luxe text-faint">
                {customer.email}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-mist" strokeWidth={1.5} />
              <p className="text-sm text-bone">{t.orders}</p>
            </div>
            {orders.length === 0 ? (
              <p className="text-xs text-faint">{t.ordersEmpty}</p>
            ) : (
              <ul className="space-y-3">
                {orders.map((o) => (
                  <li key={o.number} className="border border-hairline-soft p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-base text-bone">{o.number}</span>
                      <span className="text-sm text-bone">{o.total}</span>
                    </div>
                    <p className="mt-1 text-xs text-mist">
                      {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-luxe text-faint">
                      <span className="rounded-full border border-hairline px-2 py-0.5 text-gold">
                        {o.status}
                      </span>
                      <span>·</span>
                      <span>{o.shippingStatus}</span>
                      {o.trackingNumber && (
                        <span className="normal-case tracking-normal text-mist">
                          · {t.tracking}: {o.trackingNumber}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={signOut}
            className="mt-8 flex w-full items-center justify-center gap-2 border border-hairline py-3 text-[0.62rem] uppercase tracking-luxe text-mist transition-colors hover:border-clay hover:text-clay"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t.signOut}
          </button>
        </div>
      )}
    </Drawer>
  );
}
