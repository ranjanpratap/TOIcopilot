import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  GenerateRequest,
  GeneratedOutput,
  HeadlineItem,
  NewsBody,
  SEOData,
  AngleItem,
  HeatScoreData,
  CompetitorItem,
  CompetitorMetrics,
} from "@/types/news-brief";

// ─── Config ────────────────────────────────────────────────────────────────────
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NEWS_API_BASE = "https://newsapi.org/v2/everything";

const TRACKED_DOMAINS = [
  "ndtv.com",
  "indiatoday.in",
  "hindustantimes.com",
  "indianexpress.com",
  "thehindu.com",
  "timesnownews.com",
  "republicworld.com",
  "bbc.com",
  "cnn.com",
  "aljazeera.com",
].join(",");

const DOMAIN_TO_PUBLISHER: Record<string, string> = {
  "ndtv.com": "NDTV",
  "indiatoday.in": "India Today",
  "hindustantimes.com": "Hindustan Times",
  "indianexpress.com": "Indian Express",
  "thehindu.com": "The Hindu",
  "timesnownews.com": "Times Now",
  "republicworld.com": "Republic World",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "cnn.com": "CNN",
  "aljazeera.com": "Al Jazeera",
};

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// ─── Keyword helpers ───────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "in", "on", "at", "to", "for", "of", "and", "or", "but", "with",
  "by", "from", "as", "into", "during", "about", "this", "that", "these", "those", "be",
  "was", "were", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "must", "can", "its", "it", "are", "after",
  "before", "between", "through", "over", "under", "against", "than", "then", "when",
  "where", "who", "which", "what", "how", "why",
]);

function extractKeywords(topic: string, content: string): string {
  const topicWords = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const contentWords = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w));

  const combined = [...new Set([...topicWords.slice(0, 3), ...contentWords.slice(0, 2)])];
  return combined.slice(0, 5).join(" ");
}

function detectCategory(topic: string, content: string): string {
  const text = `${topic} ${content}`.toLowerCase();
  if (/cricket|ipl|football|sports|match|tournament|olympic|league|player|team/.test(text)) return "Sports";
  if (/supreme court|parliament|election|minister|modi|congress|bjp|politics|government|vote|rally/.test(text)) return "Politics";
  if (/rbi|economy|gdp|inflation|stocks|market|trade|business|rupee|crore|billion|startup/.test(text)) return "Business";
  if (/bollywood|movie|film|celebrity|entertainment|award|actor|actress/.test(text)) return "Entertainment";
  if (/ai|tech|startup|digital|app|crypto|blockchain|software|data/.test(text)) return "Technology";
  if (/pakistan|china|usa|war|international|global|treaty|sanction|border/.test(text)) return "International";
  return "General";
}

function hasBreakingSignals(topic: string, content: string): boolean {
  const text = `${topic} ${content}`.toLowerCase();
  return /breaking|just in|urgent|exclusive|developing|verdict|strikes|erupts|arrested|dies|killed|attack|blast|crisis|emergency/.test(text);
}

// ─── Headline generator ────────────────────────────────────────────────────────
function generateHeadlines(topic: string, style: string): HeadlineItem[] {
  const t = topic.trim();
  const isBreaking = hasBreakingSignals(topic, "");

  const headlines: HeadlineItem[] = [
    {
      text: `${t}: Everything You Need to Know — Full Breakdown`,
      seoScore: 91,
      ctrPrediction: "4.1%",
      type: "SEO",
      isRecommended: true,
    },
    {
      text: `${isBreaking ? "BREAKING: " : ""}${t} — What Happened, Why It Matters`,
      seoScore: 74,
      ctrPrediction: "4.6%",
      type: "Breaking",
    },
    {
      text: `Explained: ${t} and Its Impact on Every Indian`,
      seoScore: 84,
      ctrPrediction: "3.8%",
      type: "Explainer",
    },
    {
      text: `5 Key Takeaways From the ${t} Controversy`,
      seoScore: 82,
      ctrPrediction: "4.3%",
      type: "High CTR",
    },
    {
      text: `How ${t} Is Reshaping India's Political and Social Landscape`,
      seoScore: 78,
      ctrPrediction: "3.5%",
      type: "Analysis",
    },
    {
      text: `${t}: Opposition Hits Back, Here Is the Full Story`,
      seoScore: 71,
      ctrPrediction: "3.9%",
      type: "Balanced",
    },
    {
      text: `What ${t} Means For You — An Expert Analysis`,
      seoScore: 86,
      ctrPrediction: "4.2%",
      type: "High CTR",
    },
    {
      text: `${t} Explained: A Complete Guide for First-Time Readers`,
      seoScore: 80,
      ctrPrediction: "3.4%",
      type: "SEO",
    },
  ];

  // Apply style-specific adjustments
  if (style === "Breaking News") {
    headlines.sort((a, b) => (b.type === "Breaking" ? 1 : 0) - (a.type === "Breaking" ? 1 : 0));
  } else if (style === "SEO-focused Digital Story") {
    headlines.sort((a, b) => b.seoScore - a.seoScore);
  } else if (style === "Explainer") {
    headlines.sort((a, b) => (b.type === "Explainer" ? 1 : 0) - (a.type === "Explainer" ? 1 : 0));
  }

  return headlines;
}

