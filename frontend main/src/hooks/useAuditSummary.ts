// ─── useAuditSummary — Fetch live KPIs for a run ─────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuditSummary } from "@/lib/api-types";

interface UseAuditSummaryResult {
  summary: AuditSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAuditSummary(runId: string): UseAuditSummaryResult {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/audit/${runId}/summary`, { headers });
      if (!res.ok) throw new Error(`Failed to load audit summary (${res.status})`);

      const data = await res.json();
      setSummary(data as AuditSummary);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
}
