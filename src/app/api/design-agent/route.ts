import { NextResponse } from "next/server";
import { BEADS, BEAD_BY_SLUG, sequencePrice } from "@/lib/beads";
import { localizeBead } from "@/lib/beads.i18n";
import { dict } from "@/lib/i18n";
import { DEFAULT_WRIST_MM, fillLoop } from "@/lib/wrist";
import type {
  DesignAgentRequest,
  DesignAgentResponse,
  ResonanceTag,
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

// Which resonance intentions each "vibe" leans toward.
const VIBE_AFFINITY: Record<DesignAgentRequest["vibe"], ResonanceTag[]> = {
  Grounded: ["Peace", "Health"],
  Radiant: ["Wealth", "Career"],
  Tranquil: ["Sleep", "Emotion"],
  Ambitious: ["Wealth", "Career", "Study"],
  Mystical: ["Emotion", "Relationships", "Study"],
};

// Keyword → resonance hints, scanned from the free-text intention.
const KEYWORD_HINTS: { match: RegExp; property: ResonanceTag }[] = [
  { match: /wealth|money|abundance|prosper|fortune/i, property: "Wealth" },
  { match: /career|work|job|business|promotion|success/i, property: "Career" },
  { match: /protect|safe|shield|boundary|ground|peace/i, property: "Peace" },
  { match: /sleep|rest|insomnia|dream/i, property: "Sleep" },
  { match: /health|heal|vital|energy|strength/i, property: "Health" },
  { match: /focus|study|exam|learn|concentrat|clarity|mind/i, property: "Study" },
  { match: /love|relationship|family|friend|social|charm/i, property: "Relationships" },
  { match: /calm|anxiet|stress|emotion|mood|feeling|heart/i, property: "Emotion" },
];

/**
 * Score a bead against the request.
 *
 * Weighting matters: what the user *explicitly typed* (intention keywords) is a
 * far stronger signal of what they want than the ambient "vibe" preset, which
 * defaults to "Grounded" even when the user never touched it. We therefore
 * weight intention matches well above vibe matches so a request like
 * "I like wealth" actually surfaces Wealth stones instead of being outvoted by
 * the default vibe's Peace/Health affinities.
 */
const WEIGHT_INTENTION = 6; // explicit free-text keyword match
const WEIGHT_VIBE = 2; // ambient vibe preset match
const WEIGHT_AFFINITY = 4; // user hand-picked this exact stone

function scoreBead(
  slug: string,
  intentionTags: Set<ResonanceTag>,
  vibeTags: Set<ResonanceTag>,
  affinities: string[],
): number {
  const bead = BEAD_BY_SLUG[slug];
  let score = 0;
  for (const tag of bead.resonance) {
    if (intentionTags.has(tag)) score += WEIGHT_INTENTION;
    else if (vibeTags.has(tag)) score += WEIGHT_VIBE;
  }
  if (affinities.includes(slug)) score += WEIGHT_AFFINITY;
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
    wristMm = DEFAULT_WRIST_MM,
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

  // 1. Determine desired properties — intention keywords (strong) and the
  //    ambient vibe preset (weak) are kept separate so the user's own words win.
  const intentionTags = new Set<ResonanceTag>();
  for (const hint of KEYWORD_HINTS) {
    if (hint.match.test(intention)) intentionTags.add(hint.property);
  }
  const vibeTags = new Set<ResonanceTag>(VIBE_AFFINITY[vibe] ?? []);

  // 2. Rank stones, always keeping at least a couple of grounding anchors.
  const ranked = [...BEADS]
    .map((b) => ({ b, s: scoreBead(b.slug, intentionTags, vibeTags, affinities) }))
    .sort((a, b) => b.s - a.s || a.b.price - b.b.price);

  // 3. Build a small motif palette: the focal stone plus the next best,
  //    budget-conscious supporting varieties (a few distinct stones).
  const focal = ranked[0].b;
  const supportPool = ranked.slice(1).map((r) => r.b);

  const motif: string[] = [focal.slug];
  let running = focal.price;
  for (const bead of supportPool) {
    if (motif.length >= 5) break; // up to 5 distinct varieties
    if (running + bead.price > budget && motif.length >= 2) continue;
    motif.push(bead.slug);
    running += bead.price;
  }

  // 4. Fill the ENTIRE bracelet. The strand has to wrap the wrist, so we tile
  //    the motif around the loop until the beads fill the inner circumference
  //    (shared fillLoop — same behaviour as the Destiny composer). This
  //    replaces the old fixed 6-bead loop, which left most bracelets empty.
  const arranged = fillLoop(motif, wristMm);
  if (arranged.length === 0) arranged.push(focal.slug);

  // Centre the focal stone at the front of the loop for a balanced look.
  const focalAt = arranged.indexOf(focal.slug);
  if (focalAt > 0) {
    arranged.unshift(...arranged.splice(focalAt));
  }

  const uniqueSlugs = [...new Set(arranged)];
  const rationale: Record<string, string> = {};
  for (const slug of uniqueSlugs) {
    const b = BEAD_BY_SLUG[slug];
    const L = localizeBead(b, locale);
    const primary = b.resonance[0];
    const propLabel = dict[locale].properties[primary];
    rationale[slug] =
      locale === "zh"
        ? `${L.title}主司${propLabel}——${L.energyAlignment}。`
        : `${b.westernName} anchors ${propLabel.toLowerCase()} — ${b.energyAlignment}.`;
  }

  const focalTitle = localizeBead(focal, locale).title;
  const response: DesignAgentResponse = {
    braceletName: composeName(vibe, focal.resonance[0], locale),
    narrative: composeNarrative(intention, vibe, focalTitle, locale),
    beads: arranged,
    totalPrice: sequencePrice(arranged),
    wristMm,
    rationale,
  };

  return NextResponse.json(response);
}

type Locale = "en" | "zh";

function composeName(
  vibe: DesignAgentRequest["vibe"],
  property: ResonanceTag,
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
    const secondZh: Partial<Record<ResonanceTag, string>> = {
      Wealth: "财运",
      Peace: "守护",
      Sleep: "安眠",
      Health: "焕新",
      Study: "心境",
      Relationships: "善缘",
      Career: "登攀",
      Emotion: "宁澜",
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
  const second: Partial<Record<ResonanceTag, string>> = {
    Wealth: "Fortune",
    Peace: "Ward",
    Sleep: "Repose",
    Health: "Renewal",
    Study: "Mind",
    Relationships: "Accord",
    Career: "Ascent",
    Emotion: "Tide",
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
