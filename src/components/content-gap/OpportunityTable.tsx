"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ExternalLink, FileText, Eye } from "lucide-react";
import type { ContentGap } from "@/types/content-gap";

interface Props {
  gaps: ContentGap[];
  selectedId: string | null;
  onSelect: (gap: ContentGap) => void;
  onCreateBrief: (topic: string) => void;
  loading: boolean;
}

type SortKey = "score" | "freshness" | "competitors";
type SortDir = "asc" | "desc";

const CATEGORIES = ["All", "Politics", "Business", "Technology", "Sports", "International", "Health", "Entertainment", "General"];

function ScoreBadge({ score }: { score: number }) {
  const [bg, fg] =
    score >= 90 ? ["#FEE2E2", "#C41519"] :
    score >= 70 ? ["#FFF0E6", "#C2410C"] :
    score >= 50 ? ["#FEF9C3", "#92400E"] :
                  ["#F5F6F8", "#6B7280"];
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-7 text-[13px] font-bold flex-shrink-0"
      style={{ backgroundColor: bg, color: fg }}
    >
      {score}
    </span>
  );
}

function ScorePriorityBar({ score }: { score: number }) {
  const color = score >= 90 ? "#E21B22" : score >= 70 ? "#EA580C" : score >= 50 ? "#D97706" : "#9AA5B4";
  return (
    <div className="w-full h-1 bg-[#E2E6ED] mt-1.5">
      <div style={{ width: `${score}%`, backgroundColor: color }} className="h-full transition-all" />
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, [string, string]> = {
    Politics:      ["#EEF4FF", "#0050B3"],
    Business:      ["#ECFDF5", "#059669"],
    Technology:    ["#F5F0FF", "#7C3AED"],
    Sports:        ["#FFF7ED", "#EA580C"],
    International: ["#FEF9C3", "#92400E"],
    Health:        ["#FCE7F3", "#BE185D"],
    Entertainment: ["#FFF0F0", "#E21B22"],
  };
  const [bg, fg] = colors[category] ?? ["#F5F6F8", "#6B7280"];
  return (
    <span
      className="inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: bg, color: fg }}
    >
      {category}
    </span>
  );
}

function SortHeader({
  label, sortKey, current, direction, onSort,
}: {
  label: string; sortKey: SortKey; current: SortKey; direction: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-[11px] font-semibold text-[#9AA5B4] uppercase tracking-wide hover:text-[#333333] transition-colors"
    >
      {label}
      {active ? (
        direction === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-[#E2E6ED] flex items-center gap-4">
          <div className="skeleton w-10 h-7 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-3 w-3/4" />
            <div className="skeleton h-2.5 w-1/2" />
          </div>
          <div className="skeleton w-16 h-6 flex-shrink-0" />
          <div className="skeleton w-20 h-6 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function OpportunityTable({ gaps, selectedId, onSelect, onCreateBrief, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [category, setCategory] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [search, setSearch] = useState("");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = useMemo(() => {
    let list = [...gaps];
    if (category !== "All") list = list.filter((g) => g.category === category);
    if (minScore > 0) list = list.filter((g) => g.opportunityScore >= minScore);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) =>
        g.topic.toLowerCase().includes(q) ||
        g.competitors.some((c) => c.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === "score")       { av = a.opportunityScore;    bv = b.opportunityScore; }
      if (sortKey === "freshness")   { av = b.publishedAtMs;       bv = a.publishedAtMs; }
      if (sortKey === "competitors") { av = a.competitors.length;  bv = b.competitors.length; }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return list;
  }, [gaps, category, minScore, search, sortKey, sortDir]);

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Table header toolbar */}
      <div className="px-4 py-3 border-b border-[#E2E6ED] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#333333]">Story Opportunities</h2>
          <span className="text-[11px] text-[#9AA5B4]">
            {filtered.length} gap{filtered.length !== 1 ? "s" : ""} detected
          </span>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Filter by topic or publisher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 px-2.5 border border-[#E2E6ED] bg-[#F5F6F8] text-[12px] placeholder:text-[#9AA5B4] focus:outline-none focus:border-[#0050B3] w-52"
          />

          {/* Min score quick filter */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="h-7 px-2 border border-[#E2E6ED] bg-white text-[12px] text-[#333333] focus:outline-none cursor-pointer"
          >
            <option value={0}>All scores</option>
            <option value={70}>Score ≥ 70</option>
            <option value={80}>Score ≥ 80</option>
            <option value={90}>Score ≥ 90</option>
          </select>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
                  category === cat
                    ? "bg-[#0050B3] border-[#0050B3] text-white"
                    : "bg-white border-[#E2E6ED] text-[#6B7280] hover:border-[#0050B3] hover:text-[#0050B3]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend row */}
      <div className="hidden lg:grid grid-cols-[36px_1fr_96px_160px_80px_90px_130px] gap-4 px-4 py-2 border-b border-[#E2E6ED] bg-[#F5F6F8]">
        <div />
        <span className="text-[11px] font-semibold text-[#9AA5B4] uppercase tracking-wide">Topic</span>
        <SortHeader label="Score"       sortKey="score"       current={sortKey} direction={sortDir} onSort={handleSort} />
        <SortHeader label="Competitors" sortKey="competitors" current={sortKey} direction={sortDir} onSort={handleSort} />
        <SortHeader label="Trend"       sortKey="score"       current={sortKey} direction={sortDir} onSort={handleSort} />
        <SortHeader label="Freshness"   sortKey="freshness"   current={sortKey} direction={sortDir} onSort={handleSort} />
        <span className="text-[11px] font-semibold text-[#9AA5B4] uppercase tracking-wide">Actions</span>
      </div>

      {/* Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[14px] font-semibold text-[#333333] mb-1">No gaps found</p>
          <p className="text-[12px] text-[#9AA5B4]">Try adjusting your filters or wait for the next scan.</p>
        </div>
      ) : (
        <div>
          {filtered.map((gap, idx) => {
            const isSelected = gap.id === selectedId;
            return (
              <div
                key={gap.id}
                onClick={() => onSelect(gap)}
                className={`
                  group cursor-pointer border-b border-[#E2E6ED] transition-colors
                  ${isSelected ? "bg-[#EEF4FF] border-l-2 border-l-[#0050B3]" : "hover:bg-[#F5F6F8]"}
                `}
              >
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-[36px_1fr_96px_160px_80px_90px_130px] gap-4 px-4 py-3 items-center">
                  {/* Rank */}
                  <span className="text-[12px] font-bold text-[#9AA5B4]">{idx + 1}</span>

                  {/* Topic + category */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#333333] leading-snug line-clamp-2">{gap.topic}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <CategoryBadge category={gap.category} />
                      {gap.entities.slice(0, 2).map((e) => (
                        <span key={e} className="text-[10px] text-[#9AA5B4]">#{e}</span>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <div>
                    <ScoreBadge score={gap.opportunityScore} />
                    <ScorePriorityBar score={gap.opportunityScore} />
                  </div>

                  {/* Competitors */}
                  <div className="flex flex-wrap gap-1">
                    {gap.competitors.slice(0, 3).map((c) => (
                      <span key={c} className="px-1.5 py-0.5 bg-[#F5F6F8] border border-[#E2E6ED] text-[10px] text-[#6B7280] font-medium truncate max-w-[70px]">
                        {c}
                      </span>
                    ))}
                    {gap.competitors.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-[#F5F6F8] border border-[#E2E6ED] text-[10px] text-[#9AA5B4]">
                        +{gap.competitors.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Trend */}
                  <span className="text-[12px] font-semibold text-[#059669]">+{gap.searchTrendDelta}%</span>

                  {/* Freshness */}
                  <span className="text-[12px] text-[#6B7280]">{gap.freshness}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onCreateBrief(gap.topic)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#0050B3] hover:bg-[#003D8C] text-white text-[11px] font-semibold transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Brief
                    </button>
                    <button
                      onClick={() => onSelect(gap)}
                      className="flex items-center gap-1 px-2 py-1 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] text-[11px] text-[#6B7280] transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="lg:hidden px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-[#9AA5B4] mt-0.5 flex-shrink-0">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#333333] leading-snug">{gap.topic}</p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <CategoryBadge category={gap.category} />
                          <span className="text-[11px] text-[#6B7280]">{gap.freshness}</span>
                          <span className="text-[11px] font-semibold text-[#059669]">+{gap.searchTrendDelta}%</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {gap.competitors.slice(0, 3).map((c) => (
                            <span key={c} className="px-1.5 py-0.5 bg-[#F5F6F8] border border-[#E2E6ED] text-[10px] text-[#6B7280]">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ScoreBadge score={gap.opportunityScore} />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onCreateBrief(gap.topic)}
                      className="flex items-center gap-1 px-3 py-1 bg-[#0050B3] hover:bg-[#003D8C] text-white text-[11px] font-semibold transition-colors"
                    >
                      <FileText className="w-3 h-3" /> Create Brief
                    </button>
                    <button
                      onClick={() => onSelect(gap)}
                      className="flex items-center gap-1 px-3 py-1 border border-[#E2E6ED] bg-white text-[11px] text-[#6B7280] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
