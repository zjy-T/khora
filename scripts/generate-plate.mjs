#!/usr/bin/env node
/**
 * Generates a photorealistic empty wooden bead-display plate via Replicate
 * (flux-schnell), saved to /public/plate-environment.jpg.
 *
 * Usage: REPLICATE_API_TOKEN=<token> node scripts/generate-plate.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/plate-environment.jpg");
const TOKEN = process.env.REPLICATE_API_TOKEN;

if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set");
  process.exit(1);
}

const prompt =
  "Perfectly symmetrical top-down flat-lay photograph of a single round shallow " +
  "walnut wood tray for displaying jewelry, the circular tray is exactly centered " +
  "in the frame and fills most of the image, empty, sitting on a soft warm linen " +
  "cloth surface. The wooden tray has a smooth polished concave dish and a raised " +
  "circular rim, viewed from directly straight above at 90 degrees. Soft even " +
  "diffused overhead lighting, subtle shadows, warm beige and cream tones, calm " +
  "minimalist luxury jewelry workshop aesthetic, bird's eye view, radially " +
  "symmetric centered composition, no beads, nothing inside the tray, "+
  "photorealistic, 8k, high detail";

const res = await fetch(
  "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
  {
    method: "POST",
    headers: {
      Authorization: `Token ${TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: "1:1",
        num_outputs: 1,
        num_inference_steps: 4,
        output_format: "jpg",
        output_quality: 95,
      },
    }),
  },
);

const data = await res.json();
const url = Array.isArray(data.output) ? data.output[0] : data.output;

if (!url) {
  console.error("Generation failed:", JSON.stringify(data, null, 2));
  process.exit(1);
}

const img = await fetch(url);
const buf = Buffer.from(await img.arrayBuffer());
fs.writeFileSync(OUT, buf);
console.log(`Saved plate → ${OUT}`);
