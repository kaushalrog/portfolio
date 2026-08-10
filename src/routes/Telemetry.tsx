import { useEffect, useState } from 'react';
import { profile } from '@/data/site';
import { fetchTelemetry, SNAPSHOT } from '@/lib/github';
import type { Telemetry as TelemetryData } from '@/lib/github';
import { Container, HairlineGrid, PageHeader, SectionHeader } from '@/components/ui';
import SkillGraph from '@/components/SkillGraph';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function relative(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function Telemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTelemetry()
      .then((t) => !cancelled && setData(t))
      .catch(() => {
        if (cancelled) return;
        setData(SNAPSHOT);
        setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const t = data;
  const maxLang = t ? Math.max(...t.languages.map((l) => l.count), 1) : 1;
  const maxDay = t ? Math.max(...t.weekday, 1) : 1;
  const hasActivity = Boolean(t && t.eventWindow > 0);

  return (
    <>
      <PageHeader
        code="TELEMETRY"
        title="Driver Telemetry"
        lede="Read live from the GitHub API on load, cached for six hours. When the API is unreachable or rate-limited, the page falls back to a committed snapshot and says so rather than passing stale figures off as current."
        meta={
          <div className="lg:text-right">
            <p className="label-tech-sm mb-2">Source</p>
            {!t ? (
              <p className="mono text-[0.875rem] text-muted">CONNECTING…</p>
            ) : t.source === 'live' ? (
              <p className="mono flex items-center gap-2.5 text-[0.875rem] text-ok lg:justify-end">
                <span className="status-dot" /> LIVE
              </p>
            ) : (
              <p className="mono text-[0.875rem] text-muted">
                SNAPSHOT{failed ? ' — API UNREACHABLE' : ''}
              </p>
            )}
          </div>
        }
      />

      {/* ── account ─────────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <Container>
          <HairlineGrid className="grid-cols-2 md:grid-cols-4">
            {[
              { k: 'Public repositories', v: t ? String(t.publicRepos) : '—' },
              { k: 'Followers', v: t ? String(t.followers) : '—' },
              { k: 'Languages in use', v: t ? String(t.languages.length) : '—' },
              { k: 'On GitHub since', v: t ? t.memberSince.slice(0, 4) : '—' },
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

      {/* ── distribution + activity ─────────────────────────────────── */}
      <section className="border-b border-line py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeader index="LANGUAGE DISTRIBUTION" title="What the work is written in" caption="By repository, own repositories only" />
              {!t ? (
                <p className="label-tech py-8">Loading…</p>
              ) : (
                <ul className="space-y-3.5">
                  {t.languages.map((l) => (
                    <li key={l.name} className="flex items-center gap-4">
                      <span className="mono w-36 shrink-0 truncate text-[0.8125rem]">{l.name}</span>
                      <span className="h-2 flex-1 border border-line">
                        <span
                          className="block h-full bg-accent"
                          style={{ width: `${(l.count / maxLang) * 100}%` }}
                        />
                      </span>
                      <span className="mono w-6 shrink-0 text-right text-[0.75rem] text-muted">
                        {l.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <SectionHeader
                index="CODE ACTIVITY"
                title="Commits by weekday"
                caption="Public push events in the API's recent window"
              />
              {!t ? (
                <p className="label-tech py-8">Loading…</p>
              ) : !hasActivity ? (
                <p className="label-tech-sm py-8 normal-case">
                  No public push events in the window the API returns. This chart stays empty
                  rather than being filled with generated bars.
                </p>
              ) : (
                <>
                  <ul className="space-y-3.5">
                    {t.weekday.map((count, i) => (
                      <li key={DAYS[i]} className="flex items-center gap-4">
                        <span className="label-tech w-10 shrink-0">{DAYS[i]}</span>
                        <span className="h-2 flex-1 border border-line">
                          <span
                            className="block h-full bg-accent"
                            style={{ width: `${(count / maxDay) * 100}%` }}
                          />
                        </span>
                        <span className="mono w-8 shrink-0 text-right text-[0.75rem] text-muted">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="label-tech-sm mt-5 normal-case">
                    {t.eventWindow} commits across the returned event window.
                  </p>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── recent builds ───────────────────────────────────────────── */}
      <section className="border-b border-line py-12 md:py-16">
        <Container>
          <SectionHeader
            index="RECENT BUILDS"
            title="Last pushed"
            action={
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="link-tech"
              >
                All repositories ↗
              </a>
            }
          />
          {!t ? (
            <p className="label-tech py-8">Loading…</p>
          ) : (
            <HairlineGrid className="md:grid-cols-2 xl:grid-cols-3">
              {t.recent.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group p-5 transition-colors hover:bg-surface"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="mono truncate text-[0.9375rem] transition-colors group-hover:text-accent">
                      {r.name}
                    </span>
                    <span className="label-tech-sm shrink-0">{relative(r.pushedAt)}</span>
                  </div>
                  {r.description && (
                    <p className="mt-3 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted">
                      {r.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4">
                    {r.language && <span className="label-tech-sm text-accent">{r.language}</span>}
                    {r.stars > 0 && <span className="label-tech-sm">★ {r.stars}</span>}
                  </div>
                </a>
              ))}
            </HairlineGrid>
          )}
        </Container>
      </section>

      {/* ── skill graph ─────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <Container>
          <SectionHeader
            index="SKILL GRAPH"
            title="Dependency graph, not a bar chart"
            caption="Select a node to see the projects behind it"
          />
          <SkillGraph />
        </Container>
      </section>
    </>
  );
}
