import { AuditSummary } from "../api-types";

export const mockAuditSummary: AuditSummary = {
  docs_ingested: 120,
  tx_ingested: 50,
  scanned: 170,
  matched: 161,
  mismatched: 9,
  high_risk: 2,
  medium_risk: 7,
  low_risk: 0,
  itc_at_risk_amount: 312500,
};
