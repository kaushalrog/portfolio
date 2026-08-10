import { useState } from 'react';

/**
 * SCIRAG-UQ · the abstention pipeline.
 *
 * The three signals, the stages they come from, the cascade and the published
 * results are the system's. The fusion weights are not published, so the lab
 * does not pretend to reproduce the composite score — it shows the pipeline and
 * lets the visitor see which stage each signal originates in, which is the
 * actual claim: the signals fail independently because they come from different
 * places.
 */

const STAGES = [
  {
    id: 'retrieve',
    label: 'Hybrid retrieval',
    detail: 'Dense HNSW + BM25, diversified with MMR',
    signal: 'Retrieval confidence',
    signalNote: 'Reads the corpus. Knows nothing about the decoder.',
  },
  {
    id: 'generate',
    label: 'Generation',
    detail: 'Llama 3.1 70B via Groq',
    signal: 'Generation entropy',
    signalNote: 'Reads the decoder. Knows nothing about the corpus.',
  },
  {
    id: 'consistency',
    label: 'Resampling',
    detail: 'Multiple samples compared',
    signal: 'Semantic consistency',
    signalNote: 'Reads agreement across samples. Independent of both.',
  },
] as const;

const RESULTS = [
  { label: 'Faithfulness', value: '0.847', note: '+6.8% vs Self-RAG' },
  { label: 'Hallucination rate', value: '0.209', note: '−38.7% vs vanilla RAG' },
  { label: 'Abstention precision', value: '0.912', note: 'right about not answering' },
  { label: 'Expected calibration error', value: '0.043', note: 'reported ≈ earned confidence' },
];

export default function AbstentionLab() {
  const [active, setActive] = useState<string>('retrieve');
  const stage = STAGES.find((s) => s.id === active)!;

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:gap-14">
      <div>
        <p className="label-tech mb-6">Pipeline — select a stage</p>

        <div className="overflow-x-auto">
          <svg viewBox="0 0 700 260" className="h-auto w-full min-w-[34rem]">
            {/* query */}
            <rect x="20" y="110" width="96" height="40" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.2" />
            <text x="68" y="134" textAnchor="middle" fill="var(--color-ink)" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em' }}>
              QUERY
            </text>

            {/* stages */}
            {STAGES.map((s, i) => {
              const x = 160 + i * 160;
              const on = active === s.id;
              return (
                <g
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => setActive(s.id)}
                  onMouseEnter={() => setActive(s.id)}
                >
                  <rect
                    x={x}
                    y="110"
                    width="120"
                    height="40"
                    fill={on ? 'rgba(200,255,0,0.10)' : 'rgba(255,255,255,0.02)'}
                    stroke={on ? 'var(--color-accent)' : 'var(--color-line-strong)'}
                    strokeWidth="1.2"
                  />
                  <text
                    x={x + 60}
                    y="134"
                    textAnchor="middle"
                    fill={on ? 'var(--color-accent)' : 'var(--color-ink)'}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em' }}
                  >
                    {s.label.toUpperCase()}
                  </text>

                  {/* signal tap upward into the composite */}
                  <line
                    x1={x + 60}
                    y1="110"
                    x2={x + 60}
                    y2="62"
                    stroke={on ? 'var(--color-accent)' : 'var(--color-line)'}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx={x + 60} cy="62" r={on ? 3 : 2} fill={on ? 'var(--color-accent)' : 'var(--color-faint)'} />
                  <text
                    x={x + 60}
                    y="52"
                    textAnchor="middle"
                    fill={on ? 'var(--color-accent)' : 'var(--color-faint)'}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', letterSpacing: '0.14em' }}
                  >
                    {s.signal.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* flow arrows */}
            {[116, 280, 440, 600].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="130"
                x2={x + 44}
                y2="130"
                stroke="var(--color-line-strong)"
                strokeWidth="1"
                markerEnd="url(#uq-arrow)"
              />
            ))}
            <defs>
              <marker id="uq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--color-line-strong)" />
              </marker>
            </defs>

            {/* composite bus */}
            <line x1="220" y1="62" x2="500" y2="62" stroke="var(--color-line)" strokeWidth="1" />
            <line x1="500" y1="62" x2="560" y2="62" stroke="var(--color-line-strong)" strokeWidth="1" />
            <rect x="560" y="26" width="120" height="36" fill="rgba(200,255,0,0.06)" stroke="var(--color-accent)" strokeWidth="1.2" />
            <text x="620" y="48" textAnchor="middle" fill="var(--color-accent)" style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.1em' }}>
              COMPOSITE UQ
            </text>
            <line x1="620" y1="62" x2="620" y2="110" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3 3" />

            {/* cascade outcome */}
            <rect x="560" y="110" width="120" height="40" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.2" />
            <text x="620" y="134" textAnchor="middle" fill="var(--color-ink)" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em' }}>
              CASCADE
            </text>

            <line x1="600" y1="150" x2="560" y2="196" stroke="var(--color-line)" strokeWidth="1" />
            <line x1="640" y1="150" x2="672" y2="196" stroke="var(--color-line)" strokeWidth="1" />

            <text x="520" y="212" textAnchor="middle" fill="var(--color-ok)" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em' }}>
              ANSWER + BADGE
            </text>
            <text x="660" y="212" textAnchor="middle" fill="var(--color-warn)" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em' }}>
              ABSTAIN
            </text>
          </svg>
        </div>

        <div className="mt-8 border border-line p-5">
          <p className="label-tech text-accent">{stage.signal}</p>
          <p className="mono mt-3 text-[0.8125rem] text-muted">
            Origin — {stage.label}: {stage.detail}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/85">{stage.signalNote}</p>
        </div>

        <p className="label-tech-sm mt-6 normal-case">
          Fusion weights are not published, so this lab does not compute a composite score. The
          claim it illustrates is structural: three signals drawn from three different stages
          fail independently, which is what makes their combination informative rather than
          redundant.
        </p>
      </div>

      <aside className="space-y-8">
        <div className="border border-line p-5">
          <p className="label-tech mb-5 text-accent">Measured — BDA-Sci, 500 questions</p>
          <dl>
            {RESULTS.map((r) => (
              <div key={r.label} className="border-b border-line py-3 last:border-0">
                <dt className="label-tech-sm mb-1.5">{r.label}</dt>
                <dd className="mono text-[1.25rem] leading-none text-accent">{r.value}</dd>
                <p className="label-tech-sm mt-1.5 normal-case">{r.note}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-3 text-accent">The point of abstention</p>
          <p className="text-[0.8125rem] leading-relaxed text-muted">
            Standard RAG generates an answer regardless of whether the retrieved evidence
            supports one. On scientific literature that failure mode is expensive: a confident
            synthesis of thin evidence reads exactly like a confident synthesis of strong
            evidence.
          </p>
        </div>
      </aside>
    </div>
  );
}
