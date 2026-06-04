# Bead Photography

Each stone in the catalog renders the image at `/beads/<slug>.jpg`.

## Swapping in real product photos

You have two ways to replace these placeholders with the final product shots:

1. **Drop-in (easiest).** Replace the file in this folder, keeping the **exact
   same filename** (e.g. `gold-sheen-obsidian.jpg`). The new photo appears
   everywhere automatically — no code changes.

2. **Repoint.** If you prefer a different filename or format, edit the single
   `image` field for that stone in [`src/lib/beads.ts`](../../src/lib/beads.ts),
   then re-seed: `npm run db:seed`.

The bead catalog in `src/lib/beads.ts` is the single source of truth — it both
seeds the database and powers the interactive Builder, so one edit propagates to
the Encyclopedia, the Atelier and the Builder at once.

### Recommended specs
Square or 4:5 portrait, ≥ 1200 px, neutral/dark background, the bead centered.
The UI crops images to circular orbs and rounded cards, so keep the subject
centered with a little breathing room.

## Current placeholders

The images currently here are royalty-free mineral photographs from
[Wikimedia Commons](https://commons.wikimedia.org/) (CC / public-domain),
chosen to resemble each stone. They are stand-ins only — replace before launch.
