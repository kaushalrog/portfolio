import type { ReactNode } from 'react';
import type { Metric, Spec } from '@/data/types';

export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[112rem] px-5 md:px-10 ${className}`}>{children}</div>
  );
}

/** The standard page opener: reference code, huge title, one line of framing. */
export function PageHeader({
  code,
  title,
  lede,
  meta,
}: {
  code: string;
  title: string;
  lede?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-line py-14 md:py-20">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="label-tech mb-5 text-accent">{code}</p>
            <h1 className="display-lg">{title}</h1>
            {lede && <p className="body-lead mt-6 max-w-2xl">{lede}</p>}
          </div>
          {meta && <div className="shrink-0 lg:text-right">{meta}</div>}
        </div>
      </Container>
    </header>
  );
}

export function SectionHeader({
  index,
  title,
  caption,
  action,
}: {
  index?: string;
  title: string;
  caption?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        {index && <p className="label-tech mb-2.5 text-accent">{index}</p>}
        <h2 className="display-sm">{title}</h2>
        {caption && <p className="label-tech mt-2">{caption}</p>}
      </div>
      {action}
    </div>
  );
}

export function SpecSheet({ specs }: { specs: Spec[] }) {
  return (
    <dl className="w-full">
      {specs.map((s) => (
        <div key={s.key} className="spec-row">
          <dt className="spec-key">{s.key}</dt>
          <dd className="spec-val">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Hairline grid.
 *
 * Each cell draws its own right and bottom rule rather than the container
 * showing through gaps — so a partial final row leaves empty space, not a
 * stray filled block.
 */
export function HairlineGrid({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid border-t border-l border-line [&>*]:border-r [&>*]:border-b [&>*]:border-line ${className}`}
    >
      {children}
    </div>
  );
}

/** Measured results. Rendered nowhere when a project has none. */
export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <HairlineGrid className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="p-4 md:p-5">
          <p className="label-tech-sm mb-2.5">{m.label}</p>
          <p className="mono text-[1.375rem] leading-none text-accent md:text-[1.625rem]">
            {m.value}
          </p>
          {m.note && <p className="label-tech-sm mt-2.5 normal-case">{m.note}</p>}
        </div>
      ))}
    </HairlineGrid>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'published'
      ? 'text-accent border-accent/40'
      : status === 'active' || status === 'deployed'
        ? 'text-ok border-ok/40'
        : 'text-muted border-line-strong';
  return (
    <span className={`label-tech-sm border px-2 py-1 ${tone}`}>{status.toUpperCase()}</span>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="link-tech">
      {children} ↗
    </a>
  );
}

/** Faint numbered marker used down the left edge of long-form sections. */
export function Marker({ n }: { n: string }) {
  return <span className="label-tech-sm shrink-0 tabular-nums">{n}</span>;
}
