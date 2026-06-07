import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BeadOrb } from "@/components/beads/BeadOrb";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductResonance } from "@/components/products/ProductResonance";
import { AcquireButton } from "@/components/cart/AcquireButton";
import { CURATED_BRACELETS } from "@/lib/presets";
import { BEAD_BY_SLUG, RESONANCE_COLORS } from "@/lib/beads";
import type { Bead } from "@/lib/types";

const EDITORIAL: Record<string, { headline: string; tagline: string }> = {
  abundance: {
    headline: "The Abundance Alignment",
    tagline: "For those calling prosperity inward",
  },
  serenity: {
    headline: "The Serenity Sequence",
    tagline: "A quiet arrangement for stillness of mind",
  },
  vitality: {
    headline: "The Vitality Circle",
    tagline: "A grounding circle for restoration and steady strength",
  },
  devotion: {
    headline: "Devotion",
    tagline: "For those opening the heart after a long closure",
  },
  midnight: {
    headline: "Midnight",
    tagline: "For those who move through the world as guardians",
  },
  meridian: {
    headline: "The Meridian",
    tagline: "For the seeker of truth and clarity",
  },
  momentum: {
    headline: "Momentum",
    tagline: "For the driven",
  },
  sanctuary: {
    headline: "Sanctuary",
    tagline: "A garden of inner equilibrium",
  },
  ember: {
    headline: "Ember",
    tagline: "After depletion, before restoration",
  },
  nocturne: {
    headline: "Nocturne",
    tagline: "For the contemplative hour",
  },
};

function getFormula(slug: string) {
  return CURATED_BRACELETS.find((f) => f.id === `curated-${slug}`);
}

export async function generateStaticParams() {
  return CURATED_BRACELETS.map((f) => ({
    slug: f.id.replace("curated-", ""),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const formula = getFormula(slug);
  if (!formula) return { title: "Not Found" };
  const ed = EDITORIAL[slug];
  return {
    title: ed?.headline ?? formula.name,
    description: formula.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const formula = getFormula(slug);
  if (!formula) notFound();

  const ed = EDITORIAL[slug];
  const beads = formula.beadSequence
    .map((s) => BEAD_BY_SLUG[s])
    .filter((b): b is Bead => Boolean(b));

  // Deduplicate stones for the composition list
  const uniqueBeads = beads.reduce<Bead[]>((acc, b) => {
    if (!acc.find((x) => x.slug === b.slug)) acc.push(b);
    return acc;
  }, []);

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-32 pt-32 md:px-10 md:pt-44">
      {/* Back link */}
      <Link
        href="/builder"
        className="mb-12 inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-luxe text-faint transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
        The Atelier Collection
      </Link>

      {/* Two-column hero: gallery left, details + CTA right */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Hero photo gallery + composition */}
        <div>
          <ProductGallery slug={slug} beads={beads} />

          {/* Stone composition */}
          <div className="mt-12">
            <div className="mb-6 border-b border-hairline-soft pb-5">
              <span className="eyebrow">The Composition</span>
              <h2 className="display mt-3 text-2xl text-bone">
                {formula.beadSequence.length} stones · {uniqueBeads.length} varieties
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {uniqueBeads.map((bead) => {
                const count = formula.beadSequence.filter((s) => s === bead.slug).length;
                return (
                  <div
                    key={bead.slug}
                    className="flex flex-col items-center gap-3 border border-hairline-soft p-4 text-center"
                  >
                    <BeadOrb bead={bead} size={52} />
                    <div>
                      <p className="text-xs text-bone">{bead.westernName}</p>
                      <p
                        className="mt-0.5 text-[0.55rem] uppercase tracking-luxe"
                        style={{
                          color: RESONANCE_COLORS[bead.resonance[0]],
                        }}
                      >
                        {bead.resonance[0]}
                      </p>
                      <p className="mt-0.5 text-[0.6rem] text-faint">
                        ×{count}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product info — sticky on the right so the CTA stays in view */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="eyebrow">Atelier Collection</span>
          <h1 className="display mt-4 text-4xl text-bone md:text-5xl">
            {ed?.headline ?? formula.name}
          </h1>
          {ed?.tagline && (
            <p className="mt-3 font-serif text-lg italic text-gold">
              {ed.tagline}
            </p>
          )}
          <p className="mt-6 text-sm leading-relaxed text-mist">
            {formula.description}
          </p>

          {/* Price */}
          <div className="mt-8 border-t border-b border-hairline-soft py-6">
            <p className="text-[0.6rem] uppercase tracking-luxe text-faint">
              Atelier Price
            </p>
            <p className="mt-1 font-serif text-4xl text-bone">
              ${formula.totalPrice.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-faint">
              {formula.beadSequence.length} stones · strung on surgical-grade elastic
            </p>
          </div>

          {/* Resonance profile */}
          <ProductResonance beadSequence={formula.beadSequence} />

          {/* CTA */}
          <div className="mt-8">
            <AcquireButton
              label="Acquire This Piece"
              item={{
                id: formula.id,
                kind: "curated",
                name: ed?.headline ?? formula.name,
                price: formula.totalPrice,
                beadSequence: formula.beadSequence,
                slug,
              }}
            />
          </div>

          <p className="mt-4 text-center text-[0.6rem] uppercase tracking-luxe text-faint">
            Made to order · Ships in 5–7 days
          </p>
        </div>
      </div>
    </main>
  );
}
