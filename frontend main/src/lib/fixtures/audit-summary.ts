import { AuditSummary } from "../api-types";

export const MOCK_AUDIT_SUMMARY: AuditSummary = {
  run_id: "run-2024-08-001",
  status: "COMPLETE",
  itc_at_risk: 312500,
  transactions_scanned: 25,
  matched: 19,
  mismatched: 6,
  high_risk_count: 2,
  risk_breakdown: {
    HIGH: 2,
    MEDIUM: 2,
    LOW: 2,
  },
  created_at: "2024-08-28T08:00:00Z",
  completed_at: "2024-08-28T08:03:42Z",
};
