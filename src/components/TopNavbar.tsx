"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Plus, ChevronDown, Newspaper, User, Menu } from "lucide-react";

interface TopNavbarProps {
  onMenuToggle?: () => void;
}

export default function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  return (
    <header className="h-14 bg-white border-b border-[#E2E6ED] flex items-center px-4 gap-4 z-30 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-8 h-8 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 text-[#6B7280]" />
      </button>

      {/* Left – Logo */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center justify-center w-7 h-7 bg-[#E21B22] flex-shrink-0">
          <Newspaper className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="hidden sm:block leading-none">
          <span className="font-bold text-[#0050B3] text-sm tracking-wide">TOI</span>
          <span className="text-[#6B7280] text-sm ml-1">Editor Copilot</span>
        </div>
        {/* Vertical divider */}
        <div className="hidden sm:block w-px h-5 bg-[#E2E6ED] mx-1" />
        <span className="hidden md:block text-[11px] text-[#9AA5B4] uppercase tracking-widest font-medium">
          Newsroom Intelligence
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={`
            hidden md:flex items-center gap-2 h-8 px-3 border transition-all text-sm
            ${searchFocused
              ? "border-[#0050B3] ring-1 ring-[#0050B3] bg-white w-64"
              : "border-[#E2E6ED] bg-[#F5F6F8] w-44"
            }
          `}
        >
          <Search className="w-3.5 h-3.5 text-[#9AA5B4] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search stories, topics..."
            className="flex-1 bg-transparent text-[13px] text-[#333333] placeholder:text-[#9AA5B4] focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] transition-colors">
          <Bell className="w-4 h-4 text-[#6B7280]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#E21B22]" />
        </button>

        {/* New Analysis CTA */}
        <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 bg-[#0050B3] hover:bg-[#003D8C] text-white text-[12px] font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Analysis
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 h-8 px-2 border border-[#E2E6ED] bg-white hover:bg-[#F5F6F8] transition-colors"
          >
            <div className="w-5 h-5 bg-[#0050B3] flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="hidden sm:block text-[12px] font-medium text-[#333333]">Pratap</span>
            <ChevronDown className="w-3 h-3 text-[#9AA5B4]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E2E6ED] shadow-lg z-50">
              <div className="px-3 py-2.5 border-b border-[#E2E6ED]">
                <p className="text-xs font-semibold text-[#333333]">Pratap</p>
                <p className="text-[11px] text-[#9AA5B4]">Editor · TOI</p>
              </div>
              <div className="py-1">
                {["Profile Settings", "Preferences", "Help & Support"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 text-[12px] text-[#333333] hover:bg-[#F5F6F8] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#E2E6ED] py-1">
                <button
                  className="w-full text-left px-3 py-2 text-[12px] text-[#E21B22] hover:bg-red-50 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
