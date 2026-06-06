"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Search, User } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useCart } from "@/components/cart/CartProvider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count: cartCount, openPanel } = useCart();
  const pathname = usePathname();
  const { t } = useI18n();

  const isHome = pathname === "/";

  const leftLinks = [
    { href: "/builder", label: t.nav.builder },
    { href: "/encyclopedia", label: t.nav.lore },
  ];
  const rightLinks = [
    { href: "/atelier", label: t.nav.atelier },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  /* On inner pages always show the solid navbar; on homepage only after scroll */
  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 [transition-timing-function:var(--ease-luxe)] ${
        solid
          ? "border-b border-hairline-soft bg-obsidian/96 backdrop-blur-xl"
          : "border-b border-white/8 bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-[1760px] grid-cols-[1fr_auto_1fr] items-center px-6 py-5 md:px-10 2xl:px-16">
        {/* Left nav */}
        <div className="hidden items-center gap-10 md:flex">
          {leftLinks.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className="group relative">
                <span
                  className={`text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                    solid
                      ? active ? "text-bone" : "text-mist hover:text-bone"
                      : active ? "text-white" : "text-white/85 hover:text-white"
                  }`}
                >
                  {l.label}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-bone/40 transition-all duration-500 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Center — KHORA | 衡石 brand wordmark */}
        <Link href="/" className="group flex flex-col items-center gap-1.5 leading-none">
          <span
            className={`font-serif text-[1.75rem] font-light tracking-[0.32em] transition-colors duration-300 ${
              solid ? "text-bone group-hover:text-mist" : "text-white group-hover:text-white/75"
            }`}
          >
            KHORA
          </span>
          <div className="flex items-center gap-2.5">
            <span className={`h-px w-5 transition-colors duration-300 ${solid ? "bg-hairline" : "bg-white/20"}`} />
            <span
              className={`font-serif text-[0.7rem] tracking-[0.45em] transition-colors duration-300 ${
                solid ? "text-mist" : "text-white/45"
              }`}
            >
              衡石
            </span>
            <span className={`h-px w-5 transition-colors duration-300 ${solid ? "bg-hairline" : "bg-white/20"}`} />
          </div>
        </Link>

        {/* Right — nav + icons */}
        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {rightLinks.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className="group relative">
                <span
                  className={`text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                    solid
                      ? active ? "text-bone" : "text-mist hover:text-bone"
                      : active ? "text-white" : "text-white/85 hover:text-white"
                  }`}
                >
                  {l.label}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-bone/40 transition-all duration-500 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}

          <span className={`h-3 w-px transition-colors duration-300 ${solid ? "bg-hairline" : "bg-white/20"}`} />

          <LanguageToggle />

          <button
            onClick={() => openPanel("search")}
            className={`transition-colors duration-300 ${solid ? "text-mist hover:text-bone" : "text-white/85 hover:text-white"}`}
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => openPanel("profile")}
            className={`transition-colors duration-300 ${solid ? "text-mist hover:text-bone" : "text-white/85 hover:text-white"}`}
            aria-label="Account"
          >
            <User className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => openPanel("cart")}
            className={`relative transition-colors duration-300 ${solid ? "text-mist hover:text-bone" : "text-white/85 hover:text-white"}`}
            aria-label={t.nav.cart}
          >
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-bone text-[0.45rem] font-bold text-obsidian">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile right cluster */}
        <div className="flex items-center justify-end gap-4 md:hidden">
          <button
            onClick={() => openPanel("search")}
            className={solid ? "text-mist" : "text-white/60"}
            aria-label="Search"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => openPanel("cart")}
            className={`relative ${solid ? "text-mist" : "text-white/60"}`}
            aria-label={t.nav.cart}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-bone text-[0.45rem] font-bold text-obsidian">
                {cartCount}
              </span>
            )}
          </button>
          <LanguageToggle />
          <button
            className={solid ? "text-bone" : "text-white"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X strokeWidth={1.5} size={18} /> : <Menu strokeWidth={1.5} size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-hairline-soft bg-obsidian/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-6 py-6">
              {[...leftLinks, ...rightLinks].map((l) => (
                <Link key={l.href} href={l.href} className="border-b border-hairline-soft py-4">
                  <span className="text-xs uppercase tracking-[0.25em] text-bone">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
