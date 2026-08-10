import { useMemo, useState } from 'react';

/**
 * SEC-RAG · LAYER 1 — contradiction-aware content verification.
 *
 * The formula, the threshold and the separation argument are the
 * implementation's:
 *
 *   C(i,j) = max over sentence pairs of P_contradiction(premise=s_j, hyp=s_i)
 *   M(i)   = (1/(k-1)) · Σ_{j≠i} C(i,j)      contradiction mass
 *   T(i)   = 1 - M(i)                         trust score
 *   flag   = M(i) ≥ τ₁                        τ₁ = 0.5
 *
 * The individual C(i,j) entries here are illustrative — running real pairwise
 * NLI in a browser is not the point. What the lab shows is the mechanism: with
 * one poison among k documents the poison contradicts all k−1 peers, while each
 * honest document contradicts only 1 of k−1. That asymmetry is what separates
 * them without a labelled per-corpus threshold.
 */

const TAU_1 = 0.5;

/** The poisoned document is the example given in the project's own README. */
const DOCS = [
  { id: 0, text: 'The Eiffel Tower is located in Paris, on the Champ de Mars.' },
  { id: 1, text: "Gustave Eiffel's tower has stood in Paris since 1889." },
  { id: 2, text: 'The Eiffel Tower stands in Rome, Italy, near the Tiber river.' },
  { id: 3, text: 'Visitors reach the Eiffel Tower from the Trocadéro in Paris.' },
  { id: 4, text: "The tower on the Champ de Mars is Paris's most visited monument." },
];

const C_POISON = 0.86; // poison ↔ honest
const C_HONEST = 0.04; // honest ↔ honest

