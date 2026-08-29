import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  variant?: "text" | "card" | "stat" | "row";
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#141520] rounded",
        className
      )}
    />
  );
}

export function LoadingSkeleton({
  className,
  lines = 3,
  variant = "text",
}: LoadingSkeletonProps) {
  if (variant === "stat") {
    return (
      <div className={cn("surface-card p-5 flex flex-col gap-3", className)}>
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-8 w-28" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("surface-card p-5 flex flex-col gap-3", className)}>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-7 h-7 rounded" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-4 border-b border-[#1e2130]",
          className
        )}
      >
        <SkeletonBlock className="h-3 w-6" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 flex-1" />
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-5 w-12" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
