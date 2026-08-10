import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { research } from '@/data/research';
import { projectById } from '@/data/projects';
import type { ResearchEntry } from '@/data/types';
import { Container, MetricGrid, PageHeader } from '@/components/ui';

const STATUS_LABEL: Record<ResearchEntry['venueStatus'], string> = {
  published: 'PUBLISHED',
  submitted: 'SUBMITTED',
  'in-progress': 'IN PROGRESS',
};

const STATUS_TONE: Record<ResearchEntry['venueStatus'], string> = {
  published: 'text-accent border-accent/40',
  submitted: 'text-ok border-ok/40',
  'in-progress': 'text-muted border-line-strong',
};

/** The structured body of a research record — the fields research actually has. */
const FIELDS: { key: keyof ResearchEntry; label: string }[] = [
  { key: 'question', label: 'Research question' },
  { key: 'baseline', label: 'Baseline' },
  { key: 'method', label: 'Method' },
  { key: 'novelty', label: 'Novelty' },
  { key: 'experiment', label: 'Experiment' },
  { key: 'result', label: 'Result' },
];

function Entry({ entry, open, onToggle }: { entry: ResearchEntry; open: boolean; onToggle: () => void }) {
  const project = projectById(entry.id);

  return (
    <article id={entry.id} className="scroll-mt-20 border-b border-line">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-start gap-5 py-7 text-left md:gap-10"
      >
        <span className="label-tech shrink-0 pt-1.5 text-accent">{entry.ref}</span>

        <span className="min-w-0 flex-1">
          <span className="block font-display text-[1.75rem] leading-none tracking-wide transition-colors group-hover:text-accent md:text-[2.25rem]">
            {entry.shortTitle}
          </span>
          <span className="label-tech-sm mt-3 block normal-case">{entry.title}</span>
        </span>

        <span className="hidden shrink-0 flex-col items-end gap-2.5 pt-1 lg:flex">
          <span className={`label-tech-sm border px-2 py-1 ${STATUS_TONE[entry.venueStatus]}`}>
            {STATUS_LABEL[entry.venueStatus]}
          </span>
          <span className="label-tech-sm">{entry.year}</span>
        </span>

        <span
          aria-hidden
          className={`label-tech shrink-0 pt-1.5 transition-transform ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="grid gap-10 pb-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-3 lg:hidden">
              <span className={`label-tech-sm border px-2 py-1 ${STATUS_TONE[entry.venueStatus]}`}>
                {STATUS_LABEL[entry.venueStatus]}
              </span>
              <span className="label-tech-sm">{entry.year}</span>
            </div>

            <dl>
              {FIELDS.map((f) => (
                <div key={f.key} className="border-t border-line py-5 first:border-t-0 first:pt-0">
                  <dt className="label-tech mb-3 text-accent">{f.label}</dt>
                  <dd className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/85">
                    {entry[f.key] as string}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="space-y-8">
            <div>
              <p className="label-tech mb-3">Venue</p>
              <p className="mono text-[0.8125rem] leading-relaxed">{entry.venue}</p>
            </div>

            {entry.authors && (
              <div>
                <p className="label-tech mb-3">Authors</p>
                <p className="text-[0.8125rem] leading-relaxed text-muted">{entry.authors}</p>
              </div>
            )}

            {entry.metrics.length > 0 && (
              <div>
                <p className="label-tech mb-3">Results</p>
                <dl>
                  {entry.metrics.map((m) => (
                    <div key={m.label} className="border-b border-line py-2.5">
                      <dt className="label-tech-sm mb-1">{m.label}</dt>
                      <dd className="mono text-[0.9375rem] text-accent">
                        {m.value}
                        {m.note && (
                          <span className="label-tech-sm ml-2 normal-case">{m.note}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="flex flex-col items-start gap-3">
              {entry.links.paper && (
                <a
                  href={entry.links.paper}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-solid"
                >
                  Read paper ↗
                </a>
              )}
              {entry.links.code &&
                (entry.links.codePrivate ? (
                  <span className="label-tech-sm">Code — private repository</span>
                ) : (
                  <a
                    href={entry.links.code}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-tech"
                  >
                    Code ↗
                  </a>
                ))}
              {project && (
                <Link to={`/garage/${project.id}`} className="link-tech">
                  {project.code} · Engineering report →
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </article>
  );
}

export default function Research() {
  const { hash } = useLocation();
  const [open, setOpen] = useState<string | null>(research[0].id);

  // Deep links from the palette and project pages open the right record.
  useEffect(() => {
    const id = hash.replace('#', '');
    if (!id) return;
    if (research.some((r) => r.id === id)) {
      setOpen(id);
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ block: 'start' }),
      );
    }
  }, [hash]);

  const published = research.filter((r) => r.venueStatus === 'published');
  const submitted = research.filter((r) => r.venueStatus === 'submitted');

  const allMetrics = research.flatMap((r) => r.metrics).slice(0, 8);

  return (
    <>
      <PageHeader
        code="RESEARCH ARCHIVE"
        title="Restricted Engineering Archive"
        lede="Five records. Each one states the question it set out to answer, what it was measured against, and what came back — including where the interesting result was not the headline number."
        meta={
          <dl className="flex gap-8 lg:justify-end">
            <div>
              <dt className="label-tech-sm mb-2">Records</dt>
              <dd className="mono text-[1.5rem] leading-none text-accent">{research.length}</dd>
            </div>
            <div>
              <dt className="label-tech-sm mb-2">Published</dt>
              <dd className="mono text-[1.5rem] leading-none">{published.length}</dd>
            </div>
            <div>
              <dt className="label-tech-sm mb-2">Submitted</dt>
              <dd className="mono text-[1.5rem] leading-none">{submitted.length}</dd>
            </div>
          </dl>
        }
      />

      <section className="border-b border-line py-12">
        <Container>
          <p className="label-tech mb-6">Selected results across the archive</p>
          <MetricGrid metrics={allMetrics} />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          {research.map((entry) => (
            <Entry
              key={entry.id}
              entry={entry}
              open={open === entry.id}
              onToggle={() => setOpen(open === entry.id ? null : entry.id)}
            />
          ))}
        </Container>
      </section>
    </>
  );
}
