"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Search,
  ShieldCheck,
  Video,
  BookMarked,
  Clock,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "AI News Brief + Headline Optimizer",
    icon: Newspaper,
    href: "/dashboard/news-brief",
  },
  {
    label: "Content Gap Detector",
    icon: Search,
    href: "/dashboard/content-gap",
  },
  {
    label: "Fact Checker",
    icon: ShieldCheck,
    href: "/dashboard/fact-checker",
  },
  {
    label: "Short News Video Builder",
    icon: Video,
    href: "/dashboard/video-builder",
  },
];

const utilityItems = [
  { label: "Saved Drafts", icon: BookMarked, href: "/dashboard/drafts" },
  { label: "Recent Analyses", icon: Clock, href: "/dashboard/recent" },
  { label: "Notifications", icon: Bell, href: "/dashboard/notifications", badge: 3 },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

interface SidebarProps {
  onNavigate?: (href: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ onNavigate, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/login");
  };

  const ACTIVE_ROUTES = new Set(["/dashboard", "/dashboard/news-brief", "/dashboard/content-gap"]);

  const handleNav = (href: string) => {
    if (onClose) onClose();
    if (onNavigate) onNavigate(href);
    if (ACTIVE_ROUTES.has(href)) {
      router.push(href);
    }
  };

  return (
    <aside className="flex flex-col h-screen bg-[#001F4D] text-white w-64 flex-shrink-0 overflow-y-auto">
      {/* Red top accent */}
      <div className="h-1 bg-[#E21B22] flex-shrink-0" />

      {/* Profile Card */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0050B3] border border-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">Pratap</p>
            <p className="text-[11px] text-blue-300 truncate">Editor</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4">
        <p className="px-2 mb-2 text-[10px] font-semibold text-blue-400 uppercase tracking-widest">
          Tools
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <button
                  onClick={() => handleNav(item.href)}
                  className={`
                    w-full flex items-center gap-2.5 px-2 py-2.5 text-left text-sm transition-colors group
                    ${isActive
                      ? "bg-[#0050B3] text-white"
                      : "text-blue-200 hover:bg-white/8 hover:text-white"
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-blue-300 group-hover:text-white"}`} />
                  <span className="flex-1 leading-tight text-[13px]">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Utility items */}
        <div className="mt-6">
          <p className="px-2 mb-2 text-[10px] font-semibold text-blue-400 uppercase tracking-widest">
            Workspace
          </p>
          <ul className="space-y-0.5">
            {utilityItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => handleNav(item.href)}
                  className="w-full flex items-center gap-2.5 px-2 py-2.5 text-left text-sm text-blue-200 hover:bg-white/8 hover:text-white transition-colors group"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0 text-blue-300 group-hover:text-white" />
                  <span className="flex-1 text-[13px]">{item.label}</span>
                  {item.badge && (
                    <span className="flex items-center justify-center w-4 h-4 bg-[#E21B22] text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-white/10 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2.5 text-sm text-red-300 hover:bg-[#E21B22]/15 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-[13px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
