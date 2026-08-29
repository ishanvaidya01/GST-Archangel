import { cn } from "@/lib/utils";
import type { RiskTier } from "@/lib/api-types";

interface RiskBadgeProps {
  tier: RiskTier;
  score?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const tierConfig: Record<RiskTier, { label: string; classes: string }> = {
  HIGH: {
    label: "HIGH",
    classes:
      "bg-[#3f0d0d] text-[#ef4444] border border-[#7f1d1d] font-semibold",
  },
  MEDIUM: {
    label: "MED",
    classes:
      "bg-[#431a01] text-[#f59e0b] border border-[#78350f] font-semibold",
  },
  LOW: {
    label: "LOW",
    classes:
      "bg-[#052e16] text-[#22c55e] border border-[#14532d] font-semibold",
  },
};

const sizeClasses = {
  sm: "text-2xs px-1.5 py-0.5 rounded",
  md: "text-xs px-2 py-0.5 rounded",
  lg: "text-sm px-3 py-1 rounded-md",
};

export function RiskBadge({
  tier,
  score,
  size = "md",
  className,
}: RiskBadgeProps) {
  const config = tierConfig[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono tracking-wider",
        config.classes,
        sizeClasses[size],
        className
      )}
    >
      {score !== undefined && (
        <span className="opacity-80 font-bold">{score}</span>
      )}
      <span>{config.label}</span>
    </span>
  );
}
