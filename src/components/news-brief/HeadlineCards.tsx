"use client";

import { useState } from "react";
import { Copy, Check, FileText, Star } from "lucide-react";
import type { HeadlineItem } from "@/types/news-brief";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SEO:        { bg: "bg-blue-50",   text: "text-[#0050B3]",  border: "border-blue-200" },
  Breaking:   { bg: "bg-red-50",    text: "text-[#E21B22]",  border: "border-red-200" },
  Explainer:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "High CTR": { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  Analysis:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  Balanced:   { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2 py-1 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] text-[11px] text-[#6B7280] transition-colors"
    >
      {copied
        ? <><Check className="w-3 h-3 text-green-500" /> Copied</>
        : <><Copy className="w-3 h-3" /> Copy</>
      }
    </button>
  );
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#E8ECF0] flex-shrink-0">
        <div className="h-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

interface Props {
  headlines: HeadlineItem[];
  loading?: boolean;
}

export default function HeadlineCards({ headlines, loading }: Props) {
  const [usedIndex, setUsedIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <SectionShell title="Headline Suggestions">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-[#E2E6ED] p-4 space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Headline Suggestions"
      subtitle={`${headlines.length} headline variants generated — pick your best angle`}
      icon={<FileText className="w-4 h-4 text-[#0050B3]" />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-5">
        {headlines.map((h, i) => {
          const tc = TYPE_COLORS[h.type] ?? TYPE_COLORS.Balanced;
          const isUsed = usedIndex === i;

          return (
            <div
              key={i}
              className={`
                relative border p-4 transition-all
                ${h.isRecommended
                  ? "border-[#0050B3] bg-[#EEF4FF]"
                  : "border-[#E2E6ED] bg-white hover:border-[#C8D4E8]"
                }
              `}
            >
              {/* Recommended badge */}
              {h.isRecommended && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-[#0050B3] fill-[#0050B3]" />
                  <span className="text-[10px] font-bold text-[#0050B3] uppercase tracking-wide">
                    Recommended Headline
                  </span>
                </div>
              )}

              {/* Headline text */}
              <p className={`text-[13px] font-semibold leading-snug mb-3 ${h.isRecommended ? "text-[#0050B3]" : "text-[#333333]"}`}>
                {h.text}
              </p>

              {/* Metrics row */}
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-[#9AA5B4] uppercase tracking-wide mb-0.5">SEO Score</p>
                  <ScoreBar value={h.seoScore} color={h.seoScore >= 85 ? "#059669" : h.seoScore >= 70 ? "#F97316" : "#9AA5B4"} />
                </div>
                <div>
                  <p className="text-[10px] text-[#9AA5B4] uppercase tracking-wide mb-0.5">CTR Est.</p>
                  <span className="text-[12px] font-bold text-[#333333]">{h.ctrPrediction}</span>
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 border ${tc.bg} ${tc.text} ${tc.border}`}>
                  {h.type}
                </span>
                <div className="flex items-center gap-1.5">
                  <CopyButton text={h.text} />
                  <button
                    onClick={() => setUsedIndex(i)}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold transition-colors
                      ${isUsed
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-[#0050B3] text-white hover:bg-[#003D8C]"
                      }`}
                  >
                    {isUsed ? <><Check className="w-3 h-3" /> Used</> : "Use Headline"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

function SectionShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E2E6ED]">
      <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="font-bold text-[#333333] text-[14px]">{title}</h3>
            {subtitle && <p className="text-[11px] text-[#9AA5B4] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
