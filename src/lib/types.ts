// Shared domain types for Mystic Atelier.

export type MetaphysicalProperty =
  | "Protection"
  | "Fortune"
  | "Health"
  | "Harmony"
  | "Amplification"
  | "Clarity"
  | "Serenity"
  | "Love";

/** A single stone in the canonical catalog (src/lib/beads.ts). */
export interface Bead {
  slug: string;
  /** The 手串 stone name in its original form. */
  name: string;
  /** Refined Western name used in headlines. */
  westernName: string;
  metaphysicalProperty: MetaphysicalProperty;
  /** Evocative, upscale lore copy. */
  description: string;
  /** Hex accent used for orbs, badges and glows. */
  color: string;
  price: number;
  /** /beads/<slug>.jpg — centralized & swappable for real product photos. */
  image: string;
  /** Physical bead diameter in millimetres. Varies by stone. */
  diameterMm: number;
  origin: string;
  energyAlignment: string;
}

/** A curated or community-composed bracelet. */
export interface BraceletFormula {
  id: string;
  name: string;
  description: string;
  /** Ordered array of bead slugs. */
  beadSequence: string[];
  totalPrice: number;
  isCommunity: boolean;
  creatorName?: string | null;
}

// ── The Oracle (AI Design Agent) contract ───────────────────────────────────

export interface DesignAgentRequest {
  /** Free-text statement of what the wearer seeks. */
  intention: string;
  /** A felt mood for the piece. */
  vibe: "Grounded" | "Radiant" | "Tranquil" | "Ambitious" | "Mystical";
  /** Upper budget bound in USD. */
  budget: number;
  /** Slugs the wearer feels drawn to (optional affinities). */
  affinities: string[];
  /** Language the Oracle should respond in. */
  locale?: "en" | "zh";
}

export interface DesignAgentResponse {
  braceletName: string;
  narrative: string;
  /** Ordered bead slugs the agent recommends. */
  beads: string[];
  totalPrice: number;
  /** Per-bead reasoning, keyed by slug. */
  rationale: Record<string, string>;
}
