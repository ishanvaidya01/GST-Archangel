"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  FileText,
  Receipt,
  FileSpreadsheet,
  Download,
  Link2,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
} from "lucide-react";

interface AuditFlowPipelineProps {
  onNodeClick?: (stage: string) => void;
}

export function AuditFlowPipeline({ onNodeClick }: AuditFlowPipelineProps) {
  // Step sequence animation state (0: Extract, 1: Reconcile, 2: Analyze, 3: Decide)
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 4);
    }, 2800); // 2.8s per step cycle

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h2 className="font-[Manrope,sans-serif] text-[16px] font-extrabold tracking-tight text-[#0E1630] dark:text-white">
            AUDIT FLOW
          </h2>
          <span className="text-[14px] text-[#66708A] dark:text-[#94A3B8] font-medium">
            — From Data to Decision
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            Pipeline Active
          </span>
        </div>
      </div>

      {/* Main Flow Diagram Area */}
      <div className="relative w-full overflow-hidden py-4">
        <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 relative min-h-[300px]">
          {/* ── Left Column: 4 Data Sources ───────────────────────────────────── */}
          <div className="col-span-12 md:col-span-3 flex flex-col justify-between gap-3 z-10">
            {/* 1. Bank Statements */}
            <div className="group relative flex items-center gap-3 rounded-[16px] border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 transition-all hover:border-[#4F6EF7]/50 hover:bg-white dark:hover:bg-[#1A2236] hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 dark:bg-blue-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                <Landmark size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-[#0E1630] dark:text-white">
                  Bank Statements
                </p>
                <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">1 File • 1,245 Txns</p>
              </div>
              {/* Output Dot */}
              <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white dark:border-[#111827] bg-[#4F6EF7] shadow-sm" />
            </div>

            {/* 2. Purchase Invoices */}
            <div className="group relative flex items-center gap-3 rounded-[16px] border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 transition-all hover:border-[#4F6EF7]/50 hover:bg-white dark:hover:bg-[#1A2236] hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-[#0E1630] dark:text-white">
                  Purchase Invoices
                </p>
                <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">14 Files • 862 Invoices</p>
              </div>
              {/* Output Dot */}
              <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white dark:border-[#111827] bg-indigo-600 shadow-sm" />
            </div>

            {/* 3. GSTR-2B */}
            <div className="group relative flex items-center gap-3 rounded-[16px] border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 transition-all hover:border-amber-400/50 hover:bg-white dark:hover:bg-[#1A2236] hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Receipt size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-[#0E1630] dark:text-white">
                  GSTR-2B
                </p>
                <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">1 File • 1,302 Records</p>
              </div>
              {/* Output Dot */}
              <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white dark:border-[#111827] bg-amber-500 shadow-sm" />
            </div>

            {/* 4. GST Returns */}
            <div className="group relative flex items-center gap-3 rounded-[16px] border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 transition-all hover:border-purple-400/50 hover:bg-white dark:hover:bg-[#1A2236] hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <FileSpreadsheet size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-[#0E1630] dark:text-white">
                  GST Returns
                </p>
                <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">1 File • Jul 2024</p>
              </div>
              {/* Output Dot */}
              <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white dark:border-[#111827] bg-purple-600 shadow-sm" />
            </div>
          </div>

          {/* ── Center / Right Column: 4 Circular Process Nodes + SVG Connectors ── */}
          <div className="col-span-12 md:col-span-9 relative flex items-center justify-between px-2 sm:px-6 z-10">
            {/* SVG Connecting Flow Lines with Traveling Particles */}
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none -z-0"
              viewBox="0 0 700 280"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F6EF7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="flowGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
                </linearGradient>

                {/* Soft glow filter */}
                <filter id="flowGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 4 Merging Flow Ribbons from Left Sources to EXTRACT node */}
              <path
                d="M 0 35 C 60 35, 75 140, 120 140"
                fill="none"
                stroke="#4F6EF7"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <path
                d="M 0 105 C 55 105, 75 140, 120 140"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <path
                d="M 0 175 C 55 175, 75 140, 120 140"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <path
                d="M 0 245 C 60 245, 75 140, 120 140"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />

              {/* Connecting Ribbons between Circular Nodes */}
              <path
                d="M 120 140 L 280 140"
                fill="none"
                stroke="url(#flowGrad1)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />
              <path
                d="M 280 140 L 440 140"
                fill="none"
                stroke="url(#flowGrad2)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />
              <path
                d="M 440 140 L 600 140"
                fill="none"
                stroke="url(#flowGrad3)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />

              {/* ── Traveling Animated Flow Particles ─────────────────────────── */}
              <circle r="4.5" fill="#4F6EF7" filter="url(#flowGlow)">
                <animateMotion
                  path="M 0 35 C 60 35, 75 140, 120 140"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4.5" fill="#6366F1" filter="url(#flowGlow)">
                <animateMotion
                  path="M 0 105 C 55 105, 75 140, 120 140"
                  dur="2.4s"
                  begin="0.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4.5" fill="#F59E0B" filter="url(#flowGlow)">
                <animateMotion
                  path="M 0 175 C 55 175, 75 140, 120 140"
                  dur="2.4s"
                  begin="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4.5" fill="#8B5CF6" filter="url(#flowGlow)">
                <animateMotion
                  path="M 0 245 C 60 245, 75 140, 120 140"
                  dur="2.4s"
                  begin="1.8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Inter-node particles */}
              <circle r="5" fill="#4F6EF7" filter="url(#flowGlow)">
                <animateMotion
                  path="M 120 140 L 280 140"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="5" fill="#8B5CF6" filter="url(#flowGlow)">
                <animateMotion
                  path="M 280 140 L 440 140"
                  dur="2s"
                  begin="0.7s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="5" fill="#3B82F6" filter="url(#flowGlow)">
                <animateMotion
                  path="M 440 140 L 600 140"
                  dur="2s"
                  begin="1.4s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* ── 4 Circular Process Nodes ────────────────────────────────────── */}
            {/* Node 1: EXTRACT */}
            <div
              onClick={() => onNodeClick?.("extract")}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                activeStage === 0 ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-full border-2 bg-white dark:bg-[#151B2B] transition-all duration-300 ${
                  activeStage === 0
                    ? "border-[#4F6EF7] shadow-[0_0_25px_rgba(79,110,247,0.35)] ring-4 ring-[#4F6EF7]/15"
                    : "border-[#E2E8F0] dark:border-[#1E293B] shadow-md hover:border-[#4F6EF7]/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-colors ${
                    activeStage === 0
                      ? "bg-gradient-to-br from-[#4F6EF7] to-[#8B5CF6] text-white"
                      : "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]"
                  }`}
                >
                  <Download size={20} />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="font-[Manrope,sans-serif] text-[13px] font-extrabold uppercase tracking-wide text-[#0E1630] dark:text-white">
                  EXTRACT
                </p>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Data Extraction
                </p>
              </div>
            </div>

            {/* Node 2: RECONCILE */}
            <div
              onClick={() => onNodeClick?.("reconcile")}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                activeStage === 1 ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-full border-2 bg-white dark:bg-[#151B2B] transition-all duration-300 ${
                  activeStage === 1
                    ? "border-[#4F6EF7] shadow-[0_0_25px_rgba(79,110,247,0.35)] ring-4 ring-[#4F6EF7]/15"
                    : "border-[#E2E8F0] dark:border-[#1E293B] shadow-md hover:border-[#4F6EF7]/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-colors ${
                    activeStage === 1
                      ? "bg-gradient-to-br from-[#4F6EF7] to-[#8B5CF6] text-white"
                      : "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]"
                  }`}
                >
                  <Link2 size={20} />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="font-[Manrope,sans-serif] text-[13px] font-extrabold uppercase tracking-wide text-[#0E1630] dark:text-white">
                  RECONCILE
                </p>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Match & Validate
                </p>
              </div>
            </div>

            {/* Node 3: ANALYZE */}
            <div
              onClick={() => onNodeClick?.("analyze")}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                activeStage === 2 ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-full border-2 bg-white dark:bg-[#151B2B] transition-all duration-300 ${
                  activeStage === 2
                    ? "border-[#4F6EF7] shadow-[0_0_25px_rgba(79,110,247,0.35)] ring-4 ring-[#4F6EF7]/15"
                    : "border-[#E2E8F0] dark:border-[#1E293B] shadow-md hover:border-[#4F6EF7]/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-colors ${
                    activeStage === 2
                      ? "bg-gradient-to-br from-[#4F6EF7] to-[#8B5CF6] text-white"
                      : "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]"
                  }`}
                >
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="font-[Manrope,sans-serif] text-[13px] font-extrabold uppercase tracking-wide text-[#0E1630] dark:text-white">
                  ANALYZE
                </p>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Risk & Impact
                </p>
              </div>
            </div>

            {/* Node 4: DECIDE */}
            <div
              onClick={() => onNodeClick?.("decide")}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                activeStage === 3 ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-full border-2 bg-white dark:bg-[#151B2B] transition-all duration-300 ${
                  activeStage === 3
                    ? "border-[#4F6EF7] shadow-[0_0_25px_rgba(79,110,247,0.35)] ring-4 ring-[#4F6EF7]/15"
                    : "border-[#E2E8F0] dark:border-[#1E293B] shadow-md hover:border-[#4F6EF7]/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-colors ${
                    activeStage === 3
                      ? "bg-gradient-to-br from-[#4F6EF7] to-[#8B5CF6] text-white"
                      : "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]"
                  }`}
                >
                  <Target size={20} />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="font-[Manrope,sans-serif] text-[13px] font-extrabold uppercase tracking-wide text-[#0E1630] dark:text-white">
                  DECIDE
                </p>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Action Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Result Metrics Strip ───────────────────────────────────────── */}
      <div className="mt-6 pt-5 border-t border-[#E2E8F0]/80 dark:border-[#1E293B] grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Matched Transactions */}
        <div className="flex items-center gap-3 rounded-[14px] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 border border-[#E2E8F0]/60 dark:border-[#1E293B]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11.5px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Matched Transactions
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-[Manrope,sans-serif] text-[18px] font-extrabold text-[#0E1630] dark:text-white">
                19
              </span>
              <span className="text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                76%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Invoice Mismatches */}
        <div className="flex items-center gap-3 rounded-[14px] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 border border-[#E2E8F0]/60 dark:border-[#1E293B]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-[11.5px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Invoice Mismatches
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-[Manrope,sans-serif] text-[18px] font-extrabold text-[#0E1630] dark:text-white">
                2
              </span>
              <span className="text-[11.5px] font-semibold text-amber-600 dark:text-amber-400">
                8%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Missing Invoices */}
        <div className="flex items-center gap-3 rounded-[14px] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 border border-[#E2E8F0]/60 dark:border-[#1E293B]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <XCircle size={18} />
          </div>
          <div>
            <p className="text-[11.5px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Missing Invoices
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-[Manrope,sans-serif] text-[18px] font-extrabold text-[#0E1630] dark:text-white">
                3
              </span>
              <span className="text-[11.5px] font-semibold text-rose-600 dark:text-rose-400">
                12%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Return Discrepancies */}
        <div className="flex items-center gap-3 rounded-[14px] bg-[#F8FAFC] dark:bg-[#151B2B] p-3 border border-[#E2E8F0]/60 dark:border-[#1E293B]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <FileSearch size={18} />
          </div>
          <div>
            <p className="text-[11.5px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Return Discrepancies
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-[Manrope,sans-serif] text-[18px] font-extrabold text-[#0E1630] dark:text-white">
                1
              </span>
              <span className="text-[11.5px] font-semibold text-purple-600 dark:text-purple-400">
                4%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
