"use client";

type StatusBarProps = {
  phase: string;
  entityCount: number;
  debateCount: number;
};

const PHASES = ["INGEST", "INSTANTIATE", "REASON", "DEBATE", "CONSENSUS", "RESOLVE"];

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

export default function StatusBar({ phase, entityCount, debateCount }: StatusBarProps) {
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

            return (
              <span key={name} className={className}>
                {name}
                {index < PHASES.length - 1 ? " ->" : ""}
              </span>
            );
          })}
        </div>

        <div className="text-slate-300">ENTITIES: {entityCount}/5  |  EXCHANGES: {debateCount}</div>

        <div className="text-right text-slate-400">
          {isResolved ? "SYSTEM NOMINAL" : <span className="animate-pulse">█</span>}
        </div>
      </div>
    </footer>
  );
}
