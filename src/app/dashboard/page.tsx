import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import TrendingTable from "@/components/TrendingTable";
import AlertPanel from "@/components/AlertPanel";
import RecentActivity from "@/components/RecentActivity";
import {
  Newspaper,
  Search,
  ShieldCheck,
  Video,
  RefreshCw,
  BarChart3,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    title: "AI News Brief + Headline Optimizer",
    icon: Newspaper,
    accentColor: "#0050B3",
    href: "/dashboard/news-brief",
    stats: [
      { label: "Stories analyzed today", value: "24" },
      { label: "Avg CTR score", value: "78%" },
      { label: "Headlines generated", value: "116" },
    ],
  },
  {
    title: "Content Gap Detector",
    icon: Search,
    accentColor: "#7C3AED",
    href: null,
    stats: [
      { label: "Missed stories", value: "8" },
      { label: "Competitors tracked", value: "12" },
      { label: "High opportunity alerts", value: "3" },
    ],
  },
  {
    title: "Fact Checker",
    icon: ShieldCheck,
    accentColor: "#059669",
    href: null,
    stats: [
      { label: "Articles verified", value: "19" },
      { label: "Risk flags", value: "5" },
      { label: "Avg credibility score", value: "84%" },
    ],
  },
  {
    title: "Short News Video Builder",
    icon: Video,
    accentColor: "#E21B22",
    href: null,
    stats: [
      { label: "Videos created", value: "7" },
      { label: "Avg generation time", value: "2.4 min" },
      { label: "Exports ready", value: "5" },
    ],
  },
];

export default function DashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="px-6 py-5 space-y-6 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-bold text-[#333333]" style={{ fontSize: "22px" }}>
            Newsroom Intelligence Dashboard
          </h1>
          <p className="text-[12px] text-[#9AA5B4] mt-0.5">
            {dateStr} · {timeStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pulse indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E6ED] text-[11px] text-[#6B7280]">
            <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
            Live Data Active
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E6ED] text-[11px] text-[#6B7280] hover:bg-[#F5F6F8] transition-colors">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E6ED] text-[11px] text-[#6B7280] hover:bg-[#F5F6F8] transition-colors">
            <BarChart3 className="w-3 h-3" />
            Reports
          </button>
        </div>
      </div>

      {/* Feature Summary Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-[#9AA5B4] uppercase tracking-widest">
            Module Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURE_CARDS.map((card) =>
            card.href ? (
              <Link key={card.title} href={card.href} className="block">
                <FeatureCard
                  title={card.title}
                  icon={card.icon}
                  stats={card.stats}
                  accentColor={card.accentColor}
                />
              </Link>
            ) : (
              <FeatureCard
                key={card.title}
                title={card.title}
                icon={card.icon}
                stats={card.stats}
                accentColor={card.accentColor}
              />
            )
          )}
        </div>
      </section>

      {/* Trending Topics Table */}
      <section>
        <TrendingTable />
      </section>

      {/* Bottom row: Alerts + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
        <AlertPanel />
        <RecentActivity />
      </section>
    </div>
  );
}
