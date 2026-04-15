"use client";

import { AlertTriangle, Globe, TrendingUp, Search, X } from "lucide-react";
import { useState } from "react";

type AlertSeverity = "critical" | "warning" | "info";

interface Alert {
  id: number;
  severity: AlertSeverity;
  icon: React.ElementType;
  title: string;
  description: string;
  timestamp: string;
  tag?: string;
}

const ALERTS: Alert[] = [
  {
    id: 1,
    severity: "critical",
    icon: Globe,
    title: "Coverage Gap Detected",
    description: 'Competitors covering "India EV Policy" but no TOI article detected. 5 publishers have published in the last 2 hours.',
    timestamp: "12 min ago",
    tag: "India EV Policy",
  },
  {
    id: 2,
    severity: "warning",
    icon: AlertTriangle,
    title: "Unverified Viral Claim",
    description: 'Viral claim on X about "Budget Leak" lacks any official source. High retweet velocity — fact-check recommended before publishing.',
    timestamp: "28 min ago",
    tag: "Misinformation Risk",
  },
  {
    id: 3,
    severity: "critical",
    icon: TrendingUp,
    title: "IPL Controversy Surging",
    description: "IPL match-fixing controversy is trending strongly on YouTube with 1.2M views. Breaking story opportunity — no TOI brief published yet.",
    timestamp: "41 min ago",
    tag: "IPL 2025",
  },
  {
    id: 4,
    severity: "info",
    icon: Search,
    title: "High Search Volume Alert",
    description: 'Google search interest for "Supreme Court Electoral Bonds" up +180% in last 3 hours. Multiple publisher angles available.',
    timestamp: "1 hr ago",
    tag: "Politics",
  },
  {
    id: 5,
    severity: "warning",
    icon: AlertTriangle,
    title: "Competitor Scoop Risk",
    description: 'Hindustan Times published 3 new articles on "Pakistan Border Tensions" in 1 hour. TOI has no coverage yet.',
    timestamp: "1.5 hr ago",
    tag: "International",
  },
];

const severityConfig: Record<AlertSeverity, {
  border: string;
  bg: string;
  dot: string;
  tagBg: string;
  tagText: string;
  label: string;
}> = {
  critical: {
    border: "border-l-[#E21B22]",
    bg: "bg-red-50/60",
    dot: "bg-[#E21B22] animate-pulse",
    tagBg: "bg-red-100",
    tagText: "text-[#E21B22]",
    label: "Critical",
  },
  warning: {
    border: "border-l-orange-400",
    bg: "bg-orange-50/60",
    dot: "bg-orange-400",
    tagBg: "bg-orange-100",
    tagText: "text-orange-600",
    label: "Warning",
  },
  info: {
    border: "border-l-[#0050B3]",
    bg: "bg-blue-50/60",
    dot: "bg-[#0050B3]",
    tagBg: "bg-blue-100",
    tagText: "text-[#0050B3]",
    label: "Info",
  },
};

export default function AlertPanel() {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visible = ALERTS.filter((a) => !dismissed.includes(a.id));

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E6ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#E21B22]" />
          </div>
          <h2 className="font-bold text-[#333333]">Editor Alerts</h2>
          {visible.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-[#E21B22] text-white text-[10px] font-bold">
              {visible.length}
            </span>
          )}
        </div>
        <button className="text-[11px] font-semibold text-[#0050B3] hover:underline">
          View all
        </button>
      </div>

      {/* Alert list */}
      <div className="divide-y divide-[#F0F2F5]">
        {visible.length === 0 ? (
          <div className="px-5 py-8 text-center text-[#9AA5B4] text-sm">
            No active alerts. All clear.
          </div>
        ) : (
          visible.map((alert) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`relative flex gap-3 px-5 py-4 border-l-4 ${cfg.border} ${cfg.bg} group`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="relative">
                    <alert.icon className="w-4 h-4 text-[#6B7280]" />
                    <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 ${cfg.dot}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#333333] leading-tight">{alert.title}</p>
                    <button
                      onClick={() => setDismissed([...dismissed, alert.id])}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#9AA5B4] hover:text-[#333333]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {alert.tag && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${cfg.tagBg} ${cfg.tagText}`}>
                        {alert.tag}
                      </span>
                    )}
                    <span className="text-[10px] text-[#9AA5B4]">{alert.timestamp}</span>
                    <button className="ml-auto text-[11px] font-semibold text-[#0050B3] hover:underline">
                      Take Action →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
