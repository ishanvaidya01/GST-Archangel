"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { NewEvidenceResponse } from "@/lib/api-types";
import { CheckCircle2 } from "lucide-react";

interface EvidenceCardProps {
  result: NewEvidenceResponse;
  className?: string;
}

const tierColors = {
  HIGH: "text-[#ef4444]",
  MEDIUM: "text-[#f59e0b]",
  LOW: "text-[#22c55e]",
};

export function EvidenceCard({ result, className }: EvidenceCardProps) {
  return (
    <div className={cn("surface-card p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
        <h3 className="text-sm font-semibold text-[#22c55e]">
          Evidence Validated — Case Resolved
        </h3>
      </div>

      <p className="text-sm text-[#9ba3bf] leading-relaxed mb-4">
        {result.explanation}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#141520] border border-[#1e2130] rounded">
          <p className="text-2xs uppercase tracking-widest text-[#5a6380] mb-1">
            Previous Risk
          </p>
          <p
            className={cn(
              "text-2xl font-bold font-mono text-financial",
              tierColors[result.previous_risk_tier]
            )}
          >
            {result.previous_risk_score}
          </p>
          <p className="text-xs text-[#5a6380] font-mono">{result.previous_risk_tier}</p>
        </div>

        <div className="p-3 bg-[#052e16] border border-[#14532d] rounded">
          <p className="text-2xs uppercase tracking-widest text-[#22c55e] opacity-70 mb-1">
            New Risk
          </p>
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className={cn(
              "text-2xl font-bold font-mono text-financial",
              tierColors[result.new_risk_tier]
            )}
          >
            {result.new_risk_score}
          </motion.p>
          <p className="text-xs text-[#22c55e] font-mono">{result.new_risk_tier}</p>
        </div>
      </div>
    </div>
  );
}
