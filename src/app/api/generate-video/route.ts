import { NextRequest, NextResponse } from "next/server";
import type { GenerateVideoRequest, GeneratedVideo, VideoScene } from "@/types/video-builder";

// ── Config ─────────────────────────────────────────────────────────────────────
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const GEMINI_KEY     = process.env.GEMINI_API_KEY ?? "";

// ElevenLabs voice IDs — TOI newsroom voices
const VOICE_IDS: Record<string, string> = {
  neutral: "5l5f8iK3YPeGga21rQIX", // Neutral news anchor
  female:  "2zRM7PkgwBPiau2jvVXc", // Female news anchor
  male:    "UgBBYS2sOqTuMpoF3BR0", // Male news anchor
};

// ── Build narration script from structured sections ────────────────────────────
// Rule: caption text must exactly match the voice narration.
// We build the full narration from hook → event → facts → conclusion sections.
function buildNarrationScript(script: GenerateVideoRequest["script"]): string {
  const parts: string[] = [];

  // Use the structured sections — these are what was extracted from the article
  if (script.hook?.trim())       parts.push(script.hook.trim());
  if (script.event?.trim())      parts.push(script.event.trim());
  if (script.facts?.trim())      parts.push(script.facts.trim());
  if (script.conclusion?.trim()) parts.push(script.conclusion.trim());

  // Fall back to fullNarration if individual sections are missing
  return parts.length >= 2 ? parts.join(" ") : (script.fullNarration ?? "");
}

// ── ElevenLabs TTS ─────────────────────────────────────────────────────────────
async function generateNarrationElevenLabs(text: string, voiceStyle: string): Promise<string> {
  if (!ELEVENLABS_KEY) throw new Error("ELEVENLABS_API_KEY not set in environment");

  const voiceId = VOICE_IDS[voiceStyle] ?? VOICE_IDS.neutral;
  console.log(`ElevenLabs → voice: ${voiceId} (${voiceStyle}), key: ...${ELEVENLABS_KEY.slice(-6)}, chars: ${text.length}`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key":   ELEVENLABS_KEY,
      "Content-Type": "application/json",
      "Accept":       "audio/mpeg",
    },
    body: JSON.stringify({
      text:     text.slice(0, 2_500),
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability:         0.60,
        similarity_boost:  0.78,
        style:             0.25,
        use_speaker_boost: true,
      },
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    // Parse structured ElevenLabs error for clear diagnostics
    let reason = errBody.slice(0, 300);
    try {
      const parsed = JSON.parse(errBody);
      const detail = parsed?.detail;
      if (detail?.code)    reason = `${detail.code}: ${detail.message}`;
      if (detail?.message) reason = detail.message;
    } catch { /* not JSON */ }
    throw new Error(`ElevenLabs HTTP ${res.status} — ${reason}`);
  }

  const buffer = await res.arrayBuffer();
  if (!buffer.byteLength) throw new Error("ElevenLabs returned empty audio buffer");

  console.log(`✓ ElevenLabs narration: ${buffer.byteLength} bytes`);
  return `data:audio/mpeg;base64,${Buffer.from(buffer).toString("base64")}`;
}

// ── Build entity-grounded scene image prompt ───────────────────────────────────
function buildSceneImagePrompt(
  scene: VideoScene,
  script: GenerateVideoRequest["script"],
): string {
  const { entities, headline } = script;

  // Entity context from the article
  const entityParts: string[] = [];
  if (entities.people.length > 0)        entityParts.push(`People featured: ${entities.people.slice(0, 3).join(", ")}`);
  if (entities.places.length > 0)        entityParts.push(`Location: ${entities.places.slice(0, 2).join(", ")}`);
  if (entities.organizations.length > 0) entityParts.push(`Organizations: ${entities.organizations.slice(0, 2).join(", ")}`);
  if (entities.topics.length > 0)        entityParts.push(`Topics: ${entities.topics.slice(0, 3).join(", ")}`);

  // Scene-type specific visual direction
  const sceneDirection: Record<string, string> = {
    hook:       "High-impact breaking news opener. Dramatic wide shot, urgent atmosphere, golden hour or studio lighting.",
    event:      "News event in progress. Photojournalistic documentation. Crowds, officials, or key moment being captured.",
    facts:      "Clean infographic-style visual. Data being presented. Serious, authoritative newsroom aesthetic.",
    context:    "Establishing background shot. Archival quality. Wide angle showing the broader environment or history.",
    conclusion: "Closing wrap-up visual. Professional. TOI brand moment. Clean composition.",
  };

  return [
    `Photorealistic editorial news photograph for Times of India.`,
    `Story headline: "${headline}".`,
    `Scene type: ${scene.type} — ${sceneDirection[scene.type] ?? "News broadcast visual"}.`,
    `Scene description: ${scene.description}.`,
    entityParts.join(". "),
    `Visual keywords: ${scene.visualKeywords.join(", ")}.`,
    `Style: documentary photojournalism, cinematic lighting, India news broadcast quality. No text overlays. Sharp, high resolution, professional.`,
  ].filter(Boolean).join(" ");
}

