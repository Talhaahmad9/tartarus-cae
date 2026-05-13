import { useCallback, useMemo, useRef, useState } from "react";
import type {
  ArbitrationResult,
  CognitiveEntity,
  DashboardPhase,
  DebateExchange,
  TelemetryShard,
  TrustHistoryPoint,
} from "@/components/dashboard/CAEDashboard";

export type ReplaySessionData = {
  session: {
    sessionId: string;
    status?: DashboardPhase;
    shards?: TelemetryShard[];
  };
  entities: CognitiveEntity[];
  debateExchanges: DebateExchange[];
  arbitration: ArbitrationResult | null;
};

type ReplayState = {
  currentEntities: CognitiveEntity[];
  currentExchanges: DebateExchange[];
  arbitration: ArbitrationResult | null;
  phase: DashboardPhase;
  isReplaying: boolean;
  replayShards: TelemetryShard[];
  replayTrustHistory: Record<string, TrustHistoryPoint[]>;
  startReplay: (dataOverride?: ReplaySessionData) => Promise<void>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function initializeTrustHistory(data: ReplaySessionData): Record<string, TrustHistoryPoint[]> {
  return data.entities.reduce<Record<string, TrustHistoryPoint[]>>((acc, entity) => {
    acc[entity.nodeId] = [{ round: 0, score: 100 }];
    return acc;
  }, {});
}

export function useReplay(initialData: ReplaySessionData | null): ReplayState {
  const replayRunRef = useRef(0);
  const [currentEntities, setCurrentEntities] = useState<CognitiveEntity[]>([]);
  const [currentExchanges, setCurrentExchanges] = useState<DebateExchange[]>([]);
  const [currentArbitration, setCurrentArbitration] = useState<ArbitrationResult | null>(null);
  const [phase, setPhase] = useState<DashboardPhase>("idle");
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayShards, setReplayShards] = useState<TelemetryShard[]>([]);
  const [replayTrustHistory, setReplayTrustHistory] = useState<Record<string, TrustHistoryPoint[]>>({});

  const sourceData = useMemo(() => initialData, [initialData]);

  const startReplay = useCallback(
    async (dataOverride?: ReplaySessionData) => {
      const data = dataOverride ?? sourceData;
      if (!data) return;

      replayRunRef.current += 1;
      const runId = replayRunRef.current;

      const normalExchanges = data.debateExchanges.filter((exchange) => !exchange.isDevilsAdvocate);
      const daExchanges = data.debateExchanges.filter((exchange) => exchange.isDevilsAdvocate);

      const entitiesByNode = data.entities.reduce<Record<string, CognitiveEntity>>((acc, entity) => {
        acc[entity.nodeId] = {
          ...entity,
          trustScore: 1,
        };
        return acc;
      }, {});

      setIsReplaying(true);
      setPhase("initializing");
      setCurrentEntities([]);
      setCurrentExchanges([]);
      setCurrentArbitration(null);
      setReplayShards(Array.isArray(data.session.shards) ? data.session.shards : []);
      setReplayTrustHistory(initializeTrustHistory(data));

      await sleep(500);
      if (runId !== replayRunRef.current) return;

      setPhase("reasoning");
      for (const entity of data.entities) {
        if (runId !== replayRunRef.current) return;
        setCurrentEntities((prev) => [...prev, { ...entitiesByNode[entity.nodeId] }]);
        await sleep(800);
      }

      if (runId !== replayRunRef.current) return;
      setPhase("debating");

      const applyTrustDecay = (exchange: DebateExchange) => {
        if (!exchange.contradictionDetected) {
          return;
        }

        const targetId = exchange.targetId;
        const existing = entitiesByNode[targetId];
        if (!existing) {
          return;
        }

        const currentScore = typeof existing.trustScore === "number" ? existing.trustScore : 1;
        const delta = exchange.isDevilsAdvocate ? (exchange.daUpheld ? 0 : 0.2) : 0.15;
        const nextScore = clamp(currentScore - delta, 0, 1);

        if (nextScore === currentScore) {
          return;
        }

        entitiesByNode[targetId] = {
          ...existing,
          trustScore: nextScore,
        };

        const historyRound = exchange.round === 99 ? 3 : exchange.round;
        setReplayTrustHistory((prev) => {
          const prevPoints = prev[targetId] ?? [{ round: 0, score: 100 }];
          const nextPoint = { round: historyRound, score: Math.round(nextScore * 100) };
          return {
            ...prev,
            [targetId]: [...prevPoints, nextPoint],
          };
        });

        setCurrentEntities((prev) =>
          prev.map((entity) =>
            entity.nodeId === targetId
              ? {
                  ...entity,
                  trustScore: nextScore,
                }
              : entity
          )
        );
      };

      for (const exchange of normalExchanges) {
        if (runId !== replayRunRef.current) return;
        setCurrentExchanges((prev) => [...prev, exchange]);
        applyTrustDecay(exchange);
        await sleep(600);
      }

      for (const exchange of daExchanges) {
        if (runId !== replayRunRef.current) return;
        setCurrentExchanges((prev) => [...prev, exchange]);
        applyTrustDecay(exchange);
        await sleep(700);
      }

      if (runId !== replayRunRef.current) return;
      setPhase("consensus");
      await sleep(500);

      if (runId !== replayRunRef.current) return;
      setCurrentArbitration(data.arbitration);
      setPhase("resolved");
      setIsReplaying(false);
    },
    [sourceData]
  );

  return {
    currentEntities,
    currentExchanges,
    arbitration: currentArbitration,
    phase,
    isReplaying,
    replayShards,
    replayTrustHistory,
    startReplay,
  };
}
