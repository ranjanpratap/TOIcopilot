"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8]">

      {/* ── Mobile backdrop ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/*
        Mobile  : fixed, translated off-screen when closed, slides in when open
        Desktop : static flex item with explicit h-screen so bg fills full height
      */}
      <div
        className={[
          // Shared
          "h-screen w-64 flex-shrink-0 overflow-hidden",
          "transition-transform duration-200 ease-in-out",
          // Mobile: overlay
          "fixed inset-y-0 left-0 z-40",
          // Desktop: back into flex flow
          "lg:static lg:z-auto",
          // Toggle translation
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavbar onMenuToggle={openSidebar} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

    </div>
  );
}
