"use client";

import { Settings2, Monitor, Mic2, Type } from "lucide-react";
import type { VideoFormat, VoiceStyle, CaptionStyle } from "@/types/video-builder";

interface Props {
  format: VideoFormat;
  voiceStyle: VoiceStyle;
  captionStyle: CaptionStyle;
  onFormatChange: (v: VideoFormat) => void;
  onVoiceChange: (v: VoiceStyle) => void;
  onCaptionChange: (v: CaptionStyle) => void;
}

const FORMATS: { value: VideoFormat; label: string; sub: string }[] = [
  { value: "instagram-reel", label: "Instagram Reel",   sub: "9:16 · 1080×1920" },
  { value: "youtube-short",  label: "YouTube Short",    sub: "9:16 · 1080×1920" },
  { value: "website-video",  label: "Website Video",    sub: "16:9 · 1920×1080" },
];

const VOICES: { value: VoiceStyle; label: string }[] = [
  { value: "neutral", label: "Neutral News Anchor" },
  { value: "female",  label: "Female News Anchor"  },
  { value: "male",    label: "Male News Anchor"    },
];

const CAPTIONS: { value: CaptionStyle; label: string; desc: string }[] = [
  { value: "breaking-news",    label: "Breaking News",    desc: "Bold red bar with caps headline" },
  { value: "bold-headline",    label: "Bold Headline",    desc: "Large centred bold text" },
  { value: "minimal-subtitle", label: "Minimal Subtitle", desc: "Clean small text at bottom" },
  { value: "explainer",        label: "Explainer Style",  desc: "Labelled segments and tags" },
];

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3.5 h-3.5 text-[#9AA5B4]" />
      <p className="text-[11px] font-bold text-[#9AA5B4] uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function VideoConfigPanel({
  format, voiceStyle, captionStyle,
  onFormatChange, onVoiceChange, onCaptionChange,
}: Props) {
  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-[#0050B3]" />
        <h2 className="text-[13px] font-bold text-[#333333]">Video Format Settings</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Video Format */}
        <div>
          <SectionLabel icon={Monitor} label="Video Format" />
          <div className="space-y-1.5">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => onFormatChange(f.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 border text-left transition-colors
                  ${format === f.value
                    ? "border-[#0050B3] bg-[#EEF4FF]"
                    : "border-[#E2E6ED] hover:border-[#0050B3]/40 hover:bg-[#F5F6F8]"
                  }
                `}
              >
                <span className={`text-[12px] font-semibold ${format === f.value ? "text-[#0050B3]" : "text-[#333333]"}`}>
                  {f.label}
                </span>
                <span className="text-[10px] text-[#9AA5B4]">{f.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Style */}
        <div>
          <SectionLabel icon={Mic2} label="Voice Style" />
          <div className="grid grid-cols-1 gap-1.5">
            {VOICES.map((v) => (
              <button
                key={v.value}
                onClick={() => onVoiceChange(v.value)}
                className={`
                  px-3 py-2 border text-left text-[12px] font-medium transition-colors
                  ${voiceStyle === v.value
                    ? "border-[#0050B3] bg-[#EEF4FF] text-[#0050B3] font-semibold"
                    : "border-[#E2E6ED] text-[#6B7280] hover:border-[#0050B3]/40 hover:bg-[#F5F6F8]"
                  }
                `}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-[#9AA5B4]">
            Narration audio is auto-generated from the video script.
          </p>
        </div>

        {/* Caption Style */}
        <div>
          <SectionLabel icon={Type} label="Caption Style" />
          <div className="space-y-1.5">
            {CAPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => onCaptionChange(c.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 border text-left transition-colors
                  ${captionStyle === c.value
                    ? "border-[#0050B3] bg-[#EEF4FF]"
                    : "border-[#E2E6ED] hover:border-[#0050B3]/40 hover:bg-[#F5F6F8]"
                  }
                `}
              >
                <span className={`text-[12px] font-semibold ${captionStyle === c.value ? "text-[#0050B3]" : "text-[#333333]"}`}>
                  {c.label}
                </span>
                <span className="text-[10px] text-[#9AA5B4] text-right max-w-[120px] leading-tight">
                  {c.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration note */}
        <div className="px-3 py-2.5 bg-[#F5F6F8] border border-[#E2E6ED]">
          <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-0.5">Video Duration</p>
          <p className="text-[12px] text-[#333333]">Auto-generated · 20–40 seconds</p>
          <p className="text-[10px] text-[#9AA5B4] mt-0.5">Duration is calculated from script length.</p>
        </div>
      </div>
    </div>
  );
}
