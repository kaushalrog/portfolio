import { useEffect, useRef, useState } from 'react';
import { profile } from '@/data/site';

/**
 * Race control initialisation.
 *
 * Budget: ~2.8s to SYSTEM READY. Skip is visible from the first frame and
 * focusable immediately. Runs once per session, and not at all for visitors
 * who have asked for reduced motion.
 */
const SYSTEMS = [
  'DRIVER PROFILE',
  'ENGINEERING DATABASE',
  'RESEARCH ARCHIVE',
  'TELEMETRY',
  'GARAGE',
] as const;

const STEP_MS = 320;
const TAIL_MS = 620;
const SESSION_KEY = 'kgp:booted';

export function shouldBoot(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(SESSION_KEY) === '1') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [checked, setChecked] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  // One shared exit path, so skipping and completing behave identically.
  const finish = useRef(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    setLeaving(true);
    setTimeout(onDone, 420);
  }).current;

  useEffect(() => {
    const timers: number[] = [];
    SYSTEMS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setChecked(i + 1), STEP_MS * (i + 1)));
    });
    timers.push(
      window.setTimeout(() => setReady(true), STEP_MS * SYSTEMS.length + 180),
    );
    timers.push(
      window.setTimeout(finish, STEP_MS * SYSTEMS.length + TAIL_MS + 180),
    );
    return () => timers.forEach(clearTimeout);
  }, [finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  return (
    <div
      role="status"
      aria-label="Initialising"
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-void px-6 transition-opacity duration-[400ms] ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <button
        onClick={finish}
        className="label-tech absolute top-6 right-6 z-10 px-3 py-2 text-muted transition-colors hover:text-accent"
      >
        Skip →
      </button>

      <div className="w-full max-w-[26rem]">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-display text-[1.75rem] leading-none tracking-wide">
            {profile.team}
          </span>
          <span className="label-tech-sm">SEASON {profile.season}</span>
        </div>
        <div className="mb-7 h-px w-full bg-line-strong" />

        <p className="label-tech mb-5 text-faint">
          RACE CONTROL <span className="text-muted">— INITIALISING</span>
        </p>

        <ul className="mono space-y-[7px] text-[0.6875rem]">
          {SYSTEMS.map((system, i) => {
            const isChecked = i < checked;
            return (
              <li
                key={system}
                className={`flex items-center justify-between gap-4 transition-opacity duration-200 ${
                  isChecked ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <span className="tracking-[0.14em] text-muted">{system}</span>
                <span
                  aria-hidden
                  className="h-px flex-1 origin-left bg-line transition-transform duration-300"
                  style={{ transform: `scaleX(${isChecked ? 1 : 0})` }}
                />
                <span className={isChecked ? 'text-accent' : 'text-faint'}>
                  {isChecked ? '[OK]' : '[  ]'}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 h-px w-full bg-line" />
        <p
          className={`label-tech mt-4 transition-opacity duration-300 ${
            ready ? 'text-accent opacity-100' : 'opacity-0'
          }`}
        >
          System ready
        </p>
      </div>
    </div>
  );
}
