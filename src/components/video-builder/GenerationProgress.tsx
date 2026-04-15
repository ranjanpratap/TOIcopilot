"use client";

import { CheckCircle2, Loader2, Circle, Mic, Image, Film, FileText, BarChart3 } from "lucide-react";
import type { GenerationStage } from "@/types/video-builder";

const STAGES: {
  id: GenerationStage;
  label: string;
  desc: string;
  icon: React.ElementType;
  activeDesc: string;
}[] = [
  {
    id:         "analyzing",
    label:      "Article Analysis",
    desc:       "Script and entities extracted from article",
    icon:       FileText,
    activeDesc: "Reading article, detecting entities and extracting key story facts...",
  },
  {
    id:         "scripting",
    label:      "Script Assembly",
    desc:       "Hook · Event · Facts · Conclusion structured",
    icon:       BarChart3,
    activeDesc: "Assembling narration script from hook, event, key facts and conclusion...",
  },
  {
    id:         "narrating",
    label:      "Voice Narration",
    desc:       "ElevenLabs newsroom voice audio",
    icon:       Mic,
    activeDesc: "Generating professional newsroom narration via ElevenLabs. This takes 10–20 seconds...",
  },
  {
    id:         "scenes",
    label:      "Scene Visuals",
    desc:       "Entity-grounded images for each scene",
    icon:       Image,
    activeDesc: "Generating entity-grounded visuals for Hook · Event · Facts · Context · Conclusion scenes...",
  },
  {
    id:         "rendering",
    label:      "Final Assembly",
    desc:       "Compositing scenes, audio and captions",
    icon:       Film,
    activeDesc: "Compositing scene visuals with narration audio and caption overlays...",
  },
];

const STAGE_ORDER: GenerationStage[] = [
  "analyzing", "scripting", "narrating", "scenes", "rendering", "done",
];

interface Props {
  stage: GenerationStage;
}

export default function GenerationProgress({ stage }: Props) {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  const pct        = Math.min(Math.round((currentIdx / STAGES.length) * 100), 95);
  const activeStage = STAGES.find((s) => s.id === stage);

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-[#0050B3] animate-spin" />
        <h2 className="text-[13px] font-bold text-[#333333]">Generating Video</h2>
        <span className="ml-auto text-[11px] text-[#9AA5B4]">
          Step {Math.min(currentIdx + 1, STAGES.length)} of {STAGES.length}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Overall progress bar */}
        <div>
          <div className="h-1.5 bg-[#F5F6F8] overflow-hidden">
            <div
              className="h-full bg-[#0050B3] transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-[#9AA5B4]">AI Video Pipeline</span>
            <span className="text-[10px] font-semibold text-[#0050B3]">{pct}%</span>
          </div>
        </div>

        {/* Stage list */}
        <div className="space-y-0">
          {STAGES.map((s, idx) => {
            const stageIdx  = STAGE_ORDER.indexOf(s.id);
            const isDone    = stageIdx < currentIdx;
            const isActive  = stageIdx === currentIdx;
            const isPending = stageIdx > currentIdx;
            const Icon      = s.icon;

            return (
              <div key={s.id} className="flex gap-3">
                {/* Connector + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-7 h-7 flex items-center justify-center flex-shrink-0 z-10
                      ${isDone    ? "bg-[#059669]"
                      : isActive  ? "bg-[#0050B3]"
                      : "bg-[#F5F6F8] border border-[#E2E6ED]"}
                    `}
                  >
                    {isDone
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : isActive
                        ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        : <Icon className="w-3 h-3 text-[#C5CBD3]" />
                    }
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`w-px flex-1 min-h-[18px] my-0.5 transition-colors duration-500
                        ${isDone ? "bg-[#059669]" : "bg-[#E2E6ED]"}`}
                    />
                  )}
                </div>

                {/* Text */}
                <div className={`pb-3.5 ${idx === STAGES.length - 1 ? "pb-0" : ""}`}>
                  <p
                    className={`text-[12px] font-semibold leading-none mt-1.5 transition-colors
                      ${isDone ? "text-[#059669]" : isActive ? "text-[#0050B3]" : "text-[#9AA5B4]"}`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 leading-snug transition-colors
                      ${isDone || isActive ? "text-[#6B7280]" : "text-[#C5CBD3]"}`}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active stage detail message */}
        {activeStage && (
          <div className="flex items-start gap-3 px-4 py-3 bg-[#EEF4FF] border border-[#0050B3]/20">
            <div className="flex gap-1 flex-shrink-0 mt-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-[#0050B3] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-[12px] text-[#0050B3] leading-relaxed">
              {activeStage.activeDesc}
            </p>
          </div>
        )}

        {/* Stage-specific note */}
        {stage === "narrating" && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#ECFDF5] border border-[#059669]/20">
            <Mic className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-[#059669]">ElevenLabs voice generation active</p>
              <p className="text-[10px] text-[#6B7280]">
                Model: eleven_multilingual_v2 · Neutral / Female / Male anchor voices · Scene images generating in parallel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
