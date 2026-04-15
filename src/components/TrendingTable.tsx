"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  TrendingUp,
  Filter,
  FileText,
  Search,
  ShieldCheck,
  Video,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Category = "All" | "Politics" | "Sports" | "Entertainment" | "Business" | "Technology" | "International";
type TimeFilter = "Last 1 hour" | "Last 6 hours" | "Last 24 hours";
type Status = "Breaking" | "Rising" | "Trending" | "Monitoring";

interface TrendingTopic {
  id: number;
  topic: string;
  trendScore: number;
  googleSearch: string;
  youtubeViews: string;
  instagramReach: string;
  xMentions: string;
  competitorCoverage: string;
  category: Exclude<Category, "All">;
  status: Status;
}

const TOPICS: TrendingTopic[] = [
  {
    id: 1,
    topic: "IPL Match Fixing Rumour",
    trendScore: 92,
    googleSearch: "+230%",
    youtubeViews: "1.2M",
    instagramReach: "540K",
    xMentions: "18K",
    competitorCoverage: "7 publishers",
    category: "Sports",
    status: "Breaking",
  },
  {
    id: 2,
    topic: "Supreme Court on Electoral Bonds",
    trendScore: 88,
    googleSearch: "+180%",
    youtubeViews: "890K",
    instagramReach: "320K",
    xMentions: "14K",
    competitorCoverage: "9 publishers",
    category: "Politics",
    status: "Rising",
  },
  {
    id: 3,
    topic: "India EV Policy 2025 Update",
    trendScore: 81,
    googleSearch: "+145%",
    youtubeViews: "640K",
    instagramReach: "210K",
    xMentions: "9.2K",
    competitorCoverage: "5 publishers",
    category: "Business",
    status: "Trending",
  },
  {
    id: 4,
    topic: "Bollywood Box Office Record",
    trendScore: 76,
    googleSearch: "+120%",
    youtubeViews: "1.8M",
    instagramReach: "890K",
    xMentions: "22K",
    competitorCoverage: "11 publishers",
    category: "Entertainment",
    status: "Trending",
  },
  {
    id: 5,
    topic: "RBI Interest Rate Decision",
    trendScore: 73,
    googleSearch: "+98%",
    youtubeViews: "430K",
    instagramReach: "140K",
    xMentions: "7.8K",
    competitorCoverage: "8 publishers",
    category: "Business",
    status: "Rising",
  },
  {
    id: 6,
    topic: "AI Regulation Bill India",
    trendScore: 69,
    googleSearch: "+87%",
    youtubeViews: "310K",
    instagramReach: "95K",
    xMentions: "5.4K",
    competitorCoverage: "4 publishers",
    category: "Technology",
    status: "Trending",
  },
  {
    id: 7,
    topic: "Pakistan Border Tensions",
    trendScore: 65,
    googleSearch: "+75%",
    youtubeViews: "520K",
    instagramReach: "180K",
    xMentions: "11K",
    competitorCoverage: "13 publishers",
    category: "International",
    status: "Monitoring",
  },
  {
    id: 8,
    topic: "Cricket World Cup Qualifier",
    trendScore: 61,
    googleSearch: "+64%",
    youtubeViews: "780K",
    instagramReach: "260K",
    xMentions: "8.9K",
    competitorCoverage: "6 publishers",
    category: "Sports",
    status: "Monitoring",
  },
];

const CATEGORIES: Category[] = ["All", "Politics", "Sports", "Entertainment", "Business", "Technology", "International"];
const TIME_FILTERS: TimeFilter[] = ["Last 1 hour", "Last 6 hours", "Last 24 hours"];

