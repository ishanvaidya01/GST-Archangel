"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  Upload,
  FolderSearch,
  ChevronRight,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  runId?: string;
}

const navItems = [
  { label: "Upload", href: "/upload", icon: Upload },
];

export function AppShell({ children, runId }: AppShellProps) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const isCases = pathname.startsWith("/cases");

  return (
    <div className="min-h-screen flex flex-col bg-[#09090f]">
      {/* Top bar */}
      <header className="h-14 border-b border-[#1e2130] bg-[#09090f]/95 backdrop-blur-sm flex items-center px-6 gap-5 shrink-0 z-50 sticky top-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#1d3a6e] border border-[#2563eb]/50 flex items-center justify-center transition-all group-hover:border-[#2563eb]">
            <Shield className="w-3.5 h-3.5 text-[#3b82f6]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-[#e8eaf6]">
              GST
            </span>
            <span className="text-sm font-bold tracking-tight text-[#3b82f6]">
              {" "}ARCHANGEL
            </span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-[#2d3250]" />

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  active
                    ? "bg-[#141520] text-[#e8eaf6]"
                    : "text-[#5a6380] hover:text-[#9ba3bf] hover:bg-[#0f1017]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}

          {runId && (
            <>
              <Link
                href={`/dashboard/${runId}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  isDashboard
                    ? "bg-[#141520] text-[#e8eaf6]"
                    : "text-[#5a6380] hover:text-[#9ba3bf] hover:bg-[#0f1017]"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              <Link
                href={`/dashboard/${runId}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  isCases
                    ? "bg-[#141520] text-[#e8eaf6]"
                    : "text-[#5a6380] hover:text-[#9ba3bf] hover:bg-[#0f1017]"
                )}
              >
                <FolderSearch className="w-3.5 h-3.5" />
                Cases
              </Link>
            </>
          )}
        </nav>

        {/* Breadcrumb for cases */}
        {isCases && (
          <>
            <div className="h-5 w-px bg-[#2d3250]" />
            <div className="flex items-center gap-1.5 text-xs text-[#5a6380]">
              <span>Cases</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#9ba3bf]">
                {pathname.split("/")[2]}
                {pathname.endsWith("/adapt") && (
                  <>
                    <ChevronRight className="w-3 h-3 inline mx-1" />
                    <span className="text-[#3b82f6]">Adapt</span>
                  </>
                )}
              </span>
            </div>
          </>
        )}

        {/* Right area */}
        <div className="ml-auto flex items-center gap-4">
          {/* Run ID pill */}
          {runId && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#141520] border border-[#1e2130] rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-xs font-mono text-[#5a6380]">{runId}</span>
            </div>
          )}

          {/* Agent status */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse-slow" />
            <span className="text-xs font-mono text-[#5a6380]">
              AGENTS ACTIVE
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">PS</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-[#9ba3bf] leading-none mb-0.5">
                Priya Sharma
              </p>
              <p className="text-2xs text-[#5a6380]">GST Compliance Lead</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
