"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Download, RefreshCw, Edit3,
  Volume2, VolumeX, Mic, FileText, CheckCircle2,
} from "lucide-react";
import type { GeneratedVideo, VideoScene, CaptionStyle } from "@/types/video-builder";

interface Props {
  video: GeneratedVideo;
  onRegenerate: () => void;
  onEditScript: () => void;
}

// ── Scene gradient themes ─────────────────────────────────────────────────────
const SCENE_THEMES: Record<string, { from: string; via: string; to: string; accent: string }> = {
  hook:       { from: "#0d0002", via: "#8b0000",  to: "#E21B22", accent: "#ff6b6b" },
  event:      { from: "#00112b", via: "#002d7a",  to: "#0050B3", accent: "#4d9fff" },
  facts:      { from: "#001a10", via: "#004d2b",  to: "#059669", accent: "#34d399" },
  context:    { from: "#0d0926", via: "#2d1b69",  to: "#7C3AED", accent: "#a78bfa" },
  conclusion: { from: "#1a0e00", via: "#7a3800",  to: "#D97706", accent: "#fbbf24" },
};

const SCENE_LABEL: Record<string, string> = {
  hook: "Hook", event: "Event", facts: "Key Facts", context: "Context", conclusion: "Conclusion",
};

const FORMAT_LABEL: Record<string, string> = {
  "instagram-reel": "Instagram Reel",
  "youtube-short":  "YouTube Short",
  "website-video":  "Website Video",
};

// ── Caption styles ─────────────────────────────────────────────────────────────
function Caption({ scene, style }: { scene: VideoScene; style: CaptionStyle }) {
  if (style === "breaking-news") {
    return (
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-[#E21B22] px-3 py-1">
          <p className="text-white text-[9px] font-black uppercase tracking-widest">Breaking News</p>
        </div>
        <div className="bg-black/85 px-3 py-2.5">
          <p className="text-white text-[11px] font-bold leading-snug">{scene.captionText}</p>
        </div>
      </div>
    );
  }
  if (style === "bold-headline") {
    return (
      <div className="absolute inset-0 flex items-end justify-center pb-5 px-3">
        <div className="bg-black/75 px-4 py-3 text-center max-w-full">
          <p className="text-white text-[12px] font-black leading-tight">{scene.captionText}</p>
        </div>
      </div>
    );
  }
  if (style === "explainer") {
    return (
      <div className="absolute bottom-4 left-3 right-3">
        <div className="border-l-[3px] border-[#fbbf24] bg-black/80 pl-3 pr-3 py-2">
          <p className="text-[#fbbf24] text-[8px] font-black uppercase tracking-wider mb-0.5">
            {SCENE_LABEL[scene.type] ?? scene.type}
          </p>
          <p className="text-white text-[10px] font-semibold leading-snug">{scene.captionText}</p>
        </div>
      </div>
    );
  }
  // minimal-subtitle
  return (
    <div className="absolute bottom-4 left-3 right-3 flex justify-center">
      <p
        className="text-white text-[11px] font-semibold text-center leading-snug max-w-full px-2"
        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,1)" }}
      >
        {scene.captionText}
      </p>
    </div>
  );
}

