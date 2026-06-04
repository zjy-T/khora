import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { BEADS } from "../src/lib/beads";
import { ALL_BRACELETS } from "../src/lib/presets";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⟡ Seeding the Mystic Atelier…");

  for (const bead of BEADS) {
    await prisma.bead.upsert({
      where: { slug: bead.slug },
      update: { ...bead },
      create: { ...bead },
    });
  }
  console.log(`  ✓ ${BEADS.length} stones inscribed`);

  // Bracelets have no natural unique key, so reset and reseed deterministically.
  await prisma.bracelet.deleteMany();
  for (const b of ALL_BRACELETS) {
    await prisma.bracelet.create({
      data: {
        id: b.id,
        name: b.name,
        description: b.description,
        beadSequence: b.beadSequence,
        totalPrice: b.totalPrice,
        isCommunity: b.isCommunity,
        creatorName: b.creatorName ?? null,
      },
    });
  }
  console.log(`  ✓ ${ALL_BRACELETS.length} bracelets composed`);
  console.log("⟡ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
