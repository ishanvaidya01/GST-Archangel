"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RiskFactor, RiskTier } from "@/lib/api-types";

interface RiskLedgerProps {
  factors: RiskFactor[];
  totalScore: number;
  tier: RiskTier;
}

const tierStyle: Record<RiskTier, { score: string; badge: string; glow: string }> = {
  HIGH: {
    score: "text-[#ef4444]",
    badge: "bg-[#3f0d0d] text-[#ef4444] border-[#7f1d1d]",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]",
  },
  MEDIUM: {
    score: "text-[#f59e0b]",
    badge: "bg-[#431a01] text-[#f59e0b] border-[#78350f]",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
  LOW: {
    score: "text-[#22c55e]",
    badge: "bg-[#052e16] text-[#22c55e] border-[#14532d]",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.15)]",
  },
};

function RiskFactorRow({
  factor,
  delay,
}: {
  factor: RiskFactor;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex items-center gap-3 py-3 border-b border-[#1e2130] last:border-0"
    >
      {/* Score */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
        className="text-sm font-bold font-mono text-financial text-[#ef4444] w-8 text-right shrink-0"
      >
        +{factor.score}
      </motion.span>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e8eaf6]">{factor.label}</p>
        <p className="text-xs text-[#5a6380] mt-0.5 leading-relaxed">
          {factor.description}
        </p>
      </div>

      {/* Mini bar */}
      <div className="w-20 h-1.5 bg-[#1e2130] rounded-full overflow-hidden shrink-0">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(factor.score / 30) * 100}%` }}
          transition={{ delay: delay + 0.3, duration: 0.5, ease: "easeOut" }}
          className="h-full bg-[#ef4444] rounded-full"
        />
      </div>
    </motion.div>
  );
}

export function RiskLedger({ factors, totalScore, tier }: RiskLedgerProps) {
  const styles = tierStyle[tier];
  const totalDelay = factors.length * 0.12 + 0.3;

  return (
    <div className="surface-card p-5">
      <h3 className="text-xs uppercase tracking-widest text-[#5a6380] font-medium mb-4">
        Risk Ledger
      </h3>

      {/* Factors */}
      <div className="mb-5">
        {factors.map((factor, i) => (
          <RiskFactorRow key={factor.label} factor={factor} delay={i * 0.12} />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#2d3250] mb-4" />

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: totalDelay, duration: 0.4 }}
        className={cn(
          "flex items-center justify-between p-4 rounded-md border",
          styles.badge,
          styles.glow
        )}
      >
        <div>
          <p className="text-xs uppercase tracking-widest font-medium opacity-70 mb-1">
            Total Risk Score
          </p>
          <p className="text-xs uppercase tracking-widest font-bold">{tier} RISK</p>
        </div>
        <div className="text-right">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: totalDelay + 0.1 }}
            className={cn("text-4xl font-bold font-mono text-financial", styles.score)}
          >
            {totalScore}
          </motion.p>
          <p className="text-xs opacity-60 font-mono">/ 100</p>
        </div>
      </motion.div>
    </div>
  );
}
