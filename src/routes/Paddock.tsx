import { Link } from 'react-router-dom';
import { profile } from '@/data/site';
import { byTier, projects } from '@/data/projects';
import { research } from '@/data/research';
import K01 from '@/components/K01';
import { Container, HairlineGrid, SectionHeader } from '@/components/ui';

function DriverStatus() {
  const rows = [
    { k: 'Season', v: profile.season },
    { k: 'Team', v: profile.team },
    { k: 'Specialization', v: profile.specialization },
  ];

  return (
    <div className="w-full lg:max-w-[16rem]">
      <p className="label-tech mb-5 text-accent">Driver Status</p>
      <dl>
        {rows.map((r) => (
          <div key={r.k} className="border-b border-line py-3">
            <dt className="label-tech-sm mb-1.5">{r.k}</dt>
            <dd className="mono text-[0.8125rem]">{r.v}</dd>
          </div>
        ))}
        <div className="border-b border-line py-3">
          <dt className="label-tech-sm mb-1.5">Current development</dt>
          <dd className="mono text-[0.8125rem] leading-relaxed">
            {profile.currentDevelopment.join(' · ')}
          </dd>
        </div>
        <div className="py-3">
          <dt className="label-tech-sm mb-2">Status</dt>
          <dd className="mono flex items-center gap-2.5 text-[0.8125rem] text-ok">
            <span className="status-dot" /> ACTIVE
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function Paddock() {
  const featured = byTier('featured');
  const published = research.filter((r) => r.venueStatus === 'published').length;

  return (
    <>
      {/* ═══════════════ COMMAND CENTRE ═══════════════ */}
      <section className="grid-field border-b border-line">
        <Container className="py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,13rem)] lg:gap-8 xl:gap-12">
            {/* left — identity */}
            <div className="flex flex-col justify-center">
              <h1 className="font-display text-[clamp(3.25rem,8vw,5.5rem)] leading-[0.86] tracking-[0.01em] uppercase">
                Kaushal
                <span className="flex items-center gap-4">
                  S
                  <span aria-hidden className="h-px flex-1 bg-line-strong" />
                </span>
              </h1>

              <ul className="mt-7 flex flex-wrap gap-x-4 gap-y-1 lg:block lg:space-y-0.5">
                {profile.disciplines.map((d) => (
                  <li
                    key={d}
                    className="font-display text-[1.375rem] leading-tight tracking-wide text-muted"
                  >
                    {d}
                  </li>
                ))}
              </ul>

              <p className="body-lead mt-7 max-w-sm">{profile.statement}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/garage" className="btn btn-solid">
                  Enter Garage →
                </Link>
                <Link to="/engineering" className="btn">
                  View Engineering →
                </Link>
              </div>
            </div>

            {/* centre — the car */}
            <div className="flex items-center justify-center">
              <K01 />
            </div>

            {/* right — status */}
            <div className="flex justify-start lg:justify-end">
              <DriverStatus />
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════ SEASON SUMMARY ═══════════════ */}
      <section className="border-b border-line">
        <Container>
          <HairlineGrid className="grid-cols-2 md:grid-cols-4">
            {[
              { v: String(projects.length), k: 'Systems in the garage' },
              { v: String(research.length), k: 'Research entries' },
              { v: String(published), k: 'IEEE published' },
              { v: profile.season, k: 'Current season' },
            ].map((s) => (
              <div key={s.k} className="px-4 py-8 md:py-10">
                <p className="font-display text-[2.75rem] leading-none text-accent md:text-[3.5rem]">
                  {s.v}
                </p>
                <p className="label-tech-sm mt-3">{s.k}</p>
              </div>
            ))}
          </HairlineGrid>
        </Container>
      </section>

      {/* ═══════════════ FEATURED DEVELOPMENT ═══════════════ */}
      <section className="border-b border-line py-14 md:py-20">
        <Container>
          <SectionHeader
            index="01 // FEATURED DEVELOPMENT"
            title="The work the season is built on"
            action={
              <Link to="/garage" className="link-tech">
                All systems →
              </Link>
            }
          />

          <HairlineGrid className="md:grid-cols-2">
            {featured.map((p) => (
              <Link
                key={p.id}
                to={`/garage/${p.id}`}
                className="group flex flex-col justify-between gap-8 p-6 transition-colors hover:bg-surface md:p-8"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="label-tech text-accent">{p.code}</span>
                    <span className="label-tech-sm">{p.year}</span>
                  </div>
                  <h3 className="display-sm transition-colors group-hover:text-accent">
                    {p.name}
                  </h3>
                  <p className="label-tech mt-2.5 normal-case">{p.subtitle}</p>
                  <p className="mt-5 max-w-md text-[0.875rem] leading-relaxed text-muted">
                    {p.blurb}
                  </p>
                </div>

                <div>
                  {p.metrics.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
                      {p.metrics.slice(0, 2).map((m) => (
                        <div key={m.label}>
                          <p className="mono text-[1.125rem] leading-none text-accent">
                            {m.value}
                          </p>
                          <p className="label-tech-sm mt-1.5">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.slice(0, 4).map((t) => (
                      <span key={t} className="label-tech-sm border border-line px-2 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </HairlineGrid>
        </Container>
      </section>

      {/* ═══════════════ THE PROGRESSION ═══════════════ */}
      <section className="py-14 md:py-20">
        <Container>
          <SectionHeader
            index="02 // TRAJECTORY"
            title="How the work got here"
            caption="Each round built the capability the next one needed"
            action={
              <Link to="/archive" className="link-tech">
                Race archive →
              </Link>
            }
          />

          <ol className="flex flex-wrap items-center gap-x-3 gap-y-4">
            {[
              'Builder',
              'AI / ML',
              'Robotics',
              'Edge Systems',
              'Security',
              'Product',
              'Research',
            ].map((step, i, arr) => (
              <li key={step} className="flex items-center gap-3">
                <span className="font-display text-[1.5rem] leading-none tracking-wide md:text-[2rem]">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span aria-hidden className="text-accent">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          <p className="body-lead mt-10 max-w-2xl">
            The breadth is the point. Retrieval systems that abstain, robots that walk on one
            microcontroller, detectors that watch the operating system instead of the payload —
            different domains, one habit: find the assumption the field takes for granted, and
            check whether it holds.
          </p>
        </Container>
      </section>
    </>
  );
}
