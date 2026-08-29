import { AgentEvent } from "../api-types";

export const MOCK_AGENT_EVENTS: AgentEvent[] = [
  {
    event_id: "evt-001",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "DataExtractorAgent",
    step: "DATA_EXTRACTION",
    status: "DONE",
    message:
      "Transaction TXN-20240822-004 detected — ₹75,000 debit on 22 Aug 2024 to Apollo HealthCare Profficiency.",
    reasoning:
      "Bank CSV row 47 identified as outward payment. Payee name matched to supplier registry. GSTIN lookup performed against master database.",
    timestamp: "2024-08-28T08:01:12Z",
  },
  {
    event_id: "evt-002",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "ReconciliationAgent",
    step: "RECONCILIATION",
    status: "DONE",
    message:
      "Invoice matching performed across 14 uploaded purchase PDFs. No matching invoice found for ₹75,000.",
    reasoning:
      "Fuzzy-matched amount ±5% tolerance against all purchase invoice amounts. Checked invoice dates within ±30 days of transaction. No match found. Partial invoices of ₹40,000 (INV-1042-A) and ₹35,000 (INV-1042-B) exist but were not linked to this transaction.",
    timestamp: "2024-08-28T08:01:28Z",
  },
  {
    event_id: "evt-003",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "InvestigationAgent",
    step: "INVESTIGATION",
    status: "DONE",
    message:
      "Supplier history checked. Apollo HealthCare Profficiency has 2 prior compliance notices (FY 2023-24).",
    reasoning:
      "Queried internal compliance history database. Found 2 prior notices under Section 143 of CGST Act for late filing. No cancellation of GSTIN. Business is currently active.",
    timestamp: "2024-08-28T08:01:44Z",
  },
  {
    event_id: "evt-004",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "GSTRulesAgent",
    step: "GST_RULES",
    status: "DONE",
    message:
      "GST-3B cross-check complete. This transaction is absent from the filed return for Aug 2024.",
    reasoning:
      "Cross-referenced transaction against GST-3B data for Aug 2024 period. Amount of ₹75,000 not reflected in Table 4A (Eligible ITC). This creates a compliance exposure under Section 16(2)(c) of CGST Act.",
    timestamp: "2024-08-28T08:01:58Z",
  },
  {
    event_id: "evt-005",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "RiskScoringAgent",
    step: "RISK_ASSESSMENT",
    status: "DONE",
    message:
      "Risk score calculated: 82/100 — HIGH. Four contributing risk factors identified.",
    reasoning:
      "Composite risk model applied. Weights: invoice presence (30%), amount reconciliation (25%), supplier compliance (20%), GST filing consistency (25%). All four factors flagged. Total score: 82.",
    timestamp: "2024-08-28T08:02:10Z",
  },
  {
    event_id: "evt-006",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "DecisionAgent",
    step: "DECISION",
    status: "DONE",
    message:
      "Recommended action: REQUEST_INVOICE. ITC claim must be deferred until valid invoice is received.",
    reasoning:
      "Decision tree evaluated 3 action options: REQUEST_INVOICE, ESCALATE_TO_CA, DISMISS. Given risk score 82 and active supplier status, REQUEST_INVOICE is optimal. Escalation threshold is 90+.",
    timestamp: "2024-08-28T08:02:22Z",
  },
  {
    event_id: "evt-007",
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    agent_name: "ActionDraftAgent",
    step: "ACTION",
    status: "DONE",
    message:
      "Invoice request letter drafted. Status: DRAFT — PENDING APPROVAL. Awaiting human review before dispatch.",
    reasoning:
      "Generated formal communication based on CGST Act Section 16 requirements. Draft includes transaction reference, amount, and legal basis for request. Document is held in DRAFT state and will not be sent until explicitly approved by an authorised user.",
    timestamp: "2024-08-28T08:02:35Z",
  },
];
