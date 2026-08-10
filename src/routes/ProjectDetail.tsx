import { Link, Navigate, useParams } from 'react-router-dom';
import { disciplineLabels, projectById, projects } from '@/data/projects';
import { researchById } from '@/data/research';
import { challenges } from '@/data/research';
import {
  Container,
  ExternalLink,
  HairlineGrid,
  MetricGrid,
  SectionHeader,
  SpecSheet,
  StatusPill,
} from '@/components/ui';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = id ? projectById(id) : undefined;

  if (!project) return <Navigate to="/garage" replace />;

  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects[(index + 1) % projects.length];
  const paper = researchById(project.id);
  const relatedChallenges = challenges.filter((c) => c.projectId === project.id);

  const platform: { label: string; available: boolean }[] = [
    project.links.demo ? { label: 'Live demo', available: true } : null,
    project.links.repo
      ? { label: 'Public source', available: !project.links.repoPrivate }
      : null,
    project.links.paper ? { label: 'Published paper', available: true } : null,
  ].filter((v): v is { label: string; available: boolean } => v !== null);

  return (
    <>
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="border-b border-line py-12 md:py-16">
        <Container>
          <Link to="/garage" className="link-tech">
            ← Garage
          </Link>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-4">
                <span className="label-tech text-accent">{project.code}</span>
                <StatusPill status={project.status} />
                <span className="label-tech-sm">{disciplineLabels[project.discipline]}</span>
              </div>
              <h1 className="display-lg">{project.name}</h1>
              <p className="body-lead mt-5 max-w-2xl">{project.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {project.links.paper && (
                <a
                  href={project.links.paper}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-solid"
                >
                  Read paper ↗
                </a>
              )}
              {project.links.repo &&
                (project.links.repoPrivate ? (
                  <span className="btn cursor-not-allowed opacity-50" aria-disabled="true">
                    Source — private
                  </span>
                ) : (
                  <a
                    href={project.links.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn"
                  >
                    Source ↗
                  </a>
                ))}
            </div>
          </div>
        </Container>
      </header>

      {/* ═══════════════ IMAGES ═══════════════ */}
      {project.images && project.images.length > 0 && (
        <section className="border-b border-line py-12 md:py-16">
          <Container>
            <HairlineGrid className={project.images.length > 1 ? "md:grid-cols-2" : ""}>
              {project.images.map((img) => (
                <figure key={img.src} className="p-5 md:p-6">
                  <img
                    src={`${import.meta.env.BASE_URL}${img.src}`}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full border border-line object-contain"
                  />
                  <figcaption className="label-tech-sm mt-4 normal-case">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </HairlineGrid>
          </Container>
        </section>
      )}

      {/* ═══════════════ MEASURED RESULTS ═══════════════ */}
      {project.metrics.length > 0 && (
        <section className="border-b border-line py-12 md:py-16">
          <Container>
            <SectionHeader
              index="MEASURED RESULTS"
              title="Performance sheet"
              caption="Published figures — no estimates"
            />
            <MetricGrid metrics={project.metrics} />
          </Container>
        </section>
      )}

      {/* ═══════════════ SPECIFICATION ═══════════════ */}
      <section className="border-b border-line py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              <SectionHeader index="SPECIFICATION" title="Technical sheet" />
              <SpecSheet specs={project.specs} />
            </div>

            <div className="space-y-10">
              <div>
                <p className="label-tech mb-4 text-accent">Power Unit</p>
                <ul className="space-y-2">
                  {project.stack.map((t) => (
                    <li key={t} className="mono border-b border-line py-2 text-[0.8125rem]">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {platform.length > 0 && (
                <div>
                  <p className="label-tech mb-4 text-accent">Availability</p>
                  <ul className="space-y-2">
                    {platform.map((p) => (
                      <li
                        key={p.label}
                        className="mono flex items-center gap-2.5 border-b border-line py-2 text-[0.8125rem]"
                      >
                        <span className={p.available ? 'text-ok' : 'text-faint'}>
                          {p.available ? '✓' : '—'}
                        </span>
                        <span className={p.available ? '' : 'text-muted'}>{p.label}</span>
                        {!p.available && (
                          <span className="label-tech-sm ml-auto">REPO PRIVATE</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════ ENGINEERING REPORT ═══════════════ */}
      {project.report.length > 0 && (
        <section className="border-b border-line py-12 md:py-16">
          <Container>
            <SectionHeader
              index="ENGINEERING REPORT"
              title="How it was built"
              caption="Problem · architecture · implementation · result"
            />
            <div className="max-w-3xl">
              {project.report.map((section, i) => (
                <article key={section.heading} className="border-b border-line py-7 last:border-0">
                  <div className="flex gap-6">
                    <span className="label-tech-sm shrink-0 pt-1.5 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.5rem] leading-none tracking-wide text-accent">
                        {section.heading}
                      </h3>
                      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/85">
                        {section.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ═══════════════ CROSS-LINKS ═══════════════ */}
      {(paper || relatedChallenges.length > 0) && (
        <section className="border-b border-line py-12 md:py-16">
          <Container>
            <SectionHeader index="RELATED" title="Elsewhere on this site" />
            <HairlineGrid className="md:grid-cols-2">
              {paper && (
                <Link
                  to={`/research#${paper.id}`}
                  className="group p-6 transition-colors hover:bg-surface md:p-7"
                >
                  <p className="label-tech text-accent">{paper.ref} · Research Archive</p>
                  <p className="mt-3 font-display text-[1.375rem] leading-tight tracking-wide transition-colors group-hover:text-accent">
                    {paper.shortTitle}
                  </p>
                  <p className="label-tech-sm mt-2.5 normal-case">{paper.venue}</p>
                </Link>
              )}
              {relatedChallenges.map((c) => (
                <Link
                  key={c.ref}
                  to={`/championship#challenge-${c.ref}`}
                  className="group p-6 transition-colors hover:bg-surface md:p-7"
                >
                  <p className="label-tech text-accent">Challenge {c.ref}</p>
                  <p className="mt-3 font-display text-[1.375rem] leading-tight tracking-wide transition-colors group-hover:text-accent">
                    {c.title}
                  </p>
                  <p className="label-tech-sm mt-2.5 normal-case">Problem → attempt → solution</p>
                </Link>
              ))}
            </HairlineGrid>
          </Container>
        </section>
      )}

      {/* ═══════════════ NEXT BAY ═══════════════ */}
      <section className="py-12">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {project.links.repo && !project.links.repoPrivate && (
                <ExternalLink href={project.links.repo}>Repository</ExternalLink>
              )}
              {project.links.paper && <ExternalLink href={project.links.paper}>IEEE Xplore</ExternalLink>}
            </div>
            <Link to={`/garage/${next.id}`} className="group text-right">
              <p className="label-tech">Next bay</p>
              <p className="mt-2 font-display text-[1.75rem] leading-none tracking-wide transition-colors group-hover:text-accent">
                {next.code} · {next.name} →
              </p>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
