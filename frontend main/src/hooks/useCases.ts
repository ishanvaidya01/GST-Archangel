// ─── useCases — Fetch cases for a specific run or all runs ────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import type { CaseSummary } from "@/lib/api-types";

interface UseCasesResult {
  cases: CaseSummary[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCases(runId?: string): UseCasesResult {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Use /all/list if no runId provided (dashboard overview), else run-specific
      const url = runId
        ? `${API_BASE}/api/cases/${runId}?sort_by=risk_score&sort_dir=desc&limit=100`
        : `${API_BASE}/api/cases/all/list?sort_by=risk_score&sort_dir=desc&limit=100`;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Failed to load cases (${res.status})`);

      const data = await res.json();
      // API returns { cases: [...], total: N } in both endpoints
      const list: CaseSummary[] = (data.cases ?? data).map((c: any) => ({
        case_id: c.case_id ?? c.id,
        run_id: c.run_id,
        counterparty: c.counterparty ?? "Unknown Supplier",
        gstin: c.gstin ?? null,
        amount: Number(c.amount ?? 0),
        issue: c.issue ?? "Discrepancy detected",
        risk_score: Number(c.risk_score ?? 0),
        risk_tier: c.risk_tier ?? "LOW",
        status: c.status ?? "OPEN",
        recommended_action: c.recommended_action ?? "Review & Verify",
        invoice_no: c.invoice_no ?? null,
        created_at: c.created_at ?? new Date().toISOString(),
      }));

      setCases(list);
      setTotal(data.total ?? list.length);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return { cases, total, loading, error, refresh: fetchCases };
}
