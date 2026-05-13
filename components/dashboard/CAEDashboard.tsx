"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TelemetryGrid from "@/components/dashboard/TelemetryGrid";
import EntityReasoningPanel from "@/components/dashboard/EntityReasoningPanel";
import DebateTimeline from "@/components/dashboard/DebateTimeline";
import ArbitrationResultPanel from "@/components/dashboard/ArbitrationResultPanel";
import StatusBar from "@/components/dashboard/StatusBar";
import CustomShardInput from "@/components/dashboard/CustomShardInput";
import ContradictionChain from "@/components/dashboard/ContradictionChain";
import { useReplay, type ReplaySessionData } from "@/hooks/useReplay";

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

export type TrustHistoryPoint = {
  round: number;
  score: number;
};

export type ArbitrationResult = {
  _id?: string;
  absoluteTruthState: unknown;
  compromisedNodes: string[];
  physicsMatrix: unknown;
  arbitrationSummary: string;
  supportingEvidence: unknown[];
  debateExchanges?: DebateExchange[];
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
  const [trustHistory, setTrustHistory] = useState<Record<string, TrustHistoryPoint[]>>({});
  const [replayData, setReplayData] = useState<ReplaySessionData | null>(null);
  const [completionBanner, setCompletionBanner] = useState<{
    analyzedNodes: number;
    compromisedNodes: number;
    injectionDetected: boolean;
  } | null>(null);
  const [isBannerFading, setIsBannerFading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const bannerFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    currentEntities,
    currentExchanges,
    arbitration: replayArbitration,
    phase: replayPhase,
    isReplaying,
    replayShards,
    replayTrustHistory,
    startReplay,
  } = useReplay(replayData);

  const canInitiate = useMemo(() => !isInitiating && !isReplaying && phase !== "initializing", [isInitiating, isReplaying, phase]);

  const displayedPhase = isReplaying ? replayPhase : phase;
  const displayedEntities = isReplaying ? currentEntities : entities;
  const displayedDebates = isReplaying ? currentExchanges : debates;
  const displayedArbitration = isReplaying ? replayArbitration : arbitration;
  const displayedShards = isReplaying ? replayShards : shards;
  const displayedTrustHistory = isReplaying ? replayTrustHistory : trustHistory;

  useEffect(() => {
    if (displayedPhase !== "resolved" || !displayedArbitration) {
      return;
    }

    const matrixNodeCount =
      typeof displayedArbitration.physicsMatrix === "object" && displayedArbitration.physicsMatrix !== null
        ? Object.keys(displayedArbitration.physicsMatrix as Record<string, unknown>).length
        : 0;

    const analyzedNodes = matrixNodeCount || displayedEntities.length || displayedShards.length;
    const compromisedNodes = Array.isArray(displayedArbitration.compromisedNodes)
      ? displayedArbitration.compromisedNodes.length
      : 0;

    const showTimeout = setTimeout(() => {
      setCompletionBanner({
        analyzedNodes,
        compromisedNodes,
        injectionDetected: Boolean(displayedArbitration.promptInjectionDetected),
      });
      setIsBannerFading(false);
    }, 0);

    if (bannerFadeTimeoutRef.current) {
      clearTimeout(bannerFadeTimeoutRef.current);
    }
    if (bannerHideTimeoutRef.current) {
      clearTimeout(bannerHideTimeoutRef.current);
    }

    bannerFadeTimeoutRef.current = setTimeout(() => {
      setIsBannerFading(true);
    }, 5000);

    bannerHideTimeoutRef.current = setTimeout(() => {
      setCompletionBanner(null);
    }, 5600);

    return () => {
      clearTimeout(showTimeout);
    };
  }, [displayedPhase, displayedArbitration, displayedEntities.length, displayedShards.length]);

  useEffect(() => {
    return () => {
      if (bannerFadeTimeoutRef.current) {
        clearTimeout(bannerFadeTimeoutRef.current);
      }
      if (bannerHideTimeoutRef.current) {
        clearTimeout(bannerHideTimeoutRef.current);
      }
    };
  }, []);

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
        const nextShards = Array.isArray(payload.session?.shards) ? payload.session?.shards ?? [] : [];
        const nextEntities = Array.isArray(payload.entities) ? payload.entities : [];
        const nextDebates = Array.isArray(payload.debates) ? payload.debates : [];

        setShards(nextShards);
        setEntities(nextEntities);
        setDebates(nextDebates);
        setArbitration(payload.arbitration ?? null);

        const currentRound = nextDebates
          .filter((debate) => typeof debate.round === "number" && debate.round !== 99)
          .reduce((max, debate) => Math.max(max, debate.round), 0);

        setTrustHistory((prev) => {
          const next = { ...prev };

          nextEntities.forEach((entity) => {
            const score = typeof entity.trustScore === "number" ? clamp(entity.trustScore * 100, 0, 100) : 100;
            const existing = next[entity.nodeId] ?? [{ round: 0, score: 100 }];
            const last = existing[existing.length - 1];

            if (last.score !== score) {
              next[entity.nodeId] = [...existing, { round: currentRound, score }];
            } else if (!next[entity.nodeId]) {
              next[entity.nodeId] = existing;
            }
          });

          return next;
        });

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

  const handleInitiate = async (customShards?: TelemetryShard[]) => {
    if (!canInitiate) return;

    setError(null);
    setPhase("initializing");
    setSessionId(null);
    setEntities([]);
    setDebates([]);
    setArbitration(null);
    setShards([]);
    setTrustHistory({});
    setIsInitiating(true);

    try {
      const response = await fetch("/api/cae/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customShards && customShards.length > 0 ? { customShards } : {}),
      });

      const data = (await response.json()) as { sessionId?: string; error?: string };

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error ?? "Failed to initiate CAE orchestration.");
      }

      setSessionId(data.sessionId);
      setReplayData(null);
      startStatusStream(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate CAE orchestration.");
      setPhase("resolved");
      closeStream();
    } finally {
      setIsInitiating(false);
    }
  };

  const handleReplay = async () => {
    if (!sessionId || isReplaying) return;

    setError(null);
    closeStream();

    try {
      const response = await fetch(`/api/cae/replay/${sessionId}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as ReplaySessionData & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load replay session.");
      }

      setReplayData(data);
      await startReplay(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to replay session.");
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

          <div className="flex w-full max-w-2xl flex-col items-stretch gap-3 md:w-auto md:min-w-136">
            <CustomShardInput onRunCustomData={handleInitiate} disabled={!canInitiate} />

            <div className="flex items-center justify-end gap-3">
            <span className="rounded border border-cyan-800/70 bg-cyan-950/40 px-3 py-1 text-xs uppercase tracking-wider text-cyan-200">
              {displayedPhase}
            </span>
            {phase === "resolved" && sessionId ? (
              <button
                type="button"
                onClick={() => void handleReplay()}
                disabled={isReplaying}
                className="rounded border border-amber-600/70 bg-amber-500/10 px-4 py-2 text-xs uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReplaying ? "Replaying..." : "Replay Session"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void handleInitiate()}
              disabled={!canInitiate}
              className="rounded border border-emerald-600/70 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isInitiating ? "Initiating..." : "Initiate Arbitration"}
            </button>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mx-auto max-w-7xl mt-3 text-xs text-rose-300 border border-rose-900/70 bg-rose-950/30 rounded p-2">
            {error}
          </p>
        ) : null}
      </header>

      {completionBanner ? (
        <div className="px-4 pt-4">
          <div
            className={`mx-auto w-full max-w-7xl rounded border px-4 py-2 text-xs uppercase tracking-wider transition-opacity duration-500 ${
              completionBanner.compromisedNodes > 0
                ? "border-red-700/70 bg-red-950/40 text-red-200"
                : "border-emerald-700/70 bg-emerald-950/40 text-emerald-200"
            } ${isBannerFading ? "opacity-0" : "opacity-100"}`}
          >
            {`✓ ARBITRATION COMPLETE - ${completionBanner.analyzedNodes} nodes analyzed · ${completionBanner.compromisedNodes} compromised · Prompt injection ${completionBanner.injectionDetected ? "DETECTED" : "NOT DETECTED"}`}
          </div>
        </div>
      ) : null}

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 flex-1 max-w-7xl mx-auto w-full">
        <TelemetryGrid
          shards={displayedShards}
          entities={displayedEntities.map((entity) => ({
            nodeId: entity.nodeId,
            isCompromised: Boolean(entity.isCompromised),
            trustScore: typeof entity.trustScore === "number" ? entity.trustScore : 1,
            injectionDetected: Boolean(entity.injectionDetected),
          }))}
          trustHistory={displayedTrustHistory}
          physicsMatrix={
            displayedArbitration?.physicsMatrix &&
            typeof displayedArbitration.physicsMatrix === "object" &&
            displayedArbitration.physicsMatrix !== null
              ? (displayedArbitration.physicsMatrix as Record<string, { verdict: string }>)
              : undefined
          }
        />
        <EntityReasoningPanel entities={displayedEntities} />
        <DebateTimeline debates={displayedDebates} />
        <div className="space-y-4">
          <ArbitrationResultPanel arbitration={displayedArbitration} entities={displayedEntities} />
          {displayedArbitration ? (
            <ContradictionChain
              arbitration={{
                ...displayedArbitration,
                debateExchanges: displayedDebates,
              }}
            />
          ) : null}
        </div>
      </main>

      <StatusBar phase={displayedPhase} entityCount={displayedEntities.length} debateCount={displayedDebates.length} isReplaying={isReplaying} />
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
