import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VideoScript, AnalyzeRequest } from "@/types/video-builder";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Models tried in order — availability varies by API key / region
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro",
];

// ── Fallback script when all Gemini models fail ────────────────────────────────
function buildFallbackScript(content: string, customHeadline?: string): VideoScript {
  const words   = content.trim().split(/\s+/);
  const headline = customHeadline || words.slice(0, 8).join(" ");
  const brief    = words.slice(0, 40).join(" ") + (words.length > 40 ? "..." : "");

  return {
    headline,
    brief,
    keyFacts: [
      "Key development reported by TOI.",
      "Multiple stakeholders are closely monitoring the situation.",
      "Experts expect further updates in the coming hours.",
      "TOI will provide live coverage as events unfold.",
    ],
    entities: { people: [], places: [], organizations: ["TOI"], topics: ["News"] },
    hook:       `Breaking: ${headline}`,
    event:      brief,
    facts:      "Key facts are being verified. Stay tuned for live updates from TOI.",
    conclusion: "Follow Times of India for the latest updates on this developing story.",
    fullNarration: `${headline}. ${brief}. Follow Times of India for the latest updates.`,
    totalDuration: 30,
    scenes: [
      { id: 1, type: "hook",       duration: 4,  headline: headline.toUpperCase(), description: "Breaking news visual with TOI branding",  visualKeywords: ["news", "breaking"],   captionText: "BREAKING NEWS",              narration: `Breaking: ${headline}` },
      { id: 2, type: "event",      duration: 10, headline,                          description: "Reporter on location or news footage",    visualKeywords: ["report", "news"],     captionText: headline,                     narration: brief },
      { id: 3, type: "facts",      duration: 8,  headline: "Key Facts",             description: "Facts displayed as bullet points",        visualKeywords: ["facts", "data"],      captionText: "KEY FACTS",                  narration: "Multiple sources confirm the developing situation." },
      { id: 4, type: "context",    duration: 5,  headline: "Context",               description: "Background footage or archive visuals",   visualKeywords: ["background", "story"], captionText: "BACKGROUND",                narration: "This comes amid broader developments being tracked by TOI." },
      { id: 5, type: "conclusion", duration: 3,  headline: "Stay Updated",          description: "TOI logo and call to action",             visualKeywords: ["toi", "logo"],        captionText: "Follow @TOI for live updates", narration: "Follow Times of India for the latest." },
    ],
    visualKeywords: ["news", "india", "breaking", "report"],
  };
}

// ── JSON prompt ────────────────────────────────────────────────────────────────
function buildPrompt(content: string, customHeadline?: string): string {
  const headlineInstruction = customHeadline
    ? `Use this custom headline for the video: "${customHeadline}"`
    : "Extract a compelling headline from the article.";

  return `You are a professional news video scriptwriter for The Times of India.
Analyse this news article and generate a structured short news video script (20-40 seconds).
${headlineInstruction}

Article:
${content.slice(0, 8000)}

Respond with ONLY valid JSON (no markdown fences, no explanation). Use this exact structure:
{
  "headline": "Compelling video headline — max 10 words",
  "brief": "One to two sentence story summary for anchor read",
  "keyFacts": ["Short punchy fact 1", "Fact 2", "Fact 3", "Fact 4"],
  "entities": {
    "people": ["Person Name"],
    "places": ["City or Country"],
    "organizations": ["Organisation Name"],
    "topics": ["Topic keyword"]
  },
  "hook": "3-4 second attention-grabbing opening line. Dramatic, punchy.",
  "event": "10-12 second explanation of what happened. Clear and factual.",
  "facts": "8-10 second narration of key facts as if being read aloud.",
  "conclusion": "4-5 second closing with implication or call to follow TOI.",
  "fullNarration": "Complete narration combining all parts naturally. 80-120 words. Professional newsroom voice.",
  "totalDuration": 30,
  "scenes": [
    {"id":1,"type":"hook","duration":4,"headline":"SCENE HEADLINE IN CAPS","description":"Visual: describe what appears on screen","visualKeywords":["kw1","kw2","kw3"],"captionText":"BREAKING NEWS","narration":"Opening anchor line"},
    {"id":2,"type":"event","duration":10,"headline":"Event headline","description":"Visual for event scene","visualKeywords":["kw1","kw2"],"captionText":"Event caption","narration":"Event narration"},
    {"id":3,"type":"facts","duration":8,"headline":"KEY FACTS","description":"Animated bullet facts on dark background","visualKeywords":["data","facts"],"captionText":"KEY FACTS","narration":"Facts narration"},
    {"id":4,"type":"context","duration":5,"headline":"Context headline","description":"Context visual","visualKeywords":["kw1"],"captionText":"CONTEXT","narration":"Context narration"},
    {"id":5,"type":"conclusion","duration":3,"headline":"Stay Updated","description":"TOI branding and call-to-action","visualKeywords":["toi","logo"],"captionText":"Follow @TimesOfIndia for live updates","narration":"Closing line"}
  ],
  "visualKeywords": ["overall","story","keywords","for","visuals"]
}`;
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let content        = "";
  let customHeadline: string | undefined;

  try {
    const body: AnalyzeRequest = await req.json();
    content        = body.content ?? "";
    customHeadline = body.customHeadline;

    if (!content.trim()) {
      return NextResponse.json({ error: "Article content is required" }, { status: 400 });
    }

    const prompt = buildPrompt(content, customHeadline);

    // Try each model in sequence until one succeeds
    for (const modelName of GEMINI_MODELS) {
      try {
        const model  = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text   = result.response.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");

        const script: VideoScript = JSON.parse(jsonMatch[0]);
        if (!script.headline || !script.scenes?.length) throw new Error("Incomplete script");

        // RULE: caption text must be identical to narration for each scene
        // so that what the viewer reads exactly matches what the voice says.
        script.scenes = script.scenes.map((scene) => ({
          ...scene,
          captionText: scene.narration ?? scene.captionText,
        }));

        console.log(`✓ Script generated via ${modelName}`);
        return NextResponse.json(script);
      } catch (modelErr) {
        console.warn(`${modelName} failed:`, (modelErr as Error).message.slice(0, 120));
        // Try next model
      }
    }

    // All models failed — use deterministic fallback
    console.warn("All Gemini models failed — returning fallback script");
    const fallback = buildFallbackScript(content, customHeadline);
    fallback.scenes = fallback.scenes.map((s) => ({ ...s, captionText: s.narration }));
    return NextResponse.json(fallback);
  } catch (err) {
    console.error("video-script route error:", err);
    return NextResponse.json(buildFallbackScript(content, customHeadline));
  }
}
