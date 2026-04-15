"use client";

import { useState } from "react";
import { Compass, Users, TrendingUp, ChevronRight, CheckCircle2 } from "lucide-react";
import type { AngleItem } from "@/types/news-brief";

const POTENTIAL_COLORS: Record<string, { text: string; bg: string; dot: string }> = {
  "Very High": { text: "text-[#E21B22]", bg: "bg-red-50",    dot: "bg-[#E21B22]" },
  "High":      { text: "text-orange-600",  bg: "bg-orange-50", dot: "bg-orange-500" },
  "Moderate":  { text: "text-[#0050B3]",  bg: "bg-blue-50",   dot: "bg-[#0050B3]" },
  "Low":       { text: "text-gray-500",   bg: "bg-gray-50",   dot: "bg-gray-400" },
};

const ANGLE_ICONS: Record<string, string> = {
  "Public Impact": "👥",
  "Political Reaction": "🏛️",
  "Explainer": "📖",
  "Business & Economic Impact": "📊",
  "Human Interest": "❤️",
};

interface Props {
  angles: AngleItem[];
  loading?: boolean;
  onUseAngle?: (angle: AngleItem) => void;
}

export default function NewsAngles({ angles, loading, onUseAngle }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E6ED]">
        <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-[#E2E6ED] p-4 space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#0050B3]" />
          <div>
            <h3 className="font-bold text-[#333333] text-[14px]">News Angle Intelligence</h3>
            <p className="text-[11px] text-[#9AA5B4]">{angles.length} editorial angles analysed — select the strongest pitch</p>
          </div>
        </div>
      </div>

      {/* Angle cards */}
      <div className="divide-y divide-[#F0F2F5]">
        {angles.map((angle, i) => {
          const potential = POTENTIAL_COLORS[angle.trafficPotential] ?? POTENTIAL_COLORS.Moderate;
          const isSelected = selected === i;
          const isExpanded = expanded === i;
          const emoji = ANGLE_ICONS[angle.name] ?? "📌";

          return (
            <div
              key={i}
              className={`transition-colors ${isSelected ? "bg-[#EEF4FF]" : "bg-white hover:bg-[#FAFBFC]"}`}
            >
              {/* Summary row */}
              <div className="px-5 py-4 flex items-start gap-3">
                {/* Emoji icon */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#F5F6F8] text-base">
                  {emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold text-[#333333] leading-tight">{angle.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 ${potential.bg} ${potential.text}`}>
                          <span className={`w-1.5 h-1.5 ${potential.dot}`} />
                          {angle.trafficPotential} Traffic
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                          <Users className="w-3 h-3" />
                          {angle.targetAudience.split(",")[0]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : i)}
                      className="flex-shrink-0 text-[#9AA5B4] hover:text-[#333333] transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {/* Description (always visible) */}
                  <p className="text-[12px] text-[#6B7280] mt-2 leading-relaxed line-clamp-2">
                    {angle.description}
                  </p>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#F0F2F5] space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-1">Full Description</p>
                        <p className="text-[12px] text-[#333333] leading-relaxed">{angle.description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-1">Target Audience</p>
                        <p className="text-[12px] text-[#333333]">{angle.targetAudience}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-1">Why This Angle</p>
                        <p className="text-[12px] text-[#333333] leading-relaxed">{angle.reason}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelected(i);
                            onUseAngle?.(angle);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                            isSelected
                              ? "bg-green-50 border border-green-200 text-green-700"
                              : "bg-[#0050B3] text-white hover:bg-[#003D8C]"
                          }`}
                        >
                          {isSelected
                            ? <><CheckCircle2 className="w-3 h-3" /> Angle Selected</>
                            : "Use This Angle"
                          }
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] text-[11px] text-[#6B7280] transition-colors">
                          <TrendingUp className="w-3 h-3" />
                          Generate Body From Angle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
