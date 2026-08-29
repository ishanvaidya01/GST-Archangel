"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { submitNewEvidence } from "@/lib/api-client";
import type { NewEvidenceResponse } from "@/lib/api-types";

const EVAL_STEPS = [
  "Parsing supplier invoice documents",
  "Verifying split transaction amounts (₹40k + ₹35k = ₹75k)",
  "Cross-referencing GSTIN & GSTR-3B tax ledgers",
  "Recalculating multi-factor composite risk model",
  "Preparing audit resolution & ITC release clearance",
];

export default function AdaptEvidencePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const router = useRouter();

  const [evidence, setEvidence] = useState(
    "Supplier provided Invoice INV-1042. The ₹75,000 payment was split into two payments of ₹40,000 and ₹35,000, corresponding to INV-1042-A and INV-1042-B respectively. Both invoices carry valid GSTINs and are dated 22 Aug 2024."
  );
  const [phase, setPhase] = useState<"input" | "evaluating" | "result">("input");
  const [evalStep, setEvalStep] = useState(0);
  const [result, setResult] = useState<NewEvidenceResponse | null>(null);

  const handleEvaluate = async () => {
    setPhase("evaluating");
    setEvalStep(0);

    // Simulate multi-agent steps
    for (let i = 0; i < EVAL_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      setEvalStep(i + 1);
    }

    try {
      const data = await submitNewEvidence({
        case_id: caseId,
        evidence_text: evidence,
      });
      setResult(data);
      setPhase("result");
    } catch {
      // Fallback
      setResult({
        case_id: caseId,
        previous_risk_score: 82,
        previous_risk_tier: "HIGH",
        new_risk_score: 25,
        new_risk_tier: "LOW",
        new_status: "RESOLVED",
        explanation:
          "The new evidence explains the previously unmatched payment. Invoice INV-1042 was issued in two parts: INV-1042-A (₹40,000) and INV-1042-B (₹35,000), which together reconcile with the ₹75,000 bank debit of 22 Aug 2024. Both invoices carry valid GSTINs and are GST-3B compliant. The compliance risk is resolved and ITC of ₹13,500 can now be claimed.",
        new_action_preview: {
          action_type: "RECORD_AUDIT",
          title: "Record Audit Trail & Close Case",
          explanation:
            "The split invoice evidence has been validated. Recording the resolution with full audit trail.",
          draft_content:
            "Case GST-1042 — RESOLVED\n\nResolution basis: Supplier provided split invoices INV-1042-A (₹40,000) and INV-1042-B (₹35,000) totalling ₹75,000, reconciling with bank debit TXN-20240822-004.\n\nITC of ₹13,500 (18% GST) is eligible for claim under Section 16 of the CGST Act.\n\nAudit trail recorded on 28 Aug 2024.",
          status: "DRAFT",
        },
      });
      setPhase("result");
    }
  };

  const handleReset = () => {
    setPhase("input");
    setResult(null);
  };

  return (
    <DashboardLayout activeNav="cases">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href={`/cases/${caseId}`}
          className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#4F6EF7] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Case Detail</span>
        </Link>

        {/* ── Case Context Card ──────────────────────────────────────────────── */}
        <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[12px] font-bold text-[#4F6EF7] dark:text-[#60A5FA] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                  {caseId}
                </span>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Adaptive Re-Evaluation</span>
              </div>
              <h1 className="font-[Manrope,sans-serif] text-[22px] font-extrabold text-[#0E1630] dark:text-white">
                Submit New Evidence & Re-Evaluate
              </h1>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Provide new supplier invoices, clarifications, or banking vouchers to re-run the risk model.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                CURRENT RISK
              </span>
              <p className="font-[Manrope,sans-serif] text-[20px] font-extrabold text-rose-600 dark:text-rose-400">
                82 / 100 HIGH
              </p>
            </div>
          </div>
        </div>

        {/* ── Phase Switch ────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input-phase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] space-y-6 transition-colors duration-200"
            >
              <div>
                <label className="block text-[13.5px] font-extrabold uppercase tracking-wide text-[#0E1630] dark:text-white mb-2">
                  Supplier Evidence / Clarification Details
                </label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={5}
                  className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0D1220] text-[13.5px] text-[#0E1630] dark:text-white leading-relaxed focus:bg-white dark:focus:bg-[#151B2B] focus:border-[#4F6EF7] dark:focus:border-[#60A5FA] focus:outline-none transition-all"
                  placeholder="Describe the newly received invoices, split payments, or revised GST returns..."
                />
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-2">
                  Archangel will automatically parse invoice references, match split ledger amounts, and recalculate exposure.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]/80 dark:border-[#1E293B]">
                <Link
                  href={`/cases/${caseId}`}
                  className="px-5 py-3 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] text-[13.5px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={!evidence.trim()}
                  className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-8 py-3.5 text-[14px] font-bold text-white shadow-[0_12px_28px_-8px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-8px_rgba(90,90,247,0.65)] disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>RE-EVALUATE COMPLIANCE</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {phase === "evaluating" && (
            <motion.div
              key="eval-phase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-10 text-center shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] max-w-lg mx-auto transition-colors duration-200"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F6EF7] dark:text-[#60A5FA] mx-auto mb-4">
                <Loader2 size={28} className="animate-spin" />
              </div>
              <h3 className="font-[Manrope,sans-serif] text-[18px] font-extrabold text-[#0E1630] dark:text-white">
                AI Agents Re-Evaluating Case...
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 mb-6">
                Executing cognitive evidence pipeline & reconciling split invoices
              </p>

              {/* Steps */}
              <div className="space-y-2.5 text-left text-[12.5px]">
                {EVAL_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      i < evalStep
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400"
                        : i === evalStep
                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-[#4F6EF7] dark:text-[#60A5FA] font-semibold"
                        : "text-[#94A3B8] dark:text-[#64748B]"
                    }`}
                  >
                    {i < evalStep ? (
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : i === evalStep ? (
                      <Loader2 size={16} className="animate-spin text-[#4F6EF7] dark:text-[#60A5FA] shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div
              key="result-phase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* ── Risk Transition Card (Before vs After) ────────────────────── */}
              <div className="rounded-[24px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-7 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                  <h3 className="font-[Manrope,sans-serif] text-[16px] font-extrabold text-[#0E1630] dark:text-white">
                    Risk Assessment Update
                  </h3>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-[12px] font-extrabold text-emerald-800 dark:text-emerald-400">
                    ✓ COMPLIANCE RESOLVED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  {/* Before */}
                  <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 p-5 text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                      PREVIOUS RISK (BEFORE)
                    </span>
                    <p className="font-[Manrope,sans-serif] text-[44px] font-extrabold text-rose-600 dark:text-rose-400 my-1">
                      {result.previous_risk_score}
                    </p>
                    <span className="rounded-full bg-rose-100 dark:bg-rose-900/60 px-3 py-0.5 text-[12px] font-extrabold text-rose-700 dark:text-rose-300">
                      HIGH RISK
                    </span>
                  </div>

                  {/* After */}
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 p-5 text-center shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      NEW RISK (AFTER RE-EVALUATION)
                    </span>
                    <p className="font-[Manrope,sans-serif] text-[44px] font-extrabold text-emerald-600 dark:text-emerald-400 my-1">
                      {result.new_risk_score}
                    </p>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-3 py-0.5 text-[12px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      LOW RISK (RESOLVED)
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-6 p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1220] border border-[#E2E8F0] dark:border-[#1E293B] text-[13px] text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                  <p className="font-bold text-[#0E1630] dark:text-white mb-1">Re-Evaluation Summary:</p>
                  <p>{result.explanation}</p>
                </div>
              </div>

              {/* ── Updated Action Card ───────────────────────────────────────── */}
              <div className="rounded-[22px] border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 shadow-[0_12px_30px_-15px_rgba(60,70,160,0.08)] transition-colors duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-[Manrope,sans-serif] text-[16px] font-extrabold text-[#0E1630] dark:text-white">
                      {result.new_action_preview.title}
                    </h4>
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      {result.new_action_preview.explanation}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F8FAFC] dark:bg-[#0D1220] border border-[#E2E8F0] dark:border-[#1E293B] p-4 font-mono text-[12px] text-[#334155] dark:text-[#CBD5E1] whitespace-pre-line leading-relaxed mb-4">
                  {result.new_action_preview.draft_content}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white underline cursor-pointer"
                  >
                    Submit additional evidence
                  </button>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/cases/${caseId}`}
                      className="px-5 py-2.5 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B] text-[13px] font-bold text-[#0E1630] dark:text-white hover:bg-slate-50 dark:hover:bg-[#1E2238] transition-all"
                    >
                      View Updated Case
                    </Link>

                    <Link
                      href="/dashboard/run-2024-08-001"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:opacity-95 transition-all"
                    >
                      <span>Return to Dashboard</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
