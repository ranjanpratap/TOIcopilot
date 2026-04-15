"use client";

import { useState } from "react";
import { Hash, Copy, Check, ExternalLink } from "lucide-react";
import type { SEOData } from "@/types/news-brief";

function Tag({ children, color = "#0050B3" }: { children: string; color?: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[11px] font-medium border"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}0D`, color }}
    >
      {children}
    </span>
  );
}

interface Props {
  seo: SEOData;
  loading?: boolean;
}

export default function SEOKeywords({ seo, loading }: Props) {
  const [copied, setCopied] = useState(false);

  const fullPack = [
    `Primary Keyword: ${seo.primaryKeyword}`,
    `Supporting Keywords: ${seo.supportingKeywords.join(", ")}`,
    `Related Phrases: ${seo.relatedPhrases.join(", ")}`,
    `Meta Description: ${seo.metaDescription}`,
    `Article Slug: /${seo.slug}`,
  ].join("\n\n");

  const copyAll = async () => {
    await navigator.clipboard.writeText(fullPack);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E6ED] p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`skeleton h-3 ${i % 2 === 0 ? "w-full" : "w-2/3"}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-[#059669]" />
          <div>
            <h3 className="font-bold text-[#333333] text-[14px]">SEO Keywords</h3>
            <p className="text-[11px] text-[#9AA5B4]">Optimised for organic search and Google News indexing</p>
          </div>
        </div>
        <button
          onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-semibold transition-colors"
        >
          {copied
            ? <><Check className="w-3 h-3" /> Copied!</>
            : <><Copy className="w-3 h-3" /> Copy SEO Pack</>
          }
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Primary keyword */}
        <div>
          <label className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-2 block">
            Primary Keyword
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F0FDF4] border border-green-200">
            <Hash className="w-3.5 h-3.5 text-[#059669]" />
            <span className="text-[13px] font-bold text-[#059669]">{seo.primaryKeyword}</span>
          </div>
        </div>

        {/* Supporting keywords */}
        <div>
          <label className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-2 block">
            Supporting Keywords
          </label>
          <div className="flex flex-wrap gap-1.5">
            {seo.supportingKeywords.map((kw) => (
              <Tag key={kw} color="#0050B3">{kw}</Tag>
            ))}
          </div>
        </div>

        {/* Related phrases */}
        <div>
          <label className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-2 block">
            Related Search Phrases
          </label>
          <div className="flex flex-wrap gap-1.5">
            {seo.relatedPhrases.map((phrase) => (
              <Tag key={phrase} color="#6B7280">{phrase}</Tag>
            ))}
          </div>
        </div>

        {/* Meta description */}
        <div>
          <label className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-2 block">
            Meta Description
          </label>
          <div className="border border-[#E2E6ED] p-3 bg-[#FAFBFC]">
            <p className="text-[12px] text-[#333333] leading-relaxed">{seo.metaDescription}</p>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-[10px] ${seo.metaDescription.length > 155 ? "text-[#E21B22]" : "text-[#9AA5B4]"}`}>
                {seo.metaDescription.length} / 160 chars
              </span>
              <div className="w-24 h-1 bg-[#E2E6ED]">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min((seo.metaDescription.length / 160) * 100, 100)}%`,
                    backgroundColor: seo.metaDescription.length > 155 ? "#E21B22" : "#059669",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Slug */}
        <div>
          <label className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest mb-2 block">
            Suggested Article Slug
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F6F8] border border-[#E2E6ED] font-mono">
            <ExternalLink className="w-3.5 h-3.5 text-[#9AA5B4] flex-shrink-0" />
            <span className="text-[12px] text-[#333333]">timesofindia.com/india/<span className="text-[#0050B3] font-bold">{seo.slug}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
