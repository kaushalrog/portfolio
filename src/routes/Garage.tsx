import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { byTier, disciplineLabels, projects, tierLabels } from '@/data/projects';
import { carComponents } from '@/data/site';
import type { Project, Tier } from '@/data/types';
import { Container, HairlineGrid, PageHeader, SectionHeader, StatusPill } from '@/components/ui';

const TIER_ORDER: Tier[] = ['featured', 'engineering', 'experiment', 'build'];

function Bay({ project, large }: { project: Project; large?: boolean }) {
  return (
    <Link
      to={`/garage/${project.id}`}
      className="group flex flex-col gap-6 p-6 transition-colors hover:bg-surface md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="label-tech text-accent">{project.code}</span>
          <h3
            className={`mt-3 transition-colors group-hover:text-accent ${
              large ? 'display-sm' : 'display-flat'
            }`}
          >
            {project.name}
          </h3>
          <p className="label-tech mt-2 normal-case">{project.subtitle}</p>
        </div>
        <StatusPill status={project.status} />
      </div>

      <p className="max-w-lg text-[0.875rem] leading-relaxed text-muted">{project.blurb}</p>

      {large && project.metrics.length > 0 && (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {project.metrics.slice(0, 3).map((m) => (
            <div key={m.label}>
              <p className="mono text-[1.125rem] leading-none text-accent">{m.value}</p>
              <p className="label-tech-sm mt-1.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="label-tech-sm">{disciplineLabels[project.discipline]}</span>
        <span className="label-tech-sm">{project.year}</span>
        <span className="label-tech-sm ml-auto text-muted transition-colors group-hover:text-accent">
          Open bay →
        </span>
      </div>
    </Link>
  );
}

export default function Garage() {
  const [params, setParams] = useSearchParams();
  const component = params.get('component');

  const filtered = useMemo(
    () => (component ? projects.filter((p) => p.component === component) : projects),
    [component],
  );

  const activeComponent = carComponents.find((c) => c.id === component);

  return (
    <>
      <PageHeader
        code="GARAGE"
        title="Engineering Database"
        lede="Fourteen systems, tiered by what they are actually for. Every specification and every number on these pages is transcribed from the project's own repository, paper, or published results."
        meta={
          <dl className="flex gap-8 lg:justify-end">
            <div>
              <dt className="label-tech-sm mb-2">Bays</dt>
              <dd className="mono text-[1.5rem] leading-none text-accent">{projects.length}</dd>
            </div>
            <div>
              <dt className="label-tech-sm mb-2">Season</dt>
              <dd className="mono text-[1.5rem] leading-none">2026</dd>
            </div>
          </dl>
        }
      />

      {/* component filter */}
      <div className="border-b border-line">
        <Container className="flex flex-wrap items-center gap-2 py-4">
          <span className="label-tech mr-2">Filter</span>
          <button
            onClick={() => setParams({})}
            className={`label-tech-sm border px-2.5 py-1.5 transition-colors ${
              !component ? 'border-accent bg-accent text-page' : 'border-line text-muted hover:text-ink'
            }`}
          >
            All
          </button>
          {carComponents
            .filter((c) => projects.some((p) => p.component === c.id))
            .map((c) => (
              <button
                key={c.id}
                onClick={() => setParams({ component: c.id })}
                className={`label-tech-sm border px-2.5 py-1.5 transition-colors ${
                  component === c.id
                    ? 'border-accent bg-accent text-page'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                {c.label}
              </button>
            ))}
        </Container>
      </div>

      {activeComponent && (
        <div className="border-b border-line bg-surface">
          <Container className="py-6">
            <p className="label-tech text-accent">{activeComponent.discipline}</p>
            <p className="body-lead mt-2 max-w-2xl">{activeComponent.description}</p>
          </Container>
        </div>
      )}

      <div className="py-14 md:py-20">
        <Container>
          {TIER_ORDER.map((tier) => {
            const list = (component ? filtered.filter((p) => p.tier === tier) : byTier(tier)).sort(
              (a, b) => a.code.localeCompare(b.code),
            );
            if (list.length === 0) return null;
            const isFeatured = tier === 'featured';

            return (
              <section key={tier} className="mb-16 last:mb-0">
                <SectionHeader
                  index={`${tierLabels[tier].label.toUpperCase()} · ${String(list.length).padStart(2, '0')}`}
                  title={tierLabels[tier].label}
                  caption={tierLabels[tier].caption}
                />
                <HairlineGrid
                  className={isFeatured ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}
                >
                  {list.map((p) => (
                    <Bay key={p.id} project={p} large={isFeatured} />
                  ))}
                </HairlineGrid>
              </section>
            );
          })}

          {filtered.length === 0 && (
            <p className="label-tech py-16 text-center">No systems in this component</p>
          )}
        </Container>
      </div>
    </>
  );
}
