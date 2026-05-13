"use client";

type StatusBarProps = {
  phase: string;
  entityCount: number;
  debateCount: number;
  isReplaying?: boolean;
};

const PHASES = ["INGEST", "INSTANTIATE", "REASON", "DEBATE", "CONSENSUS", "RESOLVE"];
const PHASE_TOOLTIPS: Record<string, string> = {
  INGEST: "Reading telemetry shards from Tartarus_Core module",
  INSTANTIATE: "Spawning isolated cognitive entities - one per node",
  REASON: "Each entity independently assesses physical consistency",
  DEBATE: "Adversarial cross-examination using physics arguments only",
  CONSENSUS: "Devil's Advocate challenge + final arbitration",
  RESOLVE: "Deterministic JSON verdict produced and persisted",
};

function getCurrentIndex(phase: string): number {
  switch (phase) {
    case "initializing":
      return 1;
    case "reasoning":
      return 2;
    case "debating":
      return 3;
    case "consensus":
      return 4;
    case "resolved":
      return 5;
    default:
      return -1;
  }
}

export default function StatusBar({ phase, entityCount, debateCount, isReplaying = false }: StatusBarProps) {
  const currentIndex = getCurrentIndex(phase);
  const isResolved = phase === "resolved";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm px-4 py-3">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-[11px] uppercase tracking-wider text-slate-300 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {PHASES.map((name, index) => {
            const className =
              index < currentIndex
                ? "text-slate-500"
                : index === currentIndex
                  ? "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                  : "text-slate-700";

            const dotClass =
              index < currentIndex
                ? "bg-slate-500"
                : index === currentIndex
                  ? "bg-emerald-400"
                  : "bg-slate-700";

            return (
              <span key={name} className={`group inline-flex items-center ${className}`}>
                <span className={`relative mr-1 inline-flex h-2 w-2 rounded-full ${dotClass}`}>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-56 -translate-x-1/2 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] normal-case tracking-normal text-slate-200 group-hover:block">
                    {PHASE_TOOLTIPS[name]}
                  </span>
                </span>
                {name}
                {index < PHASES.length - 1 ? " ->" : ""}
              </span>
            );
          })}
        </div>

        <div className="text-slate-300">ENTITIES: {entityCount}/5  |  EXCHANGES: {debateCount}</div>

        <div className="text-right text-slate-400">
          {isReplaying ? (
            <span className="rounded border border-amber-600/70 bg-amber-950/40 px-2 py-0.5 text-[10px] tracking-wider text-amber-300">
              REPLAYING...
            </span>
          ) : isResolved ? (
            "SYSTEM NOMINAL"
          ) : (
            <span className="animate-pulse">█</span>
          )}
        </div>
      </div>
    </footer>
  );
}
