"use client";

import { AgentStepCard } from "./AgentStepCard";
import type { AgentEvent } from "@/lib/api-types";
import { Loader2 } from "lucide-react";

interface AgentTraceTimelineProps {
  events: AgentEvent[];
  status: "idle" | "connecting" | "streaming" | "complete" | "error";
}

export function AgentTraceTimeline({
  events,
  status,
}: AgentTraceTimelineProps) {
  if (status === "idle" || status === "connecting") {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-[#5a6380]">
        <Loader2 className="w-4 h-4 animate-spin text-[#3b82f6]" />
        <span className="text-sm">Connecting to agent trace…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center py-12 text-[#ef4444] text-sm">
        Failed to load agent trace. Please refresh.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline rail */}
      <div className="absolute left-[1.9rem] top-0 bottom-0 w-px bg-[#1e2130] z-0" />

      <div className="flex flex-col gap-3 relative z-10">
        {events.map((event, i) => (
          <div key={event.event_id} className="flex gap-4">
            {/* Dot on rail */}
            <div className="flex flex-col items-center shrink-0 mt-4">
              <div className="w-3 h-3 rounded-full border-2 border-[#3b82f6] bg-[#09090f]" />
            </div>
            <div className="flex-1 pb-1">
              <AgentStepCard
                event={event}
                isLatest={i === events.length - 1 && status === "streaming"}
              />
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {status === "streaming" && (
          <div className="flex gap-4">
            <div className="flex flex-col items-center shrink-0 mt-4">
              <div className="w-3 h-3 rounded-full border-2 border-[#2d3250] bg-[#09090f] animate-pulse" />
            </div>
            <div className="flex-1 surface-card p-4 flex items-center gap-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3b82f6]" />
              <span className="text-sm text-[#5a6380]">
                Agent processing…
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
