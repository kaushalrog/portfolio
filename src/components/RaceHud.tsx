import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDriverMode } from '@/context/DriverMode';
import { loadingLabelFor } from '@/nav';

/**
 * RACE CONTROL overlay. Purely decorative instrumentation — it carries no
 * information the page does not already state, so STANDARD loses nothing.
 */
export default function RaceHud() {
  const { isRace } = useDriverMode();
  const { pathname } = useLocation();
  const [clock, setClock] = useState('');
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    if (!isRace) return;
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRace]);

  useEffect(() => {
    if (!isRace) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isRace]);

  if (!isRace) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] lg:left-60">
      {/* Corner brackets */}
      <span className="absolute top-16 left-3 lg:top-4 h-4 w-4 border-t border-l border-accent/45" />
      <span className="absolute top-16 right-3 lg:top-4 h-4 w-4 border-t border-r border-accent/45" />
      <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-accent/45" />
      <span className="absolute right-3 bottom-3 h-4 w-4 border-r border-b border-accent/45" />

      {/* Left rail — vertical route readout */}
      <div className="absolute top-1/2 left-3 hidden -translate-y-1/2 xl:block">
        <span
          className="label-tech-sm block text-accent/55"
          style={{ writingMode: 'vertical-rl' }}
        >
          {loadingLabelFor(pathname)}
        </span>
      </div>

      {/* Bottom rail */}
      <div className="absolute inset-x-0 bottom-0 border-t border-accent/15 bg-void/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[112rem] items-center gap-5 px-5 py-1.5 md:px-10">
          <span className="label-tech-sm text-accent/70">● LIVE</span>
          <span className="label-tech-sm hidden sm:inline">SESSION {clock}</span>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="label-tech-sm">TRACK</span>
            <div className="h-px w-20 bg-accent/20 sm:w-40">
              <div
                className="h-full bg-accent transition-[width] duration-150"
                style={{ width: `${scroll}%` }}
              />
            </div>
            <span className="label-tech-sm mono w-8 text-right text-accent/70">
              {Math.round(scroll)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
