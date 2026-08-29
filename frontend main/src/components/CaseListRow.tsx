"use client";

import { cn } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";
import type { CaseSummary } from "@/lib/api-types";
import Link from "next/link";

interface CaseListRowProps {
  case_: CaseSummary;
  index: number;
}

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  INVESTIGATION_REQUIRED: "Investigation",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
  ESCALATED: "Escalated",
};

const statusColors: Record<string, string> = {
  OPEN: "text-[#9ba3bf]",
  INVESTIGATION_REQUIRED: "text-[#f59e0b]",
  RESOLVED: "text-[#22c55e]",
  DISMISSED: "text-[#5a6380]",
  ESCALATED: "text-[#ef4444]",
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CaseListRow({ case_, index }: CaseListRowProps) {
  return (
    <Link
      href={`/cases/${case_.case_id}`}
      className={cn(
        "grid grid-cols-[1.5rem_7rem_1fr_8rem_1.5fr_5rem_6rem_5rem] items-center gap-4 px-4 py-3.5",
        "border-b border-[#1e2130] hover:bg-[#0f1117] transition-colors cursor-pointer group"
      )}
    >
      {/* Row index */}
      <span className="text-xs text-[#383d52] font-mono text-financial tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Case ID */}
      <span className="text-xs font-mono text-[#3b82f6] group-hover:underline tracking-wide">
        {case_.case_id}
      </span>

      {/* Counterparty */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#e8eaf6] truncate">
          {case_.counterparty}
        </p>
        <p className="text-2xs text-[#5a6380] font-mono mt-0.5">
          {case_.gstin}
        </p>
      </div>

      {/* Amount */}
      <span className="text-sm font-mono text-financial text-[#e8eaf6] text-right">
        {formatINR(case_.amount)}
      </span>

      {/* Issue */}
      <span className="text-sm text-[#9ba3bf] truncate">{case_.issue}</span>

      {/* Risk Score */}
      <span className="text-sm font-mono text-financial text-center">
        <span
          className={cn(
            "font-bold",
            case_.risk_tier === "HIGH"
              ? "text-[#ef4444]"
              : case_.risk_tier === "MEDIUM"
                ? "text-[#f59e0b]"
                : "text-[#22c55e]"
          )}
        >
          {case_.risk_score}
        </span>
        <span className="text-[#383d52]">/100</span>
      </span>

      {/* Risk Badge */}
      <div className="flex justify-center">
        <RiskBadge tier={case_.risk_tier} size="sm" />
      </div>

      {/* Status */}
      <span
        className={cn(
          "text-xs font-medium text-right",
          statusColors[case_.status] ?? "text-[#9ba3bf]"
        )}
      >
        {statusLabels[case_.status] ?? case_.status}
      </span>
    </Link>
  );
}
