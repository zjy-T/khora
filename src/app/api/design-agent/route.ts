import { NextResponse } from "next/server";
import { BEADS, BEAD_BY_SLUG, sequencePrice } from "@/lib/beads";
import { localizeBead } from "@/lib/beads.i18n";
import { dict } from "@/lib/i18n";
import type {
  DesignAgentRequest,
  DesignAgentResponse,
  MetaphysicalProperty,
} from "@/lib/types";

/**
 * THE ORACLE — mock AI Design Agent endpoint.
 *
 * This is a deterministic stand-in that mirrors the request/response contract
 * the real agent will use. The frontend (OraclePanel) already speaks this
 * shape, so swapping in the live workflow is a drop-in replacement.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * TODO: replace the mock composition below with the OpenClaw agent workflow.
 *   const result = await openclaw.run("bracelet-designer", { intention, ... })
 * Map the agent's output onto `DesignAgentResponse` and return it.
 * ───────────────────────────────────────────────────────────────────────────
 */

// Which stone properties each "vibe" leans toward.
const VIBE_AFFINITY: Record<
  DesignAgentRequest["vibe"],
  MetaphysicalProperty[]
> = {
  Grounded: ["Protection", "Health"],
  Radiant: ["Fortune", "Amplification"],
  Tranquil: ["Serenity", "Clarity"],
  Ambitious: ["Fortune", "Amplification", "Protection"],
  Mystical: ["Clarity", "Serenity", "Amplification"],
};

// Keyword → property hints, scanned from the free-text intention.
const KEYWORD_HINTS: { match: RegExp; property: MetaphysicalProperty }[] = [
  { match: /wealth|money|abundance|prosper|success|career/i, property: "Fortune" },
  { match: /protect|safe|shield|boundary|ground/i, property: "Protection" },
  { match: /calm|peace|anxiet|stress|sleep|serad|serene/i, property: "Serenity" },
  { match: /health|heal|vital|energy|strength/i, property: "Health" },
  { match: /focus|clear|clarity|decision|mind/i, property: "Clarity" },
  { match: /love|harmon|balance|relationship|family/i, property: "Harmony" },
  { match: /manifest|amplif|goal|intention|power/i, property: "Amplification" },
];

function scoreBead(
  slug: string,
  wanted: Set<MetaphysicalProperty>,
  affinities: string[],
): number {
  const bead = BEAD_BY_SLUG[slug];
  let score = 0;
  if (wanted.has(bead.metaphysicalProperty)) score += 3;
  if (affinities.includes(slug)) score += 4;
  return score;
}

