import { useState } from 'react';
import { timeline } from '@/data/site';
import { Container, PageHeader } from '@/components/ui';

export default function Archive() {
  const [open, setOpen] = useState(timeline.length - 1);

  return (
    <>
      <PageHeader
        code="RACE ARCHIVE"
        title="Development History"
        lede="Rounds are thematic rather than calendar quarters — each one is the period where a capability was actually built, and each fed the one after it."
        meta={
          <dl className="flex gap-8 lg:justify-end">
            <div>
              <dt className="label-tech-sm mb-2">Rounds</dt>
              <dd className="mono text-[1.5rem] leading-none text-accent">{timeline.length}</dd>
            </div>
          </dl>
        }
      />

      {/* round selector */}
      <div className="border-b border-line">
        <Container className="flex gap-1 overflow-x-auto py-3">
          {timeline.map((r, i) => (
            <button
              key={r.round}
              onClick={() => setOpen(i)}
              className={`label-tech shrink-0 border px-3 py-2 transition-colors ${
                open === i
                  ? 'border-accent bg-accent text-page'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              {r.round === 'CURRENT ROUND' ? 'CURRENT' : r.round.replace('ROUND ', 'R')} ·{' '}
              {r.label}
            </button>
          ))}
        </Container>
      </div>

      <section className="py-12 md:py-16">
        <Container>
          {timeline.map((round, i) => {
            const isOpen = open === i;
            return (
              <article
                key={round.round}
                className={`border-b border-line ${isOpen ? '' : 'opacity-60'}`}
              >
                <button
                  onClick={() => setOpen(i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-baseline gap-6 py-6 text-left md:gap-10"
                >
                  <span className="label-tech shrink-0 text-accent">{round.round}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block display-md transition-colors group-hover:text-accent">
                      {round.label}
                    </span>
                  </span>
                  <span className="label-tech-sm shrink-0">{round.period}</span>
                </button>

                {isOpen && (
                  <div className="pb-10">
                    <p className="body-lead mb-8 max-w-2xl">{round.summary}</p>

                    {/* horizontal timeline of entries */}
                    <div className="relative">
                      <span
                        aria-hidden
                        className="absolute top-[7px] right-0 left-0 h-px bg-line"
                      />
                      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {round.entries.map((entry) => (
                          <div key={entry.title} className="relative pt-6">
                            <span
                              aria-hidden
                              className="absolute top-1 left-0 h-3.5 w-3.5 border border-accent bg-page"
                            />
                            <h3 className="display-flat">
                              {entry.title}
                            </h3>
                            <p className="mt-3 max-w-md text-[0.875rem] leading-relaxed text-muted">
                              {entry.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </Container>
      </section>
    </>
  );
}
