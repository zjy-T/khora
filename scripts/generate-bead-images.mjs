/**
 * KHORA | 衡石 — Polished Bead Image Generation (standardized)
 *
 * Regenerates ALL 29 polished spherical bead photos via Replicate
 * (FLUX.1-dev) with a SINGLE standardized prompt + seed, so every bead
 * reads as a cohesive, genuinely photographic product shot (no more mix of
 * CG-glassy and photoreal renders).
 *
 *   • 29 polished bead spheres →  public/beads/<slug>.jpg
 *
 * Usage:  node scripts/generate-bead-images.mjs
 *         node scripts/generate-bead-images.mjs --only=amethyst,citrine
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");

// One seed → uniform lighting & composition across the whole set.
const BEAD_SEED = 99;

const ONLY = (() => {
  const a = process.argv.find((x) => x.startsWith("--only="));
  return a ? a.slice(7).split(",").map((s) => s.trim()) : null;
})();

// ─── Catalog — polished-bead descriptions (one smooth sphere each) ───────────
const BEADS = [
  { slug: "gold-sheen-obsidian", desc: "black volcanic obsidian with a soft drifting golden sheen" },
  { slug: "rutilated-quartz", desc: "clear quartz with fine golden rutile needles suspended inside" },
  { slug: "nephrite-jade", desc: "translucent emerald-green nephrite jade with a waxy lustre" },
  { slug: "amethyst", desc: "translucent violet-purple amethyst" },
  { slug: "clear-quartz", desc: "perfectly transparent colourless clear quartz" },
  { slug: "black-obsidian", desc: "glossy jet-black obsidian" },
  { slug: "citrine", desc: "translucent honey-golden citrine" },
  { slug: "smoky-quartz", desc: "translucent smoky brown-grey quartz" },
  { slug: "red-agate", desc: "deep crimson-red agate with subtle banding, opaque" },
  { slug: "black-hair-crystal", desc: "clear quartz with fine black tourmaline needles inside" },
  { slug: "rose-quartz", desc: "translucent soft blush-pink rose quartz" },
  { slug: "tiger-eye", desc: "golden-brown tiger eye with a silky chatoyant band of light" },
  { slug: "lapis-lazuli", desc: "deep royal-blue lapis lazuli flecked with gold pyrite, opaque" },
  { slug: "green-phantom", desc: "clear quartz with a green chlorite phantom suspended inside" },
  { slug: "garnet", desc: "deep wine-red translucent garnet" },
  { slug: "red-rabbit-hair", desc: "clear quartz with fine crimson-red hematite needles inside" },
  { slug: "black-gold-super-seven", desc: "dark smoky quartz with golden and reddish mineral inclusions" },
  { slug: "green-rabbit-hair", desc: "clear quartz with silky green actinolite fibres inside" },
  { slug: "moonstone", desc: "milky-white moonstone with a soft blue adularescent glow" },
  { slug: "prehnite", desc: "translucent pale grape-green prehnite" },
  { slug: "grey-agate", desc: "soft grey agate with concentric smoke-grey banding, opaque" },
  { slug: "cinnabar", desc: "vivid vermilion-red cinnabar, opaque" },
  { slug: "kunzite", desc: "translucent lilac-pink kunzite" },
  { slug: "strawberry-quartz", desc: "rosy-pink quartz freckled with tiny red inclusions" },
  { slug: "rhodochrosite", desc: "rose-pink rhodochrosite with cream banding, opaque" },
  { slug: "purple-hair-super-seven", desc: "deep violet quartz with fine rutile needle inclusions" },
  { slug: "white-phantom", desc: "clear quartz with pale white phantom inclusions inside" },
  { slug: "aquamarine", desc: "transparent pale sea-blue aquamarine" },
  { slug: "purple-chalcedony", desc: "smooth even violet-purple chalcedony, translucent" },
];

// Single shared style → standardized, cohesive look.
function beadPrompt(bead) {
  return `Professional studio product photograph of one single polished spherical gemstone bracelet bead made of ${bead.desc}, the bead is perfectly round and smooth like a polished marble — NOT a raw crystal, NOT a rough stone, NOT a geode, just one smooth round polished gemstone sphere, a single drilled bead, centered and filling about 78 percent of the square frame, resting on a seamless warm linen-beige surface with background colour #efe9e0, soft diffused studio lighting with one gentle specular highlight on the upper-left of the sphere, soft natural contact shadow beneath, crisp sharp focus, luxury jewelry product catalog, square format, no text, no hands, no other objects, photorealistic`;
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

  const beadsDir = path.join(ROOT, "public", "beads");
  fs.mkdirSync(beadsDir, { recursive: true });

  const list = ONLY ? BEADS.filter((b) => ONLY.includes(b.slug)) : BEADS;

  console.log(`━━━ Polished bead photographs (${list.length}) ━━━━━━━━━━━━━━━━━`);
  let done = 0;
  for (const bead of list) {
    const destPath = path.join(beadsDir, `${bead.slug}.jpg`);
    await generateImage(token, beadPrompt(bead), destPath, BEAD_SEED, bead.slug);
    done++;
    console.log(`  [${done}/${list.length}]`);
  }

  console.log("\n✓ All polished bead photos generated → public/beads/\n");
}

main().catch((err) => {
  console.error("\n✗ Generation failed:", err.message);
  process.exit(1);
});
