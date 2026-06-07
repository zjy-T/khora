// Shared domain types for Mystic Atelier.

/**
 * The eight intention categories from the KHORA resonance chart
 * (财富/健康/事业/睡眠/平安/人缘/情绪/学习). A stone may carry several.
 */
export type ResonanceTag =
  | "Wealth"
  | "Health"
  | "Career"
  | "Sleep"
  | "Peace"
  | "Relationships"
  | "Emotion"
  | "Study";

/** The mineral family a stone belongs to — used as a catalog filter facet. */
export type Material =
  | "Quartz"
  | "Agate"
  | "Chalcedony"
  | "Obsidian"
  | "Jade"
  | "Feldspar"
  | "Beryl"
  | "Garnet"
  | "Cinnabar"
  | "Spodumene"
  | "Prehnite"
  | "Rhodochrosite"
  | "Super Seven"
  | "Lapis Lazuli";

/** A single stone in the canonical catalog (src/lib/beads.ts). */
export interface Bead {
  slug: string;
  /** The 手串 stone name in its original form. */
  name: string;
  /** Refined Western name used in headlines. */
  westernName: string;
  /** Resonance intentions this stone is said to serve (multi-tag, chart-derived). */
  resonance: ResonanceTag[];
  /** Mineral family — drives the Material filter facet. */
  material: Material;
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
  /** Approximate geological age of the stone. */
  age: string;
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
  /** Wrist circumference in mm. Determines how many beads fill the loop.
   *  Optional — the Oracle defaults to 150 mm (15 cm) when unset. */
  wristMm?: number;
  /** Language the Oracle should respond in. */
  locale?: "en" | "zh";
}

export interface DesignAgentResponse {
  braceletName: string;
  narrative: string;
  /** Ordered bead slugs the agent recommends. */
  beads: string[];
  totalPrice: number;
  /** Wrist circumference (mm) the strand was sized to fill. */
  wristMm: number;
  /** Per-bead reasoning, keyed by slug. */
  rationale: Record<string, string>;
}
