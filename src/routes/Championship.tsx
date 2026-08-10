import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { challenges, research } from '@/data/research';
import { profile } from '@/data/site';
import { Container, HairlineGrid, PageHeader, SectionHeader } from '@/components/ui';

const STAGES = [
  { key: 'problem', label: 'Problem' },
  { key: 'attempt', label: 'Attempt' },
  { key: 'failure', label: 'Failure', tone: 'text-warn' },
  { key: 'solution', label: 'Solution' },
  { key: 'result', label: 'Result', tone: 'text-accent' },
] as const;

export default function Championship() {
  const { hash } = useLocation();
  const [open, setOpen] = useState(challenges[0].ref);

  useEffect(() => {
    const match = hash.match(/challenge-(\d+)/);
    if (!match) return;
    const ref = match[1];
    if (challenges.some((c) => c.ref === ref)) {
      setOpen(ref);
      requestAnimationFrame(() =>
        document.getElementById(`challenge-${ref}`)?.scrollIntoView({ block: 'start' }),
      );
    }
  }, [hash]);

  const published = research.filter((r) => r.venueStatus === 'published');
  const submitted = research.filter((r) => r.venueStatus === 'submitted');

  return (
    <>
      <PageHeader
        code="CHAMPIONSHIP"
        title="Engineering Challenges"
        lede="Five problems that did not go the first way. Each one is a documented pivot — what was tried, why it failed, and what replaced it. The failures are the part worth reading."
        meta={
          <dl className="flex gap-8 lg:justify-end">
            <div>
              <dt className="label-tech-sm mb-2">Challenges</dt>
              <dd className="mono text-[1.5rem] leading-none text-accent">{challenges.length}</dd>
            </div>
          </dl>
        }
      />

      {/* ═══════════════ CHALLENGES ═══════════════ */}
      <section className="border-b border-line py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
            {/* index */}
            <nav aria-label="Challenges" className="lg:sticky lg:top-24 lg:self-start">
              <ul>
                {challenges.map((c) => (
                  <li key={c.ref}>
                    <button
                      onClick={() => setOpen(c.ref)}
                      aria-current={open === c.ref}
                      className={`flex w-full items-baseline gap-4 border-b border-line py-4 text-left transition-colors ${
                        open === c.ref ? 'text-accent' : 'text-muted hover:text-ink'
                      }`}
                    >
                      <span className="label-tech-sm shrink-0">{c.ref}</span>
                      <span className="min-w-0 flex-1 text-[0.8125rem] leading-snug">
                        {c.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* detail */}
            {challenges
              .filter((c) => c.ref === open)
              .map((c) => (
                <article key={c.ref} id={`challenge-${c.ref}`} className="scroll-mt-24">
                  <p className="label-tech mb-4 text-accent">
                    Challenge {c.ref} ·{' '}
                    <Link to={`/garage/${c.projectId}`} className="hover:underline">
                      {c.project} →
                    </Link>
                  </p>
                  <h2 className="display-md">{c.title}</h2>

                  <ol className="mt-10">
                    {STAGES.map((stage, i) => (
                      <li key={stage.key} className="flex gap-6 border-b border-line py-6 last:border-0">
                        <span className="label-tech-sm shrink-0 pt-1 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className={`font-display text-[1.375rem] leading-none tracking-wide ${
                              'tone' in stage ? stage.tone : 'text-ink'
                            }`}
                          >
                            {stage.label}
                          </h3>
                          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink/85">
                            {c[stage.key]}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════ ACHIEVEMENTS ═══════════════ */}
      <section className="border-b border-line py-12 md:py-16">
        <Container>
          <SectionHeader index="ACHIEVEMENTS" title="On the record" />
          <HairlineGrid className="md:grid-cols-2 xl:grid-cols-3">
            <div className="p-6">
              <p className="label-tech mb-3 text-accent">IEEE Publication</p>
              <p className="font-display text-[1.375rem] leading-tight tracking-wide">
                AntBot — Accessible Hexapod Platform
              </p>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
                Design and experimental validation, published by IEEE.
              </p>
              <a
                href={research[0].links.paper}
                target="_blank"
                rel="noreferrer noopener"
                className="link-tech mt-4 inline-block"
              >
                IEEE Xplore ↗
              </a>
            </div>

            <div className="p-6">
              <p className="label-tech mb-3 text-accent">Conference submission</p>
              <p className="font-display text-[1.375rem] leading-tight tracking-wide">
                BDA 2026 — BITS Pilani Goa
              </p>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
                SciRAG-UQ submitted to the 14th International Big Data & AI Conference,
                17–20 September 2026.
              </p>
              <Link to="/research#scirag-uq" className="link-tech mt-4 inline-block">
                Read the record →
              </Link>
            </div>

            <div className="p-6">
              <p className="label-tech mb-3 text-accent">Certifications</p>
              <ul className="mt-1 space-y-2.5">
                {profile.certifications.map((c) => (
                  <li key={c} className="mono border-b border-line pb-2.5 text-[0.8125rem]">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </HairlineGrid>
        </Container>
      </section>

      {/* ═══════════════ PIT CREW ═══════════════ */}
      <section className="py-12 md:py-16">
        <Container>
          <SectionHeader
            index="OPEN SOURCE // PIT CREW"
            title="Work on other people's machines"
            action={
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="link-tech"
              >
                GitHub ↗
              </a>
            }
          />

          <div className="max-w-2xl">
            <p className="body-lead">
              This section is deliberately empty of merged pull requests, because there are
              none to show yet. The public account carries forks of{' '}
              <span className="text-ink">atomic-red-team</span>,{' '}
              <span className="text-ink">LOLBAS</span>,{' '}
              <span className="text-ink">cti</span> and{' '}
              <span className="text-ink">Vulkan-Loader</span> — used as references while
              building the security work, not contributed back to.
            </p>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-muted">
              Listing them as contributions would be the easiest thing on this site to
              overstate, so it says what is actually true. When there are merged PRs, they
              will appear here with their repository, the change, and the merge state.
            </p>
          </div>

          <div className="mt-10 grid gap-px sm:grid-cols-3">
            {[
              { k: 'Public repositories', v: '17' },
              { k: 'Published papers', v: String(published.length) },
              { k: 'Under submission', v: String(submitted.length) },
            ].map((s) => (
              <div key={s.k} className="border-t border-line pt-5">
                <p className="mono text-[1.75rem] leading-none text-accent">{s.v}</p>
                <p className="label-tech-sm mt-2.5">{s.k}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
