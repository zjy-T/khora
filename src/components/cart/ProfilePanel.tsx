"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Bookmark, Settings, LogOut, User } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Drawer } from "@/components/cart/Drawer";

export function ProfilePanel() {
  const { t } = useI18n();
  const { panel, closePanel } = useCart();
  const open = panel === "profile";

  // Mock auth — front-end only. Submitting "signs in" with the email's local part.
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const name = email.split("@")[0] || t.account.guestName;

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSignedIn(true);
  }

  function handleSignOut() {
    setSignedIn(false);
    setEmail("");
    setPassword("");
  }

  return (
    <Drawer open={open} onClose={closePanel} title={t.account.title}>
      {!signedIn ? (
        <div>
          <h3 className="font-serif text-2xl text-bone">{t.account.signInTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            {t.account.signInSub}
          </p>

          <form onSubmit={handleSignIn} className="mt-8 space-y-6">
            <label className="block">
              <span className="text-[0.6rem] uppercase tracking-luxe text-faint">
                {t.account.email}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.account.emailPlaceholder}
                className="mt-2 w-full border-b border-hairline bg-transparent py-2 text-sm text-bone placeholder:text-faint focus:border-gold focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[0.6rem] uppercase tracking-luxe text-faint">
                {t.account.password}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.account.passwordPlaceholder}
                className="mt-2 w-full border-b border-hairline bg-transparent py-2 text-sm text-bone placeholder:text-faint focus:border-gold focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full border border-bone bg-bone py-3.5 font-sans text-[0.65rem] uppercase tracking-luxe text-obsidian transition-colors hover:border-gold hover:bg-gold"
            >
              {t.account.signIn}
            </button>
          </form>

          <button className="mt-4 block w-full text-center text-[0.6rem] uppercase tracking-luxe text-faint transition-colors hover:text-mist">
            {t.account.forgot}
          </button>

          <div className="mt-8 border-t border-hairline-soft pt-6 text-center">
            <p className="text-sm text-mist">{t.account.noAccount}</p>
            <button className="mt-1 text-[0.65rem] uppercase tracking-luxe text-gold transition-colors hover:text-bone">
              {t.account.createAccount}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Identity */}
          <div className="flex items-center gap-4 border-b border-hairline-soft pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-mist">
              <User className="h-5 w-5" strokeWidth={1.25} />
            </div>
            <div>
              <p className="font-serif text-xl text-bone">{t.account.greeting(name)}</p>
              <p className="text-[0.6rem] uppercase tracking-luxe text-faint">
                {t.account.memberSince}
              </p>
            </div>
          </div>

          {/* Account sections */}
          <nav className="mt-2 divide-y divide-hairline-soft">
            <div className="flex items-center gap-4 py-5">
              <Package className="h-4 w-4 text-mist" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-bone">{t.account.orders}</p>
                <p className="text-xs text-faint">{t.account.ordersEmpty}</p>
              </div>
            </div>
            <Link
              href="/builder"
              onClick={closePanel}
              className="flex items-center gap-4 py-5 transition-colors hover:bg-bone/5"
            >
              <Bookmark className="h-4 w-4 text-mist" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-bone">{t.account.savedDesigns}</p>
                <p className="text-xs text-faint">{t.account.savedHint}</p>
              </div>
            </Link>
            <div className="flex items-center gap-4 py-5">
              <Settings className="h-4 w-4 text-mist" strokeWidth={1.5} />
              <p className="text-sm text-bone">{t.account.settings}</p>
            </div>
          </nav>

          <button
            onClick={handleSignOut}
            className="mt-6 flex w-full items-center justify-center gap-2 border border-hairline py-3 text-[0.62rem] uppercase tracking-luxe text-mist transition-colors hover:border-clay hover:text-clay"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t.account.signOut}
          </button>
        </div>
      )}
    </Drawer>
  );
}