// ─── Article body generator ────────────────────────────────────────────────────
function generateNewsBody(topic: string, style: string): NewsBody {
  const t = topic.trim();
  const isBreaking = hasBreakingSignals(topic, "");

  return {
    intro: `In a ${isBreaking ? "landmark and rapidly evolving" : "significant"} development, ${t} has emerged as a defining issue in India's public discourse. The development comes at a critical juncture as stakeholders across the political, legal, and civil society spectrum weigh in on the far-reaching implications. TOI's editorial team has collated the key facts, expert reactions, and contextual analysis for a comprehensive overview.`,

    keyDevelopments: [
      `The central development in the ${t} case involves key institutional players taking unprecedented positions that could have structural implications for policy and governance.`,
      `Multiple sources with direct knowledge of the matter have confirmed that the situation has been evolving rapidly over the past 72 hours, with senior officials briefed at the highest levels.`,
      `Opposition parties have called for an immediate parliamentary session and a public inquiry, citing significant public interest and constitutional concerns related to the matter.`,
      `Leading experts from premier think tanks and academic institutions suggest this development could set a precedent that shapes legal, political, and economic outcomes for years.`,
      `Civil society groups and advocacy organisations have formally written to the relevant authorities, requesting transparency, accountability, and swift remedial action.`,
    ],

    background: `${t} has been at the centre of national attention following a series of escalating developments that culminated in today's major announcement. The issue traces its origins to policy and institutional decisions made over the preceding months, which were subsequently challenged by multiple stakeholders through constitutional and democratic channels. India's institutional framework has previously navigated challenges of similar gravity — though the scale, public interest, and political sensitivity of the current matter set it apart from routine governance disputes. Historical precedents suggest that situations of this nature typically trigger sustained legal proceedings, parliamentary deliberation, and significant media scrutiny spanning months or even years.`,

    quotes: [
      `"This is a landmark moment that will define the trajectory of Indian governance for the foreseeable future," said a senior constitutional expert based in New Delhi, speaking on the condition of anonymity.`,
      `"The people of India have been waiting for clarity on this issue for far too long. This development must be followed through with swift, transparent, and accountable institutional action," noted a prominent civil society leader at a press briefing in Mumbai.`,
      `"We are carefully and thoroughly studying the constitutional implications of this development and will respond through every appropriate legal and democratic channel available to us," stated a spokesperson for the opposition coalition.`,
    ],

    closingContext: `The situation is expected to dominate political headlines, social media discourse, and institutional deliberations through the coming fortnight, with parliamentary sessions, judicial proceedings, and civil society forums all likely to converge on this central issue. Senior political analysts predict that the aftermath could meaningfully reshape political alignments and electoral narratives ahead of upcoming state assembly elections. TOI will continue providing real-time updates, expert analysis, and ground reports as this story develops. Key dates to watch include the next scheduled Supreme Court hearing, an imminent parliamentary question hour session, and a civil society forum planned for early next week.`,
  };
}

// ─── SEO generator ────────────────────────────────────────────────────────────
function generateSEO(topic: string): SEOData {
  const t = topic.trim();
  const slug = t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 60);

  return {
    primaryKeyword: t,
    supportingKeywords: [
      `${t} 2025`,
      `${t} latest news today`,
      `${t} India update`,
      `${t} explained`,
      `${t} impact analysis`,
    ],
    relatedPhrases: [
      `what is ${t.toLowerCase()}`,
      `${t.toLowerCase()} latest developments`,
      `${t.toLowerCase()} why it matters`,
      `${t.toLowerCase()} Supreme Court India`,
      `${t.toLowerCase()} expert reaction`,
    ],
    metaDescription: `Get comprehensive coverage of ${t} on Times of India. Breaking updates, expert analysis, political reactions, and what it means for India — all in one place.`,
    slug,
  };
}

