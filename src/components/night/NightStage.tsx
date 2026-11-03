import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { NightScene, SceneFrame } from './NightScene';

/**
 * The fixed backdrop for the homepage: the WebGL night race plus the
 * steering-wheel display. Scroll position through `trackRef` is the throttle.
 *
 * The scene module loads after the page text, so nothing waits on WebGL.
 * Without WebGL the stage falls back to a static gradient and the page
 * reads exactly the same.
 */

const LEDS = 15;
const GEAR_SPAN = 42;

function gearFor(speed: number) {
  if (speed < 1) return { gear: 'N', rev: 0 };
  const g = Math.min(8, 1 + Math.floor(speed / GEAR_SPAN));
  const rev = g === 8 ? Math.min(1, (speed - 7 * GEAR_SPAN) / 48) : (speed % GEAR_SPAN) / GEAR_SPAN;
  return { gear: String(g), rev };
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function NightStage({
  trackRef,
  lights,
}: {
  trackRef: RefObject<HTMLElement | null>;
  lights: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<NightScene | null>(null);
  const [state, setState] = useState<'loading' | 'live' | 'fallback'>('loading');
  const [hudVisible, setHudVisible] = useState(true);

  // HUD nodes written directly from the render loop — 60 updates a second
  // through React state would be waste.
  const speedRef = useRef<HTMLSpanElement>(null);
  const gearRef = useRef<HTMLSpanElement>(null);
  const ledRef = useRef<HTMLDivElement>(null);
  const lapRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const sectorRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const drsRef = useRef<HTMLSpanElement>(null);

  const [mapPath, setMapPath] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const reducedMotion = prefersReducedMotion();
    const lowPower =
      window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;

    let project: ((t: number) => { x: number; y: number }) | null = null;

    const onFrame = (f: SceneFrame) => {
      const { gear, rev } = gearFor(f.speed);
      if (speedRef.current) speedRef.current.textContent = String(Math.round(f.speed)).padStart(3, '0');
      if (gearRef.current) gearRef.current.textContent = gear;
      if (lapRef.current) lapRef.current.textContent = `${Math.round(f.p * 100)}%`;
      const lit = Math.round(rev * LEDS);
      ledRef.current?.childNodes.forEach((n, i) => {
        (n as HTMLElement).dataset.on = i < lit ? '1' : '0';
      });
      if (project) {
        const { x, y } = project(f.t);
        dotRef.current?.setAttribute('cx', x.toFixed(2));
        dotRef.current?.setAttribute('cy', y.toFixed(2));
      }
      // From page progress, not track position: the grid slot sits before the line.
      const sector = f.p < 1 / 3 ? 0 : f.p < 2 / 3 ? 1 : 2;
      sectorRefs.current.forEach((el, i) => {
        if (el) el.dataset.state = i < sector ? 'done' : i === sector ? 'live' : 'idle';
      });
      if (drsRef.current) drsRef.current.dataset.on = f.speed > 270 ? '1' : '0';
    };

    // Fonts first: the trackside boards and car number are drawn onto canvases.
    Promise.all([import('./NightScene'), import('./circuit'), document.fonts?.ready])
      .then(([{ NightScene }, circuit]) => {
        if (cancelled) return;
        const map = circuit.outline();
        project = map.project;
        setMapPath(map.d);
        try {
          sceneRef.current = new NightScene(canvas, { reducedMotion, lowPower, onFrame });
          setState('live');
        } catch {
          setState('fallback');
        }
      })
      .catch(() => setState('fallback'));

    const progress = () => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      // Reduced motion keeps the camera parked on the grid; the page still scrolls.
      if (!reducedMotion) sceneRef.current?.setProgress(p);
      setHudVisible(r.bottom > window.innerHeight * 0.85);
    };
    const onResize = () => {
      sceneRef.current?.resize();
      progress();
    };
    window.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', onResize);
    progress();

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', progress);
      window.removeEventListener('resize', onResize);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [trackRef]);

  useEffect(() => {
    sceneRef.current?.setStartLights(lights);
  }, [lights, state]);

  return (
    <>
      <div aria-hidden className="night-sky fixed inset-0 z-0 lg:left-60">
        <canvas
          ref={canvasRef}
          className={`h-full w-full transition-opacity duration-[1400ms] ${
            state === 'live' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="night-vignette pointer-events-none absolute inset-0" />
      </div>

      {/* Steering-wheel display */}
      <div
        aria-hidden
        className={`wheel-hud fixed right-3 bottom-[5.5rem] z-30 transition-all duration-500 md:right-6 lg:bottom-6 ${
          hudVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
      >
        <div ref={ledRef} className="wheel-leds">
          {Array.from({ length: LEDS }, (_, i) => (
            <span key={i} data-band={i < 5 ? 'g' : i < 10 ? 'r' : 'b'} data-on="0" />
          ))}
        </div>
        <div className="flex items-stretch gap-3">
          <div className="wheel-cell w-12 md:w-14">
            <span className="wheel-label">GEAR</span>
            <span ref={gearRef} className="wheel-gear">
              N
            </span>
          </div>
          <div className="wheel-cell flex-1">
            <span className="wheel-label">KM/H</span>
            <span ref={speedRef} className="wheel-speed">
              000
            </span>
          </div>
          <div className="wheel-cell hidden w-[5.5rem] sm:flex">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <path d={mapPath} className="wheel-map-track" />
              <circle ref={dotRef} r="4.5" className="wheel-map-car" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {['S1', 'S2', 'S3'].map((s, i) => (
            <span
              key={s}
              ref={(el) => {
                sectorRefs.current[i] = el;
              }}
              data-state={i === 0 ? 'live' : 'idle'}
              className="wheel-sector"
            >
              {s}
            </span>
          ))}
          <span ref={drsRef} data-on="0" className="wheel-drs">
            DRS
          </span>
          <span className="ml-auto font-mono text-[0.625rem] tracking-[0.14em] text-white/55">
            LAP <span ref={lapRef}>0%</span>
          </span>
        </div>
      </div>
    </>
  );
}
