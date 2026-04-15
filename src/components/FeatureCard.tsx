import { type LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string;
}

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  stats: Stat[];
  accentColor?: string;
  onClick?: () => void;
}

export default function FeatureCard({
  title,
  icon: Icon,
  stats,
  accentColor = "#0050B3",
  onClick,
}: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        bg-white border border-[#E2E6ED] p-5 cursor-pointer
        hover:border-[#0050B3] hover:shadow-md
        transition-all duration-200 group relative overflow-hidden
      "
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[13px] font-semibold text-[#333333] leading-tight">{title}</p>
        </div>
        <div
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[12px] text-[#6B7280] leading-none">{stat.label}</span>
            <span className="text-[13px] font-bold text-[#333333] leading-none">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Bottom action hint */}
      <div className="mt-5 pt-3 border-t border-[#F0F2F5]">
        <span
          className="text-[11px] font-semibold uppercase tracking-wide group-hover:underline"
          style={{ color: accentColor }}
        >
          Open Module →
        </span>
      </div>
    </div>
  );
}
