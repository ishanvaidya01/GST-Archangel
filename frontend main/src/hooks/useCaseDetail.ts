// ─── useCaseDetail — Fetch full case detail for investigation page ────────────
"use client";

import { useState, useEffect, useCallback } from "react";

export interface RiskFactor {
  label: string;
  score: number;
  description: string;
}

export interface ActionPreview {
  action_type: string;
  title: string;
  explanation: string;
  draft_content: string;
  status: "DRAFT" | "APPROVED" | "SENT";
}

export interface CaseDetailFull {
  case_id: string;
  run_id: string;
  counterparty: string;
  gstin: string | null;
  amount: number;
  issue: string;
  risk_score: number;
  risk_tier: "HIGH" | "MEDIUM" | "LOW";
  status: string;
  risk_factors: RiskFactor[];
  action_preview: ActionPreview;
  invoice_no: string | null;
  created_at: string;
  agent_events: {
    agent_name: string;
    step: string;
    reasoning: any;
    timestamp: string;
  }[];
  evidence_log: {
    text: string;
    timestamp: string;
    diff: any;
  }[];
}

interface UseCaseDetailResult {
  detail: CaseDetailFull | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCaseDetail(caseId: string): UseCaseDetailResult {
  const [detail, setDetail] = useState<CaseDetailFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/cases/detail/${caseId}`, { headers });
      if (!res.ok) throw new Error(`Case not found (${res.status})`);

      const data = await res.json();
      setDetail({
        case_id: data.case_id,
        run_id: data.run_id,
        counterparty: data.counterparty ?? "Unknown Supplier",
        gstin: data.gstin ?? null,
        amount: Number(data.amount ?? 0),
        issue: data.issue ?? "Discrepancy detected",
        risk_score: Number(data.risk_score ?? 0),
        risk_tier: data.risk_tier ?? "LOW",
        status: data.status ?? "OPEN",
        risk_factors: data.risk_factors ?? [],
        action_preview: data.action_preview ?? {
          action_type: "audit_note",
          title: "Review Required",
          explanation: "Please review this case manually.",
          draft_content: "",
          status: "DRAFT",
        },
        invoice_no: data.invoice_no ?? null,
        created_at: data.created_at ?? new Date().toISOString(),
        agent_events: data.agent_events ?? [],
        evidence_log: data.evidence_log ?? [],
      });
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, error, refresh: fetchDetail };
}
