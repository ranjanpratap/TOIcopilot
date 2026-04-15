export interface HeadlineItem {
  text: string;
  seoScore: number;
  ctrPrediction: string;
  type: "SEO" | "Breaking" | "Explainer" | "High CTR" | "Analysis" | "Balanced";
  isRecommended?: boolean;
}

export interface NewsBody {
  intro: string;
  keyDevelopments: string[];
  background: string;
  quotes: string[];
  closingContext: string;
}

export interface SEOData {
  primaryKeyword: string;
  supportingKeywords: string[];
  relatedPhrases: string[];
  metaDescription: string;
  slug: string;
}

export interface AngleItem {
  name: string;
  description: string;
  targetAudience: string;
  trafficPotential: "Very High" | "High" | "Moderate" | "Low";
  reason: string;
}

export interface HeatScoreData {
  score: number;
  breakdown: {
    searchDemand: number;
    socialBuzz: number;
    competitorCoverage: number;
    freshness: number;
    videoPotential: number;
  };
  status: "Viral" | "Trending" | "Rising" | "Moderate" | "Low Priority";
  recommendation: string;
  category: string;
}

export interface CompetitorItem {
  publisher: string;
  headline: string;
  url: string;
  publishedAt: string;
  relevance: "High" | "Medium" | "Low";
  style: string;
}

export interface CompetitorMetrics {
  publishersFound: number;
  earliestPublisher: string;
  mostCommonAngle: string;
  coverageDensity: string;
}

export interface GenerationOptionsState {
  headlines: boolean;
  newsBody: boolean;
  newsImage: boolean;
  competitorCoverage: boolean;
  seoKeywords: boolean;
  newsAngles: boolean;
  heatScore: boolean;
}

export interface GenerateRequest {
  topic: string;
  content: string;
  style: string;
  options: GenerationOptionsState;
}

export interface GeneratedOutput {
  headlines?: HeadlineItem[];
  newsBody?: NewsBody;
  seoKeywords?: SEOData;
  newsAngles?: AngleItem[];
  heatScore?: HeatScoreData;
  competitors?: CompetitorItem[];
  competitorMetrics?: CompetitorMetrics;
  imagePrompt?: string;
  imageUrl?: string;
  imageSource?: "gemini" | "pollinations";
}
