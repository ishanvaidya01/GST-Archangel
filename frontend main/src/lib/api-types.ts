// ─── GST ARCHANGEL — API Types ────────────────────────────────────────────────
// These types mirror the FastAPI backend contract exactly.
// Do NOT add fields here that the backend doesn't return.

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organisation: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: {
    id: string;
    name: string;
    email: string;
    organisation: string;
  };
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResponse {
  run_id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETE" | "FAILED";
  message: string;
}

// ─── Audit Summary ────────────────────────────────────────────────────────────

export type RiskTier = "LOW" | "MEDIUM" | "HIGH";

export interface RiskBreakdown {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface AuditSummary {
  run_id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETE" | "FAILED";
  itc_at_risk: number;        // in INR
  transactions_scanned: number;
  matched: number;
  mismatched: number;
  high_risk_count: number;
  risk_breakdown: RiskBreakdown;
  created_at: string;         // ISO 8601
  completed_at: string | null;
}

// ─── Cases ────────────────────────────────────────────────────────────────────

export type CaseStatus =
  | "OPEN"
  | "INVESTIGATION_REQUIRED"
  | "RESOLVED"
  | "DISMISSED"
  | "ESCALATED";

export interface CaseSummary {
  case_id: string;
  run_id: string;
  counterparty: string;
  gstin: string | null;
  amount: number;             // in INR
  issue: string;
  risk_score: number;         // 0–100
  risk_tier: RiskTier;
  status: CaseStatus;
  recommended_action?: string;
  invoice_no?: string | null;
  created_at: string;
}

export interface CaseListResponse {
  cases: CaseSummary[];
  total: number;
}

// ─── Case Detail ──────────────────────────────────────────────────────────────

export interface RiskFactor {
  label: string;
  score: number;
  description: string;
}

export interface ActionPreview {
  action_type: string;
  title: string;
  explanation: string;
  draft_content: string;      // human-readable draft, never raw JSON
  status: "DRAFT" | "APPROVED" | "SENT";
}

export interface CaseDetail {
  case_id: string;
  run_id: string;
  counterparty: string;
  gstin: string;
  amount: number;
  issue: string;
  risk_score: number;
  risk_tier: RiskTier;
  status: CaseStatus;
  risk_factors: RiskFactor[];
  action_preview: ActionPreview;
  created_at: string;
}

// ─── Agent Events ─────────────────────────────────────────────────────────────

export type AgentEventType =
  | "DATA_EXTRACTION"
  | "RECONCILIATION"
  | "INVESTIGATION"
  | "GST_RULES"
  | "RISK_ASSESSMENT"
  | "DECISION"
  | "ACTION";

export type AgentEventStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR";

export interface AgentEvent {
  event_id: string;
  case_id: string;
  run_id: string;
  agent_name: string;
  step: AgentEventType;
  status: AgentEventStatus;
  message: string;            // short human-readable message
  reasoning?: string;         // optional expandable detail
  timestamp: string;          // ISO 8601
}

// ─── New Evidence (Adapt) ─────────────────────────────────────────────────────

export interface NewEvidenceRequest {
  case_id: string;
  evidence_text: string;
}

export interface NewEvidenceResponse {
  case_id: string;
  previous_risk_score: number;
  previous_risk_tier: RiskTier;
  new_risk_score: number;
  new_risk_tier: RiskTier;
  new_status: CaseStatus;
  explanation: string;
  new_action_preview: ActionPreview;
}

// ─── Approve Action ───────────────────────────────────────────────────────────

export interface ApproveActionRequest {
  case_id: string;
  action_type: string;
}

export interface ApproveActionResponse {
  case_id: string;
  action_type: string;
  status: "APPROVED";
  message: string;
}

// ─── Observability ────────────────────────────────────────────────────────────

export interface ObservabilityEvent {
  event_id: string;
  run_id: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  timestamp: string;
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

export interface WsAgentEvent extends AgentEvent {
  ws_sequence: number;
}
