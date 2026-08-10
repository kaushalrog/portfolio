import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { skillGraph } from '@/data/site';
import { projectById } from '@/data/projects';

/**
 * The skill graph is a dependency DAG, not a set of progress bars. An edge
 * means "is built on", and every node lists the projects it was actually used
 * in — so a node with no projects behind it has nothing to claim.
 *
 * Layout is computed from the edges: a node's column is one past its deepest
 * parent, which keeps the drawing honest if the data changes.
 */

const COL_W = 178;
const ROW_H = 74;
const NODE_W = 146;
const NODE_H = 34;
const PAD_X = 14;
const PAD_Y = 26;

export default function SkillGraph() {
  const [selected, setSelected] = useState('rag');

  const { positions, width, height } = useMemo(() => {
    const depth = new Map<string, number>();

    const resolve = (id: string, seen: Set<string>): number => {
      if (depth.has(id)) return depth.get(id)!;
      if (seen.has(id)) return 0; // cycle guard; the data is a DAG
      seen.add(id);
      const node = skillGraph.find((s) => s.id === id);
      const d = !node || node.parents.length === 0
        ? 0
        : 1 + Math.max(...node.parents.map((p) => resolve(p, seen)));
      depth.set(id, d);
      return d;
    };
    skillGraph.forEach((s) => resolve(s.id, new Set()));

    const byCol = new Map<number, string[]>();
    skillGraph.forEach((s) => {
      const d = depth.get(s.id)!;
      byCol.set(d, [...(byCol.get(d) ?? []), s.id]);
    });

    const positions = new Map<string, { x: number; y: number }>();
    const maxRows = Math.max(...[...byCol.values()].map((c) => c.length));

    byCol.forEach((ids, col) => {
      const offset = ((maxRows - ids.length) * ROW_H) / 2;
      ids.forEach((id, row) => {
        positions.set(id, {
          x: PAD_X + col * COL_W,
          y: PAD_Y + offset + row * ROW_H,
        });
      });
    });

    return {
      positions,
      width: PAD_X * 2 + (byCol.size - 1) * COL_W + NODE_W,
      height: PAD_Y * 2 + maxRows * ROW_H,
    };
  }, []);

  const node = skillGraph.find((s) => s.id === selected)!;

  /** A node is highlighted if it is selected or directly connected to it. */
  const related = useMemo(() => {
    const set = new Set<string>([selected]);
    node.parents.forEach((p) => set.add(p));
    skillGraph.forEach((s) => {
      if (s.parents.includes(selected)) set.add(s.id);
    });
    return set;
  }, [selected, node]);

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:gap-12">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[46rem]"
          role="group"
          aria-label="Skill dependency graph"
        >
          {/* edges */}
          {skillGraph.flatMap((s) =>
            s.parents.map((p) => {
              const a = positions.get(p)!;
              const b = positions.get(s.id)!;
              const x1 = a.x + NODE_W;
              const y1 = a.y + NODE_H / 2;
              const x2 = b.x;
              const y2 = b.y + NODE_H / 2;
              const mid = (x1 + x2) / 2;
              const on = related.has(s.id) && related.has(p);
              return (
                <path
                  key={`${p}->${s.id}`}
                  d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={on ? 'var(--color-accent)' : 'var(--color-line)'}
                  strokeWidth={on ? 1.3 : 0.9}
                  opacity={on ? 0.9 : 0.55}
                />
              );
            }),
          )}

          {/* nodes */}
          {skillGraph.map((s) => {
            const p = positions.get(s.id)!;
            const isSelected = s.id === selected;
            const isRelated = related.has(s.id);
            const hasWork = s.projects.length > 0;
            return (
              <g
                key={s.id}
                tabIndex={0}
                role="button"
                aria-label={s.label}
                aria-pressed={isSelected}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setSelected(s.id)}
                onFocus={() => setSelected(s.id)}
                onClick={() => setSelected(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(s.id);
                  }
                }}
              >
                <rect
                  x={p.x}
                  y={p.y}
                  width={NODE_W}
                  height={NODE_H}
                  fill={isSelected ? 'rgba(225,6,0,0.10)' : 'rgba(0,0,0,0.03)'}
                  stroke={
                    isSelected
                      ? 'var(--color-accent)'
                      : isRelated
                        ? 'rgba(225,6,0,0.45)'
                        : 'var(--color-line-strong)'
                  }
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                <text
                  x={p.x + 10}
                  y={p.y + 21}
                  fill={isSelected ? 'var(--color-accent)' : isRelated ? 'var(--color-ink)' : 'var(--color-muted)'}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.06em' }}
                >
                  {s.label.length > 22 ? `${s.label.slice(0, 21)}…` : s.label}
                </text>
                {hasWork && (
                  <circle
                    cx={p.x + NODE_W - 9}
                    cy={p.y + 9}
                    r="2.4"
                    fill={isSelected ? 'var(--color-accent)' : 'var(--color-faint)'}
                  />
                )}
              </g>
            );
          })}
        </svg>
        <p className="label-tech-sm mt-4 normal-case">
          An edge means “is built on”. A dot means the node has shipped work behind it.
        </p>
      </div>

      <aside id={`skill-${node.id}`} className="scroll-mt-24 border border-line p-5">
        <p className="label-tech mb-2 text-accent">Node</p>
        <h3 className="display-sm">{node.label}</h3>

        {node.parents.length > 0 && (
          <p className="label-tech-sm mt-3 normal-case">
            Built on{' '}
            {node.parents
              .map((p) => skillGraph.find((s) => s.id === p)?.label ?? p)
              .join(' · ')}
          </p>
        )}

        {node.tools && node.tools.length > 0 && (
          <div className="mt-6">
            <p className="label-tech mb-3">Tools</p>
            <div className="flex flex-wrap gap-1.5">
              {node.tools.map((t) => (
                <span key={t} className="label-tech-sm border border-line px-2 py-1">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="label-tech mb-3">Used in</p>
          {node.projects.length === 0 ? (
            <p className="label-tech-sm normal-case">
              A grouping node — the work sits under its children.
            </p>
          ) : (
            <ul>
              {node.projects.map((id) => {
                const p = projectById(id);
                if (!p) return null;
                return (
                  <li key={id}>
                    <Link
                      to={`/garage/${p.id}`}
                      className="group flex items-baseline gap-3 border-b border-line py-2.5"
                    >
                      <span className="label-tech-sm text-accent">{p.code}</span>
                      <span className="mono text-[0.8125rem] transition-colors group-hover:text-accent">
                        {p.name}
                      </span>
                      <span className="label-tech-sm ml-auto">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
