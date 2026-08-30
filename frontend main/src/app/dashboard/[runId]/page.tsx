"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  FileCheck,
  Mail,
  Eye,
  SlidersHorizontal,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  FileText,
  CheckCircle2,
  Loader2,
  ServerCrash,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuditFlowPipeline } from "@/components/AuditFlowPipeline";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useCases } from "@/hooks/useCases";
import { useAuditSummary } from "@/hooks/useAuditSummary";
import type { CaseSummary } from "@/lib/api-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function actionIconFor(action: string | undefined) {
  const a = (action ?? "").toLowerCase();
  if (a.includes("request") || a.includes("invoice")) return "mail";
  if (a.includes("reverse") || a.includes("itc"))     return "reverse";
  if (a.includes("duplicate"))                         return "trash";
  if (a.includes("correct") || a.includes("hsn"))     return "edit";
  return "eye";
}

function mapStatus(status: string): "Open" | "Investigating" | "Resolved" {
  if (status === "RESOLVED" || status === "DISMISSED")              return "Resolved";
  if (status === "INVESTIGATION_REQUIRED" || status === "ESCALATED") return "Investigating";
  return "Open";
}

function mapRiskTier(tier: string): "High" | "Medium" | "Low" {
  if (tier === "HIGH")   return "High";
  if (tier === "MEDIUM") return "Medium";
  return "Low";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const router = useRouter();

  // Live data hooks
  const { cases, loading: casesLoading, error: casesError } = useCases(runId);
  const { summary, loading: summaryLoading } = useAuditSummary(runId);

  // Derive KPIs from cases when summary is unavailable
  const itcAtRisk = summary?.itc_at_risk_amount ?? cases.reduce((s, c) => s + c.amount, 0);
  const totalTx   = summary?.tx_ingested ?? cases.length;
  const matched   = summary?.matched ?? 0;
  const mismatched = summary?.mismatched ?? cases.length;
  const topRiskScore = cases.length > 0 ? Math.max(...cases.map(c => c.risk_score)) : 0;
  const topRiskTier  = topRiskScore >= 70 ? "HIGH" : topRiskScore >= 40 ? "MEDIUM" : "LOW";

  // Donut chart data computed from live cases
  const exposureData = useMemo(() => {
    const high = cases.filter(c => c.risk_tier === "HIGH").reduce((s, c) => s + c.amount, 0);
    const med  = cases.filter(c => c.risk_tier === "MEDIUM").reduce((s, c) => s + c.amount, 0);
    const low  = cases.filter(c => c.risk_tier === "LOW").reduce((s, c) => s + c.amount, 0);
    const total = high + med + low || 1;
    return [
      { name: "High Risk",   value: high, color: "#EF4444", pct: `${Math.round((high / total) * 100)}%` },
      { name: "Medium Risk", value: med,  color: "#F59E0B", pct: `${Math.round((med / total) * 100)}%` },
      { name: "Low Risk",    value: low,  color: "#10B981", pct: `${Math.round((low / total) * 100)}%` },
    ];
  }, [cases]);



  // Top priority case for the recommended action card
  const topCase: CaseSummary | undefined = cases[0];

  return (
    <DashboardLayout
      activeNav="dashboard"
      runId={runId}
      headerTitle="AI Audit Summary"
      headerSubtitle="Real-time compliance investigation results"
    >
      <div className="space-y-6">
        {/* ── 1. Top KPI Hero Banner ───────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[24px] bg-[#0E1424] dark:bg-[#0D1220] border border-transparent dark:border-[#1E293B] p-6 sm:p-7 text-white shadow-xl transition-colors duration-200">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] blur-[10px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-80 bg-[radial-gradient(ellipse,rgba(79,110,247,0.2)_0%,transparent_70%)]" />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
            {/* Overall Risk Score */}
            <div className="sm:pr-6 pt-4 sm:pt-0">
              <div className="flex items-center justify-between text-[11.5px] font-bold tracking-wider uppercase text-[#94A3B8] mb-2">
                <span>OVERALL RISK SCORE</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                  <ShieldAlert size={16} />
                </div>
              </div>
              {summaryLoading || casesLoading ? (
                <div className="flex items-center gap-2 h-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-[Manrope,sans-serif] text-[34px] font-extrabold leading-none text-white">{topRiskScore}</span>
                    <span className="text-[18px] font-bold text-[#94A3B8]">/ 100</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold border ${
                      topRiskTier === "HIGH"   ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                      : topRiskTier === "MEDIUM" ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    }`}>{topRiskTier} RISK</span>
                  </div>
                  <p className="flex items-center gap-1 text-[12px] font-semibold text-rose-400 mt-2">
                    <TrendingUp size={13} /><span>Highest risk case in this audit run</span>
                  </p>
                </>
              )}
            </div>

            {/* ITC at Risk */}
            <div className="sm:px-6 pt-4 sm:pt-0">
              <div className="flex items-center justify-between text-[11.5px] font-bold tracking-wider uppercase text-[#94A3B8] mb-2">
                <span>ITC AT RISK</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-[#818CF8]">
                  <span className="font-bold text-[14px]">₹</span>
                </div>
              </div>
              {casesLoading ? (
                <div className="flex items-center gap-2 h-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[Manrope,sans-serif] text-[28px] font-extrabold leading-none text-white">
                      ₹{itcAtRisk.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#94A3B8] mt-1">Potential loss if not addressed</p>
                </>
              )}
            </div>

            {/* Total Transactions */}
            <div className="sm:px-6 pt-4 sm:pt-0">
              <div className="flex items-center justify-between text-[11.5px] font-bold tracking-wider uppercase text-[#94A3B8] mb-2">
                <span>TRANSACTIONS SCANNED</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <RefreshCw size={15} />
                </div>
              </div>
              {casesLoading ? (
                <div className="flex items-center gap-2 h-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[Manrope,sans-serif] text-[34px] font-extrabold leading-none text-white">{totalTx}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[12px]">
                    <span className="text-emerald-400 font-semibold">{matched} Matched</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-amber-400 font-semibold">{mismatched} Discrepancies</span>
                  </div>
                </>
              )}
            </div>

            {/* Open Cases */}
            <div className="sm:pl-6 pt-4 sm:pt-0">
              <div className="flex items-center justify-between text-[11.5px] font-bold tracking-wider uppercase text-[#94A3B8] mb-2">
                <span>OPEN CASES</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <FileCheck size={16} />
                </div>
              </div>
              {casesLoading ? (
                <div className="flex items-center gap-2 h-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[Manrope,sans-serif] text-[34px] font-extrabold leading-none text-white">{cases.length}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#CBD5E1]">
                    <span className="bg-slate-800/90 px-2 py-0.5 rounded-full">{cases.filter(c => c.risk_tier === "HIGH").length} High</span>
                    <span className="bg-slate-800/90 px-2 py-0.5 rounded-full">{cases.filter(c => c.risk_tier === "MEDIUM").length} Medium</span>
                    <span className="bg-slate-800/90 px-2 py-0.5 rounded-full">{cases.filter(c => c.risk_tier === "LOW").length} Low</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. Main 2-Column Section ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AuditFlowPipeline onNodeClick={() => router.push(`/audit/${runId}/processing`)} />

            {/* PRIORITY CASES TABLE */}
            <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="font-[Manrope,sans-serif] text-[16px] font-extrabold tracking-tight text-[#0E1630] dark:text-white">
                    PRIORITY CASES
                  </h2>
                  {!casesLoading && (
                    <span className="rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800 px-2.5 py-0.5 text-[11.5px] font-extrabold text-rose-600 dark:text-rose-400">
                      {cases.length} Cases
                    </span>
                  )}
                </div>
                <Link href="/cases" className="inline-flex items-center gap-1 text-[13px] font-bold text-[#4F6EF7] dark:text-[#60A5FA] hover:underline">
                  <span>View All Cases</span><ArrowRight size={14} />
                </Link>
              </div>

              {/* Loading */}
              {casesLoading && (
                <div className="flex items-center justify-center py-10 gap-3 text-[#64748B]">
                  <Loader2 size={18} className="animate-spin text-[#4F6EF7]" />
                  <span className="text-[13px]">Loading cases…</span>
                </div>
              )}

              {/* Error */}
              {!casesLoading && casesError && (
                <div className="flex items-center justify-center py-10 gap-2 text-rose-500">
                  <ServerCrash size={18} />
                  <span className="text-[13px] font-medium">{casesError}</span>
                </div>
              )}

              {/* Table */}
              {!casesLoading && !casesError && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                        <th className="pb-3 pr-3">Case ID</th>
                        <th className="pb-3 px-3">Vendor / Invoice</th>
                        <th className="pb-3 px-3">Issue</th>
                        <th className="pb-3 px-3 text-right">Amount</th>
                        <th className="pb-3 px-3 text-center">Risk</th>
                        <th className="pb-3 px-3">Recommended Action</th>
                        <th className="pb-3 px-3 text-center">Status</th>
                        <th className="pb-3 pl-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                      {cases.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-[#94A3B8] text-[13px]">
                            No cases found for this audit run.
                          </td>
                        </tr>
                      ) : (
                        cases.slice(0, 10).map((item) => {
                          const tier = mapRiskTier(item.risk_tier);
                          const statusLabel = mapStatus(item.status);
                          const icon = actionIconFor(item.recommended_action);
                          return (
                            <tr
                              key={item.case_id}
                              onClick={() => router.push(`/cases/${item.case_id}`)}
                              className="group hover:bg-[#F8FAFC] dark:hover:bg-[#151B2B] transition-colors cursor-pointer"
                            >
                              <td className="py-3.5 pr-3 font-mono font-bold text-[#0E1630] dark:text-white text-[12px]">
                                {item.case_id.substring(0, 12)}
                              </td>
                              <td className="py-3.5 px-3">
                                <p className="font-semibold text-[#0E1630] dark:text-white group-hover:text-[#4F6EF7] dark:group-hover:text-[#60A5FA] transition-colors">
                                  {item.counterparty}
                                </p>
                                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                  {item.invoice_no ?? "—"}
                                </p>
                              </td>
                              <td className="py-3.5 px-3 font-medium text-[#475569] dark:text-[#CBD5E1]">{item.issue}</td>
                              <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#0E1630] dark:text-white">
                                ₹{item.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                  tier === "High"   ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                  : tier === "Medium" ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                }`}>
                                  {item.risk_score} {tier}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0E1630] dark:text-[#E2E8F0]">
                                  {icon === "mail"    && <Mail size={14} className="text-[#4F6EF7]" />}
                                  {icon === "eye"     && <Eye size={14} className="text-amber-500" />}
                                  {icon === "edit"    && <SlidersHorizontal size={14} className="text-indigo-500" />}
                                  {icon === "trash"   && <AlertTriangle size={14} className="text-slate-500" />}
                                  {icon === "reverse" && <RefreshCw size={14} className="text-purple-500" />}
                                  <span>{item.recommended_action ?? "Review & Verify"}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  statusLabel === "Open"         ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                  : statusLabel === "Investigating" ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                                }`}>{statusLabel}</span>
                              </td>
                              <td className="py-3.5 pl-2 text-right text-[#94A3B8] group-hover:text-[#4F6EF7] transition-colors">
                                <ChevronRight size={16} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">


            {/* Financial Exposure Donut */}
            <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
              <h3 className="font-[Manrope,sans-serif] text-[14.5px] font-extrabold uppercase tracking-tight text-[#0E1630] dark:text-white mb-4">
                FINANCIAL EXPOSURE
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={exposureData} innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                        {exposureData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: unknown) => [`₹${Number(val).toLocaleString("en-IN")}`, "Exposure"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="font-[Manrope,sans-serif] text-[13px] font-extrabold text-[#0E1630] dark:text-white leading-none">
                      ₹{(itcAtRisk / 100000).toFixed(1)}L
                    </span>
                    <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Total ITC</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2.5 text-[12px]">
                  {exposureData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[#0E1630] dark:text-white">
                        ₹{item.value.toLocaleString("en-IN")}{" "}
                        <span className="text-[11px] text-[#94A3B8]">({item.pct})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommended Action Card */}
            <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[Manrope,sans-serif] text-[14.5px] font-extrabold uppercase tracking-tight text-[#0E1630] dark:text-white">
                  AI RECOMMENDED ACTION
                </h3>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-0.5 text-[11px] font-bold text-[#4F6EF7] dark:text-[#60A5FA]">
                  Top Priority
                </span>
              </div>

              {casesLoading ? (
                <div className="flex items-center gap-2 py-4"><Loader2 size={16} className="animate-spin text-[#4F6EF7]" /><span className="text-[13px] text-[#64748B]">Loading…</span></div>
              ) : topCase ? (
                <>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-blue-50 dark:bg-blue-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-[Manrope,sans-serif] text-[15px] font-extrabold text-[#0E1630] dark:text-white">
                          {topCase.recommended_action ?? "Review Case"}
                        </h4>
                        <span className="rounded-full bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                          High Impact
                        </span>
                      </div>
                      <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{topCase.counterparty}</p>
                      <p className="font-[Manrope,sans-serif] text-[20px] font-extrabold text-[#0E1630] dark:text-white mt-1">
                        ₹{topCase.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4">
                    {topCase.issue} — immediate compliance review required.
                  </p>
                  <Link
                    href={`/cases/${topCase.case_id}`}
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] py-3 text-[13.5px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgba(90,90,247,0.65)]"
                  >
                    <span>Review Action Plan</span><ArrowRight size={15} />
                  </Link>
                </>
              ) : (
                <p className="text-[13px] text-[#94A3B8] py-4 text-center">No open cases found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