const statusConfig: Record<Status, { bg: string; text: string; dot: string }> = {
  Breaking: { bg: "bg-red-50", text: "text-[#E21B22]", dot: "bg-[#E21B22]" },
  Rising:   { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  Trending: { bg: "bg-blue-50", text: "text-[#0050B3]", dot: "bg-[#0050B3]" },
  Monitoring: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
};

function TrendScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "#E21B22" : score >= 70 ? "#F97316" : "#0050B3";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#E2E6ED] flex-shrink-0">
        <div
          className="h-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[13px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 10 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-3 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function TrendingTable() {
  const [category, setCategory] = useState<Category>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("Last 6 hours");
  const [loading] = useState(false);
  const [sortField, setSortField] = useState<"trendScore" | null>("trendScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = TOPICS.filter((t) => category === "All" || t.category === category).sort((a, b) => {
    if (!sortField) return 0;
    return sortDir === "desc" ? b[sortField] - a[sortField] : a[sortField] - b[sortField];
  });

  const toggleSort = (field: "trendScore") => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E6ED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E21B22]" />
            <h2 className="font-bold text-[#333333]">Real-Time Trending Topics</h2>
          </div>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Track stories gaining momentum across search, social, and publishers.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
          Live · Updated just now
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 border-b border-[#E2E6ED] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#9AA5B4]" />
          <span className="text-[11px] text-[#9AA5B4] uppercase tracking-wide font-medium">Filter</span>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                px-3 py-1 text-[11px] font-semibold transition-colors
                ${category === cat
                  ? "bg-[#0050B3] text-white"
                  : "bg-[#F5F6F8] text-[#6B7280] hover:bg-[#E8EDF5] hover:text-[#333333]"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Time filter */}
        <div className="ml-auto">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="h-7 px-2 pr-6 border border-[#E2E6ED] bg-white text-[12px] text-[#333333] focus:outline-none focus:border-[#0050B3] appearance-none cursor-pointer"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239AA5B4' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
          >
            {TIME_FILTERS.map((tf) => (
              <option key={tf}>{tf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F5F6F8] border-b border-[#E2E6ED]">
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] min-w-[180px]">
                Topic
              </th>
              <th
                className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] cursor-pointer hover:text-[#333333] select-none whitespace-nowrap"
                onClick={() => toggleSort("trendScore")}
              >
                <span className="flex items-center gap-1">
                  Trend Score
                  {sortField === "trendScore"
                    ? sortDir === "desc"
                      ? <ChevronDown className="w-3 h-3" />
                      : <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3 opacity-30" />
                  }
                </span>
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] whitespace-nowrap">Google Search</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] whitespace-nowrap">YT Views</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] whitespace-nowrap">IG Reach</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] whitespace-nowrap">X Mentions</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] whitespace-nowrap">Competitors</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px]">Category</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px]">Status</th>
              <th className="text-left px-4 py-2.5 font-semibold text-[#6B7280] uppercase tracking-wide text-[10px] min-w-[200px]">Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : filtered.map((topic) => {
                  const st = statusConfig[topic.status];
                  return (
                    <tr key={topic.id} className="trending-row border-b border-[#F0F2F5] last:border-0">
                      {/* Topic */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#333333] text-[13px] leading-tight">{topic.topic}</p>
                      </td>
                      {/* Trend Score */}
                      <td className="px-4 py-3">
                        <TrendScoreBar score={topic.trendScore} />
                      </td>
                      {/* Google */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">{topic.googleSearch}</span>
                      </td>
                      {/* YouTube */}
                      <td className="px-4 py-3 text-[#333333]">{topic.youtubeViews}</td>
                      {/* Instagram */}
                      <td className="px-4 py-3 text-[#333333]">{topic.instagramReach}</td>
                      {/* X Mentions */}
                      <td className="px-4 py-3 text-[#333333]">{topic.xMentions}</td>
                      {/* Competitors */}
                      <td className="px-4 py-3 text-[#6B7280]">{topic.competitorCoverage}</td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-medium text-[#6B7280] bg-[#F5F6F8] px-2 py-0.5">
                          {topic.category}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 ${st.dot} ${topic.status === "Breaking" ? "animate-pulse" : ""}`} />
                          {topic.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <ActionButton icon={FileText} label="Brief" color="#0050B3" />
                          <ActionButton icon={Search} label="Gap" color="#6B7280" />
                          <ActionButton icon={ShieldCheck} label="Fact" color="#6B7280" />
                          <ActionButton icon={Video} label="Video" color="#6B7280" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-5 py-3 border-t border-[#E2E6ED] flex items-center justify-between">
        <span className="text-[11px] text-[#9AA5B4]">
          Showing {filtered.length} of {TOPICS.length} trending topics
        </span>
        <button className="text-[11px] font-semibold text-[#0050B3] hover:underline">
          View all topics →
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  color,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
}) {
  return (
    <button
      className="flex items-center gap-1 px-2 py-1 border border-[#E2E6ED] bg-white hover:border-[#0050B3] hover:bg-[#EEF4FF] transition-colors group"
      title={label}
    >
      <Icon className="w-3 h-3" style={{ color }} />
      <span className="text-[10px] font-semibold text-[#6B7280] group-hover:text-[#0050B3]">{label}</span>
    </button>
  );
}
