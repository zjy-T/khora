#!/usr/bin/env node
/**
 * Removes backgrounds from all bead JPGs using Replicate's rembg model.
 * Outputs transparent PNGs into the same /public/beads/ folder.
 *
 * Usage:
 *   REPLICATE_API_TOKEN=<token> node scripts/remove-bead-backgrounds.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEADS_DIR = path.join(__dirname, "../public/beads");
const TOKEN = process.env.REPLICATE_API_TOKEN;

if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN env var not set.");
  process.exit(1);
}

const REMBG_VERSION = "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003"; // cjwbw/rembg

async function poll(id, retries = 60) {
  for (let i = 0; i < retries; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${TOKEN}` },
    });
    const data = await res.json();
    if (data.status === "succeeded") return data.output;
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${id} ${data.status}: ${data.error}`);
    }
    process.stdout.write(".");
  }
  throw new Error("Timed out waiting for prediction");
}

const jpgFiles = fs
  .readdirSync(BEADS_DIR)
  .filter((f) => f.endsWith(".jpg"));

for (let idx = 0; idx < jpgFiles.length; idx++) {
  const file = jpgFiles[idx];
  const slug = file.replace(".jpg", "");
  const pngPath = path.join(BEADS_DIR, `${slug}.png`);

  if (fs.existsSync(pngPath)) {
    console.log(`✓ ${slug} — PNG already exists, skipping`);
    continue;
  }

  process.stdout.write(`\n→ ${slug} ... `);

  const imageBuffer = fs.readFileSync(path.join(BEADS_DIR, file));
  const base64 = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

  // Create prediction
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: REMBG_VERSION,
      input: { image: base64 },
    }),
  });

  const prediction = await createRes.json();
  if (!prediction.id) {
    console.error(`\nFailed to create prediction for ${slug}:`, prediction);
    continue;
  }

  // Poll until done
  const outputUrl = await poll(prediction.id);
  process.stdout.write(` done\n`);

  // Download the transparent PNG
  const imgRes = await fetch(outputUrl);
  const arrayBuffer = await imgRes.arrayBuffer();
  fs.writeFileSync(pngPath, Buffer.from(arrayBuffer));
  console.log(`  saved → ${slug}.png`);

  // Rate limit: 6/min = ~10s between requests
  if (idx < jpgFiles.length - 1) {
    process.stdout.write("  waiting 11s for rate limit...\n");
    await new Promise((r) => setTimeout(r, 11000));
  }
}

console.log("\nAll done.");