// ── Scene image: Imagen 4 via /predict endpoint ────────────────────────────────
async function generateSceneImageImagen(prompt: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances:  [{ prompt: prompt.slice(0, 1_000) }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!res.ok) {
      console.warn(`Imagen 4 HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const pred = data.predictions?.[0];
    if (!pred?.bytesBase64Encoded) return null;

    return `data:${pred.mimeType ?? "image/png"};base64,${pred.bytesBase64Encoded}`;
  } catch (e) {
    console.warn("Imagen 4 error:", (e as Error).message.slice(0, 80));
    return null;
  }
}

// ── Scene image: Pollinations AI server-side fetch → base64 ───────────────────
// Fetching server-side means the browser receives a data URL — no cross-origin
// or content-type rendering issues possible.
async function generateSceneImagePollinations(prompt: string, seed: number): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt.slice(0, 500));
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&model=flux&seed=${seed}`;

    const res = await fetch(url, {
      signal:  AbortSignal.timeout(35_000),
      headers: { "User-Agent": "TOI-Editor-Copilot/1.0" },
    });

    if (!res.ok) {
      console.warn(`Pollinations HTTP ${res.status} for scene`);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const mime = contentType.startsWith("image/") ? contentType.split(";")[0].trim() : "image/jpeg";
    const buf  = await res.arrayBuffer();
    if (!buf.byteLength) return null;

    return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
  } catch (e) {
    console.warn("Pollinations scene error:", (e as Error).message.slice(0, 80));
    return null;
  }
}

// ── Generate single scene image (Imagen 4 → Pollinations fallback) ─────────────
async function generateSceneImage(
  scene: VideoScene,
  script: GenerateVideoRequest["script"],
  idx: number,
): Promise<string | null> {
  const prompt = buildSceneImagePrompt(scene, script);
  const seed   = Date.now() + idx * 7919; // deterministic seed offset per scene

  // Try Imagen 4 first (best quality), then Pollinations
  const imagenResult = await generateSceneImageImagen(prompt);
  if (imagenResult) {
    console.log(`✓ Scene ${idx + 1} [${scene.type}]: Imagen 4`);
    return imagenResult;
  }

  const polResult = await generateSceneImagePollinations(prompt, seed);
  if (polResult) {
    console.log(`✓ Scene ${idx + 1} [${scene.type}]: Pollinations`);
    return polResult;
  }

  console.warn(`✗ Scene ${idx + 1} [${scene.type}]: all image sources failed`);
  return null;
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: GenerateVideoRequest = await req.json();
    const { script, format, voiceStyle, captionStyle, assets = [] } = body;

    if (!script?.headline) {
      return NextResponse.json({ error: "Valid script is required" }, { status: 400 });
    }

    // ── Build the narration text that will be spoken ───────────────────────────
    // RULE: captions per scene must match the narration per scene.
    // The scene.narration fields are authoritative — they were set by the script
    // generator to match scene.captionText. The full narration is the join of all.
    const narrationText = buildNarrationScript(script);
    console.log(`Narration text (${narrationText.length} chars): "${narrationText.slice(0, 80)}..."`);

    // ── Classify uploaded assets ───────────────────────────────────────────────
    const imageAssets = assets.filter((a) => a.type === "image" && a.preview);

    // ── Determine scene image slots ────────────────────────────────────────────
    // Uploaded images are slotted by priority into the most visual scenes.
    // Priority order: event → context → hook
    // Conclusion always gets an AI-generated branding visual.
    const uploadedSlots: Record<string, string | undefined> = {};
    if (imageAssets[0]?.preview) uploadedSlots["event"]   = imageAssets[0].preview;
    if (imageAssets[1]?.preview) uploadedSlots["context"] = imageAssets[1].preview;
    if (imageAssets[2]?.preview) uploadedSlots["hook"]    = imageAssets[2].preview;

    // ── Run narration + all 5 scene images in parallel ─────────────────────────
    const narrationPromise = generateNarrationElevenLabs(narrationText, voiceStyle)
      .catch((e) => {
        // Log full reason so it shows in the Next.js dev server terminal
        console.error("❌ ElevenLabs narration failed:", (e as Error).message);
        console.error("   → Client will fall back to browser Web Speech API");
        return undefined as string | undefined;
      });

    const sceneImagePromises = script.scenes.map((scene, idx) => {
      // Use uploaded asset if available for this scene type
      const uploadedPreview = uploadedSlots[scene.type];
      if (uploadedPreview) {
        console.log(`Scene ${idx + 1} [${scene.type}]: using uploaded asset`);
        return Promise.resolve(uploadedPreview);
      }
      // Conclusion scene: no AI image needed, use gradient fallback in player
      if (scene.type === "conclusion") {
        return Promise.resolve(null as string | null);
      }
      return generateSceneImage(scene, script, idx);
    });

    // Run everything concurrently
    const [narrationAudio, ...sceneImageResults] = await Promise.all([
      narrationPromise,
      ...sceneImagePromises,
    ]);

    const sceneImages: (string | null)[] = sceneImageResults;

    console.log(`✓ Narration: ${narrationAudio ? "generated" : "FAILED"}`);
    console.log(`✓ Scene images: ${sceneImages.filter(Boolean).length}/${sceneImages.length} generated`);

    const video: GeneratedVideo = {
      script,
      format,
      voiceStyle,
      captionStyle,
      generatedAt:        new Date().toISOString(),
      narrationAudio,
      narrationScript:    narrationText,
      sceneImages,
      uploadedAssetCount: assets.length,
    };

    return NextResponse.json(video);
  } catch (err) {
    console.error("generate-video API error:", err);
    return NextResponse.json({ error: "Video generation failed" }, { status: 500 });
  }
}
