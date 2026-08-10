import { useMemo, useState } from 'react';

/**
 * WDS-IDS · drift scoring and the alert policy.
 *
 * Band edges (0.40 / 0.45 / 0.60), the graded alert labels, the confusion
 * matrix, the per-phase results and the threshold convergence are all measured
 * values from the project. The sample stream drawn in the chart is generated —
 * it illustrates how the banding applies to a live score, nothing more.
 */

const BANDS = [
  { from: 0, to: 0.4, label: 'NORMAL', tone: 'var(--color-ok)', action: 'no action' },
  { from: 0.4, to: 0.45, label: 'WARNING', tone: '#a16207', action: 'investigate' },
  { from: 0.45, to: 0.6, label: 'ALERT', tone: 'var(--color-warn)', action: 'block / log' },
  { from: 0.6, to: 1, label: 'CRITICAL', tone: '#991b1b', action: 'immediate response' },
];

const CONFUSION = {
  trueNegative: 18_734,
  falsePositive: 3_742,
  falseNegative: 0,
  truePositive: 2_514,
};

const PHASES = [
  { phase: 'Phase 1', samples: '6,248', accuracy: '92.16%', recall: '100%' },
  { phase: 'Phase 2', samples: '6,248', accuracy: '83.74%', recall: '100%' },
  { phase: 'Phase 3', samples: '6,248', accuracy: '76.09%', recall: '100%' },
  { phase: 'Phase 4', samples: '6,246', accuracy: '88.12%', recall: '100%' },
];

const STRATEGIES = ['F1', 'Youden index', 'Balanced accuracy', 'Cost-sensitive', 'ROC optimal'];

/** Deterministic pseudo-random stream so the chart is stable across renders. */
function makeStream(n: number) {
  let seed = 20260115;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: n }, (_, i) => {
    // Two attack windows against an otherwise quiet baseline.
    const attack = (i > 26 && i < 38) || (i > 62 && i < 70);
    const base = attack ? 0.55 + rand() * 0.33 : 0.12 + rand() * 0.24;
    return { i, score: Math.min(0.99, base), attack };
  });
}

const bandFor = (score: number) => BANDS.find((b) => score >= b.from && score < b.to) ?? BANDS[3];