// ─── News angles generator ─────────────────────────────────────────────────────
function generateAngles(topic: string): AngleItem[] {
  const t = topic.trim();
  return [
    {
      name: "Public Impact",
      description: `How does ${t} directly affect the lives of ordinary Indians? This angle focuses on ground-level consequences — costs, rights, access, and social disruption — told through real examples and relatable narrative.`,
      targetAudience: "General public, 25–45 age group, tier-1 and tier-2 cities",
      trafficPotential: "High",
      reason: `"What this means for me" stories consistently outperform pure policy explainers by 2–3× in CTR. High evergreen search value once indexed. Strong potential for WhatsApp and Facebook referral traffic.`,
    },
    {
      name: "Political Reaction",
      description: `Track how political parties, opposition leaders, and government representatives are framing ${t}. Capture the political theatre, competing narratives, and what each party stands to gain or lose.`,
      targetAudience: "Political news followers, opinion leaders, urban professionals",
      trafficPotential: "Very High",
      reason: `Political reaction stories drive the highest engagement volumes on this kind of breaking issue. Partisan audiences on both sides actively share and debate. Strong social referral potential from Twitter/X and YouTube comments.`,
    },
    {
      name: "Explainer",
      description: `Demystify ${t} for readers encountering it for the first time. Timeline of events, key players, what happened, why it matters, and what comes next — presented in scannable, jargon-free format.`,
      targetAudience: "New readers, students, social media audience, international Indians",
      trafficPotential: "High",
      reason: `Explainer content ranks strongly for "what is" and "explained" queries that dominate search behaviour in the first 48 hours of a big story. Long session times boost ad revenue and email subscription conversion.`,
    },
    {
      name: "Business & Economic Impact",
      description: `Analyse the financial dimensions of ${t}. Market reactions, investor sentiment, sectoral implications, trade consequences, and long-term economic outlook — backed by data and expert commentary.`,
      targetAudience: "Business readers, investors, finance professionals, policy watchers",
      trafficPotential: "Moderate",
      reason: `Business angles attract a premium-income demographic with high advertiser value. Strong newsletter open rates, solid Google Finance and Bloomberg referral potential.`,
    },
    {
      name: "Human Interest",
      description: `Find the human faces at the centre of ${t}. Personal stories, grassroots impact, voices of those directly affected. Emotional connection, not policy analysis — designed for maximum shareability.`,
      targetAudience: "Social media audience, feature and magazine readers, diaspora",
      trafficPotential: "Moderate",
      reason: `Human interest stories are top performers for social referral and WhatsApp shares, particularly among audiences 35+. High likelihood of being picked up by regional language outlets, amplifying reach.`,
    },
  ];
}

