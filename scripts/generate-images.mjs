/**
 * KHORA | 衡石 — AI Image Generation Script
 *
 * Generates 28 photorealistic images via Replicate (FLUX.1-dev):
 *   • 13 bead macro photos   →  public/beads/<slug>.jpg
 *   • 12 bracelet angle shots →  public/bracelets/<slug>-shot-{1-4}.jpg
 *   •  3 bracelet wrist shots →  public/bracelets/<slug>-wrist.jpg
 *
 * Usage:  node scripts/generate-images.mjs
 *
 * First run: the script will prompt you for your Replicate API token and
 * write it to mystic-atelier/.env.local automatically.
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");

// ─── Consistent seed for each image group ensures uniform lighting ──────────
const BEAD_SEED = 42;
const BRACELET_SEED = 137;

// ─── Stone catalog ───────────────────────────────────────────────────────────
const BEADS = [
  { slug: "gold-sheen-obsidian",  name: "gold sheen obsidian", desc: "volcanic glass with a drifting golden shimmer" },
  { slug: "rutilated-quartz",     name: "rutilated quartz",    desc: "clear quartz threaded with golden rutile filaments" },
  { slug: "nephrite-jade",        name: "nephrite jade",       desc: "deep emerald-green nephrite jade, waxy lustre" },
  { slug: "amethyst",             name: "amethyst",            desc: "translucent violet-purple amethyst crystal" },
  { slug: "clear-quartz",         name: "clear quartz",        desc: "perfectly transparent clear crystal quartz" },
  { slug: "black-obsidian",       name: "black obsidian",      desc: "jet black volcanic obsidian glass, mirror polish" },
  { slug: "citrine",              name: "citrine",             desc: "honey-golden translucent citrine quartz" },
  { slug: "smoky-quartz",         name: "smoky quartz",        desc: "warm brown-grey smoky quartz, semi-transparent" },
  { slug: "red-agate",            name: "red agate",           desc: "deep crimson-red polished agate, opaque" },
  { slug: "black-hair-crystal",   name: "black tourmalinated quartz", desc: "clear quartz with fine black tourmaline needles inside" },
  { slug: "rose-quartz",          name: "rose quartz",         desc: "soft blush-pink translucent rose quartz" },
  { slug: "tiger-eye",            name: "tiger eye",           desc: "golden-brown chatoyant tiger eye with silky bands" },
  { slug: "lapis-lazuli",         name: "lapis lazuli",        desc: "deep royal-blue lapis lazuli with gold pyrite flecks" },
];

// ─── Bracelet designs ─────────────────────────────────────────────────────────
const BRACELETS = [
  {
    slug: "abundance",
    stones: "rutilated quartz, citrine, gold sheen obsidian, nephrite jade, and tiger eye",
    palette: "warm golden tones — yellow, amber, olive green",
  },
  {
    slug: "serenity",
    stones: "amethyst, clear quartz, and smoky quartz",
    palette: "cool serene tones — violet, crystal clear, warm grey",
  },
  {
    slug: "vitality",
    stones: "smoky quartz, black obsidian, nephrite jade, and citrine",
    palette: "grounded earth tones — dark grey, black, deep green, gold",
  },
  {
    slug: "devotion",
    stones: "rose quartz, amethyst, and clear quartz",
    palette: "soft romantic tones — blush pink, soft lavender, crystal white",
  },
  {
    slug: "midnight",
    stones: "black obsidian, black tourmalinated quartz, and lapis lazuli",
    palette: "deep protective tones — jet black, dark navy blue",
  },
  {
    slug: "meridian",
    stones: "lapis lazuli, clear quartz, and amethyst",
    palette: "truth-seeking tones — deep royal blue, crystal white, soft violet",
  },
  {
    slug: "momentum",
    stones: "rutilated quartz, tiger eye, and gold sheen obsidian",
    palette: "driven warm tones — luminous gold, amber bronze, warm brown",
  },
  {
    slug: "sanctuary",
    stones: "nephrite jade, rose quartz, and smoky quartz",
    palette: "equilibrium tones — cool jade green, blush pink, warm taupe",
  },
  {
    slug: "ember",
    stones: "smoky quartz, red agate, and black obsidian",
    palette: "restorative tones — warm smoky brown, deep crimson red, jet black",
  },
  {
    slug: "nocturne",
    stones: "amethyst, lapis lazuli, and clear quartz",
    palette: "contemplative tones — deep violet purple, midnight navy, crystal clear",
  },
];

// ─── Prompts ──────────────────────────────────────────────────────────────────
function beadPrompt(bead) {
  return `Professional studio product photograph of a single polished spherical bracelet bead, ${bead.name}, ${bead.desc}, the bead is perfectly round and smooth like a polished marble — NOT a raw crystal, NOT a rough stone, NOT a geode, just a smooth spherical polished 10mm gemstone bead as used in luxury bracelets, placed on a seamless flat surface with background color exactly #f0ece4 (warm linen beige), soft diffused studio lighting with a subtle specular highlight on the upper-left of the sphere, very minimal shadow directly beneath bead, the bead fills roughly 60 percent of the frame, sharp focus, luxury jewelry product catalog, square format, no text, no hands, photorealistic`;
}

function braceletPrompt(bracelet, shotType) {
  const stoneList = bracelet.stones;
  switch (shotType) {
    case "shot-1":
      return `Professional top-down flat-lay jewelry photograph of a crystal bead bracelet strung with ${stoneList}, ${bracelet.palette}, the bracelet forming a perfect oval on a warm cream linen surface #F4F3EF, soft diffused studio lighting, no harsh shadows, luxury jewelry product catalog, high resolution, square format, photorealistic`;
    case "shot-2":
      return `Crystal bead bracelet with ${stoneList}, ${bracelet.palette}, photographed at a 30-degree angle resting on a warm cream surface, studio lighting, the beads catching the light, luxury jewelry photography, photorealistic`;
    case "shot-3":
      return `Extreme close-up macro photograph of a section of a crystal bead bracelet with ${stoneList}, ${bracelet.palette}, sharp focus on the stone texture and surface reflections, warm cream background, editorial jewelry detail shot, photorealistic`;
    case "shot-4":
      return `Artistic editorial flat-lay of a ${stoneList} crystal bead bracelet, ${bracelet.palette}, loosely arranged in an organic oval on a warm cream textured linen surface, soft natural light, Lemaire minimalist aesthetic, luxury fashion jewelry, photorealistic`;
    case "wrist":
      return `Crystal bead bracelet with ${stoneList}, ${bracelet.palette}, worn elegantly on a slender wrist, natural soft light from the side, clean cream-bone background, sharp focus on the bracelet, minimal editorial jewelry photography, no busy background, photorealistic`;
  }
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

  // Retry up to 5 times on 429 rate-limit responses
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
        // Replicate returns retry_after in the body
        if (data.retry_after) retryAfter = Math.ceil(data.retry_after) + 3;
      } catch {}
      process.stdout.write(`\n  ⏸  rate limited — waiting ${retryAfter}s (attempt ${attempt}/5)...`);
      await sleep(retryAfter * 1000);
      process.stdout.write(` retrying...`);
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

// ─── File download ────────────────────────────────────────────────────────────
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirects
          downloadFile(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

// ─── Token setup ─────────────────────────────────────────────────────────────
function readEnvToken() {
  if (!fs.existsSync(ENV_FILE)) return null;
  const content = fs.readFileSync(ENV_FILE, "utf8");
  const match = content.match(/^REPLICATE_API_TOKEN=(.+)$/m);
  return match ? match[1].trim() : null;
}

function writeEnvToken(token) {
  let content = fs.existsSync(ENV_FILE)
    ? fs.readFileSync(ENV_FILE, "utf8")
    : "";
  if (content.match(/^REPLICATE_API_TOKEN=/m)) {
    content = content.replace(/^REPLICATE_API_TOKEN=.*/m, `REPLICATE_API_TOKEN=${token}`);
  } else {
    content += `${content.endsWith("\n") || content === "" ? "" : "\n"}REPLICATE_API_TOKEN=${token}\n`;
  }
  fs.writeFileSync(ENV_FILE, content, "utf8");
  console.log(`  ✓ Token saved to .env.local`);
}

