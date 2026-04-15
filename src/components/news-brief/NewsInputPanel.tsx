"use client";

import { Tag, AlignLeft, ChevronDown } from "lucide-react";

const MAX_CHARS = 20_000;

const OUTPUT_STYLES = [
  "Breaking News",
  "Standard News Report",
  "Explainer",
  "SEO-focused Digital Story",
  "Short Bulletin",
] as const;

interface Props {
  topic: string;
  content: string;
  style: string;
  onTopicChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onStyleChange: (v: string) => void;
}

export default function NewsInputPanel({
  topic,
  content,
  style,
  onTopicChange,
  onContentChange,
  onStyleChange,
}: Props) {
  const remaining = MAX_CHARS - content.length;
  const pct = Math.round((content.length / MAX_CHARS) * 100);

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Card header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <AlignLeft className="w-4 h-4 text-[#0050B3]" />
        <span className="font-semibold text-[13px] text-[#333333]">News Input</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Event / Topic */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#333333] uppercase tracking-wide mb-1.5">
            <Tag className="w-3 h-3 text-[#0050B3]" />
            Event / Topic
            <span className="text-[#E21B22]">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Example: Supreme Court Electoral Bonds Verdict"
            className="w-full h-10 px-3 border border-[#E2E6ED] bg-white text-[13px] text-[#333333] placeholder:text-[#B0BAC9] focus:outline-none focus:border-[#0050B3] focus:ring-1 focus:ring-[#0050B3] transition-colors"
          />
        </div>

        {/* Raw News Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-[#333333] uppercase tracking-wide">
              Paste News Content / Event Details
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium ${pct > 90 ? "text-[#E21B22]" : "text-[#9AA5B4]"}`}>
                {content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
              </span>
              {/* Mini progress bar */}
              <div className="w-16 h-1 bg-[#E2E6ED]">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: pct > 90 ? "#E21B22" : pct > 70 ? "#F97316" : "#0050B3",
                  }}
                />
              </div>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value.slice(0, MAX_CHARS))}
            placeholder={
              "Paste wire copy, press release, reporter notes, social thread, or raw event details here.\n\nSupports up to 20,000 characters."
            }
            rows={10}
            className="w-full px-3 py-2.5 border border-[#E2E6ED] bg-white text-[13px] text-[#333333] placeholder:text-[#B0BAC9] focus:outline-none focus:border-[#0050B3] focus:ring-1 focus:ring-[#0050B3] resize-y transition-colors leading-relaxed font-[inherit] min-h-[200px]"
          />
          <p className="mt-1.5 text-[11px] text-[#9AA5B4]">
            Accepts: wire copy · press releases · reporter notes · social threads · translated content
          </p>
        </div>

        {/* Output Style */}
        <div>
          <label className="text-[11px] font-semibold text-[#333333] uppercase tracking-wide mb-1.5 block">
            Output Style
          </label>
          <div className="relative">
            <select
              value={style}
              onChange={(e) => onStyleChange(e.target.value)}
              className="w-full h-10 pl-3 pr-8 border border-[#E2E6ED] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#0050B3] appearance-none cursor-pointer"
            >
              {OUTPUT_STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA5B4] pointer-events-none" />
          </div>
          <p className="mt-1.5 text-[11px] text-[#9AA5B4]">
            Controls headline tone, article structure, and SEO keyword strategy.
          </p>
        </div>
      </div>
    </div>
  );
}
