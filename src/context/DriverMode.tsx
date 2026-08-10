import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * STANDARD — a clean, quiet portfolio.
 * RACE CONTROL — the full instrumented interface: HUD frame, corner readouts,
 * live clock, extra technical overlays.
 *
 * The theme is a layer over the content, never a prerequisite for reading it.
 * Every fact on the site is legible in STANDARD.
 */
export type DriverMode = 'standard' | 'race';

interface DriverModeValue {
  mode: DriverMode;
  isRace: boolean;
  toggle: () => void;
  setMode: (mode: DriverMode) => void;
}

const Ctx = createContext<DriverModeValue | null>(null);

const STORAGE_KEY = 'kgp:driver-mode';

function readStored(): DriverMode {
  if (typeof localStorage === 'undefined') return 'standard';
  return localStorage.getItem(STORAGE_KEY) === 'race' ? 'race' : 'standard';
}

export function DriverModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DriverMode>(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.dataset.driverMode = mode;
  }, [mode]);

  const setMode = useCallback((next: DriverMode) => setModeState(next), []);
  const toggle = useCallback(
    () => setModeState((m) => (m === 'race' ? 'standard' : 'race')),
    [],
  );

  const value = useMemo(
    () => ({ mode, isRace: mode === 'race', toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDriverMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDriverMode must be used inside DriverModeProvider');
  return ctx;
}
