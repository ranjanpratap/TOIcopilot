"use client";

import { Globe, Activity, BookOpen, Zap, Clock } from "lucide-react";
import type { MonitoringStats } from "@/types/content-gap";

interface Props {
  stats: MonitoringStats;
  lastRefreshed: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}

const CARDS = [
  {
    key: "competitorsTracked",
    label: "Competitors Tracked",
    icon: Globe,
    iconColor: "#0050B3",
    iconBg: "#EEF4FF",
  },
  {
    key: "storiesScannedToday",
    label: "Stories Scanned Today",
    icon: Activity,
    iconColor: "#7C3AED",
    iconBg: "#F5F0FF",
  },
  {
    key: "toiStoriesIndexed",
    label: "TOI Stories Indexed",
    icon: BookOpen,
    iconColor: "#059669",
    iconBg: "#ECFDF5",
  },
  {
    key: "activeOpportunities",
    label: "Active Opportunities",
    icon: Zap,
    iconColor: "#E21B22",
    iconBg: "#FEE2E2",
  },
] as const;

export default function MonitoringOverview({ stats, lastRefreshed, refreshing, onRefresh }: Props) {
  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75 rounded-full" />
              <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full" />
            </span>
            <span className="text-[12px] font-semibold text-[#059669]">Live Monitoring Active</span>
          </div>
          {refreshing && (
            <span className="text-[11px] text-[#9AA5B4] flex items-center gap-1">
              <span className="w-3 h-3 border border-[#9AA5B4] border-t-transparent rounded-full animate-spin inline-block" />
              Refreshing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9AA5B4]">
              <Clock className="w-3 h-3" />
              Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-2.5 py-1 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] text-[11px] text-[#6B7280] transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const val = stats[card.key] as number;
          return (
            <div key={card.key} className="bg-white border border-[#E2E6ED] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-[#9AA5B4] uppercase tracking-wide font-medium mb-2 leading-tight">
                    {card.label}
                  </p>
                  <p className="text-[28px] font-bold text-[#333333] leading-none">
                    {val.toLocaleString()}
                  </p>
                </div>
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
