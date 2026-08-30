"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Eye,
  Brain,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Send,
  CheckCircle2,
  Loader2,
  Terminal,
  Clock,
  Zap,
  Activity,
  FileSearch,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuditSummary } from "@/hooks/useAuditSummary";

interface PipelineStep {
  id: string;
  stage: string;
  agentName: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  getStatSummary: (summary: any) => string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "perceive",
    stage: "PERCEIVE",
    agentName: "DataExtractorAgent",
    title: "Document Ingestion & OCR Parsing",
    description: "Extracting structured line items from bank CSVs, purchase PDFs, and sales records.",
    icon: Eye,
    getStatSummary: (s) => `${s?.docs_ingested ?? 0} documents parsed, ${s?.tx_ingested ?? 0} line items indexed`,
  },
  {
    id: "think",
    stage: "THINK",
    agentName: "TaxNormParserAgent",
    title: "GSTIN Validation & Semantic Mapping",
    description: "Validating active GSTINs, verifying HSN codes, and standardizing tax rates (18%, 12%, 5%).",
    icon: Brain,
    getStatSummary: () => "100% GSTIN verification complete",
  },
  {
    id: "reconcile",
    stage: "RECONCILE",
    agentName: "ReconciliationAgent",
    title: "3-Way Transaction Reconciliation",
    description: "Matching bank debits against vendor invoices and cross-checking with GSTR-2B filings.",
    icon: RefreshCw,
    getStatSummary: (s) => `${s?.matched ?? 0} matches verified, ${s?.mismatched ?? 0} discrepancies detected`,
  },
  {
    id: "investigate",
    stage: "INVESTIGATE",
    agentName: "InvestigationAgent",
    title: "Supplier Compliance & Anomaly Search",
    description: "Investigating vendor compliance track records, prior notices, and delayed filings.",
    icon: Search,
    getStatSummary: (s) => `${s?.high_risk ?? 0} vendor notices flagged under Section 143`,
  },
  {
    id: "analyze_risk",
    stage: "ANALYZE RISK",
    agentName: "RiskScoringAgent",
    title: "Multi-Factor Exposure Modeling",
    description: "Calculating composite risk scores (0-100) and quantifying Input Tax Credit (ITC) at risk.",
    icon: ShieldAlert,
    getStatSummary: (s) => `₹${(s?.itc_at_risk_amount ?? 0).toLocaleString('en-IN')} ITC exposure flagged across ${s?.high_risk ?? 0} High Risk cases`,
  },
  {
    id: "decide",
    stage: "DECIDE",
    agentName: "DecisionAgent",
    title: "Policy & Remediation Routing",
    description: "Determining optimal compliance actions: Request Missing Invoice, Reverse ITC, or CA Review.",
    icon: SlidersHorizontal,
    getStatSummary: (s) => `Optimal remediation actions selected for ${s?.mismatched ?? 0} cases`,
  },
  {
    id: "act",
    stage: "ACT",
    agentName: "ActionDraftAgent",
    title: "Autonomous Communication Drafting",
    description: "Generating legally compliant draft notices, supplier inquiry letters, and audit logs.",
    icon: Send,
    getStatSummary: () => "Action previews ready for human sign-off",
  },
];

interface LogEntry {
  id: string;
  stepName: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "risk";
}



