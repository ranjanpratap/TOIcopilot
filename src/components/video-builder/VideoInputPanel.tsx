"use client";

import { FileText, Scan, X } from "lucide-react";

const MAX_CHARS = 20_000;

interface Props {
  content: string;
  customHeadline: string;
  onContentChange: (v: string) => void;
  onHeadlineChange: (v: string) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  analyzed: boolean;
}

export default function VideoInputPanel({
  content,
  customHeadline,
  onContentChange,
  onHeadlineChange,
  onAnalyze,
  analyzing,
  analyzed,
}: Props) {
  const charCount = content.length;
  const pct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const overLimit = charCount > MAX_CHARS;

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#0050B3]" />
        <h2 className="text-[13px] font-bold text-[#333333]">News Article Input</h2>
        {analyzed && (
          <span className="ml-auto px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold">
            ANALYSED
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Article content */}
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] mb-1.5">
            Paste Article or News Story
          </label>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Paste the news article or story here. The AI will extract the headline, key facts, entities, and generate a professional video script automatically."
            rows={10}
            className="w-full resize-none border border-[#E2E6ED] px-3 py-2.5 text-[13px] text-[#333333] placeholder-[#C5CBD3] focus:outline-none focus:border-[#0050B3] transition-colors leading-relaxed"
          />
          {/* Character meter */}
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="flex-1 h-1 bg-[#F5F6F8] overflow-hidden">
              <div
                className={`h-full transition-all ${overLimit ? "bg-[#E21B22]" : pct > 80 ? "bg-[#D97706]" : "bg-[#0050B3]"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-[10px] font-medium flex-shrink-0 ${overLimit ? "text-[#E21B22]" : "text-[#9AA5B4]"}`}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Custom headline */}
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] mb-1.5">
            Custom Video Headline{" "}
            <span className="font-normal text-[#9AA5B4]">(optional — auto-extracted if blank)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={customHeadline}
              onChange={(e) => onHeadlineChange(e.target.value)}
              placeholder="e.g. Government Announces EV Subsidy Plan"
              className="w-full border border-[#E2E6ED] px-3 py-2.5 text-[13px] text-[#333333] placeholder-[#C5CBD3] focus:outline-none focus:border-[#0050B3] transition-colors pr-8"
            />
            {customHeadline && (
              <button
                onClick={() => onHeadlineChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA5B4] hover:text-[#333333] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Analyse button */}
        <button
          onClick={onAnalyze}
          disabled={!content.trim() || analyzing}
          className="
            w-full h-10 flex items-center justify-center gap-2
            bg-[#0050B3] hover:bg-[#003D8C] text-white text-[13px] font-bold
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {analyzing ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing Article...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              {analyzed ? "Re-analyse Article" : "Analyse Article"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
