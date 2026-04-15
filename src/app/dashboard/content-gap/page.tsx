"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";

import MonitoringOverview from "@/components/content-gap/MonitoringOverview";
import OpportunityTable from "@/components/content-gap/OpportunityTable";
import OpportunityDetail from "@/components/content-gap/OpportunityDetail";

import type { ContentGap, ScanResult } from "@/types/content-gap";

const EMPTY_STATS = {
  competitorsTracked: 10,
  storiesScannedToday: 0,
  toiStoriesIndexed: 0,
  activeOpportunities: 0,
  lastRefreshed: "",
};

export default function ContentGapPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ScanResult | null>(null);
  const [selectedGap, setSelectedGap] = useState<ContentGap | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setError(""); }

    try {
      const res = await fetch("/api/content-gap/scan");
      if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
      const result: ScanResult = await res.json();
      setData(result);
      setLastRefreshed(new Date());
      // Keep selectedGap in sync if it was updated
      if (selectedGap) {
        const updated = result.gaps.find((g) => g.id === selectedGap.id);
        if (updated) setSelectedGap(updated);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to scan for content gaps. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedGap]);

  // Initial fetch + auto-refresh every 5 min
  useEffect(() => {
    fetchData();
    const interval = window.setInterval(() => fetchData(true), 5 * 60_000);
    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateBrief = (topic: string) => {
    router.push(`/dashboard/news-brief?topic=${encodeURIComponent(topic)}`);
  };

  const stats = data?.stats ?? EMPTY_STATS;
  const gaps  = data?.gaps  ?? [];

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E6ED] sticky top-0 z-20">
        <div className="px-6 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#9AA5B4] mb-1">
            <Link href="/dashboard" className="hover:text-[#0050B3] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#333333] font-medium">Content Gap Detector</span>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#0050B3]" />
            <div>
              <h1 className="font-bold text-[#333333]" style={{ fontSize: "18px" }}>
                Content Gap Detector
              </h1>
              <p className="text-[11px] text-[#9AA5B4] mt-0.5">
                Stories competitors are covering that TOI has not yet published — ranked by editorial opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 max-w-[1600px] mx-auto">

        {/* Monitoring Overview */}
        <MonitoringOverview
          stats={stats}
          lastRefreshed={lastRefreshed}
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-[12px] text-[#E21B22]">
            {error}
          </div>
        )}

        {/* Table + Detail panel */}
        <div
          className={`mt-5 ${
            selectedGap
              ? "grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 items-start"
              : ""
          }`}
        >
          {/* Opportunity table */}
          <OpportunityTable
            gaps={gaps}
            selectedId={selectedGap?.id ?? null}
            onSelect={setSelectedGap}
            onCreateBrief={handleCreateBrief}
            loading={loading}
          />

          {/* Detail panel */}
          {selectedGap && (
            <div className="xl:sticky xl:top-[92px]">
              <OpportunityDetail
                gap={selectedGap}
                onClose={() => setSelectedGap(null)}
                onCreateBrief={handleCreateBrief}
              />
            </div>
          )}
        </div>

        {/* Footnote */}
        {!loading && gaps.length > 0 && (
          <p className="mt-4 text-center text-[11px] text-[#9AA5B4]">
            Gaps are identified using 3-level semantic comparison: headline similarity · content keyword overlap · named entity matching.
            Auto-refreshes every 5 minutes.
          </p>
        )}
      </div>
    </div>
  );
}
