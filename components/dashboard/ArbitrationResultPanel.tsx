"use client";

import { useState } from "react";
import type { ArbitrationResult, CognitiveEntity } from "@/components/dashboard/CAEDashboard";

type ArbitrationResultPanelProps = {
  arbitration: ArbitrationResult | null;
  entities: CognitiveEntity[];
};

export default function ArbitrationResultPanel({ arbitration, entities }: ArbitrationResultPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!arbitration) {
    return (
      <section className="rounded border border-slate-800 bg-slate-950/50 p-4">
        <h2 className="text-sm uppercase tracking-wider text-cyan-300">ARBITRATION RESULT</h2>
        <p className="mt-3 text-xs text-slate-500 animate-pulse">AWAITING FINAL ARBITRATION VERDICT...</p>
      </section>
    );
  }

  const matrixRows =
    typeof arbitration.physicsMatrix !== "object" || arbitration.physicsMatrix === null
      ? ([] as Array<{ node: string; verdict: string; reason: string; keyContradiction: string | null; confidenceScore: number | null }>)
      : Object.entries(arbitration.physicsMatrix as Record<string, unknown>).map(([node, value]) => {
          const row = (value ?? {}) as Record<string, unknown>;
          const confidenceScore =
            typeof row.confidenceScore === "number" && Number.isFinite(row.confidenceScore)
              ? Math.max(0, Math.min(100, row.confidenceScore))
              : null;
          return {
            node,
            verdict: String(row.verdict ?? "UNKNOWN"),
            reason: String(row.reason ?? "—"),
            keyContradiction: row.keyContradiction ? String(row.keyContradiction) : null,
            confidenceScore,
          };
        });

  const injectionEntity = arbitration.promptInjectionNodeId
    ? entities.find((e) => e.nodeId === arbitration.promptInjectionNodeId)
    : undefined;

  const injectionSnippet =
    injectionEntity?.injectionContent?.slice(0, 200) ??
    "Injection payload not captured in entity data.";

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(arbitration, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="rounded border border-slate-800 bg-slate-950/50 p-4">
      <h2 className="text-sm uppercase tracking-wider text-cyan-300">ARBITRATION RESULT</h2>
      <div className="mt-3 space-y-4 text-[11px]">
        <h3 className="text-xl tracking-widest text-emerald-400">{"// ARBITRATION RESOLVED"}</h3>

        {arbitration.promptInjectionDetected ? (
          <div className="rounded border animate-pulse border-orange-500 bg-linear-to-r from-red-950/50 via-orange-950/40 to-red-950/40 p-4">
            <p className="text-lg tracking-wide text-orange-300 font-semibold">
              ⚠ ADVERSARIAL PROMPT INJECTION NEUTRALIZED
            </p>
            <p className="mt-1 text-xs text-orange-200">
              Originating Node: {arbitration.promptInjectionNodeId ?? "UNKNOWN"}
            </p>
            <pre className="mt-3 rounded border border-red-900/70 bg-red-950/50 p-3 text-xs text-red-200 font-mono whitespace-pre-wrap wrap-break-word">
              {injectionSnippet}
            </pre>
          </div>
        ) : null}

        <div className="rounded border border-slate-800/80 bg-slate-900/40 p-3">
          <p className="text-slate-200">{arbitration.arbitrationSummary}</p>
        </div>

        <div className="rounded border border-slate-800/80 bg-slate-900/40 p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Compromised Nodes</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {arbitration.compromisedNodes?.length ? (
              arbitration.compromisedNodes.map((nodeId) => (
                <span key={nodeId} className="text-[10px] px-2 py-0.5 rounded border border-rose-700 text-rose-300 bg-rose-950/40">
                  {nodeId}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-emerald-300">None flagged</span>
            )}
          </div>
        </div>

        <div className="rounded border border-slate-800/80 bg-slate-900/40 p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Physics Matrix</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-1 pr-3 text-left">Node</th>
                  <th className="py-1 pr-3 text-left">Verdict</th>
                  <th className="py-1 pr-3 text-left">Reason</th>
                  <th className="py-1 text-left">Key Contradiction</th>
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row) => {
                  const compromised = row.verdict.toUpperCase() === "COMPROMISED";
                  const confidenceColor =
                    row.confidenceScore === null
                      ? ""
                      : row.confidenceScore > 70
                        ? "bg-emerald-500"
                        : row.confidenceScore >= 40
                          ? "bg-amber-500"
                          : "bg-red-500";
                  return (
                    <tr key={row.node} className="border-b border-slate-900/70 align-top">
                      <td className="py-1 pr-3 text-slate-200">{row.node}</td>
                      <td className={compromised ? "py-1 pr-3 font-semibold text-red-300" : "py-1 pr-3 font-semibold text-emerald-300"}>
                        <div>{row.verdict}</div>
                        {row.confidenceScore !== null ? (
                          <div className="mt-1">
                            <p className="text-[10px] font-normal text-slate-400">{`${Math.round(row.confidenceScore)}% confident`}</p>
                            <div className="mt-1 h-1 w-full rounded-full bg-slate-800">
                              <div
                                className={`h-1 rounded-full ${confidenceColor}`}
                                style={{ width: `${row.confidenceScore}%` }}
                              />
                            </div>
                          </div>
                        ) : null}
                      </td>
                      <td className="py-1 pr-3 text-slate-300">{row.reason}</td>
                      <td className="py-1 text-slate-400">{row.keyContradiction ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">Final JSON</p>
            <button
              type="button"
              onClick={copyJson}
              className="rounded border border-emerald-700/70 bg-emerald-950/30 px-2 py-1 text-[10px] tracking-wider text-emerald-300 hover:bg-emerald-900/30"
            >
              {copied ? "COPIED" : "COPY JSON"}
            </button>
          </div>
          <pre className="text-xs text-emerald-400 bg-slate-950 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(arbitration, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}