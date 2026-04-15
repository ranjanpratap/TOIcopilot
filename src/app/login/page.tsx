"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, TrendingUp, FileSearch, Video, Search, Newspaper } from "lucide-react";

const VALID_USER = "pratap";
const VALID_PASS = "123456";

const features = [
  { icon: TrendingUp, text: "Track trending topics in real time" },
  { icon: FileSearch, text: "Generate high-CTR headlines with AI" },
  { icon: Search,     text: "Detect content gaps vs competitors" },
  { icon: Video,      text: "Create short news videos in minutes" },
];

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (userId === VALID_USER && password === VALID_PASS) {
        router.push("/dashboard");
      } else {
        setError("Invalid user ID or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left Brand Panel ── */}
      <div
        className="hidden md:flex md:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #001A4D 0%, #003180 40%, #0050B3 75%, #0A6FD4 100%)",
        }}
      >
        {/* Subtle grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative accent line top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E21B22]" />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo area */}
          <div className="flex items-center gap-3 mb-16">
            <div className="flex items-center justify-center w-10 h-10 bg-[#E21B22]">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none tracking-wide">
                TIMES OF INDIA
              </div>
              <div className="text-blue-300 text-[11px] tracking-[0.12em] uppercase mt-0.5">
                Internal Newsroom Tools
              </div>
            </div>
          </div>

          {/* Main headline */}
          <div className="mb-10">
            <h1 className="text-white font-bold leading-tight mb-4" style={{ fontSize: "36px" }}>
              TOI Editor Copilot
            </h1>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm">
              AI-powered newsroom assistant for faster research, verification, and story creation.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white/10 border border-white/20">
                  <f.icon className="w-3.5 h-3.5 text-blue-200" />
                </div>
                <span className="text-blue-100 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom edition info */}
        <div className="relative z-10">
          <div className="border-t border-white/10 pt-6">
            <p className="text-blue-300 text-xs tracking-wide">
              FOR INTERNAL USE ONLY · TOI EDITORIAL TEAM
            </p>
          </div>
        </div>

        {/* Decorative large circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 border border-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-white/5 rounded-full" />
      </div>

      {/* ── Right Login Form ── */}
      <div className="flex flex-1 items-center justify-center bg-[#F5F6F8] p-6 md:p-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-[#E21B22] flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0050B3] text-lg">TOI Editor Copilot</span>
          </div>

          {/* Form card */}
          <div className="bg-white border border-[#E2E6ED] shadow-sm p-8">
            <div className="mb-8">
              <h2 className="font-bold text-[#333333] mb-1" style={{ fontSize: "22px" }}>
                Sign in to your account
              </h2>
              <p className="text-[#6B7280] text-sm">
                Enter your newsroom credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* User ID */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] uppercase tracking-wide mb-1.5">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your user ID"
                  className="w-full h-10 px-3 border border-[#E2E6ED] bg-white text-[#333333] text-sm focus:outline-none focus:border-[#0050B3] focus:ring-1 focus:ring-[#0050B3] transition-colors placeholder:text-[#9AA5B4]"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 px-3 pr-10 border border-[#E2E6ED] bg-white text-[#333333] text-sm focus:outline-none focus:border-[#0050B3] focus:ring-1 focus:ring-[#0050B3] transition-colors placeholder:text-[#9AA5B4]"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA5B4] hover:text-[#6B7280] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-[#E21B22] text-sm">
                  <div className="w-1 h-full bg-[#E21B22] absolute left-0 top-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#0050B3] hover:bg-[#003D8C] text-white text-sm font-semibold tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-6 flex items-start gap-2 p-3 bg-[#F5F6F8] border border-[#E2E6ED]">
              <CheckCircle2 className="w-4 h-4 text-[#0050B3] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Access is restricted to authorised TOI editorial staff. Contact IT support if you need assistance.
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#9AA5B4] mt-6">
            © {new Date().getFullYear()} The Times of India Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
