"use client";

type TelemetryGridProps = {
  shards: Array<{
    node: string;
    v_m1: number;
    v_m2: number;
    v_m3: number;
    v_m4: number;
    v_m5: number;
    v_m6: number;
    v_m7: number;
    sys_log: string;
  }>;
  entities: Array<{
    nodeId: string;
    isCompromised: boolean;
    trustScore: number;
    injectionDetected: boolean;
  }>;
};

type PhysicsMatrix = Record<string, { verdict: string }>;

const VAR_META = {
  v_m1: { label: "Thermal Kinetic Energy", unit: "°C" },
  v_m2: { label: "Containment Stress", unit: "psi" },
  v_m3: { label: "EM Flux", unit: "Wb" },
  v_m4: { label: "Acoustic Resonance", unit: "Hz" },
  v_m5: { label: "Seismic Tremors", unit: "g" },
  v_m6: { label: "Viscosity Index", unit: "—" },
  v_m7: { label: "Gamma Attenuation", unit: "mSv/h" },
} as const;

const VAR_KEYS = Object.keys(VAR_META) as Array<keyof typeof VAR_META>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getTrustColor(trust: number): string {
  const normalized = clamp(trust, 0, 1);
  const hue = normalized * 120;
  return `hsl(${hue} 90% 45%)`;
}

function truncateLog(input: string, max = 60): string {
  return input.length > max ? `${input.slice(0, max)}...` : input;
}

type TelemetryGridFinalProps = TelemetryGridProps & { physicsMatrix?: PhysicsMatrix };
export default function TelemetryGrid({ shards, entities, physicsMatrix }: TelemetryGridFinalProps) {
  return (
    <section className="rounded border border-slate-800 bg-slate-950/50 p-4">
      <h2 className="text-sm uppercase tracking-wider text-cyan-300">
        TELEMETRY GRID // {shards.length} NODES ACTIVE
      </h2>

      {shards.length === 0 ? (
        <p className="mt-4 text-xs text-slate-400">No telemetry shards yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {shards.map((shard) => {
            const entity = entities.find((item) => item.nodeId === shard.node);
            const matrixVerdict = physicsMatrix?.[shard.node]?.verdict?.toUpperCase();
            const isCompromised = matrixVerdict === "COMPROMISED";
            const hasVerdict = Boolean(matrixVerdict);
            const injectionDetected = Boolean(entity?.injectionDetected);
            const trustScore = clamp(entity?.trustScore ?? 0, 0, 1);
            const suspiciousLog = /OVERRIDE|IGNORE|CRITICAL/i.test(shard.sys_log);

            const cardStateClass = !hasVerdict
              ? "border-slate-700"
              : isCompromised
                ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                : "border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.15)]";

            const status = !hasVerdict
              ? "SCANNING..."
              : isCompromised
                ? "COMPROMISED"
                : "NOMINAL";

            const statusClass = !hasVerdict
              ? "border-amber-500/60 text-amber-300 bg-amber-900/20 animate-pulse"
              : isCompromised
                ? "border-red-500/70 text-red-300 bg-red-950/30"
                : "border-emerald-500/60 text-emerald-300 bg-emerald-950/30";

            return (
              <article
                key={shard.node}
                className={`relative overflow-hidden rounded border bg-slate-900/45 p-3 pb-5 ${cardStateClass}`}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,156,0.015) 2px, rgba(0,255,156,0.015) 4px)",
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs tracking-widest uppercase text-slate-100">NODE {shard.node}</h3>
                    <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusClass}`}>
                      {status}
                    </span>
                  </div>

                  {injectionDetected ? (
                    <div className="mt-2">
                      <span className="rounded border border-orange-500/70 bg-orange-950/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-orange-300">
                        ⚠ Injection Detected
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-3 space-y-1.5">
                    {VAR_KEYS.map((key) => (
                      <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <span className="text-xs text-slate-400">{VAR_META[key].label}</span>
                        <span
                          className={`text-xs font-bold font-mono ${
                            isCompromised ? "text-red-300" : "text-emerald-300"
                          }`}
                        >
                          {shard[key]}
                        </span>
                        <span className="text-xs text-slate-500">{VAR_META[key].unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-slate-800 pt-2">
                    <p className={`text-xs ${suspiciousLog ? "text-red-300" : "text-slate-400"}`}>
                      SYS_LOG: {truncateLog(shard.sys_log, 60)}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-800">
                  <div
                    className="h-full transition-[width] duration-300"
                    style={{
                      width: `${trustScore * 100}%`,
                      backgroundColor: getTrustColor(trustScore),
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
