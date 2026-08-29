"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { AgentEvent, AgentEventType } from "@/lib/api-types";
import {
  Database,
  GitMerge,
  Search,
  BookOpen,
  BarChart2,
  CheckCircle,
  Zap,
} from "lucide-react";

interface AgentStepCardProps {
  event: AgentEvent;
  isLatest?: boolean;
  className?: string;
}

const stepConfig: Record<
  AgentEventType,
  { label: string; icon: React.ElementType; color: string }
> = {
  DATA_EXTRACTION: {
    label: "Data Extraction",
    icon: Database,
    color: "#3b82f6",
  },
  RECONCILIATION: {
    label: "Reconciliation",
    icon: GitMerge,
    color: "#8b5cf6",
  },
  INVESTIGATION: {
    label: "Investigation",
    icon: Search,
    color: "#f59e0b",
  },
  GST_RULES: {
    label: "GST Rules",
    icon: BookOpen,
    color: "#06b6d4",
  },
  RISK_ASSESSMENT: {
    label: "Risk Assessment",
    icon: BarChart2,
    color: "#ef4444",
  },
  DECISION: {
    label: "Decision",
    icon: CheckCircle,
    color: "#22c55e",
  },
  ACTION: {
    label: "Action",
    icon: Zap,
    color: "#f59e0b",
  },
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function AgentStepCard({
  event,
  isLatest = false,
  className,
}: AgentStepCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = stepConfig[event.step];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "surface-card p-4 relative",
        isLatest && "border-[#1d3a6e]",
        className
      )}
    >
      {/* Agent name + timestamp row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: config.color + "18" }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#e8eaf6]">
              {config.label}
            </p>
            <p className="text-2xs text-[#5a6380] font-mono mt-0.5">
              {event.agent_name}
            </p>
          </div>
        </div>
        <span className="text-2xs font-mono text-[#5a6380]">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-[#9ba3bf] leading-relaxed">{event.message}</p>

      {/* Expandable reasoning */}
      {event.reasoning && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-2xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors font-medium"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {expanded ? "Hide reasoning" : "Show reasoning"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 p-3 bg-[#141520] border border-[#1e2130] rounded text-xs text-[#9ba3bf] leading-relaxed">
                  {event.reasoning}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Live indicator for latest event */}
      {isLatest && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse-slow" />
        </div>
      )}
    </motion.div>
  );
}
