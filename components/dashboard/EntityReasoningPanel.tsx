"use client";

import { useState } from "react";
import type { CognitiveEntity } from "@/components/dashboard/CAEDashboard";

type EntityReasoningPanelProps = {
  entities: CognitiveEntity[];
};

export default function EntityReasoningPanel({ entities }: EntityReasoningPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (nodeId: string) => {
    setExpanded((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  return (
    <section className="rounded border border-slate-800 bg-slate-950/50 p-4">
      <h2 className="text-sm uppercase tracking-wider text-cyan-300">ENTITY REASONING</h2>
      <div className="mt-3 space-y-3 max-h-90 overflow-y-auto pr-1">
        {entities.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>AWAITING COGNITIVE ENTITY INSTANTIATION...</span>
          </div>
        ) : (
          entities.map((entity) => {
            const isOpen = Boolean(expanded[entity.nodeId]);

            return (
              <article key={entity.nodeId} className="rounded border border-slate-800/80 bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => toggle(entity.nodeId)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs text-slate-100 uppercase tracking-widest">
                      ENTITY {entity.nodeId}
                    </h3>
                    <div className="flex items-center gap-2">
                      {entity.injectionDetected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded border border-orange-500/70 text-orange-300 bg-orange-950/30">
                          ⚠ INJECTION
                        </span>
                      ) : null}
                      {entity.isCompromised ? (
                        <span className="text-[10px] px-2 py-0.5 rounded border border-red-500/70 text-red-300 bg-red-950/30">
                          ✗ COMPROMISED
                        </span>
                      ) : null}
                      <span className="text-[10px] text-slate-500">{isOpen ? "[-]" : "[+]"}</span>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-800/70 px-3 pb-3">
                    <p className="mt-2 text-[11px] italic text-slate-300">{entity.hypothesis}</p>
                    <p className="mt-2 text-xs font-mono text-slate-400">{entity.physicsAnalysis}</p>
                    {entity.anomalyFlags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entity.anomalyFlags.map((flag, index) => (
                          <span
                            key={`${entity.nodeId}-${flag}-${index}`}
                            className="text-[10px] px-2 py-0.5 rounded border border-red-700/80 text-red-200 bg-red-950/40"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