// ─── Heat score calculator ─────────────────────────────────────────────────────
function calculateHeatScore(
  competitors: CompetitorItem[],
  topic: string,
  content: string,
): HeatScoreData {
  const articleCount = competitors.length;

  // 1. Competitor coverage (30%)
  const coverageScore = Math.min((articleCount / 12) * 100, 100);

  // 2. Freshness (20%) — based on how recent the most recent competitor article is
  let freshnessScore = 55;
  if (articleCount > 0 && competitors[0].publishedAt) {
    const ageHours =
      (Date.now() - new Date(competitors[0].publishedAt).getTime()) / 3_600_000;
    freshnessScore = Math.max(0, Math.min(100, 100 - ageHours * 4));
  }

  // 3. Keyword strength (15%)
  const text = `${topic} ${content}`.toLowerCase();
  const highValueKw = [
    "supreme court", "parliament", "modi", "election", "verdict", "ipl", "crore",
    "arrest", "blast", "attack", "exclusive", "breaking", "crisis", "emergency",
    "murder", "conviction", "strike", "ban", "recall", "resign",
  ];
  const kwMatches = highValueKw.filter((k) => text.includes(k)).length;
  const keywordScore = Math.min((kwMatches / 4) * 100, 100);

  // 4. Breaking signal (15%)
  const breakingScore = hasBreakingSignals(topic, content) ? 92 : 38;

  // 5. Category weight (10%)
  const category = detectCategory(topic, content);
  const categoryScores: Record<string, number> = {
    Politics: 90, Sports: 88, Entertainment: 80,
    Business: 72, Technology: 66, International: 76, General: 60,
  };
  const categoryScore = categoryScores[category] ?? 60;

  // 6. Video potential (10%)
  const videoKw = ["match", "verdict", "protest", "arrest", "ceremony", "launch", "statement", "press", "conference", "rally", "performance"];
  const videoScore = videoKw.some((k) => text.includes(k)) ? 88 : 50;

  const raw =
    coverageScore * 0.3 +
    freshnessScore * 0.2 +
    keywordScore * 0.15 +
    breakingScore * 0.15 +
    categoryScore * 0.1 +
    videoScore * 0.1;

  const score = Math.min(Math.round(raw), 99);

  const status =
    score >= 80 ? "Viral" :
      score >= 65 ? "Trending" :
        score >= 50 ? "Rising" :
          score >= 35 ? "Moderate" : "Low Priority";

  const recommendation =
    score >= 80
      ? `This story has viral potential. Deploy full editorial resources immediately — assign a ground reporter, push a social media package, and launch a live blog. The window for maximum traffic is the next 2–4 hours. Don't wait.`
      : score >= 65
        ? `Strong trending story with significant traffic potential. Prioritise a comprehensive explainer and assign an analyst for depth coverage. Monitor competitor publications every 30 minutes. Consider a video brief.`
        : score >= 50
          ? `Rising story with moderate traffic opportunity. A well-crafted SEO-optimised explainer or opinion piece could capture long-tail search traffic. Watch for breaking developments before committing major editorial resources.`
          : `Lower-priority story at this point. Monitor for escalation and competitor coverage pickup. A brief social media post or bulletin may be appropriate. Revisit in 2–3 hours.`;

  return {
    score,
    breakdown: {
      searchDemand: Math.round(Math.min(keywordScore * 0.9 + breakingScore * 0.1, 100)),
      socialBuzz: Math.round(Math.min(breakingScore * 0.7 + coverageScore * 0.3, 100)),
      competitorCoverage: Math.round(coverageScore),
      freshness: Math.round(freshnessScore),
      videoPotential: Math.round(videoScore),
    },
    status,
    recommendation,
    category,
  };
}

// ─── NewsAPI fetch ──────────────────────────────────────────────────────────────
interface RawArticle {
  source?: { id?: string; name?: string };
  title?: string;
  url?: string;
  publishedAt?: string;
}

