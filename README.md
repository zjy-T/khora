# Khora | 衡石

A luxury metaphysical commerce experience — oriental crystal bracelets (手串)
reframed for a discerning Western audience as instruments of **energetic
resonance** and **intentional alchemy**, not "good luck charms."

Built as a high-fashion house, not a generic storefront: deep obsidian dark
mode, champagne-gold accents, editorial serif display type, asymmetrical
layouts, and smooth Framer Motion transitions.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS `@theme` design tokens)
- **Framer Motion** — luxury animation
- **Lucide React** — iconography
- **Prisma 7 + SQLite** (better-sqlite3 driver adapter)

## Getting started

```bash
npm install            # also runs `prisma generate` (postinstall)
npm run db:reset       # create the SQLite db + seed stones & bracelets
npm run dev            # http://localhost:3000
```

> The database URL lives in `.env` (`DATABASE_URL="file:./dev.db"`). `.env` is
> git-ignored; if you clone fresh, create it (or the app falls back to
> `file:./dev.db` at runtime). Prisma CLI commands read it via `prisma.config.ts`.

### Scripts

| Script             | Purpose                            |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start the dev server               |
| `npm run build`    | Production build (full typecheck)  |
| `npm run db:push`  | Sync schema → SQLite               |
| `npm run db:seed`  | Seed stones + bracelets            |
| `npm run db:reset` | Force-reset schema and reseed      |

## Architecture

```
src/
  app/
    page.tsx                  Home — editorial landing
    builder/                  The Builder (Curator / Alchemist / Oracle)
    encyclopedia/             The Lore — museum grid (reads Prisma)
    atelier/                  The Collector's Atelier (reads Prisma)
    api/design-agent/route.ts The Oracle — mock AI design agent
  components/                 layout · home · builder · encyclopedia · atelier · ui · beads
  lib/
    beads.ts                  ← canonical stone catalog (single source of truth)
    presets.ts                curated + community bracelet formulas
    prisma.ts                 PrismaClient singleton (driver adapter)
    types.ts                  shared domain + Oracle API types
prisma/
  schema.prisma               Bead, Bracelet
  seed.ts                     seeds from lib/beads.ts + lib/presets.ts
public/beads/                 stone photography (see its README to swap photos)
```

### Single source of truth

`src/lib/beads.ts` defines every stone once. It **both** seeds the database and
powers the interactive Builder on the client, so the Encyclopedia, Atelier and
Builder never drift. Edit a stone there and re-seed.

### Swapping in real product photos

Placeholders in `public/beads/<slug>.jpg` are royalty-free mineral photos. To
use the real product shots, drop a file with the same name into that folder
(no code change), or repoint the `image` field in `src/lib/beads.ts`. See
[`public/beads/README.md`](public/beads/README.md).

### The Oracle (AI design agent)

`POST /api/design-agent` is a deterministic **mock** that already implements the
final request/response contract (`DesignAgentRequest` / `DesignAgentResponse` in
`src/lib/types.ts`). The frontend speaks that shape today, so the live agent is
a drop-in replacement — see the `// TODO: replace mock with OpenClaw agent
workflow` marker in the route.

```bash
curl -X POST http://localhost:3000/api/design-agent \
  -H 'Content-Type: application/json' \
  -d '{"intention":"grow my business while staying calm","vibe":"Ambitious","budget":1000,"affinities":["citrine"]}'
```
