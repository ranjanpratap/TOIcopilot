"use client";

import { ExternalLink, Globe, Clock } from "lucide-react";
import type { CompetitorItem, CompetitorMetrics } from "@/types/news-brief";

const RELEVANCE_CONFIG: Record<string, { bg: string; text: string }> = {
  High:   { bg: "bg-red-50",    text: "text-[#E21B22]" },
  Medium: { bg: "bg-orange-50", text: "text-orange-600" },
  Low:    { bg: "bg-gray-50",   text: "text-gray-500" },
};

const STYLE_CONFIG: Record<string, { bg: string; text: string }> = {
  Breaking:    { bg: "bg-red-50",    text: "text-[#E21B22]" },
  Explainer:   { bg: "bg-purple-50", text: "text-purple-700" },
  "Data-driven": { bg: "bg-blue-50",   text: "text-[#0050B3]" },
  Reaction:    { bg: "bg-orange-50", text: "text-orange-600" },
  Analysis:    { bg: "bg-amber-50",  text: "text-amber-700" },
  Standard:    { bg: "bg-gray-50",   text: "text-gray-500" },
};

const PUBLISHER_INITIALS: Record<string, string> = {
  NDTV: "ND", "India Today": "IT", "Hindustan Times": "HT",
  "Indian Express": "IE", "The Hindu": "TH", "Times Now": "TN",
  "Republic World": "RW", BBC: "BB", CNN: "CN", "Al Jazeera": "AJ",
};

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60_000; // minutes
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)} hr ago`;
  return `${Math.round(diff / 1440)} days ago`;
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-3 ${highlight ? "border-[#0050B3] bg-[#EEF4FF]" : "border-[#E2E6ED] bg-white"}`}>
      <p className="text-[10px] font-semibold text-[#9AA5B4] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-[13px] font-bold ${highlight ? "text-[#0050B3]" : "text-[#333333]"}`}>{value}</p>
    </div>
  );
}

interface Props {
  competitors: CompetitorItem[];
  metrics: CompetitorMetrics;
  loading?: boolean;
}

export default function CompetitorTable({ competitors, metrics, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E2E6ED]">
        <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
          <div className="skeleton h-4 w-56" />
        </div>
        <div className="grid grid-cols-4 gap-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14" />)}
        </div>
        <div className="px-5 pb-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#E21B22]" />
          <div>
            <h3 className="font-bold text-[#333333] text-[14px]">Competitor Coverage Analysis</h3>
            <p className="text-[11px] text-[#9AA5B4]">
              Tracking {competitors.length} article{competitors.length !== 1 ? "s" : ""} across monitored publishers
            </p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-bold ${
          metrics.coverageDensity === "Very High" || metrics.coverageDensity === "High"
            ? "bg-red-50 text-[#E21B22]"
            : metrics.coverageDensity === "Moderate"
            ? "bg-orange-50 text-orange-600"
            : "bg-gray-50 text-gray-500"
        }`}>
          {metrics.coverageDensity} Density
        </span>
      </div>

      {/* Summary metrics */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-[#E2E6ED]">
        <MetricCard label="Publishers Found" value={String(metrics.publishersFound)} highlight />
        <MetricCard label="Earliest Publisher" value={metrics.earliestPublisher} />
        <MetricCard label="Most Common Angle" value={metrics.mostCommonAngle} />
        <MetricCard label="Coverage Density" value={metrics.coverageDensity} />
      </div>

      {/* Table */}
      {competitors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#F5F6F8] border-b border-[#E2E6ED]">
                {["Publisher", "Headline", "Published", "Relevance", "Style", ""].map((col) => (
                  <th key={col} className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#9AA5B4] uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {competitors.map((item, i) => {
                const rel = RELEVANCE_CONFIG[item.relevance] ?? RELEVANCE_CONFIG.Low;
                const sty = STYLE_CONFIG[item.style] ?? STYLE_CONFIG.Standard;
                const initials = PUBLISHER_INITIALS[item.publisher] ?? item.publisher.slice(0, 2).toUpperCase();

                return (
                  <tr key={i} className="hover:bg-[#FAFBFC] transition-colors">
                    {/* Publisher */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#0050B3] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <span className="text-[12px] font-medium text-[#333333]">{item.publisher}</span>
                      </div>
                    </td>
                    {/* Headline */}
                    <td className="px-4 py-3 max-w-[280px]">
                      <p className="text-[12px] text-[#333333] leading-snug line-clamp-2">{item.headline}</p>
                    </td>
                    {/* Published */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px] text-[#9AA5B4]">
                        <Clock className="w-3 h-3" />
                        {relativeTime(item.publishedAt)}
                      </div>
                    </td>
                    {/* Relevance */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${rel.bg} ${rel.text}`}>
                        {item.relevance}
                      </span>
                    </td>
                    {/* Style */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 ${sty.bg} ${sty.text}`}>
                        {item.style}
                      </span>
                    </td>
                    {/* Link */}
                    <td className="px-4 py-3">
                      {item.url !== "#" ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-[#0050B3] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#C8D0DC]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <Globe className="w-8 h-8 text-[#C8D0DC] mx-auto mb-2" />
          <p className="text-[13px] text-[#9AA5B4]">No competitor articles found for this topic.</p>
          <p className="text-[11px] text-[#C8D0DC] mt-1">TOI has an exclusive opportunity — publish first.</p>
        </div>
      )}
    </div>
  );
}
