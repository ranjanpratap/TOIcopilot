"use client";

import { X, ExternalLink, FileText, Video, TrendingUp, Clock } from "lucide-react";
import type { ContentGap } from "@/types/content-gap";

interface Props {
  gap: ContentGap;
  onClose: () => void;
  onCreateBrief: (topic: string) => void;
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - score / 100);
  const color = score >= 90 ? "#E21B22" : score >= 70 ? "#EA580C" : score >= 50 ? "#D97706" : "#9AA5B4";

  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#E2E6ED" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="square"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{score}</text>
      </svg>
      <span className="text-[10px] text-[#9AA5B4] font-medium mt-0.5">Score</span>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Create Brief", icon: FileText, active: true,  color: "#0050B3", bg: "#EEF4FF" },
  { label: "Create Video", icon: Video,    active: false, color: "#6B7280", bg: "#F5F6F8" },
] as const;

export default function OpportunityDetail({ gap, onClose, onCreateBrief }: Props) {
  // Sort stories by time desc (most recent first)
  const stories = [...gap.stories].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="bg-white border border-[#E2E6ED] flex flex-col">
      {/* Detail header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between gap-3 flex-shrink-0">
        <h3 className="text-[13px] font-bold text-[#333333]">Opportunity Detail</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center hover:bg-[#F5F6F8] text-[#9AA5B4] hover:text-[#333333] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Score + topic */}
        <div className="px-5 py-4 border-b border-[#E2E6ED]">
          <div className="flex items-start gap-4">
            <ScoreRing score={gap.opportunityScore} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#333333] leading-snug">{gap.topic}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-[#EEF4FF] text-[#0050B3] text-[11px] font-semibold">
                  {gap.category}
                </span>
                <span className="px-2 py-0.5 bg-[#F5F6F8] text-[#6B7280] text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {gap.freshness}
                </span>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +{gap.searchTrendDelta}%
                </span>
              </div>
            </div>
          </div>

          {/* Entity tags */}
          {gap.entities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {gap.entities.map((e) => (
                <span key={e} className="px-2 py-0.5 border border-[#E2E6ED] text-[11px] text-[#6B7280]">
                  #{e}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Trend signals */}
        <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
          <p className="text-[11px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2.5">Trend Signals</p>
          <div className="grid grid-cols-2 gap-2">
            {gap.trendSignals.map((sig) => (
              <div key={sig.label} className="bg-[#F5F6F8] px-3 py-2">
                <p className="text-[10px] text-[#9AA5B4] font-medium">{sig.label}</p>
                <p className={`text-[13px] font-bold mt-0.5 ${sig.positive ? "text-[#059669]" : "text-[#6B7280]"}`}>
                  {sig.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor coverage */}
        <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
          <p className="text-[11px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2.5">
            Competitor Coverage · {gap.competitors.length} publisher{gap.competitors.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {stories.map((story, i) => (
              <div key={i} className="border border-[#E2E6ED] p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#0050B3] uppercase tracking-wide flex-shrink-0">
                    {story.publisher}
                  </span>
                  <span className="text-[10px] text-[#9AA5B4] flex-shrink-0">{timeSince(story.publishedAt)}</span>
                </div>
                <p className="text-[12px] text-[#333333] leading-snug">{story.headline}</p>
                {story.description && (
                  <p className="text-[11px] text-[#9AA5B4] mt-1 line-clamp-2 leading-relaxed">{story.description}</p>
                )}
                {story.url && story.url.startsWith("http") && (
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#0050B3] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read article <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Publishing timeline */}
        <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
          <p className="text-[11px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-2.5">Publishing Timeline</p>
          <div className="relative pl-4">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-[#E2E6ED]" />
            {stories.map((story, i) => (
              <div key={i} className="relative mb-3 last:mb-0">
                <div className="absolute -left-3 top-1.5 w-2 h-2 bg-[#0050B3] flex-shrink-0" />
                <p className="text-[11px] font-semibold text-[#0050B3]">{story.publisher}</p>
                <p className="text-[11px] text-[#6B7280]">{timeSince(story.publishedAt)}</p>
                <p className="text-[11px] text-[#333333] leading-snug line-clamp-1">{story.headline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-bold text-[#9AA5B4] uppercase tracking-wide mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  disabled={!action.active}
                  onClick={() => action.active && action.label === "Create Brief" && onCreateBrief(gap.topic)}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 border text-[12px] font-semibold transition-colors
                    ${action.active
                      ? "border-[#0050B3] bg-[#EEF4FF] text-[#0050B3] hover:bg-[#0050B3] hover:text-white"
                      : "border-[#E2E6ED] bg-[#F5F6F8] text-[#9AA5B4] cursor-not-allowed"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
