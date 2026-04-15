export interface CompetitorStory {
  publisher: string;
  headline: string;
  url: string;
  publishedAt: string;
  description: string;
}

export interface TrendSignal {
  label: string;
  value: string;
  positive: boolean;
}

export interface ContentGap {
  id: string;
  topic: string;
  category: string;
  opportunityScore: number;
  competitors: string[];
  stories: CompetitorStory[];
  freshness: string;
  publishedAtMs: number;
  searchTrendDelta: number;
  entities: string[];
  trendSignals: TrendSignal[];
}

export interface MonitoringStats {
  competitorsTracked: number;
  storiesScannedToday: number;
  toiStoriesIndexed: number;
  activeOpportunities: number;
  lastRefreshed: string;
}

export interface ScanResult {
  gaps: ContentGap[];
  stats: MonitoringStats;
}
