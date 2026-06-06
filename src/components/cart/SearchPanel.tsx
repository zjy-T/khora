"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { BEADS } from "@/lib/beads";
import { CURATED_BRACELETS } from "@/lib/presets";
import { localizeBead } from "@/lib/beads.i18n";
import { localizeBracelet } from "@/lib/presets.i18n";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Drawer } from "@/components/cart/Drawer";

export function SearchPanel() {
  const { t, locale } = useI18n();
  const { panel, closePanel } = useCart();
  const open = panel === "search";
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field and clear stale queries each time the panel opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      const id = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(id);
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  const { stones, pieces } = useMemo(() => {
    if (!q) return { stones: [], pieces: [] };
    const stoneHits = BEADS.filter((b) => {
      const L = localizeBead(b, locale);
      return (
        b.westernName.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        L.title.toLowerCase().includes(q) ||
        b.material.toLowerCase().includes(q) ||
        b.resonance.some((r) => r.toLowerCase().includes(q))
      );
    }).slice(0, 6);

    const pieceHits = CURATED_BRACELETS.filter((f) => {
      const L = localizeBracelet(f, locale);
      return (
        f.name.toLowerCase().includes(q) ||
        L.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    }).slice(0, 6);

    return { stones: stoneHits, pieces: pieceHits };
  }, [q, locale]);

  const hasResults = stones.length > 0 || pieces.length > 0;

  return (
    <Drawer open={open} onClose={closePanel} title={t.search.title}>
      {/* Search field */}
      <div className="flex items-center gap-3 border-b border-hairline pb-4">
        <SearchIcon className="h-4 w-4 shrink-0 text-faint" strokeWidth={1.5} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.placeholder}
          className="w-full bg-transparent font-serif text-lg text-bone placeholder:text-faint focus:outline-none"
        />
      </div>

      {/* Results */}
      <div className="mt-7">
        {!q && (
          <p className="text-sm leading-relaxed text-mist">{t.search.hint}</p>
        )}

        {q && !hasResults && (
          <div>
            <p className="font-serif text-lg text-bone">{t.search.noResults}</p>
            <p className="mt-2 text-sm text-mist">{t.search.noResultsHint(query.trim())}</p>
          </div>
        )}

        {pieces.length > 0 && (
          <section className="mb-8">
            <p className="eyebrow mb-4">{t.search.pieces}</p>
            <ul className="space-y-1">
              {pieces.map((f) => {
                const L = localizeBracelet(f, locale);
                const slug = f.id.replace("curated-", "");
                return (
                  <li key={f.id}>
                    <Link
                      href={`/products/${slug}`}
                      onClick={closePanel}
                      className="-mx-3 flex items-center justify-between gap-4 rounded px-3 py-2.5 transition-colors hover:bg-bone/5"
                    >
                      <span className="font-serif text-base text-bone">{L.name}</span>
                      <span className="text-xs text-gold">
                        ${f.totalPrice.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {stones.length > 0 && (
          <section>
            <p className="eyebrow mb-4">{t.search.stones}</p>
            <ul className="space-y-1">
              {stones.map((b) => {
                const L = localizeBead(b, locale);
                return (
                  <li key={b.slug}>
                    <Link
                      href="/encyclopedia"
                      onClick={closePanel}
                      className="-mx-3 flex items-center gap-3 rounded px-3 py-2.5 transition-colors hover:bg-bone/5"
                    >
                      <BeadOrb bead={b} size={28} />
                      <span className="flex-1 text-sm text-bone">{L.title}</span>
                      <span className="text-[0.6rem] uppercase tracking-luxe text-faint">
                        {b.material}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </Drawer>
  );
}
