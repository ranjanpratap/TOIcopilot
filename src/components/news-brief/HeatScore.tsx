"use client";

import { Thermometer } from "lucide-react";
import type { HeatScoreData } from "@/types/news-brief";

const STATUS_CONFIG: Record<string, { text: string; bg: string; border: string; scoreColor: string }> = {
  Viral:         { text: "text-white",        bg: "bg-[#E21B22]",    border: "border-[#E21B22]",    scoreColor: "#E21B22" },
  Trending:      { text: "text-white",        bg: "bg-orange-500",   border: "border-orange-500",   scoreColor: "#F97316" },
  Rising:        { text: "text-white",        bg: "bg-amber-500",    border: "border-amber-500",    scoreColor: "#F59E0B" },
  Moderate:      { text: "text-[#333333]",    bg: "bg-[#E2E6ED]",    border: "border-[#C8D0DC]",    scoreColor: "#6B7280" },
  "Low Priority":{ text: "text-[#6B7280]",   bg: "bg-[#F5F6F8]",   border: "border-[#E2E6ED]",    scoreColor: "#9AA5B4" },
};

const BREAKDOWN_LABELS: Record<string, string> = {
  searchDemand: "Search Demand",
  socialBuzz: "Social Buzz",
  competitorCoverage: "Competitor Coverage",
  freshness: "Freshness",
  videoPotential: "Video Potential",
};

// SVG gauge meter — semicircle from left to right
function GaugeMeter({ score, color }: { score: number; color: string }) {
  const r = 80;
  const cx = 100;
  const cy = 95;
  const arcLen = Math.PI * r; // ≈ 251.3

  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-[220px]" aria-label={`Heat score: ${score} out of 100`}>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#E8ECF0"
        strokeWidth="14"
        strokeLinecap="butt"
      />
      {/* Progress */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="butt"
        strokeDasharray={arcLen}
        strokeDashoffset={arcLen * (1 - score / 100)}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
      {/* Score text */}
      <text
        x={cx}
        y={cy - 18}
        textAnchor="middle"
        fontSize="40"
        fontWeight="800"
        fill={color}
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="11"
        fill="#9AA5B4"
        fontFamily="inherit"
      >
        out of 100
      </text>
      {/* Min/Max labels */}
      <text x="14" y={cy + 14} fontSize="9" fill="#9AA5B4" fontFamily="inherit">0</text>
      <text x="178" y={cy + 14} fontSize="9" fill="#9AA5B4" fontFamily="inherit">100</text>
    </svg>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const barColor =
    value >= 75 ? "#E21B22" :
    value >= 55 ? "#F97316" :
    value >= 40 ? "#0050B3" : "#9AA5B4";

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#6B7280] w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#E8ECF0]">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${value}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-[11px] font-bold text-[#333333] w-6 text-right flex-shrink-0">{value}</span>
    </div>
  );
}

interface Props {
  data: HeatScoreData;
  loading?: boolean;
}

export default function HeatScore({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E2E6ED] p-5 space-y-4">
        <div className="skeleton h-4 w-36" />
        <div className="skeleton h-32 w-48 mx-auto" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-3 w-full" />)}
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.Moderate;

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <Thermometer className="w-4 h-4 text-[#E21B22]" />
        <div>
          <h3 className="font-bold text-[#333333] text-[14px]">News Heat Score</h3>
          <p className="text-[11px] text-[#9AA5B4]">Trending potential score based on real-time signals</p>
        </div>
      </div>

      <div className="p-5">
        {/* Gauge + status */}
        <div className="flex flex-col items-center mb-5">
          <GaugeMeter score={data.score} color={cfg.scoreColor} />
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-[12px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {data.status}
            </span>
            <span className="text-[11px] text-[#9AA5B4]">Category: {data.category}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-3">Score Breakdown</p>
          <div className="space-y-2.5">
            {Object.entries(data.breakdown).map(([key, value]) => (
              <BreakdownBar
                key={key}
                label={BREAKDOWN_LABELS[key] ?? key}
                value={value}
              />
            ))}
          </div>
          {/* Weight legend */}
          <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-[#9AA5B4]">
            {[
              ["Competitor Coverage", "30%"],
              ["Freshness", "20%"],
              ["Keyword Strength", "15%"],
              ["Breaking Signal", "15%"],
              ["Category Weight", "10%"],
              ["Video Potential", "10%"],
            ].map(([label, weight]) => (
              <div key={label} className="flex justify-between px-2 py-0.5 bg-[#F5F6F8]">
                <span>{label}</span>
                <span className="font-bold">{weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial recommendation */}
        <div className="border-l-4 border-[#0050B3] pl-3 bg-[#EEF4FF] py-3 pr-3">
          <p className="text-[10px] font-bold text-[#0050B3] uppercase tracking-wide mb-1">Editorial Recommendation</p>
          <p className="text-[12px] text-[#333333] leading-relaxed">{data.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
