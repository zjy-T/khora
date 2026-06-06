/**
 * KHORA | 衡石 — Natural Rock-Form Image Generation
 *
 * Generates 13 photorealistic images of each stone in its RAW / NATURAL rock
 * form (rough, uncut mineral specimens) via Replicate (FLUX.1-dev), with a
 * single standardized photographic style so the Stone Guide cards read as a
 * cohesive museum / gemology catalog.
 *
 *   • 13 raw mineral specimens →  public/rocks/<slug>.jpg
 *
 * The polished spherical bead photos in public/beads/ are left untouched —
 * those still power the bracelet builder orbs.
 *
 * Usage:  node scripts/generate-rock-images.mjs
 *         node scripts/generate-rock-images.mjs --force   (regenerate all)
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");

// A single seed keeps lighting / composition uniform across the whole set.
const ROCK_SEED = 77;
const FORCE = process.argv.includes("--force");

// ─── Stone catalog — raw, natural rock-form descriptions ─────────────────────
const ROCKS = [
  { slug: "gold-sheen-obsidian", name: "gold sheen obsidian", desc: "a rough chunk of jet-black volcanic obsidian glass with a drifting metallic golden sheen across its conchoidal fractured surface" },
  { slug: "rutilated-quartz",    name: "rutilated quartz",    desc: "a raw clear quartz crystal point shot through with fine golden rutile needles like captured sunlight" },
  { slug: "nephrite-jade",       name: "nephrite jade",       desc: "an unpolished boulder of deep emerald-green nephrite jade with a waxy matte rind" },
  { slug: "amethyst",            name: "amethyst",            desc: "a natural amethyst geode cluster of sparkling deep violet-purple crystal points" },
  { slug: "clear-quartz",        name: "clear quartz",        desc: "a raw transparent clear quartz crystal cluster with sharp natural terminations" },
  { slug: "black-obsidian",      name: "black obsidian",      desc: "a rough piece of jet-black volcanic obsidian with glassy conchoidal fractured edges" },
  { slug: "citrine",             name: "citrine",             desc: "a natural citrine crystal cluster of honey-golden translucent points" },
  { slug: "smoky-quartz",        name: "smoky quartz",        desc: "a raw smoky quartz crystal cluster of warm brown-grey semi-transparent points" },
  { slug: "red-agate",           name: "red agate",           desc: "a rough cracked-open agate nodule revealing deep crimson-red concentric banding" },
  { slug: "black-hair-crystal",  name: "black tourmalinated quartz", desc: "a raw clear quartz crystal shot through with jet-black tourmaline needles" },
  { slug: "rose-quartz",         name: "rose quartz",         desc: "a rough unpolished chunk of soft blush-pink rose quartz with a frosted natural surface" },
  { slug: "tiger-eye",           name: "tiger eye",           desc: "a rough jagged raw chunk of tiger eye ore freshly broken from the host rock, irregular angular fractured matte stone with a dusty crust, showing golden-brown silky chatoyant fibrous bands only on the broken face" },
  { slug: "lapis-lazuli",        name: "lapis lazuli",        desc: "a rough chunk of deep royal-blue lapis lazuli rock veined with gold pyrite and white calcite" },
  { slug: "green-phantom",            name: "green phantom quartz",     desc: "a raw clear quartz crystal point enclosing a ghostly mossy green chlorite phantom pyramid, rough natural terminations" },
  { slug: "garnet",                   name: "garnet",                   desc: "a cluster of raw rough deep red garnet dodecahedral crystals embedded in grey mica schist matrix" },
  { slug: "red-rabbit-hair",          name: "red rabbit-hair quartz",   desc: "a raw clear quartz crystal shot through with fine crimson-red hematite needles, rough natural terminations" },
  { slug: "black-gold-super-seven",   name: "black gold super seven",   desc: "a rough jagged super seven quartz specimen, smoky-black with amethyst zones and golden rutile, raw natural crystal faces freshly broken" },
  { slug: "green-rabbit-hair",        name: "green rabbit-hair quartz", desc: "a raw clear quartz crystal threaded with silky green actinolite fibres, rough unpolished natural point" },
  { slug: "moonstone",                name: "moonstone",                desc: "a rough unpolished chunk of milky moonstone feldspar with a faint bluish schiller, jagged natural broken surface" },
  { slug: "prehnite",                 name: "prehnite",                 desc: "a raw botryoidal prehnite specimen, bubbly pale grape-green mineral crust on dark host matrix" },
  { slug: "grey-agate",               name: "grey agate",               desc: "a rough cracked-open grey agate nodule revealing soft grey concentric banding, unpolished dusty crust" },
  { slug: "cinnabar",                 name: "cinnabar",                 desc: "a raw rough cinnabar specimen, vivid vermilion-red crystalline mineral encrusted on pale dolomite matrix" },
  { slug: "kunzite",                  name: "kunzite",                  desc: "a raw rough kunzite crystal, translucent lilac-pink spodumene with vertical striations and natural terminations" },
  { slug: "strawberry-quartz",        name: "strawberry quartz",        desc: "a rough jagged chunk of strawberry quartz, rosy red translucent quartz freckled with red inclusions, raw broken face" },
  { slug: "rhodochrosite",            name: "rhodochrosite",            desc: "a rough rhodochrosite specimen showing rose-pink and cream concentric banding, raw stalactite cross-section" },
  { slug: "purple-hair-super-seven",  name: "purple hair super seven",  desc: "a raw rough super seven amethystine quartz crystal, deep violet with fine golden rutile needles, jagged natural faces" },
  { slug: "white-phantom",            name: "white phantom quartz",     desc: "a raw clear quartz crystal cluster holding pale white phantom outlines within, rough natural sharp terminations" },
  { slug: "aquamarine",               name: "aquamarine",               desc: "a raw rough aquamarine beryl crystal, pale sea-blue hexagonal prism with natural striations on host matrix" },
  { slug: "purple-chalcedony",        name: "purple chalcedony",        desc: "a rough chunk of purple chalcedony, translucent violet botryoidal mineral with a frosted unpolished natural crust" },
];

// One shared style suffix = a standardized, cohesive look across the set.
function rockPrompt(rock) {
  return `Museum gemology catalog photograph of ${rock.desc}, a single natural raw rough uncut mineral specimen in its geological rock form — NOT polished, NOT a bead, NOT a sphere, NOT jewelry, an unworked natural stone, resting on a smooth dark charcoal slate surface, deep neutral near-black charcoal background, dramatic soft directional studio lighting from the upper left raking across the surface to reveal fine mineral texture and crystalline detail, the single specimen centered and filling roughly 65 percent of the frame, sharp macro focus, square format, no text, no hands, photorealistic`;
}

// ─── Replicate API ────────────────────────────────────────────────────────────
async function createPrediction(token, prompt, seed) {
  const body = JSON.stringify({
    input: {
      prompt,
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "jpg",
      output_quality: 95,
      seed,
    },
  });

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body,
      },
    );

    if (res.status === 429) {
      let retryAfter = 15;
      try {
        const data = await res.json();
        if (data.retry_after) retryAfter = Math.ceil(data.retry_after) + 3;
      } catch {}
      process.stdout.write(`\n  ⏸  rate limited — waiting ${retryAfter}s (attempt ${attempt}/5)...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Replicate API error ${res.status}: ${text}`);
    }
    return res.json();
  }
  throw new Error("Exceeded max retries due to rate limiting");
}

async function pollPrediction(token, id, maxWaitMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await sleep(2500);
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.status === "succeeded") return data;
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${id} ${data.status}: ${data.error}`);
    }
  }
  throw new Error(`Prediction ${id} timed out after ${maxWaitMs / 1000}s`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

function readEnvToken() {
  if (!fs.existsSync(ENV_FILE)) return null;
  const content = fs.readFileSync(ENV_FILE, "utf8");
  const match = content.match(/^REPLICATE_API_TOKEN=(.+)$/m);
  return match ? match[1].trim() : null;
}

async function generateImage(token, prompt, destPath, seed, label) {
  if (fs.existsSync(destPath) && !FORCE) {
    console.log(`  ↩  skip  ${path.relative(ROOT, destPath)} (already exists)`);
    return;
  }

  process.stdout.write(`  ⏳ generating  ${label} ...`);
  let prediction = await createPrediction(token, prompt, seed);
  if (prediction.status !== "succeeded") {
    prediction = await pollPrediction(token, prediction.id);
  }
  const imageUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;
  await downloadFile(imageUrl, destPath);
  process.stdout.write(`  ✓\n`);
  await sleep(12000); // stay within 6 req/min
}

async function main() {
  const token = readEnvToken() ?? process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error("No REPLICATE_API_TOKEN found in .env.local. Aborting.");
    process.exit(1);
  }

  console.log("Verifying token…");
  const check = await fetch("https://api.replicate.com/v1/account", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!check.ok) {
    console.error(`Token verification failed (${check.status}).`);
    process.exit(1);
  }
  const account = await check.json();
  console.log(`✓ Authenticated as: ${account.username}\n`);

  const rocksDir = path.join(ROOT, "public", "rocks");
  fs.mkdirSync(rocksDir, { recursive: true });

  console.log("━━━ Natural rock-form specimens (13) ━━━━━━━━━━━━━━━━━━━━━━━");
  let done = 0;
  for (const rock of ROCKS) {
    const destPath = path.join(rocksDir, `${rock.slug}.jpg`);
    await generateImage(token, rockPrompt(rock), destPath, ROCK_SEED, rock.name);
    done++;
    console.log(`  [${done}/${ROCKS.length}]`);
  }

  console.log("\n✓ All rock-form specimens generated → public/rocks/\n");
}

main().catch((err) => {
  console.error("\n✗ Generation failed:", err.message);
  process.exit(1);
});
