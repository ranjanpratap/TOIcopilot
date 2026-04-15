"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Newspaper,
  Zap,
  X,
  Image as ImageIcon,
  BarChart2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import NewsInputPanel from "@/components/news-brief/NewsInputPanel";
import GenerationOptions from "@/components/news-brief/GenerationOptions";
import HeadlineCards from "@/components/news-brief/HeadlineCards";
import ArticleOutput from "@/components/news-brief/ArticleOutput";
import SEOKeywords from "@/components/news-brief/SEOKeywords";
import NewsAngles from "@/components/news-brief/NewsAngles";
import HeatScore from "@/components/news-brief/HeatScore";
import CompetitorTable from "@/components/news-brief/CompetitorTable";

import type {
  GenerationOptionsState,
  GeneratedOutput,
  AngleItem,
} from "@/types/news-brief";

// ─── Loading step messages ─────────────────────────────────────────────────────
const LOADING_STEPS = [
  "Analyzing editorial context...",
  "Generating headline options...",
  "Rewriting news body...",
  "Scanning competitor coverage...",
  "Calculating news heat score...",
  "Identifying story angles...",
  "Finalising analysis...",
];

// ─── News Image Block ──────────────────────────────────────────────────────────
function NewsImageBlock({
  imageUrl,
  imagePrompt,
  imageSource,
  topic,
}: {
  imageUrl?: string;
  imagePrompt: string;
  imageSource?: "gemini" | "pollinations";
  topic: string;
}) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">(
    imageUrl ? "loading" : "error",
  );

  // Reset when a new image URL arrives
  useEffect(() => {
    setImgState(imageUrl ? "loading" : "error");
  }, [imageUrl]);

  return (
    <div className="bg-white border border-[#E2E6ED]">
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-[#7C3AED]" />
        <h3 className="font-bold text-[#333333] text-[14px]">News Image Concept</h3>
        {imageSource && imgState === "loaded" && (
          <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold ${
            imageSource === "gemini"
              ? "bg-[#EDE9FE] text-[#7C3AED]"
              : "bg-[#F5F6F8] text-[#6B7280]"
          }`}>
            {imageSource === "gemini" ? "AI GENERATED" : "AI GENERATED"}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Image container */}
        {imageUrl ? (
          <div className="relative border border-[#E2E6ED] overflow-hidden bg-[#F5F6F8]" style={{ minHeight: "200px" }}>
            {/* Loading shimmer */}
            {imgState === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#F5F6F8] z-10">
                <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                <p className="text-[12px] text-[#9AA5B4]">Generating editorial image...</p>
              </div>
            )}

            {/* Error state */}
            {imgState === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F5F6F8] z-10 px-6">
                <AlertCircle className="w-6 h-6 text-[#9AA5B4]" />
                <p className="text-[12px] text-[#6B7280] text-center">
                  Image could not be loaded. The editorial photo brief is shown below.
                </p>
              </div>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Editorial image: ${topic}`}
              className="w-full object-cover"
              style={{
                maxHeight: "480px",
                display: imgState === "error" ? "none" : "block",
                opacity: imgState === "loading" ? 0 : 1,
              }}
              onLoad={() => setImgState("loaded")}
              onError={() => {
                console.error("News image failed to load:", imageUrl?.slice(0, 80));
                setImgState("error");
              }}
            />
          </div>
        ) : (
          <div className="border border-[#E2E6ED] bg-[#F5F6F8] flex flex-col items-center justify-center gap-2 py-10">
            <AlertCircle className="w-5 h-5 text-[#9AA5B4]" />
            <p className="text-[12px] text-[#6B7280]">Image generation did not return a result.</p>
          </div>
        )}

        {/* Editorial photo brief */}
        <div className="border-l-4 border-[#7C3AED] pl-3 bg-purple-50/50 py-3 pr-3">
          <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wide mb-1">Editorial Photo Brief</p>
          <p className="text-[13px] text-[#333333] leading-relaxed">{imagePrompt}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-[#EEF4FF] flex items-center justify-center mb-5">
        <Newspaper className="w-8 h-8 text-[#0050B3]" />
      </div>
      <h3 className="text-[16px] font-bold text-[#333333] mb-2">No Analysis Yet</h3>
      <p className="text-[13px] text-[#9AA5B4] max-w-xs leading-relaxed">
        Paste a news input and select generation options. AI analysis will appear here.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 text-[11px] text-[#9AA5B4]">
        {[
          "Headline variants with SEO scores",
          "Full structured article body",
          "Competitor coverage table",
          "News heat score meter",
          "Editorial angle intelligence",
          "SEO keyword pack",
        ].map((hint) => (
          <div key={hint} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E2E6ED]">
            <span className="w-1.5 h-1.5 bg-[#0050B3] flex-shrink-0" />
            {hint}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Loading skeleton section ──────────────────────────────────────────────────
function LoadingSection({ step }: { step: string }) {
  return (
    <div className="bg-white border border-[#E2E6ED] p-6">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#0050B3] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-[13px] text-[#6B7280]">{step}</p>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`skeleton h-3 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function NewsBriefPage() {
  // Input state
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("Standard News Report");

  // Options state
  const [options, setOptions] = useState<GenerationOptionsState>({
    headlines: true,
    newsBody: true,
    newsImage: false,
    competitorCoverage: true,
    seoKeywords: false,
    newsAngles: true,
    heatScore: true,
  });

  // Generation state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [error, setError] = useState("");

  const outputRef = useRef<HTMLDivElement>(null);
  const stepIntervalRef = useRef<number | null>(null);

  // Pre-fill topic from ?topic= query param (used when navigating from Content Gap Detector)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefill = params.get("topic");
      if (prefill) setTopic(decodeURIComponent(prefill));
    }
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  const handleOptionChange = (key: keyof GenerationOptionsState, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter an event or topic before generating.");
      return;
    }
    const anySelected = Object.values(options).some(Boolean);
    if (!anySelected) {
      setError("Please select at least one generation option.");
      return;
    }

    setError("");
    setLoading(true);
    setOutput(null);

    // Cycle loading step messages
    let stepIdx = 0;
    setLoadingStep(LOADING_STEPS[0]);
    stepIntervalRef.current = window.setInterval(() => {
      stepIdx = (stepIdx + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[stepIdx]);
    }, 900);

    try {
      const res = await fetch("/api/news-brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, content, style, options }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: GeneratedOutput = await res.json();
      setOutput(data);

      // Smooth scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e) {
      setError("Generation failed. Please try again.");
      console.error(e);
    } finally {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTopic("");
    setContent("");
    setOutput(null);
    setError("");
  };

  const handleAngleSelect = (angle: AngleItem) => {
    // Could pre-fill regeneration with this angle
    console.log("Angle selected:", angle.name);
  };

  const enabledCount = Object.values(options).filter(Boolean).length;
  const hasOutput = output !== null;

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E6ED] sticky top-0 z-20">
        <div className="px-6 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#9AA5B4] mb-1">
            <Link href="/dashboard" className="hover:text-[#0050B3] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#333333] font-medium">AI News Brief + Headline Optimizer</span>
          </div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#0050B3]" />
                <h1 className="font-bold text-[#333333]" style={{ fontSize: "18px" }}>
                  AI News Brief + Headline Optimizer
                </h1>
              </div>
              <p className="text-[11px] text-[#9AA5B4] mt-0.5 ml-6">
                Paste raw news content, generate optimised headlines, analyse competitor coverage, and discover the strongest editorial angles.
              </p>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E21B22] hover:bg-[#C41519] text-white text-[11px] font-semibold transition-colors disabled:opacity-60"
              >
                <Zap className="w-3.5 h-3.5" />
                Generate Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 max-w-[1600px] mx-auto items-start">

        {/* ── Left column: Input + Options ──────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-[92px] lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto lg:pr-1">

          {/* Input Panel */}
          <NewsInputPanel
            topic={topic}
            content={content}
            style={style}
            onTopicChange={setTopic}
            onContentChange={setContent}
            onStyleChange={setStyle}
          />

          {/* Generation Options */}
          <GenerationOptions options={options} onChange={handleOptionChange} />

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-[12px] text-[#E21B22]">
              <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Generate action bar (sticky bottom in left panel on mobile) */}
          <div className="bg-white border border-[#E2E6ED] p-4 space-y-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="
                w-full h-10 flex items-center justify-center gap-2
                bg-[#0050B3] hover:bg-[#003D8C] text-white text-[13px] font-bold
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {loadingStep}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Analysis
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="w-full h-8 flex items-center justify-center gap-1.5 border border-[#E2E6ED] text-[12px] text-[#9AA5B4] hover:text-[#333333] hover:bg-[#F5F6F8] transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
            {enabledCount > 0 && !loading && (
              <p className="text-center text-[10px] text-[#9AA5B4]">
                Will generate {enabledCount} module{enabledCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* ── Right column: Output ──────────────────────────────────────── */}
        <div className="space-y-4 min-w-0" ref={outputRef}>
          {!loading && !hasOutput && <EmptyState />}

          {loading && (
            <>
              <LoadingSection step={loadingStep} />
              <LoadingSection step="Preparing additional modules..." />
            </>
          )}

          {hasOutput && !loading && (
            <>
              {/* Output meta ribbon */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-[#E2E6ED]">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-[#0050B3]" />
                  <span className="text-[12px] font-semibold text-[#333333]">Analysis Complete</span>
                  <span className="text-[11px] text-[#9AA5B4]">— {enabledCount} module{enabledCount !== 1 ? "s" : ""} generated</span>
                </div>
                <button
                  onClick={handleGenerate}
                  className="text-[11px] font-semibold text-[#0050B3] hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Re-generate
                </button>
              </div>

              {/* Heat Score — first so editor immediately sees story priority */}
              {output?.heatScore && (
                <HeatScore data={output.heatScore} />
              )}

              {/* Headlines */}
              {output?.headlines && (
                <HeadlineCards headlines={output.headlines} />
              )}

              {/* News Angles */}
              {output?.newsAngles && (
                <NewsAngles angles={output.newsAngles} onUseAngle={handleAngleSelect} />
              )}

              {/* Article body */}
              {output?.newsBody && (
                <ArticleOutput body={output.newsBody} onRegenerate={handleGenerate} />
              )}

              {/* SEO */}
              {output?.seoKeywords && (
                <SEOKeywords seo={output.seoKeywords} />
              )}

              {/* News Image Concept */}
              {output?.imagePrompt && (
                <NewsImageBlock
                  imageUrl={output.imageUrl}
                  imagePrompt={output.imagePrompt}
                  imageSource={output.imageSource}
                  topic={topic}
                />
              )}

              {/* Competitor Coverage */}
              {output?.competitors && output.competitorMetrics && (
                <CompetitorTable
                  competitors={output.competitors}
                  metrics={output.competitorMetrics}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
