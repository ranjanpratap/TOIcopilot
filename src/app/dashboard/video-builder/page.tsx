"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Video, Zap, X, Clapperboard } from "lucide-react";

import VideoInputPanel    from "@/components/video-builder/VideoInputPanel";
import AssetUploader      from "@/components/video-builder/AssetUploader";
import VideoConfigPanel   from "@/components/video-builder/VideoConfigPanel";
import ScriptPreview      from "@/components/video-builder/ScriptPreview";
import VideoPreviewPlayer from "@/components/video-builder/VideoPreviewPlayer";
import GenerationProgress from "@/components/video-builder/GenerationProgress";

import type {
  VideoFormat,
  VoiceStyle,
  CaptionStyle,
  VideoScript,
  GeneratedVideo,
  GenerationStage,
  UploadedAsset,
} from "@/types/video-builder";

// ─── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-[#EEF4FF] flex items-center justify-center mb-5">
        <Clapperboard className="w-8 h-8 text-[#0050B3]" />
      </div>
      <h3 className="text-[16px] font-bold text-[#333333] mb-2">No Video Yet</h3>
      <p className="text-[13px] text-[#9AA5B4] max-w-xs leading-relaxed">
        Paste a news article, analyse it, then generate a professional short news video.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 text-[11px] text-[#9AA5B4] w-full max-w-xs">
        {[
          "AI-generated video script",
          "Hook · Event · Facts · Conclusion",
          "Caption overlay styles",
          "Instagram Reel · YouTube Short",
          "Entity & keyword detection",
          "Full narration voiceover",
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

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function VideoBuilderPage() {
  // Article input
  const [content,         setContent]         = useState("");
  const [customHeadline,  setCustomHeadline]   = useState("");

  // Analysis
  const [analyzing,  setAnalyzing]  = useState(false);
  const [script,     setScript]     = useState<VideoScript | null>(null);
  const [analyzeErr, setAnalyzeErr] = useState("");

  // Assets
  const [assets, setAssets] = useState<UploadedAsset[]>([]);

  // Config
  const [format,       setFormat]       = useState<VideoFormat>("instagram-reel");
  const [voiceStyle,   setVoiceStyle]   = useState<VoiceStyle>("neutral");
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("breaking-news");

  // Generation
  const [stage,      setStage]      = useState<GenerationStage>("idle");
  const [video,      setVideo]      = useState<GeneratedVideo | null>(null);
  const [generateErr, setGenerateErr] = useState("");

  // ── Analyse article ──────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    setAnalyzeErr("");
    setScript(null);
    setVideo(null);
    setStage("idle");

    try {
      const res = await fetch("/api/video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, customHeadline: customHeadline || undefined }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: VideoScript = await res.json();
      setScript(data);
    } catch (e) {
      console.error(e);
      setAnalyzeErr("Analysis failed. Please check your article content and try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [content, customHeadline]);

  // ── Generate video ───────────────────────────────────────────────────────────
  // Pipeline stages reflect real server work:
  //   analyzing + scripting → quick (script already done)
  //   narrating             → while ElevenLabs TTS runs server-side (~5–15s)
  //   scenes                → while scene images are generated (~10–25s)
  //   rendering             → brief assembly stage
  const handleGenerate = useCallback(async () => {
    if (!script) return;
    setGenerateErr("");
    setVideo(null);

    // Quick stages — script analysis already completed
    setStage("analyzing");
    await sleep(600);
    setStage("scripting");
    await sleep(600);

    // "narrating" stage is shown for the full duration of the API call
    // (ElevenLabs TTS + scene image generation all happen server-side in parallel)
    setStage("narrating");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          format,
          voiceStyle,
          captionStyle,
          assets: assets.map((a) => ({ name: a.name, type: a.type, preview: a.preview ?? null })),
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: GeneratedVideo = await res.json();

      // Brief scenes + rendering stages after API resolves
      setStage("scenes");
      await sleep(500);
      setStage("rendering");
      await sleep(400);

      setVideo(data);
      setStage("done");
    } catch (e) {
      console.error(e);
      setGenerateErr("Video generation failed. Please try again.");
      setStage("error");
    }
  }, [script, format, voiceStyle, captionStyle, assets]);

  const handleRegenerate = useCallback(() => {
    setVideo(null);
    setStage("idle");
    handleGenerate();
  }, [handleGenerate]);

  const handleEditScript = useCallback(() => {
    setVideo(null);
    setStage("idle");
  }, []);

  const handleAddAssets = useCallback((newAssets: UploadedAsset[]) => {
    setAssets((prev) => [...prev, ...newAssets]);
  }, []);

  const handleRemoveAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const isGenerating = stage !== "idle" && stage !== "done" && stage !== "error";
  const hasVideo     = video !== null && stage === "done";

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E6ED] sticky top-0 z-20">
        <div className="px-6 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#9AA5B4] mb-1">
            <Link href="/dashboard" className="hover:text-[#0050B3] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#333333] font-medium">Short News Video Builder</span>
          </div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#0050B3]" />
                <h1 className="font-bold text-[#333333]" style={{ fontSize: "18px" }}>
                  Short News Video Builder
                </h1>
              </div>
              <p className="text-[11px] text-[#9AA5B4] mt-0.5 ml-6">
                Paste a news article, generate a structured video script, produce narration, and preview your short news video.
              </p>
            </div>

            {/* Header CTA */}
            {script && !hasVideo && !isGenerating && (
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E21B22] hover:bg-[#C41519] text-white text-[11px] font-semibold transition-colors flex-shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                Generate Video
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 max-w-[1600px] mx-auto items-start">

        {/* ── LEFT: Input + Config ──────────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-[92px] lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto lg:pr-1">

          {/* 1. Article input */}
          <VideoInputPanel
            content={content}
            customHeadline={customHeadline}
            onContentChange={setContent}
            onHeadlineChange={setCustomHeadline}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            analyzed={script !== null}
          />

          {/* Analysis error */}
          {analyzeErr && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-[12px] text-[#E21B22]">
              <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {analyzeErr}
            </div>
          )}

          {/* 2. Script preview (shown after analysis) */}
          {script && (
            <ScriptPreview script={script} />
          )}

          {/* 3. Asset uploader */}
          <AssetUploader
            assets={assets}
            onAdd={handleAddAssets}
            onRemove={handleRemoveAsset}
          />

          {/* 4. Video config */}
          <VideoConfigPanel
            format={format}
            voiceStyle={voiceStyle}
            captionStyle={captionStyle}
            onFormatChange={setFormat}
            onVoiceChange={setVoiceStyle}
            onCaptionChange={setCaptionStyle}
          />

          {/* Generate error */}
          {generateErr && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-[12px] text-[#E21B22]">
              <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {generateErr}
            </div>
          )}

          {/* Generate button */}
          <div className="bg-white border border-[#E2E6ED] p-4">
            <button
              onClick={handleGenerate}
              disabled={!script || isGenerating}
              className="
                w-full h-10 flex items-center justify-center gap-2
                bg-[#E21B22] hover:bg-[#C41519] text-white text-[13px] font-bold
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Video...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {hasVideo ? "Regenerate Video" : "Generate Video"}
                </>
              )}
            </button>
            {!script && (
              <p className="mt-2 text-center text-[10px] text-[#9AA5B4]">
                Analyse an article first to enable video generation.
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Output ─────────────────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">
          {/* Empty state */}
          {!isGenerating && !hasVideo && <EmptyState />}

          {/* Generation progress */}
          {isGenerating && <GenerationProgress stage={stage} />}

          {/* Video preview player */}
          {hasVideo && video && (
            <VideoPreviewPlayer
              video={video}
              onRegenerate={handleRegenerate}
              onEditScript={handleEditScript}
            />
          )}
        </div>
      </div>
    </div>
  );
}
