"use client";

import { useMemo, useRef, useState } from "react";
import TelemetryGrid from "@/components/dashboard/TelemetryGrid";
import EntityReasoningPanel from "@/components/dashboard/EntityReasoningPanel";
import DebateTimeline from "@/components/dashboard/DebateTimeline";
import ArbitrationResultPanel from "@/components/dashboard/ArbitrationResultPanel";
import StatusBar from "@/components/dashboard/StatusBar";

export type DashboardPhase =
  | "idle"
  | "initializing"
  | "reasoning"
  | "debating"
  | "consensus"
  | "resolved";

export type TelemetryShard = {
  node: string;
  v_m1: number;
  v_m2: number;
  v_m3: number;
  v_m4: number;
  v_m5: number;
  v_m6: number;
  v_m7: number;
  sys_log: string;
  [key: string]: unknown;
};

export type CognitiveEntity = {
  _id?: string;
  nodeId: string;
  hypothesis: string;
  physicsAnalysis: string;
  anomalyFlags: string[];
  trustScore?: number;
  isCompromised?: boolean;
  injectionDetected?: boolean;
  injectionContent?: string | null;
};

export type DebateExchange = {
  _id?: string;
  round: number;
  challengerId: string;
  targetId: string;
  argument: string;
  contradictionDetected: boolean;
  contradictionReason?: string | null;
  evidenceKeys: string[];
  isDevilsAdvocate?: boolean;
  daDefense?: string | null;
  daUpheld?: boolean | null;
};

export type ArbitrationResult = {
  _id?: string;
  absoluteTruthState: unknown;
  compromisedNodes: string[];
  physicsMatrix: unknown;
  arbitrationSummary: string;
  supportingEvidence: unknown[];
  promptInjectionDetected: boolean;
  promptInjectionNodeId?: string | null;
};

type StatusPayload = {
  session?: { status?: DashboardPhase; shards?: TelemetryShard[] } | null;
  entities?: CognitiveEntity[];
  debates?: DebateExchange[];
  arbitration?: ArbitrationResult | null;
};

export default function CAEDashboard() {
  const [phase, setPhase] = useState<DashboardPhase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [entities, setEntities] = useState<CognitiveEntity[]>([]);
  const [debates, setDebates] = useState<DebateExchange[]>([]);
  const [arbitration, setArbitration] = useState<ArbitrationResult | null>(null);
  const [shards, setShards] = useState<TelemetryShard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const canInitiate = useMemo(() => !isInitiating && phase !== "initializing", [isInitiating, phase]);

  const closeStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const startStatusStream = (newSessionId: string) => {
    closeStream();

    const source = new EventSource(`/api/cae/status/${newSessionId}`);
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as StatusPayload;
        setShards(Array.isArray(payload.session?.shards) ? payload.session?.shards ?? [] : []);
        setEntities(Array.isArray(payload.entities) ? payload.entities : []);
        setDebates(Array.isArray(payload.debates) ? payload.debates : []);
        setArbitration(payload.arbitration ?? null);
        if (payload.session?.status) {
          setPhase(payload.session.status);
        }
      } catch {
        setError("Failed to parse CAE status stream payload.");
      }
    };

    source.onerror = () => {
      closeStream();
    };
  };

  const handleInitiate = async () => {
    if (!canInitiate) return;

    setError(null);
    setPhase("initializing");
    setSessionId(null);
    setEntities([]);
    setDebates([]);
    setArbitration(null);
    setShards([]);
    setIsInitiating(true);

    try {
      const response = await fetch("/api/cae/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = (await response.json()) as { sessionId?: string; error?: string };

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error ?? "Failed to initiate CAE orchestration.");
      }

      setSessionId(data.sessionId);
      startStatusStream(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate CAE orchestration.");
      setPhase("resolved");
      closeStream();
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#070B14] text-slate-100 font-mono flex flex-col">
      <header className="border-b border-cyan-900/50 p-4 md:p-6 bg-slate-950/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-base md:text-lg tracking-[0.16em] text-cyan-300">
              TARTARUS CAE // EPIMENIDES PARADIGM
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Session: {sessionId ?? "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded border border-cyan-800/70 bg-cyan-950/40 px-3 py-1 text-xs uppercase tracking-wider text-cyan-200">
              {phase}
            </span>
            <button
              type="button"
              onClick={handleInitiate}
              disabled={!canInitiate}
              className="rounded border border-emerald-600/70 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isInitiating ? "Initiating..." : "Initiate"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mx-auto max-w-7xl mt-3 text-xs text-rose-300 border border-rose-900/70 bg-rose-950/30 rounded p-2">
            {error}
          </p>
        ) : null}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 flex-1 max-w-7xl mx-auto w-full">
        <TelemetryGrid
          shards={shards}
          entities={entities.map((entity) => ({
            nodeId: entity.nodeId,
            isCompromised: Boolean(entity.isCompromised),
            trustScore: typeof entity.trustScore === "number" ? entity.trustScore : 1,
            injectionDetected: Boolean(entity.injectionDetected),
          }))}
          physicsMatrix={
            arbitration?.physicsMatrix &&
            typeof arbitration.physicsMatrix === "object" &&
            arbitration.physicsMatrix !== null
              ? (arbitration.physicsMatrix as Record<string, { verdict: string }>)
              : undefined
          }
        />
        <EntityReasoningPanel entities={entities} />
        <DebateTimeline debates={debates} />
        <ArbitrationResultPanel arbitration={arbitration} entities={entities} />
      </main>

      <StatusBar phase={phase} entityCount={entities.length} debateCount={debates.length} />
    </div>
  );
}
