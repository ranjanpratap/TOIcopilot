"use client";

import { ScrollText, Users, MapPin, Building2, Tag, CheckCircle2 } from "lucide-react";
import type { VideoScript } from "@/types/video-builder";

interface Props {
  script: VideoScript;
}

function EntityPill({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 border border-[#E2E6ED] text-[11px] text-[#6B7280] leading-none">
      {label}
    </span>
  );
}

const SCENE_COLORS: Record<string, { dot: string; label: string }> = {
  hook:       { dot: "bg-[#E21B22]", label: "Hook"       },
  event:      { dot: "bg-[#0050B3]", label: "Event"      },
  facts:      { dot: "bg-[#059669]", label: "Key Facts"  },
  context:    { dot: "bg-[#7C3AED]", label: "Context"    },
  conclusion: { dot: "bg-[#D97706]", label: "Conclusion" },
};

export default function ScriptPreview({ script }: Props) {
  const hasEntities =
    script.entities.people.length > 0 ||
    script.entities.places.length > 0 ||
    script.entities.organizations.length > 0 ||
    script.entities.topics.length > 0;

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-[#059669]" />
        <h2 className="text-[13px] font-bold text-[#333333]">Article Analysis</h2>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-[#059669] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ready for video
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Headline */}
        <div>
          <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-1">Headline</p>
          <h3 className="text-[14px] font-bold text-[#333333] leading-snug">{script.headline}</h3>
        </div>

        {/* Story brief */}
        <div>
          <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-1">Story Brief</p>
          <p className="text-[12px] text-[#6B7280] leading-relaxed">{script.brief}</p>
        </div>

        {/* Key facts */}
        {script.keyFacts.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2">Key Facts</p>
            <ul className="space-y-1.5">
              {script.keyFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#0050B3] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[12px] text-[#333333] leading-snug">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Entities */}
        {hasEntities && (
          <div>
            <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2">Entities Detected</p>
            <div className="space-y-2">
              {[
                { icon: Users,     key: "people",        label: "People"        },
                { icon: MapPin,    key: "places",        label: "Places"        },
                { icon: Building2, key: "organizations", label: "Organisations" },
                { icon: Tag,       key: "topics",        label: "Topics"        },
              ].map(({ icon: Icon, key, label }) => {
                const items = script.entities[key as keyof typeof script.entities];
                if (!items.length) return null;
                return (
                  <div key={key} className="flex items-start gap-2">
                    <div className="flex items-center gap-1 w-24 flex-shrink-0">
                      <Icon className="w-3 h-3 text-[#9AA5B4]" />
                      <span className="text-[10px] text-[#9AA5B4]">{label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {items.map((e: string) => <EntityPill key={e} label={e} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Script sections */}
        <div>
          <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2">Generated Script</p>
          <div className="space-y-2">
            {[
              { key: "hook",       label: "Hook",        color: "#E21B22", bg: "#FFF0F0" },
              { key: "event",      label: "Event",       color: "#0050B3", bg: "#EEF4FF" },
              { key: "facts",      label: "Key Facts",   color: "#059669", bg: "#ECFDF5" },
              { key: "conclusion", label: "Conclusion",  color: "#D97706", bg: "#FFFBEB" },
            ].map(({ key, label, color, bg }) => (
              <div key={key} className="border border-[#E2E6ED] overflow-hidden">
                <div className="px-3 py-1.5 flex items-center gap-1.5" style={{ background: bg }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
                    {label}
                  </span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[12px] text-[#333333] leading-relaxed">
                    {script[key as keyof Pick<VideoScript, "hook" | "event" | "facts" | "conclusion">]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scene breakdown timeline */}
        <div>
          <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2">
            Scene Timeline · {script.totalDuration}s total
          </p>
          <div className="flex gap-1 h-6 overflow-hidden">
            {script.scenes.map((scene) => {
              const pct = (scene.duration / script.totalDuration) * 100;
              const meta = SCENE_COLORS[scene.type] ?? { dot: "bg-[#9AA5B4]", label: scene.type };
              return (
                <div
                  key={scene.id}
                  title={`${meta.label} · ${scene.duration}s`}
                  className={`${meta.dot} flex items-center justify-center text-white text-[9px] font-bold overflow-hidden`}
                  style={{ width: `${pct}%` }}
                >
                  {pct > 12 ? `${scene.duration}s` : ""}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            {Object.entries(SCENE_COLORS).map(([type, meta]) => (
              <span key={type} className="flex items-center gap-1 text-[10px] text-[#9AA5B4]">
                <span className={`w-2 h-2 ${meta.dot}`} />
                {meta.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
