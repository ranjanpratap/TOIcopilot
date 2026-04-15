"use client";

import { useState, useRef } from "react";
import { Copy, Check, Edit3, RefreshCw, FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { NewsBody } from "@/types/news-brief";

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2.5 py-1 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] text-[11px] text-[#6B7280] transition-colors"
    >
      {copied ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ArticleSection({ label, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#F0F2F5] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#FAFBFC] transition-colors"
      >
        <span className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-widest">{label}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#9AA5B4]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9AA5B4]" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

interface Props {
  body: NewsBody;
  loading?: boolean;
  onRegenerate?: () => void;
}

export default function ArticleOutput({ body, loading, onRegenerate }: Props) {
  const [editMode, setEditMode] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const fullText = [
    body.intro,
    "\n\nKEY DEVELOPMENTS\n" + body.keyDevelopments.map((d) => `• ${d}`).join("\n"),
    "\n\nBACKGROUND\n" + body.background,
    "\n\nQUOTES\n" + body.quotes.join("\n\n"),
    "\n\nCLOSING CONTEXT\n" + body.closingContext,
  ].join("\n\n");

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E6ED]">
        <div className="px-5 py-3.5 border-b border-[#E2E6ED]">
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`skeleton h-3 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0050B3]" />
          <div>
            <h3 className="font-bold text-[#333333] text-[14px]">Generated News Body</h3>
            <p className="text-[11px] text-[#9AA5B4]">Full structured article — edit inline or copy to your CMS</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 px-2.5 py-1 border text-[11px] font-semibold transition-colors ${
              editMode
                ? "border-[#0050B3] bg-[#EEF4FF] text-[#0050B3]"
                : "border-[#E2E6ED] bg-white text-[#6B7280] hover:bg-[#F5F6F8]"
            }`}
          >
            <Edit3 className="w-3 h-3" />
            {editMode ? "Done Editing" : "Edit Inline"}
          </button>
          <CopyBlock text={fullText} />
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1 px-2.5 py-1 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] text-[11px] text-[#6B7280] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Word count ribbon */}
      <div className="px-5 py-2 border-b border-[#F0F2F5] bg-[#FAFBFC] flex items-center gap-3 text-[10px] text-[#9AA5B4]">
        <span>~{Math.round(fullText.split(/\s+/).length)} words</span>
        <span>·</span>
        <span>~{Math.ceil(fullText.split(/\s+/).length / 200)} min read</span>
        <span>·</span>
        <span className={`font-medium ${editMode ? "text-[#0050B3]" : ""}`}>
          {editMode ? "Edit mode active — click text to edit" : "Read-only mode"}
        </span>
      </div>

      {/* Article sections */}
      <div ref={articleRef}>
        <ArticleSection label="Introduction" defaultOpen>
          <p
            contentEditable={editMode}
            suppressContentEditableWarning
            className={`text-[13px] text-[#333333] leading-relaxed ${editMode ? "border border-dashed border-[#0050B3] px-2 py-1 focus:outline-none" : ""}`}
          >
            {body.intro}
          </p>
        </ArticleSection>

        <ArticleSection label="Key Developments">
          <ul className="space-y-2.5">
            {body.keyDevelopments.map((dev, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 bg-[#E21B22]" />
                <p
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  className={`text-[13px] text-[#333333] leading-relaxed flex-1 ${editMode ? "border border-dashed border-[#0050B3] px-2 py-1 focus:outline-none" : ""}`}
                >
                  {dev}
                </p>
              </li>
            ))}
          </ul>
        </ArticleSection>

        <ArticleSection label="Background" defaultOpen={false}>
          <p
            contentEditable={editMode}
            suppressContentEditableWarning
            className={`text-[13px] text-[#333333] leading-relaxed ${editMode ? "border border-dashed border-[#0050B3] px-2 py-1 focus:outline-none" : ""}`}
          >
            {body.background}
          </p>
        </ArticleSection>

        <ArticleSection label="Quotes" defaultOpen={false}>
          <div className="space-y-3">
            {body.quotes.map((q, i) => (
              <blockquote
                key={i}
                contentEditable={editMode}
                suppressContentEditableWarning
                className={`border-l-4 border-[#0050B3] pl-3 text-[13px] text-[#333333] italic leading-relaxed ${editMode ? "focus:outline-none" : ""}`}
              >
                {q}
              </blockquote>
            ))}
          </div>
        </ArticleSection>

        <ArticleSection label="Closing Context" defaultOpen={false}>
          <p
            contentEditable={editMode}
            suppressContentEditableWarning
            className={`text-[13px] text-[#333333] leading-relaxed ${editMode ? "border border-dashed border-[#0050B3] px-2 py-1 focus:outline-none" : ""}`}
          >
            {body.closingContext}
          </p>
        </ArticleSection>
      </div>
    </div>
  );
}
