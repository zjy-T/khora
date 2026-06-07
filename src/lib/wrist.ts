import { BEAD_BY_SLUG } from "@/lib/beads";

/**
 * Wrist sizing — the single source of truth shared by every surface that sizes
 * a bracelet (Custom Build / Alchemist, the Oracle agent, the Destiny chart,
 * and the live preview in BuilderShell). Keep all wrist math here so the panels
 * can never drift apart in either the offered sizes or the fill behaviour.
 */

/** Selectable wrist circumferences in mm (click-select chips, not a slider). */
export const WRIST_OPTIONS = [140, 150, 160, 170, 180, 190, 200] as const;

/** Default wrist when the wearer hasn't chosen — 150 mm (15 cm) suits most. */
export const DEFAULT_WRIST_MM = 150;

/** Comfort ease added to the wrist to get the bracelet's inner loop length. */
export const FIT_ALLOWANCE_MM = 15;

/** Fallback bead diameter when a stone is missing its measurement. */
export const FALLBACK_BEAD_MM = 10;

/** Bracelet inner-loop circumference (mm) for a given wrist size. */
export function braceletCircumferenceMm(wristMm: number): number {
  return Math.max(wristMm, 80) + FIT_ALLOWANCE_MM;
}

/**
 * Tile a motif of bead slugs around the loop until the beads' cumulative
 * diameter fills the bracelet's circumference. Returns the full strand.
 *
 * Used identically by the Oracle and Destiny composers so a "filled bracelet"
 * means the same thing everywhere.
 */
export function fillLoop(motif: string[], wristMm: number): string[] {
  const circumferenceMm = braceletCircumferenceMm(wristMm);
  const pattern = motif.length > 0 ? motif : [];
  if (pattern.length === 0) return [];

  const strand: string[] = [];
  let usedMm = 0;
  for (let i = 0; usedMm < circumferenceMm && strand.length < 60; i++) {
    const slug = pattern[i % pattern.length];
    const d = BEAD_BY_SLUG[slug]?.diameterMm ?? FALLBACK_BEAD_MM;
    // Stop before a bead would overflow the loop (small tolerance so the ring
    // closes snugly rather than leaving an obvious gap).
    if (usedMm + d > circumferenceMm + 1.5 && strand.length > 0) break;
    strand.push(slug);
    usedMm += d;
  }
  return strand;
}
