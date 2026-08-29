"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  ChevronRight,
  FolderSearch,
  FileText,
  Loader2,
  ServerCrash,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCases } from "@/hooks/useCases";
import type { CaseSummary } from "@/lib/api-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function actionIcon(action: string | undefined) {
  const a = (action ?? "").toLowerCase();
  if (a.includes("request") || a.includes("invoice")) return "mail";
  if (a.includes("reverse") || a.includes("itc")) return "reverse";
  if (a.includes("duplicate")) return "trash";
  if (a.includes("correct") || a.includes("file") || a.includes("hsn")) return "edit";
  return "eye";
}

function mapStatus(status: string): "Open" | "Investigating" | "Resolved" {
  if (status === "RESOLVED" || status === "DISMISSED") return "Resolved";
  if (status === "INVESTIGATION_REQUIRED" || status === "ESCALATED") return "Investigating";
  return "Open";
}

function mapRiskTier(tier: string): "High" | "Medium" | "Low" {
  if (tier === "HIGH") return "High";
  if (tier === "MEDIUM") return "Medium";
  return "Low";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CasesListPage() {
  const router = useRouter();
  const { cases, total, loading, error, refresh } = useCases();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Open" | "Investigating" | "Resolved">("All");

  // Derived KPIs from live data
  const openCount = cases.filter(c => mapStatus(c.status) !== "Resolved").length;
  const highCount = cases.filter(c => c.risk_tier === "HIGH").length;
  const medCount  = cases.filter(c => c.risk_tier === "MEDIUM").length;
  const lowCount  = cases.filter(c => c.risk_tier === "LOW").length;
  const itcAtRisk = cases.reduce((sum, c) => sum + (c.amount ?? 0), 0);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.case_id.toLowerCase().includes(query) ||
        item.counterparty.toLowerCase().includes(query) ||
        (item.invoice_no ?? "").toLowerCase().includes(query) ||
        item.issue.toLowerCase().includes(query);

      const tier = mapRiskTier(item.risk_tier);
      const matchesRisk = selectedRisk === "All" || tier === selectedRisk;
      const statusLabel = mapStatus(item.status);
      const matchesStatus = selectedStatus === "All" || statusLabel === selectedStatus;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [cases, searchQuery, selectedRisk, selectedStatus]);

  return (
    <DashboardLayout
      activeNav="cases"
      headerTitle="Compliance Cases"
      headerSubtitle="Review and resolve GST discrepancies identified by Archangel."
    >
      <div className="space-y-6">
        {/* ── 1. Top Summary KPI Metrics Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Open Cases */}
          <div className="rounded-[20px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-5 shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)] transition-colors duration-200">
            <div className="flex items-center justify-between text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              <span>OPEN CASES</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                <FolderSearch size={14} />
              </span>
            </div>
            <p className="font-[Manrope,sans-serif] text-[28px] font-extrabold text-[#0E1630] dark:text-white">
              {loading ? "—" : openCount}
            </p>
            <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Requiring compliance review</p>
          </div>

          {/* High Risk */}
          <div className="rounded-[20px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-5 shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)] transition-colors duration-200">
            <div className="flex items-center justify-between text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              <span>HIGH RISK</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <ShieldAlert size={14} />
              </span>
            </div>
            <p className="font-[Manrope,sans-serif] text-[28px] font-extrabold text-rose-600 dark:text-rose-400">
              {loading ? "—" : highCount}
            </p>
            <p className="text-[11.5px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">Immediate action needed</p>
          </div>

          {/* Medium Risk */}
          <div className="rounded-[20px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-5 shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)] transition-colors duration-200">
            <div className="flex items-center justify-between text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              <span>MEDIUM RISK</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={14} />
              </span>
            </div>
            <p className="font-[Manrope,sans-serif] text-[28px] font-extrabold text-amber-600 dark:text-amber-400">
              {loading ? "—" : medCount}
            </p>
            <p className="text-[11.5px] text-amber-700 dark:text-amber-400/90 font-medium mt-0.5">Discrepancies identified</p>
          </div>

          {/* Low Risk */}
          <div className="rounded-[20px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-5 shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)] transition-colors duration-200">
            <div className="flex items-center justify-between text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              <span>LOW RISK</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <p className="font-[Manrope,sans-serif] text-[28px] font-extrabold text-emerald-600 dark:text-emerald-400">
              {loading ? "—" : lowCount}
            </p>
            <p className="text-[11.5px] text-emerald-700 dark:text-emerald-400/90 font-medium mt-0.5">Minor anomalies</p>
          </div>

          {/* ITC at Risk */}
          <div className="rounded-[20px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-5 shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)] col-span-2 sm:col-span-1 transition-colors duration-200">
            <div className="flex items-center justify-between text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              <span>ITC AT RISK</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                <span className="font-bold text-[13px]">₹</span>
              </span>
            </div>
            <p className="font-[Manrope,sans-serif] text-[28px] font-extrabold text-[#0E1630] dark:text-white">
              {loading ? "—" : `₹${itcAtRisk.toLocaleString("en-IN")}`}
            </p>
            <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Total eligible claim exposure</p>
          </div>
        </div>

        {/* ── 2. Filters & Search Bar ─────────────────────────────────────────── */}
        <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-4 shadow-[0_10px_25px_-12px_rgba(60,70,160,0.06)] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases by ID, vendor name, invoice number, or issue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0D1220] text-[13.5px] text-[#0E1630] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-[#151B2B] focus:border-[#4F6EF7] dark:focus:border-[#60A5FA] focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 rounded-full bg-[#F1F5F9] dark:bg-[#0D1220] p-1 text-[12px] font-semibold border border-transparent dark:border-[#1E293B]">
              {(["All", "High", "Medium", "Low"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRisk(r)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    selectedRisk === r
                      ? "bg-white dark:bg-[#1E2238] text-[#0E1630] dark:text-[#60A5FA] font-bold shadow-sm"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-full bg-[#F1F5F9] dark:bg-[#0D1220] p-1 text-[12px] font-semibold border border-transparent dark:border-[#1E293B]">
              {(["All", "Open", "Investigating", "Resolved"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    selectedStatus === s
                      ? "bg-white dark:bg-[#1E2238] text-[#0E1630] dark:text-[#60A5FA] font-bold shadow-sm"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={refresh}
              title="Refresh cases"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#4F6EF7] dark:hover:text-[#60A5FA] transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ── 3. Cases Table ─────────────────────────────────────────────────── */}
        <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="font-[Manrope,sans-serif] text-[16px] font-extrabold text-[#0E1630] dark:text-white">
                Discrepancy Cases
              </h2>
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                ({filteredCases.length} of {total} cases)
              </span>
            </div>
            <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Click any case to inspect agent trace &amp; resolve
            </span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-[#64748B] dark:text-[#94A3B8]">
              <Loader2 size={20} className="animate-spin text-[#4F6EF7]" />
              <span className="text-[14px] font-medium">Loading cases from backend…</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <ServerCrash size={32} className="text-rose-400" />
              <p className="text-[14px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>
              <button
                onClick={refresh}
                className="mt-1 px-4 py-2 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] text-[13px] font-semibold text-[#4F6EF7] hover:border-[#4F6EF7] transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[11.5px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    <th className="pb-3 pr-3">Case ID</th>
                    <th className="pb-3 px-3">Vendor / Invoice</th>
                    <th className="pb-3 px-3">Issue</th>
                    <th className="pb-3 px-3 text-right">Amount</th>
                    <th className="pb-3 px-3 text-center">Risk Tier</th>
                    <th className="pb-3 px-3">Recommended Action</th>
                    <th className="pb-3 px-3 text-center">Status</th>
                    <th className="pb-3 pl-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#94A3B8]">
                        No cases match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((item) => {
                      const tier = mapRiskTier(item.risk_tier);
                      const statusLabel = mapStatus(item.status);
                      const icon = actionIcon(item.recommended_action);
                      return (
                        <tr
                          key={item.case_id}
                          onClick={() => router.push(`/cases/${item.case_id}`)}
                          className="group hover:bg-[#F8FAFC] dark:hover:bg-[#151B2B] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 pr-3 font-mono font-bold text-[#0E1630] dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA]">
                                <FileText size={14} />
                              </span>
                              <span className="text-[12px]">{item.case_id.substring(0, 12)}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <p className="font-semibold text-[#0E1630] dark:text-white group-hover:text-[#4F6EF7] dark:group-hover:text-[#60A5FA] transition-colors">
                              {item.counterparty}
                            </p>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              {item.invoice_no ?? "—"} • {formatDate(item.created_at)}
                            </p>
                          </td>

                          <td className="py-3.5 px-3 font-medium text-[#475569] dark:text-[#CBD5E1]">
                            {item.issue}
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#0E1630] dark:text-white">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                tier === "High"
                                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                  : tier === "Medium"
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              }`}
                            >
                              {item.risk_score} {tier}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0E1630] dark:text-[#E2E8F0]">
                              {icon === "mail"    && <Mail size={14} className="text-[#4F6EF7] dark:text-[#60A5FA]" />}
                              {icon === "eye"     && <Eye size={14} className="text-amber-500" />}
                              {icon === "edit"    && <SlidersHorizontal size={14} className="text-indigo-500 dark:text-indigo-400" />}
                              {icon === "trash"   && <AlertTriangle size={14} className="text-slate-500" />}
                              {icon === "reverse" && <RefreshCw size={14} className="text-purple-500 dark:text-purple-400" />}
                              <span>{item.recommended_action ?? "Review & Verify"}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                statusLabel === "Open"
                                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                  : statusLabel === "Investigating"
                                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>

                          <td className="py-3.5 pl-2 text-right text-[#94A3B8] group-hover:text-[#4F6EF7] dark:group-hover:text-[#60A5FA] transition-colors">
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
    </DashboardLayout>
  );
}
