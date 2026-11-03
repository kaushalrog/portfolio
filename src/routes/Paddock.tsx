import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { profile, timeline } from '@/data/site';
import { byTier, projects } from '@/data/projects';
import { research } from '@/data/research';
import NightStage, { prefersReducedMotion } from '@/components/night/NightStage';

/**
 * The Paddock — a night race. Scrolling the page drives the K-01 one lap
 * around the circuit; each sector of the lap is a chapter of the profile.
 *
 * The 3D is a backdrop. Every word and number here is ordinary page text,
 * readable with WebGL off, motion reduced, or the canvas still loading.
 */

const CHAPTERS = [
  { id: 'lights-out', label: 'Lights out' },
  { id: 'sector-1', label: 'S1 · Driver' },
  { id: 'sector-2', label: 'S2 · Garage' },
  { id: 'sector-3', label: 'S3 · History' },
  { id: 'chequered', label: 'Chequered flag' },
] as const;

const LIGHTS_KEY = 'kgp:lights-out';

/* ───────────────────────── start sequence ─────────────────────────
   Five reds, one per beat, a random hold, then all out. Runs once a
   session; any key, click or scroll jumps straight to lights out. */

type Phase = 'arming' | 'out';

function useStartSequence() {
  const skip =
    typeof window === 'undefined' ||
    prefersReducedMotion() ||
    sessionStorage.getItem(LIGHTS_KEY) === '1';
  const [lights, setLights] = useState(0);
  const [phase, setPhase] = useState<Phase>(skip ? 'out' : 'arming');

  const go = useCallback(() => {
    sessionStorage.setItem(LIGHTS_KEY, '1');
    setLights(0);
    setPhase('out');
  }, []);

  useEffect(() => {
    if (phase !== 'arming') return;
    const timers: number[] = [];
    for (let i = 1; i <= 5; i++) timers.push(window.setTimeout(() => setLights(i), 450 + i * 520));
    timers.push(window.setTimeout(go, 450 + 5 * 520 + 500 + Math.random() * 700));
    const early = () => go();
    window.addEventListener('keydown', early);
    window.addEventListener('pointerdown', early);
    window.addEventListener('wheel', early, { passive: true });
    window.addEventListener('touchmove', early, { passive: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', early);
      window.removeEventListener('pointerdown', early);
      window.removeEventListener('wheel', early);
      window.removeEventListener('touchmove', early);
    };
  }, [phase, go]);

  return { lights, phase };
}

/* ───────────────────────── reveal on enter ───────────────────────── */

function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [root]);
}

/** Counts up once the element is revealed. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(value);
      return;
    }
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / 1100);
        el.textContent = String(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

function SectorTag({ n, label }: { n: string; label: string }) {
  return (
    <p data-reveal className="sector-tag">
      <span className="sector-tag-n">{n}</span>
      <span>{label}</span>
    </p>
  );
}

/* ───────────────────────── chapter rail ───────────────────────── */