export default function DriftLab() {
  const [threshold, setThreshold] = useState(0.45);
  const stream = useMemo(() => makeStream(84), []);

  const W = 720;
  const H = 200;
  const x = (i: number) => (i / (stream.length - 1)) * W;
  const y = (s: number) => H - s * H;

  const alerted = stream.filter((p) => p.score >= threshold);
  const missed = stream.filter((p) => p.attack && p.score < threshold);
  const falseAlarms = stream.filter((p) => !p.attack && p.score >= threshold);

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:gap-14">
      <div>
        {/* ── trace ────────────────────────────────────────────────── */}
        <p className="label-tech mb-4">
          Drift score vs learned baseline
          <span className="label-tech-sm ml-3 normal-case">illustrative stream</span>
        </p>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H + 26}`} className="h-auto w-full min-w-[34rem]">
            {/* band shading */}
            {BANDS.map((b) => (
              <rect
                key={b.label}
                x="0"
                y={y(b.to)}
                width={W}
                height={y(b.from) - y(b.to)}
                fill={b.tone}
                opacity="0.05"
              />
            ))}

            {/* band edges */}
            {BANDS.slice(1).map((b) => (
              <g key={b.label}>
                <line
                  x1="0"
                  y1={y(b.from)}
                  x2={W}
                  y2={y(b.from)}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={W - 4}
                  y={y(b.from) - 4}
                  textAnchor="end"
                  fill="var(--color-faint)"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em' }}
                >
                  {b.from.toFixed(2)} {b.label}
                </text>
              </g>
            ))}

            {/* the stream */}
            <polyline
              points={stream.map((p) => `${x(p.i)},${y(p.score)}`).join(' ')}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="1"
            />
            {stream.map((p) => {
              const over = p.score >= threshold;
              return (
                <circle
                  key={p.i}
                  cx={x(p.i)}
                  cy={y(p.score)}
                  r={over ? 2.6 : 1.6}
                  fill={over ? bandFor(p.score).tone : 'var(--color-faint)'}
                />
              );
            })}

            {/* attack windows */}
            {[
              [27, 37],
              [63, 69],
            ].map(([a, b]) => (
              <g key={a}>
                <rect
                  x={x(a)}
                  y="0"
                  width={x(b) - x(a)}
                  height={H}
                  fill="var(--color-warn)"
                  opacity="0.07"
                />
                <text
                  x={(x(a) + x(b)) / 2}
                  y="12"
                  textAnchor="middle"
                  fill="var(--color-warn)"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.14em' }}
                >
                  ATTACK
                </text>
              </g>
            ))}

            {/* the operator's threshold */}
            <line
              x1="0"
              y1={y(threshold)}
              x2={W}
              y2={y(threshold)}
              stroke="var(--color-accent)"
              strokeWidth="1.4"
            />
            <text
              x="4"
              y={y(threshold) - 5}
              fill="var(--color-accent)"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em' }}
            >
              τ = {threshold.toFixed(2)}
            </text>
          </svg>
        </div>

        {/* ── threshold control ────────────────────────────────────── */}
        <div className="mt-8">
          <label className="label-tech mb-3 block" htmlFor="drift-threshold">
            Detection threshold
          </label>
          <input
            id="drift-threshold"
            type="range"
            min="0.15"
            max="0.85"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[0.4, 0.45, 0.6].map((t) => (
              <button
                key={t}
                onClick={() => setThreshold(t)}
                className={`label-tech-sm border px-2.5 py-1.5 transition-colors ${
                  Math.abs(threshold - t) < 0.005
                    ? 'border-accent bg-accent text-page'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                {t.toFixed(2)}
              </button>
            ))}
            <span className="label-tech-sm self-center normal-case">
              0.45 is the deployed value
            </span>
          </div>
        </div>

        {/* ── what this threshold does to the stream ───────────────── */}
        <div className="mt-8 grid grid-cols-3 border-t border-l border-line [&>*]:border-r [&>*]:border-b [&>*]:border-line">
          {[
            { k: 'Alerts raised', v: alerted.length, tone: 'text-ink' },
            {
              k: 'Attacks missed',
              v: missed.length,
              tone: missed.length > 0 ? 'text-warn' : 'text-ok',
            },
            { k: 'False alarms', v: falseAlarms.length, tone: 'text-muted' },
          ].map((s) => (
            <div key={s.k} className="p-4">
              <p className={`mono text-[1.5rem] leading-none ${s.tone}`}>{s.v}</p>
              <p className="label-tech-sm mt-2">{s.k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── measured results ───────────────────────────────────────── */}
      <aside className="space-y-8">
        <div className="border border-line p-5">
          <p className="label-tech mb-4 text-accent">Confusion matrix — measured</p>
          <table className="mono w-full text-[0.75rem]">
            <thead>
              <tr>
                <th />
                <th className="label-tech-sm pb-2 text-right">Pred. normal</th>
                <th className="label-tech-sm pb-2 text-right">Pred. attack</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <th className="label-tech-sm py-2.5 text-left">Normal</th>
                <td className="py-2.5 text-right tabular-nums text-ok">
                  {CONFUSION.trueNegative.toLocaleString()}
                </td>
                <td className="py-2.5 text-right tabular-nums text-muted">
                  {CONFUSION.falsePositive.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t border-line">
                <th className="label-tech-sm py-2.5 text-left">Attack</th>
                <td className="py-2.5 text-right text-[1rem] tabular-nums text-accent">
                  {CONFUSION.falseNegative}
                </td>
                <td className="py-2.5 text-right tabular-nums text-ok">
                  {CONFUSION.truePositive.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="label-tech-sm mt-4 normal-case">
            A literal zero in the false-negative cell — 2,514 attacks, none missed.
          </p>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-4 text-accent">Temporal stability</p>
          <table className="mono w-full text-[0.75rem]">
            <tbody>
              {PHASES.map((p) => (
                <tr key={p.phase} className="border-b border-line last:border-0">
                  <th className="label-tech-sm py-2 text-left">{p.phase}</th>
                  <td className="py-2 text-right tabular-nums text-muted">{p.accuracy}</td>
                  <td className="py-2 text-right tabular-nums text-accent">{p.recall}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="label-tech-sm mt-4 normal-case">
            Overall accuracy drifts across phases. Recall does not move.
          </p>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-3 text-accent">Why 0.45</p>
          <ul className="mb-4 space-y-1.5">
            {STRATEGIES.map((s) => (
              <li key={s} className="mono flex items-center gap-2.5 text-[0.75rem] text-muted">
                <span className="text-accent">→</span> {s}
              </li>
            ))}
          </ul>
          <p className="text-[0.8125rem] leading-relaxed text-muted">
            Five optimisation strategies with different loss assumptions all converged on the
            same value. When that happens, the threshold is a property of the data rather than
            of the method.
          </p>
        </div>
      </aside>
    </div>
  );
}
