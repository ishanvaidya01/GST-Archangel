// ─── GST ARCHANGEL — API Client ───────────────────────────────────────────────
// All functions are structured for easy swap: replace the mock import with
// a real fetch() call and the rest of the app stays unchanged.

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UploadResponse,
  AuditSummary,
  CaseListResponse,
  CaseDetail,
  NewEvidenceRequest,
  NewEvidenceResponse,
  ApproveActionRequest,
  ApproveActionResponse,
} from "./api-types";

import { MOCK_AUDIT_SUMMARY } from "./fixtures/audit-summary";
import { MOCK_CASES, MOCK_CASE_DETAIL } from "./fixtures/cases";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

// Simulated network latency for mock responses
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(buildUrl("/api/auth/login"), { 
    method: "POST", 
    body: JSON.stringify(data), 
    headers: { "Content-Type": "application/json" } 
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(buildUrl("/api/auth/register"), { 
    method: "POST", 
    body: JSON.stringify(data), 
    headers: { "Content-Type": "application/json" } 
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadFiles(files: {
  bankCsv: File | null;
  purchaseInvoices: File[];
  salesInvoices: File[];
}): Promise<UploadResponse> {
  const formData = new FormData();
  if (files.bankCsv) {
    formData.append("bank_csv", files.bankCsv);
  }
  files.purchaseInvoices.forEach(f => formData.append("purchase_invoices", f));
  files.salesInvoices.forEach(f => formData.append("sale_invoices", f));

  // The backend uses Depends(get_current_user), we assume token is passed or handled via cookies.
  // Actually, we need to pass Authorization header if we have token, but for now we just fetch.
  // The user might be storing token in localStorage or similar.
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl("/api/upload"), {
    method: "POST",
    body: formData,
    headers,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

// ─── Audit Summary ────────────────────────────────────────────────────────────

export async function getAuditSummary(runId: string): Promise<AuditSummary> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(buildUrl(`/api/audit/${runId}/summary`), { headers });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

// ─── Cases ────────────────────────────────────────────────────────────────────

export async function getCases(runId: string): Promise<CaseListResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(`/api/cases/${runId}`), { headers });
  if (!res.ok) throw new Error("Failed to fetch cases");
  const data = await res.json();
  return {
    cases: data,
    total: data.length,
  };
}

export async function getCaseDetail(caseId: string): Promise<CaseDetail> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(`/api/cases/detail/${caseId}`), { headers });
  if (!res.ok) throw new Error("Failed to fetch case detail");
  return res.json();
}

// ─── New Evidence ─────────────────────────────────────────────────────────────

export async function submitNewEvidence(
  data: NewEvidenceRequest
): Promise<NewEvidenceResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(`/api/cases/${data.case_id}/adapt`), { 
    method: "POST", 
    body: JSON.stringify(data), 
    headers 
  });
  if (!res.ok) throw new Error("Failed to submit evidence");
  return res.json();
}

// ─── Approve Action ───────────────────────────────────────────────────────────

export async function approveAction(
  data: ApproveActionRequest
): Promise<ApproveActionResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(`/api/cases/${data.case_id}/actions/approve`), { 
    method: "POST", 
    headers 
  });
  if (!res.ok) throw new Error("Failed to approve action");
  return res.json();
}