function ChapterRail() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      let idx = 0;
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top < mid) idx = i;
      });
      setActive(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav aria-label="Chapters" className="chapter-rail fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 xl:block">
      <ol className="flex flex-col gap-3">
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(c.id)?.scrollIntoView({
                  behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                });
              }}
              aria-current={active === i ? 'step' : undefined}
              className="chapter-rail-item group"
            >
              <span className="chapter-rail-label">{c.label}</span>
              <span className="chapter-rail-tick" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function Paddock() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { lights, phase } = useStartSequence();
  const featured = byTier('featured');
  const published = research.filter((r) => r.venueStatus === 'published').length;
  useReveal(trackRef);

  const tower = [
    { k: 'Systems in the garage', v: projects.length },
    { k: 'Research entries', v: research.length },
    { k: 'Featured builds', v: featured.length },
    { k: 'Certifications', v: profile.certifications.length },
    { k: 'IEEE published', v: published },
  ];

  return (
    <div className="inverted night-page relative">
      <NightStage trackRef={trackRef} lights={lights} />
      <ChapterRail />

      <div ref={trackRef} className="relative z-10">
        {/* ═══════════════ LIGHTS OUT ═══════════════ */}
        <section
          id="lights-out"
          className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-28 md:pb-20"
        >
          <div className="hero-scrim pointer-events-none absolute inset-0" />

          {phase === 'arming' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-5">
              <div role="img" aria-label={`${lights} of 5 start lights on`} className="start-gantry">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="start-pod">
                    <span data-on={i < lights ? '1' : '0'} />
                    <span data-on={i < lights ? '1' : '0'} />
                  </div>
                ))}
              </div>
              <p className="label-tech-sm text-white/50">Press any key to skip</p>
            </div>
          )}

          <div className="relative mx-auto w-full max-w-[112rem] px-5 md:px-10">
            <p className={`hero-kicker ${phase === 'out' ? 'is-go' : ''}`}>
              <span className="stripe">
                <span />
                <span />
                <span />
              </span>
              {profile.team} · Night Race · Season {profile.season}
            </p>
            <h1 className={`hero-name ${phase === 'out' ? 'is-go' : ''}`}>
              <span className="hero-name-line">Kaushal</span>
              <span className="hero-name-line text-accent">S.</span>
            </h1>
            <div className={`hero-meta ${phase === 'out' ? 'is-go' : ''}`}>
              <p className="max-w-md text-[1.0625rem] leading-relaxed text-white/80 md:text-[1.1875rem]">
                {profile.role}. {profile.statement}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/garage" className="btn-race btn-race-solid">
                  Enter the garage
                </Link>
                <a
                  href="#sector-1"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('sector-1')?.scrollIntoView({
                      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    });
                  }}
                  className="btn-race"
                >
                  Start the lap
                </a>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className={`scroll-cue absolute bottom-24 left-1/2 -translate-x-1/2 md:bottom-6 ${
              phase === 'out' ? 'is-go' : ''
            }`}
          >
            <span className="label-tech-sm text-white/55">Scroll to race</span>
            <span className="scroll-cue-chevrons">
              <i />
              <i />
              <i />
            </span>
          </div>
        </section>

        {/* ═══════════════ SECTOR 1 — THE DRIVER ═══════════════ */}
        <section id="sector-1" className="relative min-h-[170vh] py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-[112rem] gap-12 px-5 md:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <SectorTag n="S1" label="The driver" />
              <h2 data-reveal className="night-h2 mt-6">
                {profile.disciplines.join(' · ')}
              </h2>
              <p data-reveal style={{ '--d': '120ms' } as CSSProperties} className="night-lead mt-8 max-w-xl">
                {profile.bio}
              </p>
              <p data-reveal style={{ '--d': '200ms' } as CSSProperties} className="mt-4 font-mono text-[0.75rem] tracking-[0.12em] text-white/55 uppercase">
                Base · {profile.base}
              </p>

              <ul className="approach mt-16 md:mt-24">
                {profile.approach.map((w, i) => (
                  <li
                    key={w}
                    data-reveal
                    style={{ '--d': `${i * 110}ms` } as CSSProperties}
                    className={i === profile.approach.length - 1 ? 'text-accent' : ''}
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pt-40">
              <div data-reveal className="timing-tower">
                <div className="timing-tower-head">
                  <span>Classification</span>
                  <span className="text-accent">● Live</span>
                </div>
                {tower.map((row, i) => (
                  <div key={row.k} className="timing-row" style={{ '--d': `${i * 90}ms` } as CSSProperties}>
                    <span className="timing-pos">{i + 1}</span>
                    <span className="timing-bar" />
                    <span className="timing-label">{row.k}</span>
                    <span className="timing-value">
                      <CountUp value={row.v} />
                    </span>
                  </div>
                ))}
                <div className="timing-tower-foot">
                  Now developing · {profile.currentDevelopment.join(' · ')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTOR 2 — THE GARAGE ═══════════════ */}
        <section id="sector-2" className="relative py-24 md:py-32">
          <div className="mx-auto w-full max-w-[112rem] px-5 md:px-10">
            <SectorTag n="S2" label="The garage" />
            <h2 data-reveal className="night-h2 mt-6 max-w-4xl">
              The machinery the season is built on.
            </h2>

            <div className="mt-20 flex flex-col gap-[38vh] pb-[20vh] md:mt-28">
              {featured.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/garage/${p.id}`}
                  data-reveal
                  data-side={i % 2 ? 'right' : 'left'}
                  className={`pit-board group ${i % 2 ? 'md:ml-auto' : ''}`}
                >
                  <div className="pit-board-head">
                    <span className="pit-board-code">{p.code}</span>
                    <span className="pit-board-status">{p.status}</span>
                    <span className="ml-auto text-white/50">{p.year}</span>
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="pit-board-name">{p.name}</h3>
                    <p className="mt-2 font-mono text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">
                      {p.subtitle}
                    </p>
                    <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/80">{p.blurb}</p>

                    {p.metrics.length > 0 && (
                      <div className="mt-7 grid grid-cols-2 gap-px bg-white/10">
                        {p.metrics.slice(0, 2).map((m) => (
                          <div key={m.label} className="bg-[#0b0c10] p-4">
                            <p className="pit-board-metric">{m.value}</p>
                            <p className="mt-2 font-mono text-[0.625rem] tracking-[0.12em] text-white/55 uppercase">
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-1.5">
                      {p.stack.slice(0, 4).map((t) => (
                        <span key={t} className="pit-chip">
                          {t}
                        </span>
                      ))}
                      <span className="pit-board-go ml-auto">Open bay →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link to="/garage" data-reveal className="btn-race btn-race-solid">
              All {projects.length} systems
            </Link>
          </div>
        </section>

        {/* ═══════════════ SECTOR 3 — RACE HISTORY ═══════════════ */}
        <section id="sector-3" className="relative min-h-[150vh] py-24 md:py-32">
          <div className="mx-auto w-full max-w-[112rem] px-5 md:px-10">
            <SectorTag n="S3" label="Race history" />
            <h2 data-reveal className="night-h2 mt-6 max-w-4xl">
              Every round built what the next one needed.
            </h2>

            <ol className="timing-screen mt-16 md:mt-24">
              <li className="timing-screen-head" aria-hidden>
                <span>Rnd</span>
                <span>Discipline</span>
                <span className="hidden md:block">Systems</span>
                <span className="text-right">Season</span>
              </li>
              {timeline.map((r, i) => (
                <li
                  key={r.round}
                  data-reveal
                  style={{ '--d': `${i * 70}ms` } as CSSProperties}
                  className={`timing-screen-row ${i === timeline.length - 1 ? 'is-current' : ''}`}
                >
                  <span className="font-mono text-white/60">
                    {r.round === 'CURRENT ROUND' ? 'NOW' : r.round.replace('ROUND ', 'R')}
                  </span>
                  <span>
                    <span className="timing-screen-label">{r.label}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-white/55 md:hidden">
                      {r.entries.map((e) => e.title).join(' · ')}
                    </span>
                    <span className="mt-1 hidden text-[0.8125rem] leading-snug text-white/55 md:block">
                      {r.summary}
                    </span>
                  </span>
                  <span className="hidden text-[0.875rem] leading-snug text-white/80 md:block">
                    {r.entries.map((e) => e.title).join(' · ')}
                  </span>
                  <span className="text-right font-mono text-[0.75rem] text-white/60">{r.period}</span>
                  <span aria-hidden className="timing-screen-sweep" />
                </li>
              ))}
            </ol>

            <Link to="/archive" data-reveal className="btn-race mt-10">
              Full race archive
            </Link>
          </div>
        </section>

        {/* ═══════════════ CHEQUERED FLAG ═══════════════ */}
        <section id="chequered" className="relative flex min-h-[110vh] flex-col justify-end pb-28 md:pb-24">
          <div aria-hidden className="chequer-band" />
          <div className="relative mx-auto w-full max-w-[112rem] px-5 md:px-10">
            <SectorTag n="P1" label="Chequered flag" />
            <h2 data-reveal className="hero-name is-go mt-6">
              <span className="hero-name-line">Take the</span>
              <span className="hero-name-line text-accent">wheel.</span>
            </h2>
            <p data-reveal className="night-lead mt-8 max-w-xl">
              Open to research collaborations, engineering roles and anything that needs a system
              built, broken and understood.
            </p>
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <a href={`mailto:${profile.links.email}`} className="btn-race btn-race-solid">
                Radio the team
              </a>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="btn-race">
                GitHub ↗
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="btn-race">
                LinkedIn ↗
              </a>
              <a href={profile.links.resume} target="_blank" rel="noreferrer" className="btn-race">
                Résumé ↗
              </a>
              <Link to="/research" className="btn-race">
                Research
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