export default function ContradictionLab() {
  const [poison, setPoison] = useState<number | null>(2);
  const [inspect, setInspect] = useState(2);
  const k = DOCS.length;

  const { matrix, mass, trust } = useMemo(() => {
    const m: number[][] = DOCS.map((_, i) =>
      DOCS.map((_, j) => {
        if (i === j) return 0;
        return poison !== null && (i === poison || j === poison) ? C_POISON : C_HONEST;
      }),
    );
    const mass = m.map((row) => row.reduce((a, b) => a + b, 0) / (k - 1));
    return { matrix: m, mass, trust: mass.map((v) => 1 - v) };
  }, [poison, k]);

  const kept = DOCS.filter((_, i) => mass[i] < TAU_1);

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:gap-14">
      <div>
        {/* ── controls ─────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="label-tech mr-2">Poison</span>
          <button
            onClick={() => setPoison(null)}
            className={`label-tech-sm border px-2.5 py-1.5 transition-colors ${
              poison === null
                ? 'border-accent bg-accent text-page'
                : 'border-line text-muted hover:text-ink'
            }`}
          >
            None
          </button>
          {DOCS.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setPoison(d.id);
                setInspect(d.id);
              }}
              className={`label-tech-sm border px-2.5 py-1.5 transition-colors ${
                poison === d.id
                  ? 'border-warn bg-warn text-page'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              d{d.id + 1}
            </button>
          ))}
        </div>

        <p className="label-tech mb-4">
          Query — <span className="normal-case text-muted">“Where does the Eiffel Tower stand?”</span>
        </p>

        {/* ── retrieved set ────────────────────────────────────────── */}
        <ul className="mb-10">
          {DOCS.map((d, i) => {
            const flagged = mass[i] >= TAU_1;
            return (
              <li key={d.id}>
                <button
                  onClick={() => setInspect(d.id)}
                  aria-pressed={inspect === d.id}
                  className={`flex w-full items-start gap-4 border-b border-line py-3.5 text-left transition-colors ${
                    inspect === d.id ? 'bg-surface' : 'hover:bg-surface/60'
                  }`}
                >
                  <span
                    className={`label-tech-sm shrink-0 pt-0.5 ${
                      flagged ? 'text-warn' : 'text-faint'
                    }`}
                  >
                    d{i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.8125rem] leading-relaxed text-ink/85">
                    {d.text}
                  </span>
                  <span className="mono shrink-0 text-right text-[0.75rem]">
                    <span className={flagged ? 'text-warn' : 'text-ok'}>
                      T={trust[i].toFixed(2)}
                    </span>
                    <span className="label-tech-sm ml-3">
                      {flagged ? 'DROPPED' : 'KEPT'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ── consensus graph as a matrix ──────────────────────────── */}
        <p className="label-tech mb-4">
          Consensus graph — C(i,j), pairwise contradiction
        </p>
        <div className="overflow-x-auto">
          <table className="mono border-collapse text-[0.6875rem]">
            <thead>
              <tr>
                <th className="label-tech-sm w-10 p-2 text-left" />
                {DOCS.map((d) => (
                  <th key={d.id} className="label-tech-sm w-14 p-2 text-center">
                    d{d.id + 1}
                  </th>
                ))}
                <th className="label-tech-sm w-16 p-2 text-center text-accent">M(i)</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr
                  key={i}
                  className={inspect === i ? 'bg-surface' : ''}
                  onMouseEnter={() => setInspect(i)}
                >
                  <th className="label-tech-sm p-2 text-left">d{i + 1}</th>
                  {row.map((c, j) => (
                    <td
                      key={j}
                      className="border border-line p-2 text-center tabular-nums"
                      style={{
                        background:
                          i === j
                            ? 'transparent'
                            : `rgba(194,65,12,${(c * 0.5).toFixed(3)})`,
                        color: i === j ? 'var(--color-faint)' : 'var(--color-ink)',
                      }}
                    >
                      {i === j ? '—' : c.toFixed(2)}
                    </td>
                  ))}
                  <td
                    className={`border border-line p-2 text-center font-semibold tabular-nums ${
                      mass[i] >= TAU_1 ? 'text-warn' : 'text-ok'
                    }`}
                  >
                    {mass[i].toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="label-tech-sm mt-4 normal-case">
          C(i,j) values are illustrative. The formula, the τ₁ = 0.5 threshold and the
          asymmetry they exploit are the implementation's.
        </p>
      </div>

      {/* ── readout ────────────────────────────────────────────────── */}
      <aside className="space-y-8">
        <div className="border border-line p-5">
          <p className="label-tech mb-4 text-accent">Inspecting d{inspect + 1}</p>
          <dl className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-tech-sm">Contradiction mass M</dt>
              <dd className="mono text-[1.125rem] text-ink">{mass[inspect].toFixed(3)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-tech-sm">Trust T = 1 − M</dt>
              <dd className="mono text-[1.125rem] text-accent">{trust[inspect].toFixed(3)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-tech-sm">Threshold τ₁</dt>
              <dd className="mono text-[1.125rem] text-muted">{TAU_1.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-line pt-4">
            <p
              className={`mono text-[0.875rem] ${
                mass[inspect] >= TAU_1 ? 'text-warn' : 'text-ok'
              }`}
            >
              {mass[inspect] >= TAU_1
                ? 'FLAGGED — M ≥ τ₁, dropped by the constructor'
                : 'CLEAN — M < τ₁, kept and weighted'}
            </p>
          </div>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-4 text-accent">Secure Context Constructor</p>
          <p className="mono text-[0.8125rem] leading-relaxed">
            {kept.length} of {k} documents kept
          </p>
          <div className="mt-3 flex gap-1">
            {DOCS.map((d, i) => (
              <span
                key={d.id}
                className={`h-8 flex-1 border ${
                  mass[i] >= TAU_1 ? 'border-warn/50 bg-warn/20' : 'border-ok/40 bg-ok/15'
                }`}
                title={`d${i + 1} — ${mass[i] >= TAU_1 ? 'dropped' : 'kept'}`}
              />
            ))}
          </div>
          <p className="label-tech-sm mt-4 normal-case">
            {kept.length === 0
              ? 'Kept set empty — the system refuses rather than answering from unverified context.'
              : 'Surviving documents are weighted by trust before reaching the model.'}
          </p>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-3 text-accent">Why this layer exists</p>
          <p className="text-[0.8125rem] leading-relaxed text-muted">
            A misinformation document carries a false claim and no directive. Layer 2 — the
            instruction detector — is structurally unable to see it, and scores exactly{' '}
            <span className="mono text-ink">0.0%</span> recall and{' '}
            <span className="mono text-ink">AUC 0.524</span> on this category. Layer 1 is the
            only layer that covers it.
          </p>
        </div>
      </aside>
    </div>
  );
}
