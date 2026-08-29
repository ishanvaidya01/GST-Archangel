import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PortfolioStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  accent?: boolean;
  className?: string;
}

export function PortfolioStatCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  accent = false,
  className,
}: PortfolioStatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-[#ef4444]"
      : trend === "down"
        ? "text-[#22c55e]"
        : "text-[#5a6380]";

  return (
    <div
      className={cn(
        "surface-card p-5 flex flex-col gap-2",
        accent && "border-[#1d3a6e] bg-[#0a1528]",
        className
      )}
    >
      <p className="text-xs uppercase tracking-widest text-[#5a6380] font-medium">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-bold font-mono text-financial tracking-tight",
          accent ? "text-[#3b82f6]" : "text-[#e8eaf6]"
        )}
      >
        {value}
      </p>
      {(subValue || trendLabel) && (
        <div className="flex items-center gap-2 mt-0.5">
          {trend && (
            <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
          )}
          {trendLabel && (
            <span className={cn("text-xs font-medium", trendColor)}>
              {trendLabel}
            </span>
          )}
          {subValue && (
            <span className="text-xs text-[#5a6380]">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
}