export async function POST(request: Request) {
  let body: DesignAgentRequest;
  try {
    body = (await request.json()) as DesignAgentRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    intention = "",
    vibe = "Grounded",
    budget = 1200,
    affinities = [],
    locale = "en",
  } = body;

  if (!intention.trim()) {
    return NextResponse.json(
      {
        error:
          locale === "zh"
            ? "求问神谕前，请先说出你的意念。"
            : "An intention is required to consult the Oracle.",
      },
      { status: 422 },
    );
  }

  // Simulate the latency of a thoughtful agent.
  await new Promise((r) => setTimeout(r, 1100));

  // 1. Determine desired properties from vibe + intention keywords.
  const wanted = new Set<MetaphysicalProperty>(VIBE_AFFINITY[vibe] ?? []);
  for (const hint of KEYWORD_HINTS) {
    if (hint.match.test(intention)) wanted.add(hint.property);
  }

  // 2. Rank stones, always keeping at least a couple of grounding anchors.
  const ranked = [...BEADS]
    .map((b) => ({ b, s: scoreBead(b.slug, wanted, affinities) }))
    .sort((a, b) => b.s - a.s || a.b.price - b.b.price);

  // 3. Compose a 6-bead loop within budget (mirror around a focal stone).
  const focal = ranked[0].b;
  const supports = ranked.slice(1).map((r) => r.b);

  const sequence: string[] = [focal.slug];
  let running = focal.price;
  for (const bead of supports) {
    if (sequence.length >= 6) break;
    if (running + bead.price > budget && sequence.length >= 3) continue;
    sequence.push(bead.slug);
    running += bead.price;
  }
  // Pad to 6 by repeating the focal stone if budget was tight.
  while (sequence.length < 6) sequence.push(focal.slug);

  // Arrange symmetrically around the focal stone for a balanced loop.
  const arranged = [
    sequence[1] ?? focal.slug,
    sequence[3] ?? focal.slug,
    sequence[5] ?? focal.slug,
    focal.slug,
    sequence[4] ?? focal.slug,
    sequence[2] ?? focal.slug,
  ];

  const uniqueSlugs = [...new Set(arranged)];
  const rationale: Record<string, string> = {};
  for (const slug of uniqueSlugs) {
    const b = BEAD_BY_SLUG[slug];
    const L = localizeBead(b, locale);
    const propLabel = dict[locale].properties[b.metaphysicalProperty];
    rationale[slug] =
      locale === "zh"
        ? `${L.title}主司${propLabel}——${L.energyAlignment}。`
        : `${b.westernName} anchors ${b.metaphysicalProperty.toLowerCase()} — ${b.energyAlignment}.`;
  }

  const focalTitle = localizeBead(focal, locale).title;
  const response: DesignAgentResponse = {
    braceletName: composeName(vibe, focal.metaphysicalProperty, locale),
    narrative: composeNarrative(intention, vibe, focalTitle, locale),
    beads: arranged,
    totalPrice: sequencePrice(arranged),
    rationale,
  };

  return NextResponse.json(response);
}

type Locale = "en" | "zh";

function composeName(
  vibe: DesignAgentRequest["vibe"],
  property: MetaphysicalProperty,
  locale: Locale,
): string {
  if (locale === "zh") {
    const firstZh: Record<DesignAgentRequest["vibe"], string> = {
      Grounded: "沉稳之",
      Radiant: "璀璨之",
      Tranquil: "静谧之",
      Ambitious: "君王之",
      Mystical: "玄秘之",
    };
    const secondZh: Partial<Record<MetaphysicalProperty, string>> = {
      Fortune: "财运",
      Protection: "守护",
      Serenity: "时刻",
      Health: "焕新",
      Clarity: "心境",
      Harmony: "和合",
      Amplification: "飞升",
    };
    return `${firstZh[vibe]}${secondZh[property] ?? "共振"}`;
  }

  const first: Record<DesignAgentRequest["vibe"], string> = {
    Grounded: "The Anchored",
    Radiant: "The Luminous",
    Tranquil: "The Still",
    Ambitious: "The Sovereign",
    Mystical: "The Veiled",
  };
  const second: Partial<Record<MetaphysicalProperty, string>> = {
    Fortune: "Fortune",
    Protection: "Ward",
    Serenity: "Hour",
    Health: "Renewal",
    Clarity: "Mind",
    Harmony: "Accord",
    Amplification: "Ascent",
  };
  return `${first[vibe]} ${second[property] ?? "Resonance"}`;
}

function composeNarrative(
  intention: string,
  vibe: DesignAgentRequest["vibe"],
  focal: string,
  locale: Locale,
): string {
  const trimmed = intention.trim().replace(/[.。]$/, "");
  if (locale === "zh") {
    return `你说，你想「${trimmed}」。神谕在其下读到一股${dict.zh.vibes[vibe]}的潜流，以${focal}为中心作答——这串编排正是围绕它而转。其余灵石经悉心拣选，于日间托持并流转这份意念。`;
  }
  return `You spoke of "${trimmed}." The Oracle reads a ${vibe.toLowerCase()} current beneath it, and answers with ${focal} at the center — the stone around which this composition turns. The supporting stones were chosen to hold and circulate that intention through the day.`;
}
