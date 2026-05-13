"use client";

import type { DebateExchange } from "@/components/dashboard/CAEDashboard";

type DebateTimelineProps = {
  debates: DebateExchange[];
};

export default function DebateTimeline({ debates }: DebateTimelineProps) {
  const daExchanges = debates.filter((debate) => debate.round === 99 && debate.isDevilsAdvocate === true);

  const grouped = debates.reduce<Record<number, DebateExchange[]>>((acc, debate) => {
    if (debate.round === 99 && debate.isDevilsAdvocate === true) {
      return acc;
    }

    acc[debate.round] = acc[debate.round] ?? [];
    acc[debate.round].push(debate);
    return acc;
  }, {});

  const rounds = Object.keys(grouped)
    .map((key) => Number(key))
    .sort((a, b) => a - b);

  return (
    <section className="rounded border border-slate-800 bg-slate-950/50 p-4">
      <h2 className="text-sm uppercase tracking-wider text-cyan-300">DEBATE TIMELINE</h2>
      <div className="mt-3 max-h-90 overflow-y-auto pr-1">
        {debates.length === 0 ? (
          <p className="text-xs text-slate-500">DEBATE ENGINE STANDBY...</p>
        ) : (
          <div className="space-y-4 border-l border-slate-700 pl-4">
            {rounds.map((round) => (
              <div key={round} className="space-y-3">
                <p className="text-xs tracking-wider text-slate-400">── ROUND {round} ──</p>
                {grouped[round].map((debate, index) => (
                  <article
                    key={`${debate.challengerId}-${debate.targetId}-${index}`}
                    className="rounded border border-slate-800/80 bg-slate-900/40 p-3"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-emerald-300 font-semibold tracking-wider uppercase">
                          {debate.challengerId}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">{debate.argument}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border h-fit ${
                          debate.contradictionDetected
                            ? "border-red-500/70 text-red-300 bg-red-950/30"
                            : "border-emerald-500/60 text-emerald-300 bg-emerald-950/30"
                        }`}
                      >
                        {debate.contradictionDetected ? "⚡ CONTRADICTION" : "✓ CONSISTENT"}
                      </span>
                    </div>

                    {debate.evidenceKeys?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {debate.evidenceKeys.map((key) => (
                          <span
                            key={`${debate.challengerId}-${debate.targetId}-${key}`}
                            className="rounded border border-cyan-800/70 bg-cyan-950/30 px-2 py-0.5 text-[10px] font-mono text-cyan-200"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {debate.contradictionReason ? (
                      <p className="mt-2 text-xs italic text-red-300">{debate.contradictionReason}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ))}

            {daExchanges.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs tracking-wider text-amber-400">── DEVIL&apos;S ADVOCATE INTERVENTIONS ──</p>
                {daExchanges.map((debate, index) => (
                  <article
                    key={`da-${debate.targetId}-${index}`}
                    className="rounded border border-amber-800/50 border-l-2 border-l-amber-500 bg-amber-950/20 p-3"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-amber-300 font-semibold tracking-wider uppercase">
                          ⚖ DEVIL&apos;S ADVOCATE → {debate.targetId}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">{debate.daDefense ?? debate.argument}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border h-fit ${
                          debate.daUpheld
                            ? "border-emerald-500/60 text-emerald-300 bg-emerald-950/30"
                            : "border-red-500/70 text-red-300 bg-red-950/30"
                        }`}
                      >
                        {debate.daUpheld ? "DEFENSE UPHELD" : "DEFENSE COLLAPSED"}
                      </span>
                    </div>

                    {debate.contradictionReason ? (
                      <p className="mt-2 text-xs italic text-slate-400">{debate.contradictionReason}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
