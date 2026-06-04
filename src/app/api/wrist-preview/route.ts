import { NextResponse } from "next/server";
import { BEAD_BY_SLUG } from "@/lib/beads";

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

// Build an evocative prompt from the bead slugs
function buildPrompt(slugs: string[]): string {
  const unique = [...new Set(slugs)];
  const stones = unique
    .map((s) => BEAD_BY_SLUG[s])
    .filter(Boolean)
    .map((b) => b!.westernName);

  const dominantColors = unique
    .map((s) => BEAD_BY_SLUG[s])
    .filter(Boolean)
    .map((b) => b!.color);

  const stoneList =
    stones.length === 1
      ? stones[0]
      : stones.slice(0, -1).join(", ") + " and " + stones[stones.length - 1];

  return (
    `Close-up editorial photograph of a luxury crystal bead bracelet worn on a slender wrist, ` +
    `photographed from above against a soft linen surface. The bracelet is composed of polished ${stoneList} beads ` +
    `strung on a natural elastic cord. The stones are round, highly polished, and glossy. ` +
    `Soft studio lighting from above, shallow depth of field, muted warm background, ` +
    `luxury jewelry photography style, photorealistic, high resolution, 8k detail`
  );
}

async function poll(id: string, token: string, retries = 45): Promise<string> {
  for (let i = 0; i < retries; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json();
    if (data.status === "succeeded") {
      const output = Array.isArray(data.output) ? data.output[0] : data.output;
      return output as string;
    }
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${data.status}: ${data.error}`);
    }
  }
  throw new Error("Timed out waiting for image generation");
}

export async function POST(request: Request) {
  if (!REPLICATE_TOKEN) {
    return NextResponse.json({ error: "Replicate token not configured" }, { status: 500 });
  }

  let slugs: string[];
  try {
    const body = await request.json();
    slugs = body.slugs ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (slugs.length === 0) {
    return NextResponse.json({ error: "No beads provided" }, { status: 422 });
  }

  const prompt = buildPrompt(slugs);

  // Use flux-schnell for fast generation
  const createRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
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
        output_quality: 90,
      },
    }),
  });

  const prediction = await createRes.json();

  if (!prediction.id) {
    return NextResponse.json({ error: prediction.detail ?? "Failed to start prediction" }, { status: 500 });
  }

  // If the `Prefer: wait` header completed it synchronously
  if (prediction.status === "succeeded") {
    const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    return NextResponse.json({ url: output, prompt });
  }

  // Otherwise poll
  try {
    const url = await poll(prediction.id, REPLICATE_TOKEN);
    return NextResponse.json({ url, prompt });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
