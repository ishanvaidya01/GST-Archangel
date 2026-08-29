"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Landmark,
  FileText,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function InfoCard({
  icon,
  label,
  className,
  duration,
  distance,
  delay = 0,
  rotate = 0,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  className: string;
  duration: number;
  distance: number;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className={`absolute z-10 flex h-[136px] w-[172px] xl:h-[142px] xl:w-[178px] flex-col items-center justify-center gap-2.5 xl:gap-3 rounded-[20px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] px-3.5 py-3.5 xl:px-4 xl:py-4 text-center shadow-[0_22px_45px_-18px_rgba(60,70,160,0.25)] dark:shadow-none transition-colors duration-200 ${className}`}
      style={{ rotate }}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <span className="flex h-[48px] w-[48px] xl:h-[52px] xl:w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#4F6EF7]/10 to-[#8B5CF6]/10 dark:from-[#4F6EF7]/20 dark:to-[#8B5CF6]/20">
        {icon}
      </span>
      <span className="font-[Manrope,sans-serif] text-[15.5px] xl:text-[16.5px] font-bold leading-[1.15] text-[#0E1630] dark:text-white">
        {label}
      </span>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F8FD] dark:bg-[#080B14] text-[#0E1630] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* atmosphere glows */}
      <div className="pointer-events-none absolute -right-[8%] -top-[10%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,rgba(139,92,246,0.06)_45%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] blur-[10px]" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[5%] h-[500px] w-[700px] bg-[radial-gradient(ellipse_at_bottom_right,rgba(79,110,247,0.14)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(79,110,247,0.2)_0%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[220px] w-[60%] bg-[linear-gradient(120deg,rgba(139,92,246,0.05),rgba(79,110,247,0.09))] dark:opacity-20"
        style={{ clipPath: "polygon(30% 100%, 100% 40%, 100% 100%)" }}
      />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5 lg:px-14 xl:px-16">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="h-8 w-8">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#4F6EF7" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M20 6 L10 12.5 L20 19 L30 12.5 Z" fill="url(#logoGrad)" />
            <path
              d="M10 20 L20 26.5 L30 20 L30 24 L20 30.5 L10 24 Z"
              fill="url(#logoGrad)"
              opacity="0.75"
            />
          </svg>
          <span className="font-[Manrope,sans-serif] text-[21px] font-extrabold">
            <span className="text-[#0E1630] dark:text-white">GST</span>{" "}
            <span className="text-[#4F6EF7] dark:text-[#60A5FA]">ARCHANGEL</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-6 py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgba(90,90,247,0.65)]"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="relative z-[5] mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-6 px-8 py-4 lg:grid-cols-2 lg:px-14 xl:px-16 xl:py-6 2xl:py-8 min-h-[calc(100vh-90px)]">

        {/* Left column */}
        <div className="py-2">
          {/* Badge */}
          <FadeUp delay={0.05} className="mb-4 xl:mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/15 dark:border-indigo-500/30 bg-gradient-to-r from-[#4F6EF7]/10 to-[#8B5CF6]/10 dark:from-[#4F6EF7]/20 dark:to-[#8B5CF6]/20 px-4 py-2 text-[13.5px] font-semibold text-[#4F6EF7] dark:text-[#60A5FA]">
              <Sparkles size={14} /> Autonomous GST Compliance Agent
            </span>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.15}>
            <h1 className="font-[Manrope,sans-serif] text-[40px] font-extrabold leading-[1.08] tracking-[-1.2px] text-[#0E1630] dark:text-white sm:text-[48px] xl:text-[54px] 2xl:text-[58px]">
              AI Powered.
              <br />
              Finance Perfected.
              <br />
              <span className="bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] bg-clip-text text-transparent">
                GST Compliant.
              </span>
            </h1>
          </FadeUp>

          {/* Subtitle */}
          <FadeUp delay={0.25} className="mt-4 xl:mt-5">
            <p className="max-w-[480px] text-[16px] leading-[1.65] text-[#66708A] dark:text-[#94A3B8] xl:text-[17px]">
              Detect discrepancies, reconcile data, identify risks, take
              intelligent actions and stay fully GST compliant — with zero
              manual hassle.
            </p>
          </FadeUp>

          {/* CTA buttons */}
          <FadeUp delay={0.35} className="mt-7 xl:mt-8">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-7 py-4 text-[15.5px] font-semibold text-white shadow-[0_16px_32px_-10px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-10px_rgba(90,90,247,0.65)]"
              >
                Run GST Audit <ArrowRight size={17} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5 rounded-full border border-[#E7E9F5] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] py-3.5 pl-3.5 pr-6 text-[15.5px] font-semibold text-[#0E1630] dark:text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(20,20,50,0.12)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6]">
                  <Play size={10} fill="white" className="text-white" />
                </span>
                See How It Works
              </a>
            </div>
          </FadeUp>

          {/* Feature indicators */}
          <FadeUp delay={0.45} className="mt-8 xl:mt-10 2xl:mt-12">
            <div className="flex flex-wrap items-center gap-6 xl:gap-7">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-green-500/10 dark:bg-green-500/20">
                  <ShieldCheck size={16} className="text-green-600 dark:text-green-400" />
                </span>
                <span className="text-[14px] font-medium text-[#404A63] dark:text-[#CBD5E1]">
                  100% Tax Accurate
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-amber-500/10 dark:bg-amber-500/20">
                  <AlertTriangle size={16} className="text-amber-500" />
                </span>
                <span className="text-[14px] font-medium text-[#404A63] dark:text-[#CBD5E1]">
                  Discrepancy Alerts
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-indigo-500/10 dark:bg-indigo-500/20">
                  <TrendingUp size={16} className="text-[#4F6EF7] dark:text-[#60A5FA]" />
                </span>
                <span className="text-[14px] font-medium text-[#404A63] dark:text-[#CBD5E1]">
                  ITC Maximize
                </span>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Right column: Shield Composition */}
        <div className="relative flex items-center justify-center py-6 min-h-[460px] xl:min-h-[500px]">

          {/* Orbital Ring 1 */}
          <div
            className="pointer-events-none absolute h-[380px] w-[380px] rounded-full border border-indigo-400/20 dark:border-indigo-400/30 xl:h-[430px] xl:w-[430px]"
            style={{ animation: "spin 90s linear infinite" }}
          />

          {/* Orbital Ring 2 */}
          <div
            className="pointer-events-none absolute h-[470px] w-[470px] rounded-full border border-dashed border-indigo-300/25 dark:border-indigo-300/35 xl:h-[530px] xl:w-[530px]"
            style={{ animation: "spin 140s linear infinite reverse" }}
          />

          {/* Core glow behind podium */}
          <div className="pointer-events-none absolute h-[260px] w-[260px] rounded-full bg-gradient-to-tr from-[#4F6EF7]/25 to-[#8B5CF6]/30 blur-[40px]" />

          {/* ── Central Hero Shield Image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative z-[6] flex items-center justify-center"
          >
            <Image
              src="/hero-shield.png"
              alt="GST Archangel Shield"
              width={420}
              height={420}
              priority
              className="h-[310px] w-[310px] object-contain sm:h-[350px] sm:w-[350px] xl:h-[390px] xl:w-[390px] 2xl:h-[420px] 2xl:w-[420px] drop-shadow-[0_24px_48px_rgba(79,110,247,0.3)]"
            />
          </motion.div>

          {/* ── 4 Floating Data Cards ── */}

          {/* Top-Left: Bank Statements */}
          <InfoCard
            icon={<Landmark size={26} className="text-[#4F6EF7]" />}
            label={
              <>
                Bank
                <br />
                Statements
              </>
            }
            className="-top-1 -left-2 sm:top-2 sm:left-4 xl:top-3 xl:left-8"
            duration={5}
            distance={7}
            delay={0}
            rotate={-2}
          />

          {/* Top-Right: Invoices */}
          <InfoCard
            icon={<FileText size={26} className="text-[#8B5CF6]" />}
            label="Invoices"
            className="-top-1 -right-2 sm:top-2 sm:right-4 xl:top-3 xl:right-8"
            duration={5.5}
            distance={8}
            delay={0.6}
            rotate={2.5}
          />

          {/* Bottom-Left: GST Records */}
          <InfoCard
            icon={<ShieldCheck size={26} className="text-[#4F6EF7]" />}
            label={
              <>
                GST
                <br />
                Records
              </>
            }
            className="-bottom-1 -left-2 sm:bottom-2 sm:left-4 xl:bottom-3 xl:left-8"
            duration={6}
            distance={6}
            delay={1.2}
            rotate={-1.5}
          />

          {/* Bottom-Right: Sales Data */}
          <InfoCard
            icon={<BarChart3 size={26} className="text-[#8B5CF6]" />}
            label={
              <>
                Sales
                <br />
                Data
              </>
            }
            className="-bottom-1 -right-2 sm:bottom-2 sm:right-4 xl:bottom-3 xl:right-8"
            duration={5.2}
            distance={7}
            delay={1.8}
            rotate={2}
          />
        </div>
      </div>
    </div>
  );
}
