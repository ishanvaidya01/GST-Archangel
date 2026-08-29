// ─── GST ARCHANGEL — WebSocket Client ─────────────────────────────────────────
// Provides useAgentTrace(runId) hook.
// Currently uses simulated events. Replace with real WS connection by
// uncommenting the WebSocket block and removing the simulation interval.
//
// Real endpoint: ws://<host>/ws/audit/{run_id}

import { useEffect, useRef, useState } from "react";
import type { AgentEvent } from "./api-types";
import { MOCK_AGENT_EVENTS } from "./fixtures/agent-events";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentTraceStatus = "idle" | "connecting" | "streaming" | "complete" | "error";

export interface UseAgentTraceResult {
  events: AgentEvent[];
  status: AgentTraceStatus;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgentTrace(
  runId: string,
  caseId: string | null = null,
  enabled = true
): UseAgentTraceResult {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<AgentTraceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !runId) return;

    setEvents([]);
    setStatus("connecting");
    setError(null);

    const wsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/ws/audit/${runId}`);
    ws.onopen = () => setStatus("streaming");
    ws.onmessage = (e) => {
      const event: AgentEvent = JSON.parse(e.data);
      if (!caseId || event.case_id === caseId) {
        setEvents((prev) => [...prev, event]);
      }
    };
    ws.onerror = () => { setStatus("error"); setError("WebSocket connection failed."); };
    ws.onclose = () => setStatus("complete");
    
    return () => {
      ws.close();
    };
  }, [runId, caseId, enabled]);

  return { events, status, error };
}