async function promptToken() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║         KHORA · Image Generation Setup                  ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
    console.log("A Replicate API token is needed to generate the product photos.");
    console.log("Here's how to get one (takes ~2 minutes):\n");
    console.log("  1. Go to → https://replicate.com/signin");
    console.log("  2. Sign in with GitHub (free account)");
    console.log('  3. Go to → https://replicate.com/account/api-tokens');
    console.log('  4. Click "Create token", name it "khora-images"');
    console.log("  5. Copy the token (starts with r8_...)\n");
    rl.question("Paste your Replicate API token here: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── Image generation runner ─────────────────────────────────────────────────
const FORCE_BEADS = process.argv.includes("--force-beads");

async function generateImage(token, prompt, destPath, seed, label, isBeadPhoto = false) {
  // Skip if already generated (unless --force-beads is passed for bead photos)
  if (fs.existsSync(destPath) && !(isBeadPhoto && FORCE_BEADS)) {
    console.log(`  ↩  skip  ${path.relative(ROOT, destPath)} (already exists)`);
    return;
  }

  process.stdout.write(`  ⏳ generating  ${label} ...`);
  let prediction = await createPrediction(token, prompt, seed);

  // If Replicate didn't finish within the "wait" window, poll manually
  if (prediction.status !== "succeeded") {
    prediction = await pollPrediction(token, prediction.id);
  }

  const imageUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;

  await downloadFile(imageUrl, destPath);
  process.stdout.write(`  ✓\n`);

  // 12-second cooldown keeps us well within the 6 req/min limit
  await sleep(12000);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Resolve token
  let token = readEnvToken() ?? process.env.REPLICATE_API_TOKEN;
  if (!token) {
    token = await promptToken();
    if (!token) {
      console.error("No token provided. Aborting.");
      process.exit(1);
    }
    writeEnvToken(token);
  } else {
    console.log("✓ Replicate token found in .env.local");
  }

  // Verify token with a lightweight account check
  console.log("\nVerifying token…");
  const check = await fetch("https://api.replicate.com/v1/account", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!check.ok) {
    console.error(`Token verification failed (${check.status}). Check your token and try again.`);
    process.exit(1);
  }
  const account = await check.json();
  console.log(`✓ Authenticated as: ${account.username}\n`);

  const beadsDir = path.join(ROOT, "public", "beads");
  const braceletsDir = path.join(ROOT, "public", "bracelets");

  let total = 0;
  let done = 0;

  // 2. Bead macro photos (13)
  console.log("━━━ Bead photographs (13) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const bead of BEADS) {
    total++;
    const destPath = path.join(beadsDir, `${bead.slug}.jpg`);
    await generateImage(token, beadPrompt(bead), destPath, BEAD_SEED, bead.name, true);
    done++;
    console.log(`  [${done}/${BEADS.length + BRACELETS.length * 5}]`);
  }

  // 3. Bracelet shots (5 per bracelet = 15)
  const SHOT_TYPES = ["shot-1", "shot-2", "shot-3", "shot-4", "wrist"];
  const SHOT_LABELS = ["overhead flat-lay", "30° angle", "detail close-up", "editorial", "on wrist"];

  console.log("\n━━━ Bracelet photographs (15) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const bracelet of BRACELETS) {
    console.log(`\n  ${bracelet.slug.toUpperCase()}`);
    for (let i = 0; i < SHOT_TYPES.length; i++) {
      total++;
      const shotType = SHOT_TYPES[i];
      const label = `${bracelet.slug} — ${SHOT_LABELS[i]}`;
      const destPath = path.join(braceletsDir, `${bracelet.slug}-${shotType}.jpg`);
      const seed = BRACELET_SEED + BRACELETS.indexOf(bracelet) * 10 + i;
      await generateImage(token, braceletPrompt(bracelet, shotType), destPath, seed, label);
      done++;
      console.log(`  [${done}/${BEADS.length + BRACELETS.length * 5}]`);
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log(`║  ✓ All ${BEADS.length + BRACELETS.length * 5} images generated successfully              ║`);
  console.log("║                                                          ║");
  console.log("║  Next: the live preview will automatically use the       ║");
  console.log("║  new bead photos once you restart the dev server.        ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

main().catch((err) => {
  console.error("\n✗ Generation failed:", err.message);
  process.exit(1);
});
