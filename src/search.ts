import { projects } from '@/data/projects';
import { research, challenges } from '@/data/research';
import { skillGraph, profile } from '@/data/site';
import { navItems } from '@/nav';

export interface SearchEntry {
  id: string;
  title: string;
  subtitle: string;
  group: 'Navigate' | 'Projects' | 'Research' | 'Challenges' | 'Skills' | 'External';
  to?: string;
  href?: string;
  /** Lowercased haystack. Matching against a technology returns everything using it. */
  terms: string;
}

const norm = (s: string) => s.toLowerCase();

export const searchIndex: SearchEntry[] = [
  ...navItems.map((n) => ({
    id: `nav:${n.to}`,
    title: n.label,
    subtitle: n.loading,
    group: 'Navigate' as const,
    to: n.to,
    terms: norm(`${n.label} ${n.loading}`),
  })),

  ...projects.map((p) => ({
    id: `project:${p.id}`,
    title: `${p.code} · ${p.name}`,
    subtitle: p.subtitle,
    group: 'Projects' as const,
    to: `/garage/${p.id}`,
    terms: norm(
      [
        p.code,
        p.name,
        p.subtitle,
        p.blurb,
        p.tier,
        p.discipline,
        p.status,
        p.year,
        ...p.stack,
        ...p.keywords,
        ...p.specs.map((s) => `${s.key} ${s.value}`),
        ...p.metrics.map((m) => `${m.label} ${m.value}`),
      ].join(' '),
    ),
  })),

  ...research.map((r) => ({
    id: `research:${r.id}`,
    title: `${r.ref} · ${r.shortTitle}`,
    subtitle: r.venue,
    group: 'Research' as const,
    to: `/research#${r.id}`,
    terms: norm(
      [r.ref, r.title, r.shortTitle, r.venue, r.question, r.method, r.novelty, r.result].join(' '),
    ),
  })),

  ...challenges.map((c) => ({
    id: `challenge:${c.ref}`,
    title: `Challenge ${c.ref} · ${c.title}`,
    subtitle: c.project,
    group: 'Challenges' as const,
    to: `/championship#challenge-${c.ref}`,
    terms: norm([c.ref, c.title, c.project, c.problem, c.attempt, c.failure, c.solution].join(' ')),
  })),

  ...skillGraph
    .filter((s) => s.projects.length > 0)
    .map((s) => ({
      id: `skill:${s.id}`,
      title: s.label,
      subtitle: `${s.projects.length} project${s.projects.length === 1 ? '' : 's'}${
        s.tools?.length ? ` · ${s.tools.slice(0, 3).join(', ')}` : ''
      }`,
      group: 'Skills' as const,
      to: `/telemetry#skill-${s.id}`,
      terms: norm([s.label, ...(s.tools ?? []), ...s.projects].join(' ')),
    })),

  {
    id: 'ext:github',
    title: 'GitHub',
    subtitle: profile.links.github,
    group: 'External',
    href: profile.links.github,
    terms: 'github repositories code source',
  },
  {
    id: 'ext:resume',
    title: 'Resume',
    subtitle: 'PDF',
    group: 'External',
    href: profile.links.resume,
    terms: 'resume cv pdf download',
  },
  {
    id: 'ext:linkedin',
    title: 'LinkedIn',
    subtitle: 'Profile',
    group: 'External',
    href: profile.links.linkedin,
    terms: 'linkedin profile contact',
  },
];

/**
 * Substring scoring, weighted so an exact title hit outranks a keyword hit.
 * The corpus is ~40 entries; anything cleverer would be slower to read than run.
 */
export function searchAll(query: string): SearchEntry[] {
  const q = norm(query.trim());
  if (!q) return [];
  const tokens = q.split(/\s+/);

  return searchIndex
    .map((entry) => {
      let score = 0;
      for (const token of tokens) {
        if (!entry.terms.includes(token)) return { entry, score: -1 };
        score += 1;
        if (norm(entry.title).includes(token)) score += 3;
        if (norm(entry.title).startsWith(token)) score += 2;
      }
      return { entry, score };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map((r) => r.entry);
}
