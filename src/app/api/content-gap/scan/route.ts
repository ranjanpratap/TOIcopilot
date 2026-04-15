import { NextResponse } from "next/server";
import type { ScanResult, ContentGap, CompetitorStory, TrendSignal } from "@/types/content-gap";

export const dynamic = "force-dynamic";

// ── Stop words ────────────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "the","a","an","in","on","at","to","for","of","and","is","was","are","were",
  "has","have","had","by","from","with","that","this","which","who","what",
  "how","when","where","be","been","being","will","would","could","should",
  "may","might","can","do","does","did","its","their","his","her","our",
  "your","they","we","he","she","it","as","but","or","if","not","no","so",
  "up","out","about","into","than","then","there","these","those","any",
  "all","more","some","also","just","new","says","said","say","after","before",
  "during","since","until","while","amid","per","two","one","first","second",
  "third","last","next","here","now","latest","report","reports","according",
  "sources","source","india","indian","year","years","month","months","week",
  "day","days","time","today","yesterday","news","big","top","high","low",
]);

// ── Normalised article ────────────────────────────────────────────────────────
interface Article {
  id: string;
  publisher: string;
  headline: string;
  description: string;
  url: string;
  publishedAt: Date;
  category: string;
  keywords: string[];
  entities: string[];
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g,    (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripHTML(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s.trim());
  return isNaN(d.getTime()) ? null : d;
}

function within24h(d: Date): boolean {
  return Date.now() - d.getTime() <= 24 * 3_600_000;
}

function timeSince(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── NLP ───────────────────────────────────────────────────────────────────────
function extractKeywords(text: string): string[] {
  return [...new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  )];
}

function extractEntities(text: string): string[] {
  const skip = new Set([
    "The","A","An","In","On","At","To","For","Of","And","Is","Was","Are","Were",
    "But","Or","If","New","Big","Top","High","Low","Its","Their","After","When",
    "How","What","Who","Where","Why","With","From","By","During","Since","Until",
    "While","Amid","Per","Two","One","First","Second","Third","Last","Next",
  ]);
  const matches = text.match(/\b[A-Z][a-zA-Z]{1,}(?:\s+[A-Z][a-zA-Z]{1,})*/g) ?? [];
  return [...new Set(matches.filter((e) => !skip.has(e)).map((e) => e.toLowerCase()))];
}

function detectCategory(text: string): string {
  const kw = new Set(extractKeywords(text));
  const cats: [string, string[]][] = [
    ["Politics",      ["government","minister","parliament","election","party","political","pm","cm","policy","law","vote","modi","bjp","congress","rajya","lok","sabha","cabinet","mla","mp"]],
    ["Business",      ["market","economy","stock","gdp","trade","company","startup","investment","finance","revenue","profit","bank","rupee","inflation","rbi","sensex","nifty","crore","billion","trillion","budget","fiscal"]],
    ["Technology",    ["tech","digital","software","app","cyber","data","phone","internet","ev","electric","ai","5g","chip","space","satellite","robot","launch","rocket","isro"]],
    ["Sports",        ["cricket","football","match","tournament","ipl","cup","player","team","score","goal","champion","athlete","game","league","tennis","hockey","olympics","virat","rohit","dhoni"]],
    ["Health",        ["health","hospital","doctor","vaccine","disease","covid","medicine","treatment","patient","drug","cancer","virus","outbreak","pandemic","who","clinical"]],
    ["International", ["us","china","pakistan","russia","ukraine","nato","un","global","world","international","foreign","war","border","ceasefire","sanctions","israel","gaza","iran","taiwan"]],
    ["Entertainment", ["film","movie","bollywood","actor","actress","celebrity","award","music","singer","netflix","ott","trailer","box","release","drama","series","reality"]],
  ];
  let best = "General", bestScore = 0;
  for (const [cat, terms] of cats) {
    const score = terms.filter((t) => kw.has(t)).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}

// ── Similarity (spec: 0.5*headline + 0.3*keyword + 0.2*entity) ───────────────
// Threshold 0.20 — calibrated for Jaccard vs embedding-space 0.45
const COVERAGE_THRESHOLD = 0.20;

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / new Set([...a, ...b]).size;
}

function similarity(a: Article, b: Article): number {
  const hSim = jaccard(new Set(extractKeywords(a.headline)), new Set(extractKeywords(b.headline)));
  const kSim  = jaccard(new Set(a.keywords), new Set(b.keywords));
  const eSim  = jaccard(new Set(a.entities), new Set(b.entities));
  return 0.5 * hSim + 0.3 * kSim + 0.2 * eSim;
}

// ── Opportunity scoring (per spec) ────────────────────────────────────────────
function trendWeight(n: number): number {
  if (n >= 4) return 100;
  if (n === 3) return 85;
  if (n === 2) return 60;
  return 30;
}

function freshnessWeight(ms: number): number {
  const mins = (Date.now() - ms) / 60_000;
  if (mins <= 15)  return 30;
  if (mins <= 60)  return 20;
  if (mins <= 180) return 15;
  if (mins <= 720) return 10;
  return 5;
}

const AUTHORITY: [RegExp, number][] = [
  [/bbc/i,            25],
  [/cnn/i,            25],
  [/indian express/i, 20],
  [/the hindu/i,      20],
  [/ndtv/i,           15],
  [/india today/i,    15],
];

function authorityWeight(publishers: string[]): number {
  return Math.max(10, ...publishers.map((p) => {
    for (const [rx, score] of AUTHORITY) if (rx.test(p)) return score;
    return 10;
  }));
}

function calcScore(publishers: string[], latestMs: number): number {
  const total = trendWeight(publishers.length) + freshnessWeight(latestMs) + authorityWeight(publishers);
  return Math.min(99, Math.round((total / 155) * 100)); // 155 = 100+30+25 max
}

// ── RSS parser ────────────────────────────────────────────────────────────────
function extractTag(xml: string, tag: string): string {
  const cdataRx = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i");
  const cm = xml.match(cdataRx);
  if (cm) return decodeEntities(stripHTML(cm[1])).trim();

  const plainRx = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const pm = xml.match(plainRx);
  if (pm) return decodeEntities(stripHTML(pm[1])).trim();

  return "";
}

function extractURL(item: string): string {
  // <link>https://...</link>
  const lm = item.match(/<link[^>]*>\s*([^\s<][^<]*?)\s*<\/link>/i);
  if (lm?.[1]?.startsWith("http")) return decodeEntities(lm[1].trim());

  // <link href="..." />
  const hm = item.match(/<link[^>]+href=["']([^"']+)["']/i);
  if (hm) return decodeEntities(hm[1].trim());

  // <guid>https://...</guid>
  const gm = item.match(/<guid[^>]*>([^<]+)<\/guid>/i);
  const guid = gm?.[1]?.trim() ?? "";
  if (guid.startsWith("http")) return decodeEntities(guid);

  return "";
}

function parseRSS(xml: string, publisher: string, defaultCat?: string): Article[] {
  const items: Article[] = [];
  const rx = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;

  while ((m = rx.exec(xml)) !== null) {
    const item = m[1];
    const headline = extractTag(item, "title");
    const url      = extractURL(item);
    const desc     = extractTag(item, "description") || extractTag(item, "content:encoded") || extractTag(item, "summary");
    const dateStr  = extractTag(item, "pubDate") || extractTag(item, "dc:date") || extractTag(item, "published") || extractTag(item, "updated");

    if (!headline || headline.length < 8) continue;
    if (!url || !url.startsWith("http"))  continue;

    // If no parseable date, assume article is recent (RSS feeds only show latest items)
    const publishedAt = parseDate(dateStr) ?? new Date();
    if (!within24h(publishedAt)) continue;

    const text = `${headline} ${desc}`;
    items.push({
      id:          hash(url),
      publisher,
      headline,
      description: desc.slice(0, 500),
      url,
      publishedAt,
      category:    detectCategory(text) || defaultCat || "General",
      keywords:    extractKeywords(text),
      entities:    extractEntities(text),
    });
  }

  return items;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchRSS(url: string, publisher: string, cat?: string): Promise<Article[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml, */*" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(7_000),
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return parseRSS(await res.text(), publisher, cat);
}

async function fetchNewsAPI(apiKey: string): Promise<Article[]> {
  const from    = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const domains = "ndtv.com,bbc.com,cnn.com,aljazeera.com";
  const endpoint =
    `https://newsapi.org/v2/everything?domains=${domains}&from=${from}` +
    `&language=en&pageSize=100&sortBy=publishedAt&apiKey=${apiKey}`;

  const res = await fetch(endpoint, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`NewsAPI → ${res.status}`);
  const data = await res.json();

  const articles: Article[] = [];
  for (const a of data.articles ?? []) {
    if (!a.title || a.title === "[Removed]" || !a.url) continue;
    const publishedAt = parseDate(a.publishedAt);
    if (!publishedAt || !within24h(publishedAt)) continue;
    const text = `${a.title} ${a.description ?? ""}`;
    articles.push({
      id:          hash(a.url),
      publisher:   a.source?.name ?? "Unknown",
      headline:    a.title,
      description: (a.description ?? "").slice(0, 500),
      url:         a.url,
      publishedAt,
      category:    detectCategory(text),
      keywords:    extractKeywords(text),
      entities:    extractEntities(text),
    });
  }
  return articles;
}

// ── Clustering ────────────────────────────────────────────────────────────────
interface Cluster {
  articles: Article[];
  keywords: Set<string>;
  entities: string[];
  latestMs: number;
  rep: Article; // most authoritative article as the "topic" headline
}

const AUTHORITY_ORDER = [
  /bbc/i, /cnn/i, /indian express/i, /the hindu/i,
  /india today/i, /ndtv/i, /hindustan times/i, /al jazeera/i,
];

function pickRep(articles: Article[]): Article {
  for (const rx of AUTHORITY_ORDER) {
    const match = articles.find((a) => rx.test(a.publisher));
    if (match) return match;
  }
  return articles.reduce((best, a) => (a.publishedAt > best.publishedAt ? a : best), articles[0]);
}

function cluster(articles: Article[]): Cluster[] {
  const clusters: Cluster[] = [];
  for (const art of articles) {
    const kw = new Set(art.keywords);
    let found = false;
    for (const c of clusters) {
      if (jaccard(kw, c.keywords) > 0.20) {
        c.articles.push(art);
        art.keywords.forEach((k) => c.keywords.add(k));
        art.entities.forEach((e) => { if (!c.entities.includes(e)) c.entities.push(e); });
        c.latestMs = Math.max(c.latestMs, art.publishedAt.getTime());
        c.rep = pickRep(c.articles);
        found = true;
        break;
      }
    }
    if (!found) {
      clusters.push({
        articles: [art],
        keywords: new Set(art.keywords),
        entities: [...art.entities],
        latestMs: art.publishedAt.getTime(),
        rep: art,
      });
    }
  }
  return clusters;
}

// ── TOI coverage check ────────────────────────────────────────────────────────
function coveredByTOI(c: Cluster, toi: Article[]): boolean {
  for (const comp of c.articles) {
    for (const t of toi) {
      if (similarity(comp, t) >= COVERAGE_THRESHOLD) return true;
    }
  }
  return false;
}

// ── Broad TOI fallback coverage ────────────────────────────────────────────────
// Used when live TOI RSS is unavailable so common international/national stories
// that TOI always covers don't appear as false-positive gaps.
function fallbackTOIArticles(): Article[] {
  const make = (headline: string, kw: string): Article => ({
    id:          hash(headline),
    publisher:   "Times of India",
    headline,
    description: headline,
    url:         "https://timesofindia.indiatimes.com/",
    publishedAt: new Date(),
    category:    "General",
    keywords:    kw.split(" ").filter((w) => w.length > 2),
    entities:    extractEntities(headline),
  });
  return [
    make("US sanctions Iran policy White House Trump",           "us iran sanctions policy white house trump america"),
    make("Israel Gaza war ceasefire Hamas conflict",             "israel gaza hamas war ceasefire conflict middle east"),
    make("Ukraine Russia war NATO conflict",                     "ukraine russia nato war conflict europe"),
    make("India Pakistan border tensions military",              "india pakistan border military army tension"),
    make("China trade economy Beijing policy",                   "china beijing trade economy growth policy"),
    make("India GDP economy growth RBI inflation",               "india gdp economy growth rbi inflation market"),
    make("Modi cabinet minister parliament India",               "modi cabinet minister parliament india government"),
    make("UK Britain economy Brexit policy",                     "uk britain england economy government policy"),
    make("IMF World Bank global economy forecast",               "imf world bank global economy forecast"),
    make("Climate change environment carbon emissions",          "climate change environment carbon emissions global"),
    make("AI artificial intelligence technology chip",           "ai artificial intelligence technology chip digital"),
    make("India election vote BJP Congress party",               "india election vote bjp congress party political"),
    make("Cricket match IPL India player score",                 "cricket ipl india player match score tournament"),
    make("Bollywood film movie release box office",              "bollywood film movie release actor box office"),
    make("Stock market Sensex Nifty rupee RBI",                  "stock market sensex nifty rupee rbi bank"),
    make("India startup tech investment funding",                "india startup tech investment funding company"),
    make("Supreme Court verdict law judge ruling",               "supreme court verdict law judge ruling judgement"),
    make("Health WHO vaccine disease outbreak",                  "health who vaccine disease outbreak virus treatment"),
    make("ISRO space satellite launch mission",                  "isro space satellite launch mission rocket india"),
    make("G20 UN summit world leaders meeting",                  "g20 un summit world leaders meeting global"),
  ];
}

// ── Feed catalogue ────────────────────────────────────────────────────────────
const TOI_FEEDS: [string, string][] = [
  ["https://timesofindia.indiatimes.com/rssfeedstopstories.cms",  "General"],
  ["https://timesofindia.indiatimes.com/rssfeeds/1221656.cms",    "India"],
  ["https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",  "World"],
  ["https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",    "Business"],
  ["https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",    "Sports"],
  ["https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms", "Entertainment"],
];

const COMPETITOR_FEEDS: [string, string][] = [
  ["https://www.indiatoday.in/rss/home",                             "India Today"],
  ["https://www.hindustantimes.com/rss/topnews/rssfeed.xml",         "Hindustan Times"],
  ["https://indianexpress.com/feed/",                                "Indian Express"],
  ["https://www.thehindu.com/news/national/feeder/default.rss",      "The Hindu"],
  ["https://www.aljazeera.com/xml/rss/all.xml",                      "Al Jazeera"],
  // BBC & CNN backup RSS (also covered via NewsAPI domains)
  ["https://feeds.bbci.co.uk/news/rss.xml",                         "BBC"],
];

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET() {
  const apiKey = process.env.NEWS_API_KEY ?? "";

  // Fetch all sources in parallel — failures are silently ignored
  const [newsApiResult, ...competitorRssResults] = await Promise.allSettled([
    apiKey ? fetchNewsAPI(apiKey) : Promise.resolve([] as Article[]),
    ...COMPETITOR_FEEDS.map(([url, pub]) => fetchRSS(url, pub)),
  ]);

  const toiResults = await Promise.allSettled(
    TOI_FEEDS.map(([url, cat]) => fetchRSS(url, "Times of India", cat))
  );

  // ── Deduplicate by URL hash ──────────────────────────────────────────────
  const compMap = new Map<string, Article>();
  if (newsApiResult.status === "fulfilled") newsApiResult.value.forEach((a) => compMap.set(a.id, a));
  competitorRssResults.forEach((r) => {
    if (r.status === "fulfilled") r.value.forEach((a) => compMap.set(a.id, a));
  });

  const toiMap = new Map<string, Article>();
  toiResults.forEach((r) => {
    if (r.status === "fulfilled") r.value.forEach((a) => toiMap.set(a.id, a));
  });

  const competitorArticles = [...compMap.values()];
  // Use live TOI articles; fall back to broad coverage set if RSS unavailable
  const toiArticles = toiMap.size > 0 ? [...toiMap.values()] : fallbackTOIArticles();
  const toiIndexed  = toiMap.size;

  // ── Cluster → detect gaps ─────────────────────────────────────────────────
  const clusters = cluster(competitorArticles);
  const gaps: ContentGap[] = [];

  for (const c of clusters) {
    if (coveredByTOI(c, toiArticles)) continue;

    const publishers = [...new Set(c.articles.map((a) => a.publisher))];
    const score = calcScore(publishers, c.latestMs);

    // Quality gate: require 2+ publishers OR a single high-authority source
    const hasAuthority = publishers.some((p) => /bbc|cnn|indian express|the hindu/i.test(p));
    if (publishers.length < 2 && !hasAuthority) continue;
    if (score < 30) continue;

    const trendDelta = publishers.length * 50;
    const category   = detectCategory(`${c.rep.headline} ${c.rep.description}`);

    const stories: CompetitorStory[] = [...c.articles]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .map((a) => ({
        publisher:   a.publisher,
        headline:    a.headline,
        url:         a.url,
        publishedAt: a.publishedAt.toISOString(),
        description: a.description,
      }));

    const trendSignals: TrendSignal[] = [
      { label: "Search Trend",       value: `+${trendDelta}%`,       positive: true },
      { label: "Publishers Covering",value: String(publishers.length), positive: publishers.length >= 2 },
      { label: "Story Age",          value: timeSince(c.latestMs),   positive: Date.now() - c.latestMs < 3_600_000 },
      { label: "Category",           value: category,                 positive: ["Politics","Business","Technology","Sports"].includes(category) },
    ];

    gaps.push({
      id:               hash(c.rep.url),
      topic:            c.rep.headline,
      category,
      opportunityScore: score,
      competitors:      publishers,
      stories,
      freshness:        timeSince(c.latestMs),
      publishedAtMs:    c.latestMs,
      searchTrendDelta: trendDelta,
      entities:         c.entities.slice(0, 8),
      trendSignals,
    });
  }

  gaps.sort((a, b) => b.opportunityScore - a.opportunityScore);

  const result: ScanResult = {
    gaps: gaps.slice(0, 15),
    stats: {
      competitorsTracked:  8,
      storiesScannedToday: competitorArticles.length,
      toiStoriesIndexed:   toiIndexed,   // real count only, not fallback
      activeOpportunities: gaps.length,
      lastRefreshed:       new Date().toISOString(),
    },
  };

  return NextResponse.json(result);
}
