import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { CurrencyProvider } from "@/components/i18n/CurrencyProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { SidePanels } from "@/components/cart/SidePanels";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/Analytics";
import { SupportChat } from "@/components/support/SupportChat";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KHORA | 衡石",
    template: "%s — KHORA",
  },
  description:
    "Custom crystal bead bracelets composed with intention. Each stone selected for resonance, each arrangement a quiet act of alignment.",
  keywords: [
    "crystal bracelets",
    "gemstone beads",
    "custom bracelet",
    "intentional jewelry",
    "mineral jewelry",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obsidian text-bone flex flex-col antialiased">
        <LanguageProvider>
          <CurrencyProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <SidePanels />
            <SupportChat />
          </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
