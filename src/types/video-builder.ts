export type VideoFormat = "instagram-reel" | "youtube-short" | "website-video";
export type VoiceStyle = "neutral" | "female" | "male";
export type CaptionStyle = "breaking-news" | "bold-headline" | "minimal-subtitle" | "explainer";
export type GenerationStage =
  | "idle"
  | "analyzing"
  | "scripting"
  | "narrating"
  | "scenes"
  | "rendering"
  | "done"
  | "error";

export interface VideoScene {
  id: number;
  type: "hook" | "event" | "facts" | "context" | "conclusion";
  duration: number; // seconds
  headline: string;
  description: string;
  visualKeywords: string[];
  captionText: string;
  narration: string;
}

export interface VideoScript {
  headline: string;
  brief: string;
  keyFacts: string[];
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
    topics: string[];
  };
  hook: string;
  event: string;
  facts: string;
  conclusion: string;
  fullNarration: string;
  totalDuration: number;
  scenes: VideoScene[];
  visualKeywords: string[];
}

export interface GeneratedVideo {
  script: VideoScript;
  format: VideoFormat;
  voiceStyle: VoiceStyle;
  captionStyle: CaptionStyle;
  generatedAt: string;
  /** base64 data URL (audio/mpeg) for the full narration — from ElevenLabs */
  narrationAudio?: string;
  /** The exact text sent to ElevenLabs — hook + event + facts + conclusion */
  narrationScript?: string;
  /** Per-scene background images (base64 data URLs). Index matches scene order. */
  sceneImages?: (string | null)[];
  /** Number of editor-uploaded assets that were integrated */
  uploadedAssetCount?: number;
}

export interface AnalyzeRequest {
  content: string;
  customHeadline?: string;
}

export interface GenerateVideoRequest {
  script: VideoScript;
  format: VideoFormat;
  voiceStyle: VoiceStyle;
  captionStyle: CaptionStyle;
  assets?: { name: string; type: "clip" | "image"; preview?: string }[];
}

export interface UploadedAsset {
  id: string;
  name: string;
  type: "clip" | "image";
  size: number;
  preview?: string; // data URL for images
}
