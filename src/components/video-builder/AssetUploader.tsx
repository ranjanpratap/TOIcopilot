"use client";

import { useRef, useCallback } from "react";
import { Film, Image as ImageIcon, Upload, X, Paperclip } from "lucide-react";
import type { UploadedAsset } from "@/types/video-builder";

interface Props {
  assets: UploadedAsset[];
  onAdd: (assets: UploadedAsset[]) => void;
  onRemove: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetUploader({ assets, onAdd, onRemove }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newAssets: UploadedAsset[] = [];

      Array.from(files).forEach((file) => {
        const isClip  = /^video\//i.test(file.type);
        const isImage = /^image\//i.test(file.type);
        if (!isClip && !isImage) return;

        const asset: UploadedAsset = {
          id:   `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: isClip ? "clip" : "image",
          size: file.size,
        };

        if (isImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            asset.preview = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        newAssets.push(asset);
      });

      if (newAssets.length) onAdd(newAssets);
    },
    [onAdd],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="bg-white border border-[#E2E6ED]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6ED] flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-[#7C3AED]" />
        <h2 className="text-[13px] font-bold text-[#333333]">Optional Media Assets</h2>
        {assets.length > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-bold">
            {assets.length} FILE{assets.length !== 1 ? "S" : ""}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#E2E6ED] hover:border-[#0050B3] transition-colors cursor-pointer p-5 flex flex-col items-center gap-2 group"
        >
          <Upload className="w-6 h-6 text-[#9AA5B4] group-hover:text-[#0050B3] transition-colors" />
          <p className="text-[12px] font-semibold text-[#6B7280] group-hover:text-[#0050B3] transition-colors">
            Drop files here or click to browse
          </p>
          <div className="flex gap-4 text-[10px] text-[#9AA5B4]">
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3" /> MP4, MOV (clips)
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> JPG, PNG (images)
            </span>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/quicktime,image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Asset type info cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Film, label: "News Clips", hint: "Press conference, event footage", color: "#7C3AED", bg: "#EDE9FE" },
            { icon: ImageIcon, label: "Images", hint: "People, locations, products", color: "#0050B3", bg: "#EEF4FF" },
          ].map(({ icon: Icon, label, hint, color, bg }) => (
            <div key={label} className="border border-[#E2E6ED] p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-[11px] font-semibold text-[#333333]">{label}</span>
              </div>
              <p className="text-[10px] text-[#9AA5B4] leading-snug">{hint}</p>
            </div>
          ))}
        </div>

        {/* Uploaded asset list */}
        {assets.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#9AA5B4] uppercase tracking-wide">Uploaded Assets</p>
            {assets.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 p-2.5 border border-[#E2E6ED] group">
                {/* Thumbnail / icon */}
                {a.preview ? (
                  <img src={a.preview} alt={a.name} className="w-10 h-10 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-[#7C3AED]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#333333] truncate">{a.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 ${a.type === "clip" ? "bg-[#EDE9FE] text-[#7C3AED]" : "bg-[#EEF4FF] text-[#0050B3]"}`}>
                      {a.type === "clip" ? "CLIP" : "IMAGE"}
                    </span>
                    <span className="text-[10px] text-[#9AA5B4]">{formatBytes(a.size)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onRemove(a.id)}
                  className="w-6 h-6 flex items-center justify-center text-[#9AA5B4] hover:text-[#E21B22] hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {assets.length === 0 && (
          <p className="text-[11px] text-[#9AA5B4] text-center py-1">
            No assets uploaded — AI will generate contextual visuals automatically.
          </p>
        )}
      </div>
    </div>
  );
}
