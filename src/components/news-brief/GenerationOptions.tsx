"use client";

import {
  FileText,
  Search,
  ShieldCheck,
  BarChart2,
  Hash,
  Compass,
  Thermometer,
  Image,
} from "lucide-react";
import type { GenerationOptionsState } from "@/types/news-brief";

const OPTIONS: {
  key: keyof GenerationOptionsState;
  label: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
}[] = [
  {
    key: "headlines",
    label: "Generate Headlines",
    description: "6–8 optimised headline variants with SEO score and CTR prediction",
    icon: FileText,
    accentColor: "#0050B3",
  },
  {
    key: "newsBody",
    label: "Generate News Body",
    description: "Full structured article: intro, developments, background, quotes, context",
    icon: AlignLeftIcon,
    accentColor: "#0050B3",
  },
  {
    key: "newsImage",
    label: "Generate News Image",
    description: "AI image concept prompt for editorial photo or illustration brief",
    icon: Image,
    accentColor: "#7C3AED",
  },
  {
    key: "competitorCoverage",
    label: "Competitor Coverage Analysis",
    description: "Scan tracked publishers for existing coverage and identify coverage gaps",
    icon: Search,
    accentColor: "#E21B22",
  },
  {
    key: "seoKeywords",
    label: "SEO Keywords",
    description: "Primary keyword, supporting terms, meta description, and article slug",
    icon: Hash,
    accentColor: "#059669",
  },
  {
    key: "newsAngles",
    label: "News Angle Intelligence",
    description: "5 editorial angle cards with audience targeting and traffic potential",
    icon: Compass,
    accentColor: "#0050B3",
  },
  {
    key: "heatScore",
    label: "News Heat Score",
    description: "0–100 trending score with breakdown across search, social, and recency",
    icon: Thermometer,
    accentColor: "#E21B22",
  },
];

// inline simple icon to avoid import issues
function AlignLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="16" x2="18" y2="16" />
    </svg>
  );
}

interface Props {
  options: GenerationOptionsState;
  onChange: (key: keyof GenerationOptionsState, value: boolean) => void;
}

export default function GenerationOptions({ options, onChange }: Props) {
  const enabledCount = Object.values(options).filter(Boolean).length;

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#0050B3]" />
          <span className="font-semibold text-[13px] text-[#333333]">Select What To Generate</span>
        </div>
        <span className="text-[11px] text-[#9AA5B4]">
          {enabledCount} of {OPTIONS.length} selected
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {OPTIONS.map(({ key, label, description, icon: Icon, accentColor }) => {
          const isOn = options[key];
          return (
            <button
              key={key}
              onClick={() => onChange(key, !isOn)}
              className={`
                flex items-start gap-3 p-3 border text-left transition-all
                ${isOn
                  ? "border-[#0050B3] bg-[#EEF4FF]"
                  : "border-[#E2E6ED] bg-white hover:border-[#C8D4E8] hover:bg-[#FAFBFC]"
                }
              `}
            >
              {/* Toggle indicator */}
              <div
                className={`
                  flex-shrink-0 mt-0.5 w-4 h-4 border-2 flex items-center justify-center transition-colors
                  ${isOn ? "border-[#0050B3] bg-[#0050B3]" : "border-[#C8D4E8] bg-white"}
                `}
              >
                {isOn && (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center"
                style={{ backgroundColor: `${isOn ? accentColor : "#9AA5B4"}18` }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isOn ? accentColor : "#9AA5B4" }}
                />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className={`text-[12px] font-semibold leading-tight ${isOn ? "text-[#333333]" : "text-[#6B7280]"}`}>
                  {label}
                </p>
                <p className="text-[11px] text-[#9AA5B4] mt-0.5 leading-relaxed">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