export default function AuditProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const runId = (params?.runId as string) || "run-2024-08-001";

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const { summary, refresh: refreshSummary } = useAuditSummary(runId);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const wsUrl = API_BASE.replace(/^http/, "ws") + `/ws/audit/${runId}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "heartbeat") return;

        // data is AgentEventPayload
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        
        let type: LogEntry["type"] = "info";
        if (data.step.toLowerCase().includes("complete")) type = "success";
        if (data.risk_score_delta && data.risk_score_delta > 0) type = "risk";
        
        const newLog: LogEntry = {
          id: `log-${Date.now()}-${Math.random()}`,
          stepName: data.agent_name,
          message: data.message || `Executing step: ${data.step}`,
          timestamp: elapsed,
          type,
        };

        setLogs((prev) => [...prev, newLog]);
        
        // Refresh summary so UI numbers tick up live!
        refreshSummary();

        // Advance active step visually if we match an agent
        const stepIdx = PIPELINE_STEPS.findIndex(p => p.agentName === data.agent_name);
        if (stepIdx > activeStepIndex) {
          setActiveStepIndex(stepIdx);
        }

        if (data.step === "WORKFLOW_COMPLETED") {
          setIsCompleted(true);
          setActiveStepIndex(PIPELINE_STEPS.length);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.onclose = () => {
      setIsCompleted(true);
      setActiveStepIndex(PIPELINE_STEPS.length);
    };

    return () => {
      ws.close();
    };
  }, [runId, startTime, activeStepIndex]);

  // Overall Progress Percentage
  const progressPercent = Math.min(
    100,
    Math.round((activeStepIndex / PIPELINE_STEPS.length) * 100)
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FD] dark:bg-[#080B14] text-[#0E1630] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Atmosphere glows */}
      <div className="pointer-events-none absolute -right-[10%] -top-[10%] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,rgba(139,92,246,0.06)_45%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] blur-[10px]" />
      <div className="pointer-events-none absolute bottom-[-10%] -left-[5%] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(79,110,247,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(79,110,247,0.18)_0%,transparent_70%)]" />

      {/* ── Top Navbar ───────────────────────────────────────────────────────── */}
      <nav className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5 lg:px-16 border-b border-[#E2E8F0]/60 dark:border-[#1E293B] bg-white/70 dark:bg-[#0D1220]/80 backdrop-blur-md transition-colors duration-200">
        <Link href="/" className="flex items-center gap-3 group">
          <svg viewBox="0 0 40 40" className="h-8 w-8">
            <defs>
              <linearGradient id="procLogoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#4F6EF7" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M20 6 L10 12.5 L20 19 L30 12.5 Z" fill="url(#procLogoGrad)" />
            <path
              d="M10 20 L20 26.5 L30 20 L30 24 L20 30.5 L10 24 Z"
              fill="url(#procLogoGrad)"
              opacity="0.75"
            />
          </svg>
          <span className="font-[Manrope,sans-serif] text-[20px] font-extrabold">
            <span className="text-[#0E1630] dark:text-white">GST</span>{" "}
            <span className="text-[#4F6EF7] dark:text-[#60A5FA]">ARCHANGEL</span>
          </span>
        </Link>

        {/* Audit Run Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#151B2B] border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#4F6EF7] animate-pulse" />
            <span className="font-mono text-[12px] font-bold text-[#404A63] dark:text-[#CBD5E1]">
              AUDIT RUN: {runId}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[12px] font-semibold">
            <Activity size={13} className="animate-pulse" />
            <span>AGENTS LIVE</span>
          </div>
        </div>

        {/* Controls & Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href={`/dashboard/${runId}`}
            className="text-[13.5px] font-semibold text-[#66708A] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="relative z-[5] mx-auto max-w-[1500px] px-6 py-8 lg:px-12">
        {/* Top Header & Live Progress */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/15 dark:border-indigo-500/30 bg-gradient-to-r from-[#4F6EF7]/10 to-[#8B5CF6]/10 dark:from-[#4F6EF7]/20 dark:to-[#8B5CF6]/20 px-3.5 py-1 text-[12.5px] font-semibold text-[#4F6EF7] dark:text-[#60A5FA] mb-2.5">
                <Sparkles size={13} /> Autonomous Multi-Agent Investigation
              </div>
              <h1 className="font-[Manrope,sans-serif] text-[28px] font-extrabold text-[#0E1630] dark:text-white lg:text-[38px] tracking-tight">
                Your GST Audit is Running
              </h1>
              <p className="text-[15.5px] text-[#66708A] dark:text-[#94A3B8] mt-1">
                Archangel is analyzing your financial records through a 7-stage cognitive pipeline.
              </p>
            </div>

            {/* Progress counter & bar */}
            <div className="w-full md:w-80 rounded-[18px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-4 shadow-[0_10px_25px_-10px_rgba(60,70,160,0.1)] dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0E1630] dark:text-white mb-2">
                <span>Pipeline Progress</span>
                <span className="text-[#4F6EF7] dark:text-[#60A5FA]">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-2">
                <span>
                  {isCompleted
                    ? "All 7 agents finished"
                    : `Running step ${Math.min(activeStepIndex + 1, 7)} of 7`}
                </span>
                <span>{isCompleted ? "Complete" : "Analyzing..."}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Completed Banner Trigger ────────────────────────────────────────── */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-8 rounded-[24px] border border-green-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 dark:from-emerald-950/40 dark:to-indigo-950/40 p-6 sm:p-7 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                    <CheckCircle2 size={30} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-[12px] font-bold text-emerald-800 dark:text-emerald-300">
                        AUDIT COMPLETE
                      </span>
                      <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">100% Reconciled</span>
                    </div>
                    <h3 className="font-[Manrope,sans-serif] text-[20px] font-extrabold text-[#0E1630] dark:text-white mt-1">
                      Discrepancies Flagged • Potential ITC at Risk Analyzed
                    </h3>
                    <p className="text-[13.5px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
                      Audit complete. AI recommended actions and draft responses are ready for review.
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/${runId}`)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-8 py-4 text-[15px] font-bold text-white shadow-[0_16px_32px_-10px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-10px_rgba(90,90,247,0.65)] cursor-pointer"
                  >
                    <span>VIEW AUDIT DASHBOARD</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Two-Column Layout ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7-step Cognitive Agent Pipeline) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-[Manrope,sans-serif] text-[18px] font-bold text-[#0E1630] dark:text-white">
                Cognitive Multi-Agent Pipeline
              </h2>
              <span className="text-[12.5px] text-[#64748B] dark:text-[#94A3B8]">
                Perceive → Think → Reconcile → Investigate → Risk → Decide → Act
              </span>
            </div>

            {PIPELINE_STEPS.map((step, index) => {
              const isDone = index < activeStepIndex;
              const isCurrent = index === activeStepIndex && !isCompleted;
              const isPending = index > activeStepIndex;
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`relative flex items-start gap-4 rounded-[20px] border p-4.5 transition-all duration-300 ${
                    isCurrent
                      ? "border-[#4F6EF7] bg-white dark:bg-[#111827] ring-2 ring-[#4F6EF7]/20 shadow-[0_16px_35px_-12px_rgba(79,110,247,0.25)]"
                      : isDone
                      ? "border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)]"
                      : "border-slate-200/50 dark:border-[#1E293B]/40 bg-slate-50/50 dark:bg-[#0D1220]/40 opacity-60"
                  }`}
                >
                  {/* Left step status icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-colors ${
                      isDone
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                        : isCurrent
                        ? "bg-gradient-to-br from-[#4F6EF7] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/25"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} />
                    ) : isCurrent ? (
                      <Loader2 size={22} className="animate-spin" />
                    ) : (
                      <StepIcon size={20} />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[11px] font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                            isCurrent
                              ? "bg-indigo-100 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]"
                              : isDone
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {step.stage}
                        </span>
                        <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                          @{step.agentName}
                        </span>
                      </div>

                      <span
                        className={`text-[12px] font-semibold ${
                          isDone
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isCurrent
                            ? "text-[#4F6EF7] dark:text-[#60A5FA] animate-pulse"
                            : "text-[#94A3B8]"
                        }`}
                      >
                        {isDone ? "Done" : isCurrent ? "Active Processing" : "Queued"}
                      </span>
                    </div>

                    <h4 className="font-[Manrope,sans-serif] text-[15.5px] font-bold text-[#0E1630] dark:text-white mt-1">
                      {step.title}
                    </h4>

                    <p className="text-[13px] text-[#66708A] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                      {step.description}
                    </p>

                    {(isDone || isCurrent) && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#151B2B] border border-[#E2E8F0] dark:border-[#1E293B] px-2.5 py-1 text-[11.5px] font-medium text-[#404A63] dark:text-[#CBD5E1]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4F6EF7] dark:bg-[#60A5FA]" />
                        <span>{step.getStatSummary(summary)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column (Agent Activity Stream & Live Telemetry) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Telemetry KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-4.5 shadow-[0_12px_28px_-12px_rgba(60,70,160,0.08)] transition-colors duration-200">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  <FileSearch size={14} className="text-[#4F6EF7] dark:text-[#60A5FA]" />
                  <span>Docs Ingested</span>
                </div>
                <p className="font-[Manrope,sans-serif] text-[24px] font-extrabold text-[#0E1630] dark:text-white">
                  {summary?.docs_ingested ?? 0}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  100% OCR verified
                </p>
              </div>

              <div className="rounded-[20px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-4.5 shadow-[0_12px_28px_-12px_rgba(60,70,160,0.08)] transition-colors duration-200">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  <RefreshCw size={14} className="text-[#4F6EF7] dark:text-[#60A5FA]" />
                  <span>Matched Items</span>
                </div>
                <p className="font-[Manrope,sans-serif] text-[24px] font-extrabold text-[#0E1630] dark:text-white">
                  {summary?.matched ?? 0}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Across {summary?.tx_ingested ?? 0} bank debits
                </p>
              </div>

              <div className="rounded-[20px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-4.5 shadow-[0_12px_28px_-12px_rgba(60,70,160,0.08)] transition-colors duration-200">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span>Discrepancies</span>
                </div>
                <p className="font-[Manrope,sans-serif] text-[24px] font-extrabold text-amber-600 dark:text-amber-400">
                  {summary?.mismatched ?? 0}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/90 font-medium mt-0.5">
                  Missing & unlinked invoices
                </p>
              </div>

              <div className="rounded-[20px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-4.5 shadow-[0_12px_28px_-12px_rgba(60,70,160,0.08)] transition-colors duration-200">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  <TrendingUp size={14} className="text-rose-500" />
                  <span>ITC at Risk</span>
                </div>
                <p className="font-[Manrope,sans-serif] text-[24px] font-extrabold text-rose-600 dark:text-rose-400">
                  ₹{(summary?.itc_at_risk_amount ?? 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-400/90 font-medium mt-0.5">
                  Section 16 exposure
                </p>
              </div>
            </div>

            {/* Agent Activity Panel (Neural Event Stream) */}
            <div className="flex-1 rounded-[22px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_14px_35px_-15px_rgba(60,70,160,0.1)] dark:shadow-none flex flex-col transition-colors duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]/70 dark:border-[#1E293B] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                    <Terminal size={16} />
                  </div>
                  <div>
                    <h3 className="font-[Manrope,sans-serif] text-[15px] font-bold text-[#0E1630] dark:text-white">
                      Agent Activity Stream
                    </h3>
                    <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">
                      Real-time multi-agent execution telemetry
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE
                </span>
              </div>

              {/* Event Logs List */}
              <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-[#94A3B8]">
                    <Loader2 size={24} className="animate-spin text-[#4F6EF7] mb-2" />
                    <p className="text-[13px]">Initializing agent context...</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl border text-[12.5px] ${
                        log.type === "risk"
                          ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900 text-rose-900 dark:text-rose-300"
                          : log.type === "warning"
                          ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900 text-amber-900 dark:text-amber-300"
                          : log.type === "success"
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300"
                          : "bg-[#F8FAFC] dark:bg-[#151B2B] border-[#E2E8F0] dark:border-[#1E293B] text-[#334155] dark:text-[#CBD5E1]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[11px] opacity-80">
                        <span className="font-mono font-bold tracking-wider uppercase">
                          [{log.stepName}]
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={10} /> +{log.timestamp}s
                        </span>
                      </div>
                      <p className="leading-snug">{log.message}</p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Bottom status */}
              <div className="mt-4 pt-3 border-t border-[#E2E8F0]/70 dark:border-[#1E293B] flex items-center justify-between text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">
                <span>Autonomous Agent Runtime: v2.4</span>
                <span>Deterministic Evidence Verification</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
