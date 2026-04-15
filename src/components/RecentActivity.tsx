"use client";

import {
  ShieldCheck,
  FileText,
  Video,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
} from "lucide-react";

type ActivityType = "fact-check" | "headline" | "video" | "trend" | "gap";

interface Activity {
  id: number;
  type: ActivityType;
  action: string;
  subject: string;
  user: string;
  timestamp: string;
  status: "completed" | "in-progress";
}

const ACTIVITIES: Activity[] = [
  {
    id: 1,
    type: "fact-check",
    action: "Fact check completed",
    subject: "Fuel Price Hike Claims",
    user: "Pratap",
    timestamp: "8 min ago",
    status: "completed",
  },
  {
    id: 2,
    type: "headline",
    action: "Headline suggestions generated",
    subject: "Supreme Court Verdict on Electoral Bonds",
    user: "Pratap",
    timestamp: "22 min ago",
    status: "completed",
  },
  {
    id: 3,
    type: "video",
    action: "Short video storyboard created",
    subject: "IPL Controversy - Match Fixing Allegations",
    user: "Pratap",
    timestamp: "45 min ago",
    status: "completed",
  },
  {
    id: 4,
    type: "trend",
    action: "Trend analysis run",
    subject: "India EV Policy 2025",
    user: "Pratap",
    timestamp: "1 hr ago",
    status: "completed",
  },
  {
    id: 5,
    type: "gap",
    action: "Content gap analysis",
    subject: "RBI Interest Rate Coverage vs Competitors",
    user: "Pratap",
    timestamp: "2 hr ago",
    status: "completed",
  },
  {
    id: 6,
    type: "fact-check",
    action: "Fact check in progress",
    subject: "Budget Leak Viral Claim",
    user: "Pratap",
    timestamp: "2.5 hr ago",
    status: "in-progress",
  },
];

const typeConfig: Record<ActivityType, {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
}> = {
  "fact-check": { icon: ShieldCheck, iconBg: "bg-green-100", iconColor: "text-green-600", label: "Fact Check" },
  "headline":   { icon: FileText,   iconBg: "bg-blue-100",  iconColor: "text-[#0050B3]",  label: "Headline" },
  "video":      { icon: Video,      iconBg: "bg-purple-100",iconColor: "text-purple-600",  label: "Video" },
  "trend":      { icon: TrendingUp, iconBg: "bg-orange-100",iconColor: "text-orange-600",  label: "Trend" },
  "gap":        { icon: Search,     iconBg: "bg-gray-100",  iconColor: "text-gray-600",    label: "Content Gap" },
};

export default function RecentActivity() {
  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E6ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0050B3]" />
          <h2 className="font-bold text-[#333333]">Recent Activity</h2>
        </div>
        <button className="text-[11px] font-semibold text-[#0050B3] hover:underline">
          View all
        </button>
      </div>

      {/* Activity feed */}
      <div className="divide-y divide-[#F0F2F5]">
        {ACTIVITIES.map((activity) => {
          const cfg = typeConfig[activity.type];
          return (
            <div key={activity.id} className="flex gap-3 px-5 py-3.5 hover:bg-[#FAFBFC] transition-colors">
              {/* Icon */}
              <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center ${cfg.iconBg}`}>
                <cfg.icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[12px] text-[#6B7280]">{activity.action} · </span>
                    <span className="text-[12px] font-semibold text-[#333333]">{activity.subject}</span>
                  </div>
                  {activity.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-orange-400 animate-pulse" />
                      <span className="text-[10px] text-orange-500 font-medium">In progress</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${cfg.iconBg} ${cfg.iconColor}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-[#9AA5B4]">by {activity.user}</span>
                  <span className="text-[10px] text-[#9AA5B4]">·</span>
                  <span className="text-[10px] text-[#9AA5B4]">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#E2E6ED]">
        <button className="w-full text-center text-[11px] font-semibold text-[#0050B3] hover:underline">
          Load more activity →
        </button>
      </div>
    </div>
  );
}