// ── Scene frame ────────────────────────────────────────────────────────────────
function SceneFrame({
  scene, captionStyle, isPortrait, imageUrl, isAudioPlaying,
}: {
  scene: VideoScene;
  captionStyle: CaptionStyle;
  isPortrait: boolean;
  imageUrl?: string | null;
  isAudioPlaying: boolean;
}) {
  const theme = SCENE_THEMES[scene.type] ?? SCENE_THEMES.event;
  const grad  = `linear-gradient(160deg, ${theme.from}, ${theme.via}, ${theme.to})`;

  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{ background: grad }}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={scene.description}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.72 }}
        />
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: imageUrl
            ? "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 100%)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* TOI header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-black/55">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[#E21B22] animate-pulse" />
          <span className="text-white text-[9px] font-black uppercase tracking-widest">LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          {isAudioPlaying && (
            <div className="flex items-end gap-0.5 mr-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-0.5 bg-[#34d399] rounded-full"
                  style={{ height: `${6 + i * 2}px`, animation: `audioBar 0.6s ease-in-out ${i * 0.1}s infinite alternate` }}
                />
              ))}
            </div>
          )}
          <span className="text-white/75 text-[8px] font-bold uppercase tracking-widest">Times of India</span>
        </div>
      </div>

      {/* Scene type badge */}
      <div className="absolute top-9 left-3">
        {scene.type === "hook" ? (
          <div className="px-2 py-0.5 bg-[#E21B22]">
            <span className="text-white text-[8px] font-black uppercase tracking-widest">Breaking</span>
          </div>
        ) : (
          <div className="px-2 py-0.5 bg-black/60 border" style={{ borderColor: `${theme.accent}55` }}>
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
              {SCENE_LABEL[scene.type] ?? scene.type}
            </span>
          </div>
        )}
      </div>

      {/* Facts scene bullets */}
      {scene.type === "facts" && (
        <div className="absolute inset-0 flex flex-col justify-center px-4 pt-14 pb-20">
          <div className="space-y-1.5">
            {scene.narration.split(/[.!?]/).filter((s) => s.trim()).slice(0, 3).map((fact, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-white text-[8px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: theme.accent }}>
                  {i + 1}
                </span>
                <span className="text-white text-[10px] font-semibold leading-snug drop-shadow">
                  {fact.trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Caption scene={scene} style={captionStyle} />
    </div>
  );
}

const AUDIO_BAR_STYLE = `
@keyframes audioBar {
  from { transform: scaleY(0.35); }
  to   { transform: scaleY(1); }
}`;

// ── Main player ────────────────────────────────────────────────────────────────
export default function VideoPreviewPlayer({ video, onRegenerate, onEditScript }: Props) {
  const { script, format, captionStyle, narrationAudio, narrationScript, sceneImages } = video;
  const isPortrait = format !== "website-video";
  const scenes     = script.scenes;

  // ── Playback state ───────────────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [overallPct, setOverallPct] = useState(0);
  const [muted,      setMuted]      = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const synthRef    = useRef<SpeechSynthesis | null>(null);
  const utterRef    = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef    = useRef<number | null>(null);
  const progressRef = useRef(0);

  const hasElevenLabsAudio = !!narrationAudio;
  const hasBrowserSpeech   = typeof window !== "undefined" && "speechSynthesis" in window;
  const hasAudio           = hasElevenLabsAudio || hasBrowserSpeech;

  // Cumulative scene end-times
  const sceneBoundaries = scenes.reduce<number[]>((acc, sc) => {
    acc.push((acc[acc.length - 1] ?? 0) + sc.duration);
    return acc;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const sceneForTime = useCallback((t: number) => {
    let cum = 0;
    for (let i = 0; i < scenes.length; i++) {
      cum += scenes[i].duration;
      if (t < cum || i === scenes.length - 1) return i;
    }
    return scenes.length - 1;
  }, [scenes]);

  // ── ElevenLabs audio lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (!narrationAudio) return;

    const audio      = new Audio(narrationAudio);
    audio.preload    = "auto";
    audio.muted      = muted;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const t = audio.currentTime;
      setCurrentIdx(sceneForTime(t));
      setOverallPct(Math.min((t / script.totalDuration) * 100, 100));
    };
    const onEnded = () => { setPlaying(false); setOverallPct(100); };
    const onError = (e: Event) => console.warn("Audio playback error:", e);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended",      onEnded);
    audio.addEventListener("error",      onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended",      onEnded);
      audio.removeEventListener("error",      onError);
      audioRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrationAudio]);

  // Sync mute to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    if (synthRef.current && utterRef.current) {
      utterRef.current.volume = muted ? 0 : 1;
    }
  }, [muted]);

  // ── Browser speech synthesis helpers ─────────────────────────────────────────
  const startBrowserSpeech = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utter  = new SpeechSynthesisUtterance(text);
    utter.rate   = 0.88;   // Slightly slower — newsroom delivery pace
    utter.pitch  = 1.0;
    utter.volume = muted ? 0 : 1;

    // Prefer a native English voice (better quality)
    const voices = synth.getVoices();
    const pick   =
      voices.find((v) => v.name.toLowerCase().includes("samantha")) ??   // macOS
      voices.find((v) => v.name.toLowerCase().includes("daniel")) ??     // macOS UK
      voices.find((v) => !v.localService && v.lang.startsWith("en")) ??  // online voice
      voices.find((v) => v.lang.startsWith("en-IN")) ??                  // Indian English
      voices.find((v) => v.lang.startsWith("en"));

    if (pick) utter.voice = pick;

    utter.onend = () => {
      setPlaying(false);
      setOverallPct(100);
      setCurrentIdx(scenes.length - 1);
    };

    synthRef.current = synth;
    utterRef.current = utter;
    synth.speak(utter);
  }, [muted, scenes.length]);

  const stopBrowserSpeech = useCallback(() => {
    if (synthRef.current) { synthRef.current.cancel(); }
    utterRef.current = null;
  }, []);

  const pauseBrowserSpeech = useCallback(() => {
    synthRef.current?.pause();
  }, []);

  const resumeBrowserSpeech = useCallback(() => {
    synthRef.current?.resume();
  }, []);

  // ── Timer-based scene advancement ─────────────────────────────────────────────
  // Used when: (a) no ElevenLabs audio at all, OR (b) browser speech is driving audio
  // (browser speech synthesis can't be time-queried, so we use a timer for scenes)
  useEffect(() => {
    if (!playing) { clearTimer(); return; }
    // If ElevenLabs audio is available, it drives scene timing via timeupdate
    if (hasElevenLabsAudio) return;

    const sceneDurationMs = scenes[currentIdx].duration * 1000;
    const tickMs          = 80;

    timerRef.current = window.setInterval(() => {
      progressRef.current += tickMs;

      const cumBefore = scenes.slice(0, currentIdx).reduce((s, sc) => s + sc.duration * 1000, 0);
      setOverallPct(Math.min(((cumBefore + progressRef.current) / (script.totalDuration * 1000)) * 100, 100));

      if (progressRef.current >= sceneDurationMs) {
        progressRef.current = 0;
        if (currentIdx < scenes.length - 1) {
          setCurrentIdx((i) => i + 1);
        } else {
          setPlaying(false);
          clearTimer();
        }
      }
    }, tickMs);

    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentIdx, hasElevenLabsAudio]);

  // ── Controls ──────────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    clearTimer();
    stopBrowserSpeech();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    progressRef.current = 0;
    setCurrentIdx(0);
    setOverallPct(0);
    setPlaying(false);
  }, [clearTimer, stopBrowserSpeech]);

  const togglePlay = useCallback(() => {
    if (overallPct >= 99.5) {
      restart();
      setTimeout(() => {
        setPlaying(true);
        // Browser speech will be started by the effect below
      }, 50);
      return;
    }

    if (hasElevenLabsAudio && audioRef.current) {
      // ElevenLabs audio path
      if (playing) { audioRef.current.pause(); }
      else         { audioRef.current.play().catch((e) => console.warn("Play blocked:", e)); }
      setPlaying((v) => !v);
    } else if (hasBrowserSpeech) {
      // Browser speech synthesis path
      if (playing) {
        pauseBrowserSpeech();
        setPlaying(false);
      } else {
        setPlaying(true);
        // Speech started by effect below (needs playing = true)
      }
    }
  }, [overallPct, playing, hasElevenLabsAudio, hasBrowserSpeech, restart, pauseBrowserSpeech]);

  // Start browser speech when playing transitions to true (no ElevenLabs audio)
  useEffect(() => {
    if (!playing || hasElevenLabsAudio || !hasBrowserSpeech) return;

    // If utterance already exists and is paused, resume it
    if (utterRef.current && synthRef.current) {
      const state = synthRef.current.paused;
      if (state) {
        resumeBrowserSpeech();
        return;
      }
    }

    // Otherwise start fresh from the narration text
    const narText = narrationScript ?? script.fullNarration;
    startBrowserSpeech(narText);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Stop browser speech when muted (volume = 0 instead of cancel)
  useEffect(() => {
    if (utterRef.current) utterRef.current.volume = muted ? 0 : 1;
  }, [muted]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopBrowserSpeech();
      clearTimer();
    };
  }, [stopBrowserSpeech, clearTimer]);

  const jumpToScene = useCallback((idx: number) => {
    clearTimer();
    stopBrowserSpeech();
    progressRef.current = 0;
    const startTime = sceneBoundaries[idx - 1] ?? 0;

    if (hasElevenLabsAudio && audioRef.current) {
      audioRef.current.currentTime = startTime;
    }
    setCurrentIdx(idx);
    setOverallPct((startTime / script.totalDuration) * 100);
    setPlaying(false);
  }, [clearTimer, stopBrowserSpeech, sceneBoundaries, hasElevenLabsAudio, script.totalDuration]);

  const scrubTo = useCallback((pct: number) => {
    const targetTime = (pct / 100) * script.totalDuration;
    if (hasElevenLabsAudio && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    } else {
      stopBrowserSpeech();
      progressRef.current = 0;
      setCurrentIdx(sceneForTime(targetTime));
      setPlaying(false);
    }
    setOverallPct(pct);
  }, [script.totalDuration, hasElevenLabsAudio, sceneForTime, stopBrowserSpeech]);

  // ── Download narration audio ──────────────────────────────────────────────────
  const handleDownloadAudio = useCallback(() => {
    if (!narrationAudio) return;
    const link    = document.createElement("a");
    link.href     = narrationAudio;
    link.download = `toi-narration-${Date.now()}.mp3`;
    link.click();
  }, [narrationAudio]);

  const handleExport = () => {
    const exportRes = isPortrait ? "1080×1920" : "1920×1080";
    alert(
      `Export: ${FORMAT_LABEL[format]} (${exportRes})\n\n` +
      `Delivered assets:\n` +
      `• ${scenes.length} scene images (base64 PNG/JPEG)\n` +
      `• Narration: ${hasElevenLabsAudio ? "ElevenLabs MP3 embedded" : "Browser Speech Synthesis"}\n` +
      `• Caption style: "${captionStyle}"\n` +
      `• Duration: ${script.totalDuration}s\n\n` +
      `Production pipeline composites these via FFmpeg or Remotion.`,
    );
  };

  const currentScene = scenes[currentIdx] ?? scenes[0];
  const currentImage = sceneImages?.[currentIdx] ?? null;
  const frameH       = isPortrait ? 440 : 260;

  // Audio playing indicator (true when playing, regardless of source)
  const isAudioPlaying = playing;

  return (
    <>
      <style>{AUDIO_BAR_STYLE}</style>

      <div className="bg-white border border-[#E2E6ED]">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2 h-2 bg-[#E21B22] animate-pulse" />
            <h2 className="text-[13px] font-bold text-[#333333]">Video Preview</h2>
            <span className="px-2 py-0.5 bg-[#EEF4FF] text-[#0050B3] text-[10px] font-bold">
              {FORMAT_LABEL[format]}
            </span>
            {hasElevenLabsAudio && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
                <Mic className="w-2.5 h-2.5" />EL NARRATION
              </span>
            )}
            {!hasElevenLabsAudio && hasBrowserSpeech && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FFF7ED] text-[#D97706] text-[10px] font-bold">
                <Volume2 className="w-2.5 h-2.5" />BROWSER VOICE
              </span>
            )}
            {(sceneImages?.filter(Boolean).length ?? 0) > 0 && (
              <span className="px-2 py-0.5 bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-bold">
                {sceneImages!.filter(Boolean).length} AI VISUALS
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onEditScript}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-[#E2E6ED] text-[11px] text-[#6B7280] hover:bg-[#F5F6F8] transition-colors">
              <Edit3 className="w-3 h-3" />Edit
            </button>
            <button onClick={onRegenerate}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-[#E2E6ED] text-[11px] text-[#6B7280] hover:bg-[#F5F6F8] transition-colors">
              <RefreshCw className="w-3 h-3" />Regenerate
            </button>
            {hasElevenLabsAudio && (
              <button onClick={handleDownloadAudio}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-[#059669]/30 bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold hover:bg-[#D1FAE5] transition-colors">
                <Mic className="w-3 h-3" />Audio
              </button>
            )}
            <button onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0050B3] text-white text-[11px] font-semibold hover:bg-[#003D8C] transition-colors">
              <Download className="w-3 h-3" />Export
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* ── Video frame ─────────────────────────────────────────────────── */}
          <div className="flex justify-center">
            <div
              className="relative overflow-hidden bg-black"
              style={{ width: isPortrait ? Math.round(frameH * 9 / 16) : "100%", height: `${frameH}px` }}
            >
              <SceneFrame
                scene={currentScene}
                captionStyle={captionStyle}
                isPortrait={isPortrait}
                imageUrl={currentImage}
                isAudioPlaying={isAudioPlaying}
              />
              {!playing && (
                <button onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-[#333333] translate-x-0.5" fill="currentColor" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ── Controls ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay}
              className="w-8 h-8 bg-[#0050B3] flex items-center justify-center text-white hover:bg-[#003D8C] transition-colors flex-shrink-0">
              {playing
                ? <Pause className="w-3.5 h-3.5" fill="currentColor" />
                : <Play  className="w-3.5 h-3.5 translate-x-0.5" fill="currentColor" />}
            </button>

            <button onClick={restart}
              className="w-8 h-8 border border-[#E2E6ED] flex items-center justify-center text-[#6B7280] hover:bg-[#F5F6F8] transition-colors flex-shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Scrubber */}
            <div className="flex-1 h-1.5 bg-[#E2E6ED] relative cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                scrubTo(((e.clientX - rect.left) / rect.width) * 100);
              }}>
              <div className="h-full bg-[#0050B3] transition-none" style={{ width: `${overallPct}%` }} />
              {sceneBoundaries.slice(0, -1).map((t, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-white/60"
                  style={{ left: `${(t / script.totalDuration) * 100}%` }} />
              ))}
            </div>

            <span className="text-[10px] text-[#9AA5B4] font-mono flex-shrink-0">
              {Math.round(overallPct / 100 * script.totalDuration)}s / {script.totalDuration}s
            </span>

            <button
              onClick={() => setMuted((v) => !v)}
              className="w-7 h-7 flex items-center justify-center transition-colors flex-shrink-0 text-[#0050B3] hover:bg-[#EEF4FF]"
              title={muted ? "Unmute narration" : "Mute narration"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* ── Audio status strip ────────────────────────────────────────────── */}
          {hasElevenLabsAudio ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#ECFDF5] border border-[#059669]/20">
              <Mic className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#059669]">
                  ElevenLabs narration embedded · Voice: {video.voiceStyle}
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  {script.totalDuration}s · Synced to scene timeline · Click "Audio" to download MP3
                </p>
              </div>
              {playing && (
                <div className="flex items-end gap-0.5">
                  {[1, 2, 3, 2, 1].map((h, i) => (
                    <div key={i} className="w-0.5 bg-[#059669] rounded-full"
                      style={{ height: `${h * 4}px`, animation: `audioBar 0.5s ease-in-out ${i * 0.1}s infinite alternate` }} />
                  ))}
                </div>
              )}
            </div>
          ) : hasBrowserSpeech ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#FFF7ED] border border-[#D97706]/20">
              <Volume2 className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#D97706]">
                  Browser voice synthesis active
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  ElevenLabs quota used up — using your device's built-in voice engine. Press Play to hear narration.
                </p>
              </div>
              {playing && (
                <div className="flex items-end gap-0.5">
                  {[1, 2, 3, 2, 1].map((h, i) => (
                    <div key={i} className="w-0.5 bg-[#D97706] rounded-full"
                      style={{ height: `${h * 4}px`, animation: `audioBar 0.5s ease-in-out ${i * 0.1}s infinite alternate` }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200">
              <VolumeX className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <p className="text-[11px] text-red-600">Audio not available in this browser.</p>
            </div>
          )}

          {/* ── Scene strip ──────────────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2">
              Scenes
              {(sceneImages?.filter(Boolean).length ?? 0) > 0 && (
                <span className="ml-2 text-[#7C3AED] normal-case font-medium">
                  · {sceneImages!.filter(Boolean).length} AI visuals
                </span>
              )}
            </p>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${scenes.length}, 1fr)` }}>
              {scenes.map((scene, idx) => {
                const theme  = SCENE_THEMES[scene.type] ?? SCENE_THEMES.event;
                const active = idx === currentIdx;
                const img    = sceneImages?.[idx];
                return (
                  <button key={scene.id} onClick={() => jumpToScene(idx)}
                    className={`relative overflow-hidden border-2 transition-colors ${active ? "border-[#0050B3]" : "border-transparent hover:border-[#E2E6ED]"}`}>
                    <div className="h-12 flex flex-col items-center justify-center gap-0.5 px-1 relative"
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.via})` }}>
                      {img && (
                        <img src={img} alt={scene.type}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ opacity: 0.5 }} />
                      )}
                      <span className="relative text-white text-[8px] font-black uppercase tracking-wide leading-none text-center z-10">
                        {SCENE_LABEL[scene.type] ?? scene.type}
                      </span>
                      <span className="relative text-white/60 text-[7px] z-10">{scene.duration}s</span>
                    </div>
                    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050B3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Current scene narration ───────────────────────────────────────── */}
          <div className="border border-[#E2E6ED] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-[#333333]">
                Scene {currentScene.id} — {SCENE_LABEL[currentScene.type] ?? currentScene.type}
              </p>
              <div className="flex items-center gap-2">
                {currentImage && <span className="text-[9px] text-[#7C3AED] font-semibold uppercase tracking-wide">AI Visual</span>}
                <span className="text-[10px] text-[#9AA5B4]">{currentScene.duration}s</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9AA5B4] mb-0.5">Visual Direction</p>
              <p className="text-[11px] text-[#6B7280] leading-snug">{currentScene.description}</p>
            </div>
            <div className="bg-[#F5F6F8] border-l-2 border-[#0050B3] pl-2.5 pr-3 py-2.5">
              <p className="text-[10px] font-bold text-[#0050B3] mb-1 uppercase tracking-wide">Voice Narration / Caption</p>
              <p className="text-[12px] text-[#333333] leading-relaxed italic">"{currentScene.narration}"</p>
            </div>
          </div>

          {/* ── Full narration script per scene ───────────────────────────────── */}
          <div className="border border-[#E2E6ED]">
            <div className="px-4 py-3 border-b border-[#E2E6ED] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#9AA5B4]" />
              <p className="text-[11px] font-bold text-[#9AA5B4] uppercase tracking-wide">
                Narration Script · Caption Matched
              </p>
              <div className="ml-auto flex items-center gap-1 text-[10px] text-[#059669] font-semibold">
                <CheckCircle2 className="w-3 h-3" />Voice = Captions
              </div>
            </div>
            <div className="divide-y divide-[#E2E6ED]">
              {scenes.map((scene) => {
                const theme = SCENE_THEMES[scene.type] ?? SCENE_THEMES.event;
                return (
                  <div key={scene.id} className="flex gap-0">
                    <div className="w-1 flex-shrink-0" style={{ background: theme.to }} />
                    <div className="px-3.5 py-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.to }}>
                          {SCENE_LABEL[scene.type]}
                        </span>
                        <span className="text-[9px] text-[#9AA5B4]">{scene.duration}s</span>
                      </div>
                      <p className="text-[12px] text-[#333333] leading-relaxed">{scene.narration}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Export formats ────────────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2">Export Formats</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Instagram Reel", sub: "1080×1920", key: "instagram-reel" },
                { label: "YouTube Short",  sub: "1080×1920", key: "youtube-short"  },
                { label: "Website Video",  sub: "1920×1080", key: "website-video"  },
              ].map(({ label, sub, key }) => (
                <button key={label} onClick={handleExport}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2.5 border transition-colors group
                    ${key === format ? "border-[#0050B3] bg-[#EEF4FF]" : "border-[#E2E6ED] hover:border-[#0050B3] hover:bg-[#EEF4FF]"}`}>
                  <Download className={`w-3.5 h-3.5 transition-colors ${key === format ? "text-[#0050B3]" : "text-[#9AA5B4] group-hover:text-[#0050B3]"}`} />
                  <span className={`text-[10px] font-semibold text-center leading-tight transition-colors ${key === format ? "text-[#0050B3]" : "text-[#333333] group-hover:text-[#0050B3]"}`}>
                    {label}
                  </span>
                  <span className="text-[9px] text-[#9AA5B4]">{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
