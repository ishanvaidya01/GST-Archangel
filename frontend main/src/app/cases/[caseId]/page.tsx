"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Send,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Database,
  GitMerge,
  Search,
  BookOpen,
  BarChart2,
  Zap,
  Loader2,
  ServerCrash,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCaseDetail } from "@/hooks/useCaseDetail";

const STEP_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  DATA_EXTRACTION: { icon: Database, color: "#4F6EF7", bg: "bg-blue-50 dark:bg-blue-950/60" },
  RECONCILIATION:  { icon: GitMerge, color: "#8B5CF6", bg: "bg-purple-50 dark:bg-purple-950/60" },
  INVESTIGATION:   { icon: Search, color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/60" },
  GST_RULES:       { icon: BookOpen, color: "#06B6D4", bg: "bg-cyan-50 dark:bg-cyan-950/60" },
  RISK_ASSESSMENT: { icon: BarChart2, color: "#EF4444", bg: "bg-rose-50 dark:bg-rose-950/60" },
  DECISION:        { icon: CheckCircle2, color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
  ACTION:          { icon: Zap, color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/60" },
};

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);

  const { detail, loading, error } = useCaseDetail(caseId);

  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [actionStatus, setActionStatus] = useState<"DRAFT" | "APPROVED">("DRAFT");
  const [copied, setCopied] = useState(false);

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyDraft = () => {
    if (detail?.action_preview?.draft_content) {
      navigator.clipboard.writeText(detail.action_preview.draft_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const riskTier = detail?.risk_tier ?? "LOW";
  const riskScore = detail?.risk_score ?? 0;
  const vendorName = detail?.counterparty ?? "Unknown Supplier";
  const amount = detail?.amount ?? 0;
  const issue = detail?.issue ?? "Discrepancy detected";

  return (
    <DashboardLayout
      activeNav="cases"
      runId={detail?.run_id ?? "run-2024-08-001"}
      headerTitle={`Case ${caseId.substring(0, 12)}`}
      headerSubtitle="Review automated investigation and approve action"
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/cases"
            className="group flex items-center gap-2 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] transition-colors hover:text-[#0E1630] dark:hover:text-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] group-hover:bg-[#E2E8F0] dark:group-hover:bg-[#334155] transition-colors">
              <ArrowLeft size={14} />
            </div>
            Back to Cases
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[12px] font-bold text-[#0E1630] dark:text-white">
              {detail?.run_id ?? "—"}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-[#64748B]">
            <Loader2 size={24} className="animate-spin text-[#4F6EF7]" />
            <span className="text-[14px] font-medium">Loading case details…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <ServerCrash size={36} className="text-rose-400" />
            <p className="text-[14px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            <Link href="/cases" className="mt-2 px-4 py-2 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] text-[13px] font-semibold text-[#4F6EF7]">
              Back to Cases
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && !error && detail && (
          <>
            {/* ── 1. Case Overview Header Card ───────────────────────────────────── */}
            <div className="rounded-[24px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 sm:p-7 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span className="font-mono text-[13px] font-extrabold text-[#4F6EF7] dark:text-[#60A5FA] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 px-3 py-1 rounded-full">
                      {caseId.substring(0, 12).toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold ${
                      riskTier === "HIGH"   ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                      : riskTier === "MEDIUM" ? "bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      <ShieldAlert size={14} /> {riskScore} / 100 {riskTier} RISK
                    </span>
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 text-[12px] font-bold text-amber-700 dark:text-amber-400">
                      {detail.status.replace("_", " ")}
                    </span>
                  </div>

                  <h1 className="font-[Manrope,sans-serif] text-[24px] font-extrabold text-[#0E1630] dark:text-white tracking-tight">
                    {vendorName}
                  </h1>
                  {detail.gstin && (
                    <p className="font-mono text-[12.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      GSTIN: {detail.gstin}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-[#E2E8F0]/80 dark:border-[#1E293B]">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">TRANSACTION AMOUNT</p>
                      <p className="font-[Manrope,sans-serif] text-[20px] font-extrabold text-[#0E1630] dark:text-white mt-0.5">
                        ₹{amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#1E293B] hidden sm:block" />
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">PRIMARY ISSUE</p>
                      <p className="text-[14px] font-bold text-rose-600 dark:text-rose-400 mt-1">{issue}</p>
                    </div>
                    <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#1E293B] hidden sm:block" />
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">DETECTED ON</p>
                      <p className="text-[13.5px] font-semibold text-[#475569] dark:text-[#CBD5E1] mt-1">
                        {new Date(detail.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0 w-full lg:w-auto">
                  <Link
                    href={`/cases/${caseId}/adapt`}
                    className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5"
                  >
                    <FlaskConical size={16} />
                    <span>Submit New Evidence</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 2. Two Column Section ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Agent Trace + Action Draft */}
              <div className="lg:col-span-8 space-y-6">
                {/* Agent Trace */}
                <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E2E8F0]/80 dark:border-[#1E293B]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h2 className="font-[Manrope,sans-serif] text-[16px] font-extrabold text-[#0E1630] dark:text-white">Agent Trace Timeline</h2>
                        <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">Sequential evidence processing &amp; reasoning steps</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Deterministic Audit Log
                    </span>
                  </div>

                  {detail.agent_events.length === 0 ? (
                    <p className="text-[13px] text-[#94A3B8] py-8 text-center">No agent events recorded for this case yet.</p>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E8F0] dark:before:bg-[#1E293B]">
                      {detail.agent_events.map((evt, idx) => {
                        const conf = STEP_ICONS[evt.step] || { icon: Zap, color: "#4F6EF7", bg: "bg-blue-50 dark:bg-blue-950/60" };
                        const Icon = conf.icon;
                        const isExpanded = expandedReasoning[`${idx}`];
                        const reasoning = typeof evt.reasoning === "string" ? evt.reasoning : JSON.stringify(evt.reasoning, null, 2);

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.05 }}
                            className="relative flex items-start gap-4"
                          >
                            <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-[#111827] bg-[#4F6EF7] shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                            <div className="flex-1 rounded-[16px] border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#151B2B] p-4 hover:bg-white dark:hover:bg-[#1A2236] hover:shadow-sm transition-all">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`p-1 rounded-md ${conf.bg}`} style={{ color: conf.color }}>
                                    <Icon size={14} />
                                  </span>
                                  <span className="font-mono text-[11px] font-bold text-[#4F6EF7] dark:text-[#60A5FA]">
                                    @{evt.agent_name}
                                  </span>
                                </div>
                                <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                  {new Date(evt.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-[13.5px] font-semibold text-[#0E1630] dark:text-white leading-snug">
                                {evt.step.replace("_", " ")}
                              </p>
                              {reasoning && (
                                <div className="mt-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleReasoning(`${idx}`)}
                                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#4F6EF7] dark:text-[#60A5FA] hover:underline cursor-pointer"
                                  >
                                    <span>{isExpanded ? "Hide Agent Reasoning" : "View Agent Reasoning"}</span>
                                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                  </button>
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 rounded-xl bg-white dark:bg-[#0D1220] border border-[#E2E8F0] dark:border-[#1E293B] p-3 text-[12px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed whitespace-pre-wrap font-mono"
                                      >
                                        {reasoning}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Draft Card */}
                <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]/80 dark:border-[#1E293B]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3 className="font-[Manrope,sans-serif] text-[15px] font-extrabold text-[#0E1630] dark:text-white">
                          Action Plan: {detail.action_preview.title}
                        </h3>
                        <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">Human-in-the-loop autonomous response preview</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                      actionStatus === "APPROVED"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA] border border-indigo-200 dark:border-indigo-800"
                    }`}>
                      {actionStatus === "APPROVED" ? "APPROVED FOR DISPATCH" : "DRAFT READY"}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mb-4 leading-relaxed">
                    {detail.action_preview.explanation}
                  </p>

                  <div className="relative rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0D1220] p-4 font-mono text-[12px] text-[#334155] dark:text-[#CBD5E1] leading-relaxed whitespace-pre-line mb-4">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] px-2 py-1 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white shadow-sm transition-all cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    {detail.action_preview.draft_content}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      <Clock size={14} />
                      <span>Prepared by @ActionDraftAgent</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/cases/${caseId}/adapt`}
                        className="px-4 py-2.5 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] text-[13px] font-bold text-[#404A63] dark:text-[#CBD5E1] hover:border-[#4F6EF7] transition-all"
                      >
                        Submit Supplier Evidence
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActionStatus("APPROVED")}
                        disabled={actionStatus === "APPROVED"}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Send size={14} />
                        <span>{actionStatus === "APPROVED" ? "Action Approved" : "Approve & Dispatch"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Risk Ledger + Vendor Profile */}
              <div className="lg:col-span-4 space-y-6">
                {/* Risk Ledger */}
                <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
                  <h3 className="font-[Manrope,sans-serif] text-[14.5px] font-extrabold uppercase tracking-tight text-[#0E1630] dark:text-white mb-4">
                    RISK LEDGER
                  </h3>
                  {detail.risk_factors.length === 0 ? (
                    <p className="text-[13px] text-[#94A3B8] py-4 text-center">No risk factors recorded.</p>
                  ) : (
                    <div className="space-y-3 mb-5">
                      {detail.risk_factors.map((item) => (
                        <div key={item.label} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151B2B] border border-[#E2E8F0]/70 dark:border-[#1E293B]">
                          <div>
                            <p className="text-[13px] font-bold text-[#0E1630] dark:text-white">{item.label}</p>
                            <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{item.description}</p>
                          </div>
                          <span className="font-mono text-[13px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800 px-2 py-0.5 rounded-lg shrink-0">
                            +{item.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total Score */}
                  <div className={`rounded-xl border p-4 flex items-center justify-between ${
                    riskTier === "HIGH"   ? "border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40"
                    : riskTier === "MEDIUM" ? "border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40"
                    : "border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40"
                  }`}>
                    <div>
                      <p className={`text-[11px] font-extrabold uppercase tracking-wider ${
                        riskTier === "HIGH" ? "text-rose-700 dark:text-rose-400" : riskTier === "MEDIUM" ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}>TOTAL COMPLIANCE RISK</p>
                      <p className={`font-[Manrope,sans-serif] text-[20px] font-extrabold ${
                        riskTier === "HIGH" ? "text-rose-700 dark:text-rose-400" : riskTier === "MEDIUM" ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}>{riskTier} RISK</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-[Manrope,sans-serif] text-[32px] font-extrabold leading-none ${
                        riskTier === "HIGH" ? "text-rose-600 dark:text-rose-400" : riskTier === "MEDIUM" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}>{riskScore}</span>
                      <span className={`font-mono text-[14px] ${
                        riskTier === "HIGH" ? "text-rose-700 dark:text-rose-400" : riskTier === "MEDIUM" ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}> / 100</span>
                    </div>
                  </div>
                </div>

                {/* Vendor Compliance Profile */}
                <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
                  <h3 className="font-[Manrope,sans-serif] text-[14.5px] font-extrabold uppercase tracking-tight text-[#0E1630] dark:text-white mb-4">
                    VENDOR COMPLIANCE PROFILE
                  </h3>
                  <div className="space-y-3 text-[12.5px]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70 dark:border-[#1E293B]">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Vendor Name:</span>
                      <span className="font-bold text-[#0E1630] dark:text-white max-w-[55%] text-right">{vendorName}</span>
                    </div>
                    {detail.gstin && (
                      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70 dark:border-[#1E293B]">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">GSTIN:</span>
                        <span className="font-mono font-bold text-[#0E1630] dark:text-white">{detail.gstin}</span>
                      </div>
                    )}
                    {detail.invoice_no && (
                      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70 dark:border-[#1E293B]">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Invoice No:</span>
                        <span className="font-mono font-bold text-[#0E1630] dark:text-white">{detail.invoice_no}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70 dark:border-[#1E293B]">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Section 16 Eligibility:</span>
                      <span className={`font-bold ${riskTier === "HIGH" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {riskTier === "HIGH" ? "Blocked pending invoice" : "Eligible for ITC"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Potential ITC at Risk:</span>
                      <span className="font-mono font-bold text-[#0E1630] dark:text-white">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
