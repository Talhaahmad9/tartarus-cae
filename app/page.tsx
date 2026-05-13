import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Database,
  Radar,
  ShieldAlert,
  Sparkles,
  Workflow,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B14] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(14,165,233,0.2),transparent_38%),radial-gradient(circle_at_85%_18%,rgba(34,197,94,0.16),transparent_40%),radial-gradient(circle_at_60%_100%,rgba(59,130,246,0.14),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.18),rgba(2,6,23,0.8))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-size-[28px_28px] bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-cyan-900/60 bg-slate-950/65 p-6 shadow-[0_0_40px_rgba(8,47,73,0.45)] backdrop-blur">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-800/70 bg-cyan-950/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Epimenides Paradigm
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[0.08em] text-cyan-200 md:text-5xl">
            Cognitive Arbitration Engine
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Autonomous multi-agent AI system for adversarial telemetry arbitration.
            The CAE isolates reasoning entities, forces physics-grounded debate, detects
            prompt injection, and converges on a deterministic reactor truth state.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-500/80 bg-emerald-500/15 px-5 text-xs font-semibold uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-500/25"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md border border-cyan-700/80 bg-cyan-500/10 px-5 text-xs font-semibold uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-500/20"
            >
              Create Account
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 bg-slate-900/70 px-5 text-xs font-semibold uppercase tracking-wider text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Open Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Ingest",
              icon: Activity,
              text: "Telemetry shards are loaded and normalized without positional assumptions.",
            },
            {
              title: "Instantiate",
              icon: BrainCircuit,
              text: "Each node becomes an isolated reasoning entity with blind peer context.",
            },
            {
              title: "Debate",
              icon: Radar,
              text: "Entities cross-examine hypotheses using thermodynamic and geophysical logic.",
            },
            {
              title: "Arbitrate",
              icon: Workflow,
              text: "Final arbitration produces deterministic JSON and compromised node verdicts.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-800/90 bg-slate-950/55 p-4 backdrop-blur transition hover:border-cyan-700/70"
            >
              <item.icon className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-3 text-sm font-semibold uppercase tracking-wider text-slate-100">
                {item.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-xl border border-rose-900/60 bg-slate-950/65 p-5 shadow-[0_0_36px_rgba(136,19,55,0.28)]">
            <div className="flex items-center gap-2 text-rose-200">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.15em]">
                Live Injection Hardening
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              The pipeline treats prompt-injection payloads as hostile artifacts. Compromised
              node instructions are detected, contained, and surfaced in the UI without being
              executed by the arbitration logic.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md border border-rose-900/60 bg-rose-950/25 p-3 text-[11px] text-rose-200">
{`ALERT: SYSTEM OVERRIDE DETECTED
ACTION: PAYLOAD ISOLATED
RESULT: ARBITRATION FLOW CONTINUES`}
            </pre>
          </article>

          <article className="rounded-xl border border-slate-800/90 bg-slate-950/65 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">
              After Login, What Happens?
            </p>
            <ol className="mt-4 space-y-3 text-xs text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  Authenticated users can open <span className="font-semibold text-cyan-200">/dashboard</span>
                  {' '}to access the CAE runtime panel.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  Click <span className="font-semibold text-cyan-200">INITIATE</span> to start a fresh
                  orchestration session and begin SSE status streaming.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  Watch entity hypotheses, debate exchanges, and arbitration results persist to
                  MongoDB in real time.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  Final verdict includes compromised nodes, physics matrix, and injection status,
                  ready for audit or export.
                </span>
              </li>
            </ol>
          </article>
        </section>

        <section className="rounded-xl border border-slate-800/90 bg-slate-950/55 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
              <Database className="h-4 w-4 text-cyan-300" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">Persistence</p>
              <p className="mt-1 text-sm text-slate-200">MongoDB Session Trace</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
              <BrainCircuit className="h-4 w-4 text-cyan-300" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">Reasoning</p>
              <p className="mt-1 text-sm text-slate-200">Groq LLaMA 3.3-70B</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
              <Workflow className="h-4 w-4 text-cyan-300" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">Streaming</p>
              <p className="mt-1 text-sm text-slate-200">Live SSE Pipeline State</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
