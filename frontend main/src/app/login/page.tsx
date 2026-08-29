"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { login } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const AGENT_STEPS = [
  { label: "PERCEIVE", desc: "Reads financial records" },
  { label: "THINK", desc: "Cross-references transactions" },
  { label: "DECIDE", desc: "Evaluates compliance risk" },
  { label: "ACT", desc: "Drafts the next action" },
  { label: "ADAPT", desc: "Re-evaluates with new evidence" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("priya@archangel.com");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await login({ email, password });
      // Store user info so DashboardLayout can read it
      const userName = result?.user?.name ?? email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const userOrg  = result?.user?.organisation ?? "GST Compliance Lead";
      localStorage.setItem("user", JSON.stringify({ name: userName, organisation: userOrg, email }));
      router.push("/upload");
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#09090f] flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-[44%] flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 dark:from-[#0a0f1e] dark:via-[#09090f] dark:to-[#09090f] dark:border-r dark:border-[#1e2130]">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 dark:bg-[#1d3a6e] border border-white/30 dark:border-[#2563eb] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white dark:text-[#3b82f6]" />
            </div>
            <span className="text-sm font-bold text-white dark:text-[#e8eaf6]">
              GST{" "}
              <span className="text-indigo-200 dark:text-[#3b82f6]">
                ARCHANGEL
              </span>
            </span>
          </Link>
          <ThemeToggle size="sm" />
        </div>

        {/* Middle content */}
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-200 dark:text-[#5a6380] font-semibold mb-8">
            Agentic GST Compliance
          </p>

          <h2 className="text-3xl font-bold text-white dark:text-[#e8eaf6] leading-tight mb-10">
            An agent that investigates,
            <br />
            decides, and adapts.
          </h2>

          <div className="flex flex-col gap-3">
            {AGENT_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-white/15 dark:bg-[#141520] border border-white/20 dark:border-[#2d3250] flex items-center justify-center">
                    <span className="text-xs font-bold text-white dark:text-[#3b82f6]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {i < AGENT_STEPS.length - 1 && (
                    <div className="w-px h-3 bg-white/20 dark:bg-[#2d3250] mt-1" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white dark:text-[#e8eaf6] tracking-wider">
                    {step.label}
                  </p>
                  <p className="text-xs text-indigo-200 dark:text-[#5a6380]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-indigo-300 dark:text-[#5a6380] leading-relaxed border-t border-white/10 dark:border-[#1e2130] pt-6">
          Institutional-grade GST reconciliation for finance teams that need
          certainty, not guesswork.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile header */}
        <div className="lg:hidden w-full max-w-sm mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 dark:bg-[#1d3a6e] dark:border dark:border-[#2563eb] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white dark:text-[#3b82f6]" />
            </div>
            <span className="text-sm font-bold text-[#111827] dark:text-[#e8eaf6]">
              GST{" "}
              <span className="text-indigo-600 dark:text-[#3b82f6]">ARCHANGEL</span>
            </span>
          </Link>
          <ThemeToggle size="sm" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#111827] dark:text-[#e8eaf6] tracking-tight mb-2">
              Sign in
            </h1>
            <p className="text-sm text-[#667085] dark:text-[#5a6380]">
              Access your compliance command center
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#374151] dark:text-[#9ba3bf] mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-white dark:bg-[#0f1017] border border-[#E5E7EB] dark:border-[#1e2130] text-sm text-[#111827] dark:text-[#e8eaf6] placeholder:text-[#9CA3AF] dark:placeholder:text-[#383d52] focus:border-indigo-400 dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-[#3b82f6]/15 outline-none transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#374151] dark:text-[#9ba3bf] mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 pr-11 rounded-lg bg-white dark:bg-[#0f1017] border border-[#E5E7EB] dark:border-[#1e2130] text-sm text-[#111827] dark:text-[#e8eaf6] focus:border-indigo-400 dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-[#3b82f6]/15 outline-none transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] dark:hover:text-[#9ba3bf] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3.5 py-2.5 bg-[#FEF2F2] dark:bg-[#3f0d0d] border border-[#FECACA] dark:border-[#7f1d1d] rounded-lg text-xs text-[#DC2626] dark:text-[#ef4444]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "mt-1 h-11 w-full rounded-lg font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2",
                "bg-indigo-600 dark:bg-[#3b82f6] hover:bg-indigo-700 dark:hover:bg-[#2563eb] text-white",
                "shadow-lg shadow-indigo-500/20 dark:shadow-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#F7F8FC] dark:focus:ring-[#3b82f6] dark:focus:ring-offset-[#09090f]"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#9CA3AF] dark:text-[#5a6380]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 dark:text-[#3b82f6] hover:text-indigo-700 dark:hover:text-[#60a5fa] font-semibold transition-colors"
            >
              Create account
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 p-3.5 bg-indigo-50 dark:bg-[#0a1528] border border-indigo-100 dark:border-[#1d3a6e] rounded-lg text-xs text-[#667085] dark:text-[#5a6380] text-center">
            Demo credentials pre-filled.{" "}
            <span className="text-indigo-600 dark:text-[#3b82f6] font-medium">
              Click Sign in
            </span>{" "}
            to continue.
          </div>
        </div>
      </div>
    </div>
  );
}
