// One-off: generate the 45°-angle wooden bead board via Replicate (flux-schnell)
// and download it to public/images/wooden-plate-bench.jpg.
//
//   node scripts/gen-plate.mjs
//
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Pull REPLICATE_API_TOKEN from .env.local (without adding a dep).
function loadToken() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  for (const f of [".env.local", ".env"]) {
    try {
      const txt = readFileSync(join(root, f), "utf8");
      const m = txt.match(/^REPLICATE_API_TOKEN=(.+)$/m);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  throw new Error("REPLICATE_API_TOKEN not found in env or .env.local");
}

const TOKEN = loadToken();

const prompt =
  "A high-end product photograph of an empty round light white-oak wooden bead board, " +
  "a shallow circular wooden tray with a single carved circular groove channel near the " +
  "inner rim, shot from a low three-quarter camera angle so the round tray appears as a " +
  "strongly foreshortened wide horizontal ellipse — a dramatic 45-degree oblique " +
  "perspective, NOT a flat overhead bird's-eye view. The front rim is closer to the " +
  "camera and larger than the back rim, the carved wooden side wall thickness of the tray " +
  "is clearly visible, resting on a soft warm cream linen surface, gentle natural studio " +
  "light from the upper left casting a soft shadow, minimalist luxury aesthetic, ultra " +
  "photorealistic, sharp focus, 8k, empty board with no beads, centered composition";

console.log("→ Requesting plate from Replicate (flux-schnell)…");

const createRes = await fetch(
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
        width: 1024,
        height: 1024,
        num_outputs: 1,
        num_inference_steps: 4,
        output_format: "jpg",
        output_quality: 95,
        aspect_ratio: "1:1",
      },
    }),
  },
);

const prediction = await createRes.json();
if (!prediction.id && !prediction.output) {
  throw new Error("Replicate error: " + JSON.stringify(prediction));
}

async function resolveUrl(p) {
  if (p.status === "succeeded") {
    return Array.isArray(p.output) ? p.output[0] : p.output;
  }
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(
      `https://api.replicate.com/v1/predictions/${p.id}`,
      { headers: { Authorization: `Token ${TOKEN}` } },
    );
    const data = await res.json();
    if (data.status === "succeeded")
      return Array.isArray(data.output) ? data.output[0] : data.output;
    if (data.status === "failed" || data.status === "canceled")
      throw new Error(`Prediction ${data.status}: ${data.error}`);
  }
  throw new Error("Timed out");
}

const url = await resolveUrl(prediction);
console.log("→ Image URL:", url);

const imgRes = await fetch(url);
const buf = Buffer.from(await imgRes.arrayBuffer());
mkdirSync(join(root, "public/images"), { recursive: true });
const out = join(root, "public/images/wooden-plate-bench.jpg");
writeFileSync(out, buf);
console.log("✓ Saved", out, `(${(buf.length / 1024).toFixed(0)} KB)`);
