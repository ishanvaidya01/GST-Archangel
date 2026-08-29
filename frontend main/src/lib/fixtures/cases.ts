import { CaseSummary, CaseDetail } from "../api-types";

export const MOCK_CASES: CaseSummary[] = [
  {
    case_id: "GST-1042",
    run_id: "run-2024-08-001",
    counterparty: "Apollo HealthCare Profficiency",
    gstin: "27AABCU9603R1ZX",
    amount: 75000,
    issue: "Missing invoice",
    risk_score: 82,
    risk_tier: "HIGH",
    status: "INVESTIGATION_REQUIRED",
    created_at: "2024-08-28T08:01:12Z",
  },
  {
    case_id: "GST-1087",
    run_id: "run-2024-08-001",
    counterparty: "Dhanvantari Pharma Ltd",
    gstin: "07AAACH9999R1ZQ",
    amount: 142000,
    issue: "GSTIN mismatch on invoice",
    risk_score: 76,
    risk_tier: "HIGH",
    status: "INVESTIGATION_REQUIRED",
    created_at: "2024-08-28T08:01:35Z",
  },
  {
    case_id: "GST-1063",
    run_id: "run-2024-08-001",
    counterparty: "Sunrise Logistics Pvt Ltd",
    gstin: "29AADCS0472N1ZF",
    amount: 38500,
    issue: "Partial payment — amount mismatch",
    risk_score: 54,
    risk_tier: "MEDIUM",
    status: "OPEN",
    created_at: "2024-08-28T08:01:50Z",
  },
  {
    case_id: "GST-1074",
    run_id: "run-2024-08-001",
    counterparty: "Mehta Office Solutions",
    gstin: "33AAKCM5023G1ZP",
    amount: 21000,
    issue: "Duplicate invoice number",
    risk_score: 48,
    risk_tier: "MEDIUM",
    status: "OPEN",
    created_at: "2024-08-28T08:02:03Z",
  },
  {
    case_id: "GST-1098",
    run_id: "run-2024-08-001",
    counterparty: "Rajan Steel Works",
    gstin: "24AABCR4567L1ZM",
    amount: 18750,
    issue: "Late filing — GST-3B discrepancy",
    risk_score: 22,
    risk_tier: "LOW",
    status: "OPEN",
    created_at: "2024-08-28T08:02:18Z",
  },
  {
    case_id: "GST-1103",
    run_id: "run-2024-08-001",
    counterparty: "Priya Stationery House",
    gstin: "06AAAFP2113K1ZB",
    amount: 9200,
    issue: "HSN code discrepancy",
    risk_score: 18,
    risk_tier: "LOW",
    status: "OPEN",
    created_at: "2024-08-28T08:02:31Z",
  },
];

export const MOCK_CASE_DETAIL: CaseDetail = {
  case_id: "GST-1042",
  run_id: "run-2024-08-001",
  counterparty: "Apollo HealthCare Profficiency",
  gstin: "27AABCU9603R1ZX",
  amount: 75000,
  issue: "Missing invoice",
  risk_score: 82,
  risk_tier: "HIGH",
  status: "INVESTIGATION_REQUIRED",
  risk_factors: [
    {
      label: "Missing invoice",
      score: 25,
      description:
        "No GST-compliant invoice found in the uploaded documents for this transaction.",
    },
    {
      label: "Supplier history",
      score: 15,
      description:
        "Apollo HealthCare Profficiency has 2 prior compliance notices in the last 12 months.",
    },
    {
      label: "GST inconsistency",
      score: 20,
      description:
        "GST-3B return does not reflect this transaction amount in the reconciliation period.",
    },
    {
      label: "Amount mismatch",
      score: 22,
      description:
        "Bank debit of ₹75,000 does not match any single invoice entry. Two separate credits exist.",
    },
  ],
  action_preview: {
    action_type: "REQUEST_INVOICE",
    title: "Request Missing Invoice from Supplier",
    explanation:
      "No valid invoice matching this ₹75,000 bank debit was found. ITC cannot be claimed without a GST-compliant invoice. The recommended action is to formally request the missing invoice from Apollo HealthCare Profficiency.",
    draft_content:
      "Dear Apollo HealthCare Profficiency,\n\nThis is to inform you that we have identified a payment of ₹75,000 (Ref: TXN-20240822-004) debited from our account on 22 Aug 2024 for which no corresponding GST-compliant invoice has been received.\n\nAs per Section 16 of the CGST Act, input tax credit can only be claimed against a valid invoice. We request you to provide Invoice INV-1042 or relevant documentation at your earliest convenience.\n\nRegards,\nGST Compliance Team",
    status: "DRAFT",
  },
  created_at: "2024-08-28T08:01:12Z",
};
