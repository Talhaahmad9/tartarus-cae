"use client";

import { useMemo, useState } from "react";
import type { ArbitrationResult, DebateExchange } from "@/components/dashboard/CAEDashboard";

type ContradictionChainProps = {
  arbitration: ArbitrationResult;
};

type MatrixRow = {
  nodeId: string;
  verdict: string;
  reason: string;
  keyContradiction: string | null;
  confidenceScore: number;
};

function parseMatrixRows(arbitration: ArbitrationResult): MatrixRow[] {
  if (typeof arbitration.physicsMatrix !== "object" || arbitration.physicsMatrix === null) {
    return [];
  }

  return Object.entries(arbitration.physicsMatrix as Record<string, unknown>).map(([nodeKey, value]) => {
    const row = (value ?? {}) as Record<string, unknown>;
    const confidenceScore =
      typeof row.confidenceScore === "number" && Number.isFinite(row.confidenceScore)
        ? Math.max(0, Math.min(100, row.confidenceScore))
        : 0;

    return {
      nodeId: typeof row.nodeId === "string" && row.nodeId.trim().length > 0 ? row.nodeId : nodeKey,
      verdict: String(row.verdict ?? "UNKNOWN").toUpperCase(),
      reason: String(row.reason ?? "—"),
      keyContradiction: row.keyContradiction ? String(row.keyContradiction) : null,
      confidenceScore,
    };
  });
}

function getTargetNodeId(exchange: DebateExchange): string {
  const withTargetNodeId = exchange as DebateExchange & { targetNodeId?: string };
  return withTargetNodeId.targetNodeId ?? exchange.targetId;
}

export default function ContradictionChain({ arbitration }: ContradictionChainProps) {
  const [expandedByNode, setExpandedByNode] = useState<Record<string, boolean>>({});

  const matrixRows = useMemo(() => parseMatrixRows(arbitration), [arbitration]);
  const debateExchanges = Array.isArray(arbitration.debateExchanges) ? arbitration.debateExchanges : [];

  const toggleNode = (nodeId: string) => {
    setExpandedByNode((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  return (
    <section className="rounded border border-slate-800 bg-slate-950/50 p-4">
      <h2 className="text-sm uppercase tracking-wider text-cyan-300">CONTRADICTION CHAIN</h2>
      <p className="mt-1 text-xs text-slate-400">
        Step-by-step physics path from challenge events to final verdict.
      </p>

      <div className="mt-3 space-y-3">
        {matrixRows.length === 0 ? (
          <p className="text-xs text-slate-500">No physics matrix available yet.</p>
        ) : (
          matrixRows.map((row) => {
            const isCompromised = row.verdict === "COMPROMISED";
            const isExpanded = Boolean(expandedByNode[row.nodeId]);
            const contradictionEvents = debateExchanges.filter(
              (exchange) => exchange.contradictionDetected && getTargetNodeId(exchange) === row.nodeId && !exchange.isDevilsAdvocate
            );
            const daExchange = debateExchanges.find(
              (exchange) => exchange.isDevilsAdvocate && getTargetNodeId(exchange) === row.nodeId
            );
            const confidenceColor = isCompromised ? "bg-red-500" : "bg-emerald-500";

            return (
              <article
                key={row.nodeId}
                className={`rounded border p-3 ${isCompromised ? "border-red-800/70 bg-red-950/20" : "border-emerald-800/70 bg-emerald-950/20"}`}
              >
                <button
                  type="button"
                  onClick={() => toggleNode(row.nodeId)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-300">Node {row.nodeId}</p>
                    <span
                      className={`mt-1 inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${
                        isCompromised
                          ? "border-red-600/70 bg-red-950/30 text-red-300"
                          : "border-emerald-600/70 bg-emerald-950/30 text-emerald-300"
                      }`}
                    >
                      {row.verdict}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">{isExpanded ? "Collapse" : "Expand"}</span>
                </button>

                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Confidence</p>
                    <p className="text-[10px] text-slate-300">{`${Math.round(row.confidenceScore)}%`}</p>
                  </div>
                  <div className="h-1 w-full rounded-full bg-slate-800">
                    <div
                      className={`h-1 rounded-full ${confidenceColor}`}
                      style={{ width: `${row.confidenceScore}%` }}
                    />
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-3 space-y-2 border-t border-slate-800/70 pt-3 text-xs">
                    {isCompromised ? (
                      <>
                        {contradictionEvents.length > 0 ? (
                          <ol className="space-y-2">
                            {contradictionEvents.map((event, index) => (
                              <li key={`${row.nodeId}-${event.round}-${event.challengerId}-${index}`} className="rounded border border-slate-800 bg-slate-900/40 p-2 text-slate-200">
                                {`[Round ${event.round}] CHALLENGER: ${event.challengerId} -> "${event.argument}"`}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-slate-400">No contradiction events captured for this node.</p>
                        )}

                        {daExchange ? (
                          <div className="rounded border border-amber-700/70 bg-amber-950/25 p-2 text-amber-200">
                            <p>{`[DA] Defense attempted -> "${daExchange.daDefense ?? daExchange.argument}"`}</p>
                            <p className="mt-1 font-semibold text-amber-300">
                              {`[DA RULING] ${daExchange.daUpheld ? "UPHELD" : "COLLAPSED"}`}
                            </p>
                          </div>
                        ) : null}

                        <p className="rounded border border-red-700/70 bg-red-950/30 p-2 font-semibold text-red-200">
                          {`Final contradiction: ${row.keyContradiction ?? row.reason}`}
                        </p>
                      </>
                    ) : (
                      <p className="text-emerald-200">{row.reason}</p>
                    )}
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