async function fetchCompetitorArticles(keywords: string): Promise<RawArticle[]> {
  if (!NEWS_API_KEY || !keywords.trim()) return [];

  try {
    const url = new URL(NEWS_API_BASE);
    url.searchParams.set("q", keywords);
    url.searchParams.set("domains", TRACKED_DOMAINS);
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("language", "en");
    url.searchParams.set("apiKey", NEWS_API_KEY);

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers: { "User-Agent": "TOI-Editor-Copilot/1.0" },
    });

    if (!res.ok) {
      console.warn(`NewsAPI responded ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.articles) ? data.articles : [];
  } catch (err) {
    console.error("NewsAPI fetch failed:", err);
    return [];
  }
}

function mapArticles(raw: RawArticle[], topic: string): CompetitorItem[] {
  const styleOf = (title: string = ""): string => {
    if (/breaking|just in|live/i.test(title)) return "Breaking";
    if (/\?|explainer|guide|what is/i.test(title)) return "Explainer";
    if (/\d+\s*(points?|things?|ways?|facts?)/i.test(title)) return "Data-driven";
    if (/react|responds?|hits? back|slams?/i.test(title)) return "Reaction";
    if (/analysis|impact|why|how|means/i.test(title)) return "Analysis";
    return "Standard";
  };

  const relevanceOf = (i: number): "High" | "Medium" | "Low" =>
    i < 3 ? "High" : i < 7 ? "Medium" : "Low";

  return raw.slice(0, 12).map((article, i) => {
    let publisher = article.source?.name ?? "Unknown";
    try {
      const domain = new URL(article.url ?? "https://example.com").hostname.replace("www.", "");
      publisher = DOMAIN_TO_PUBLISHER[domain] ?? publisher;
    } catch { }

    return {
      publisher,
      headline: article.title ?? "Untitled",
      url: article.url ?? "#",
      publishedAt: article.publishedAt ?? new Date().toISOString(),
      relevance: relevanceOf(i),
      style: styleOf(article.title),
    };
  });
}

// Fallback mock competitors when NewsAPI returns nothing
function mockCompetitors(topic: string): CompetitorItem[] {
  const t = topic.trim();
  const publishers: Array<{ name: string; style: string }> = [
    { name: "NDTV", style: "Breaking" },
    { name: "India Today", style: "Analysis" },
    { name: "Hindustan Times", style: "Standard" },
    { name: "Indian Express", style: "Explainer" },
    { name: "The Hindu", style: "Analysis" },
    { name: "Times Now", style: "Breaking" },
    { name: "Republic World", style: "Reaction" },
  ];

  return publishers.map((p, i) => ({
    publisher: p.name,
    headline: [
      `${t}: Full coverage of the latest developments`,
      `${t} — what you need to know right now`,
      `Breaking: ${t} triggers national debate`,
      `${t}: A deep dive into the controversy`,
      `${t}: Timeline of events and what comes next`,
      `${t}: All eyes on the political fallout`,
      `${t}: Experts weigh in on the implications`,
    ][i % 7],
    url: "#",
    publishedAt: new Date(Date.now() - (i * 22 + 15) * 60_000).toISOString(),
    relevance: i < 2 ? "High" : i < 5 ? "Medium" : "Low",
    style: p.style,
  }));
}

function buildCompetitorMetrics(
  competitors: CompetitorItem[],
  topic: string,
): CompetitorMetrics {
  const styles = competitors.map((c) => c.style);
  const styleCounts: Record<string, number> = {};
  styles.forEach((s) => { styleCounts[s] = (styleCounts[s] ?? 0) + 1; });
  const mostCommon = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Standard";

  const earliest = competitors.slice().sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  )[0];

  const density =
    competitors.length >= 10 ? "Very High" :
      competitors.length >= 6 ? "High" :
        competitors.length >= 3 ? "Moderate" : "Low";

  return {
    publishersFound: competitors.length,
    earliestPublisher: earliest?.publisher ?? "N/A",
    mostCommonAngle: mostCommon,
    coverageDensity: density,
  };
}

// ─── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { topic, content, style, options } = body;

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const keywords = extractKeywords(topic, content ?? "");

    // Run NewsAPI fetch in parallel with content generation
    const [rawArticles] = await Promise.all([
      options.competitorCoverage || options.heatScore
        ? fetchCompetitorArticles(keywords)
        : Promise.resolve([]),
    ]);

    const mappedArticles = rawArticles.length > 0
      ? mapArticles(rawArticles, topic)
      : mockCompetitors(topic);

    const output: GeneratedOutput = {};

    if (options.headlines) {
      output.headlines = generateHeadlines(topic, style);
    }

    if (options.newsBody) {
      output.newsBody = generateNewsBody(topic, style);
    }

    if (options.seoKeywords) {
      output.seoKeywords = generateSEO(topic);
    }

    if (options.newsAngles) {
      output.newsAngles = generateAngles(topic);
    }

    if (options.heatScore) {
      output.heatScore = calculateHeatScore(mappedArticles, topic, content ?? "");
    }

    if (options.competitorCoverage) {
      output.competitors = mappedArticles;
      output.competitorMetrics = buildCompetitorMetrics(mappedArticles, topic);
    }

    if (options.newsImage) {
      // ── System prompt (editorial quality, entity-grounded) ─────────────────
      const editorContext = [
        topic ? `Headline: "${topic}"` : "",
        content?.trim() ? `News content: ${content.trim().slice(0, 600)}` : "",
      ].filter(Boolean).join("\n");

      const SYSTEM_PROMPT =
        `Carefully read and analyze everything shared by the editor, including headline, pasted news content, ` +
        `event details, summary, and any related context. Identify important people, famous personalities, places, ` +
        `landmarks, objects, events, political context, and visual cues mentioned in the input. ` +
        `Create a photorealistic, editorial-quality news image inspired by those details, suitable for Times of India ` +
        `style digital and print usage. The image should visually represent the core news event and should be grounded ` +
        `in the entities and context provided by the editor, not generic imagery. If a famous person, public figure, ` +
        `known place, or recognizable event is mentioned, the visual should be built around that context. ` +
        `Keep the image clean, realistic, high-impact, newsroom appropriate, and without unnecessary text overlay ` +
        `unless explicitly requested.\n\n${editorContext}`;

      // Brief version for the photo brief display (no system prompt boilerplate)
      const briefPrompt =
        `Editorial news photograph for Times of India. ${editorContext}. ` +
        `Photorealistic, documentary style, wide-angle composition, natural lighting, front-page quality. No text overlays.`;

      output.imagePrompt = briefPrompt;

      // ── 1. Imagen 4 via /predict endpoint ─────────────────────────────────────
      if (!output.imageUrl) {
        try {
          const predictEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`;
          const imgRes = await fetch(predictEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt: SYSTEM_PROMPT.slice(0, 1000) }],
              parameters: { sampleCount: 1, aspectRatio: "16:9" },
            }),
            signal: AbortSignal.timeout(30_000),
          });

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            const prediction = imgData.predictions?.[0];
            if (prediction?.bytesBase64Encoded) {
              const mime = prediction.mimeType ?? "image/png";
              output.imageUrl = `data:${mime};base64,${prediction.bytesBase64Encoded}`;
              output.imageSource = "gemini";
              console.log(`✓ Imagen 4 image generated (${prediction.bytesBase64Encoded.length} chars base64)`);
            } else {
              console.warn("Imagen 4 responded OK but no predictions found:", JSON.stringify(imgData).slice(0, 200));
            }
          } else {
            const errText = await imgRes.text().catch(() => "");
            console.warn(`Imagen 4 HTTP ${imgRes.status}:`, errText.slice(0, 120));
          }
        } catch (e) {
          console.warn("Imagen 4 error:", (e as Error).message.slice(0, 120));
        }
      }

      // ── 2. Gemini generateContent image models (newer preview models) ─────────
      const GEMINI_IMG_MODELS = [
        "gemini-3.1-flash-image-preview",
        "gemini-3-pro-image-preview",
      ];

      for (const modelName of GEMINI_IMG_MODELS) {
        if (output.imageUrl) break;
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
          const imgRes = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: SYSTEM_PROMPT }] }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
            signal: AbortSignal.timeout(25_000),
          });

          if (!imgRes.ok) {
            console.warn(`Gemini image [${modelName}] HTTP ${imgRes.status}`);
            continue;
          }

          const imgData = await imgRes.json();
          const rawParts = imgData.candidates?.[0]?.content?.parts ?? [];
          const typedParts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = rawParts;
          const inlinePart = typedParts.find((p) => p.inlineData?.data);

          if (inlinePart?.inlineData) {
            output.imageUrl = `data:${inlinePart.inlineData.mimeType};base64,${inlinePart.inlineData.data}`;
            output.imageSource = "gemini";
            console.log(`✓ Gemini image generated via ${modelName} (${inlinePart.inlineData.data.length} chars base64)`);
          } else {
            console.warn(`Gemini [${modelName}] responded OK but no inlineData found`);
          }
        } catch (e) {
          console.warn(`Gemini image [${modelName}] error:`, (e as Error).message.slice(0, 120));
        }
      }

      // ── 3. Pollinations fallback — fetch server-side → base64 data URL ────────
      // Fetching server-side avoids all browser cross-origin / content-type issues.
      if (!output.imageUrl) {
        try {
          const seed = Math.floor(Math.random() * 999_999);
          const promptText = `${topic} news editorial photorealistic ${
            content?.trim().slice(0, 200) ?? ""
          } Times of India style journalism`.slice(0, 450);
          const encoded = encodeURIComponent(promptText);
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&model=flux&seed=${seed}`;

          console.log("Fetching Pollinations image server-side:", pollinationsUrl.slice(0, 120));
          const polRes = await fetch(pollinationsUrl, {
            signal: AbortSignal.timeout(30_000),
            headers: { "User-Agent": "TOI-Editor-Copilot/1.0" },
          });

          if (polRes.ok) {
            const contentType = polRes.headers.get("content-type") ?? "image/jpeg";
            // Normalise to a browser-safe MIME type
            const mime = contentType.startsWith("image/") ? contentType.split(";")[0].trim() : "image/jpeg";
            const arrayBuf = await polRes.arrayBuffer();
            const base64 = Buffer.from(arrayBuf).toString("base64");
            output.imageUrl = `data:${mime};base64,${base64}`;
            output.imageSource = "pollinations";
            console.log(`✓ Pollinations image fetched server-side (${base64.length} chars base64, ${mime})`);
          } else {
            console.warn(`Pollinations HTTP ${polRes.status}`);
          }
        } catch (e) {
          console.warn("Pollinations fetch error:", (e as Error).message.slice(0, 120));
        }
      }
    }

    return NextResponse.json(output);
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
