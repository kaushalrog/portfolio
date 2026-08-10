import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { navItems } from '@/nav';
import { profile } from '@/data/site';
import { useDriverMode } from '@/context/DriverMode';

/** Width of the desktop rail. Layout padding in App.tsx must match. */
export const RAIL_W = '15rem';

function DriverModeToggle() {
  const { mode, setMode } = useDriverMode();
  return (
    <div role="radiogroup" aria-label="Driver mode" className="flex items-center border border-line">
      {(['standard', 'race'] as const).map((m) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => setMode(m)}
          className={`label-tech-sm px-2.5 py-1.5 transition-colors ${
            mode === m ? 'bg-accent text-void' : 'text-faint hover:text-ink'
          }`}
        >
          {m === 'standard' ? 'STD' : 'RACE'}
        </button>
      ))}
    </div>
  );
}

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* ═══════════════ DESKTOP RAIL ═══════════════ */}
      <aside
        className="fixed inset-y-0 left-0 z-[100] hidden flex-col border-r border-line bg-void lg:flex"
        style={{ width: RAIL_W }}
      >
        <NavLink to="/" className="group block border-b border-line px-6 py-7">
          <span className="block font-display text-[1.75rem] leading-none tracking-wider transition-colors group-hover:text-accent">
            {profile.team}
          </span>
          <span className="label-tech-sm mt-2 block text-accent">SEASON {profile.season}</span>
        </NavLink>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-6 py-3 transition-colors ${
                  isActive ? 'bg-accent-dim text-accent' : 'text-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-accent" />
                  )}
                  <span aria-hidden className="w-4 shrink-0 text-[0.8125rem] leading-none">
                    {item.glyph}
                  </span>
                  <span className="label-tech text-current">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-line px-6 py-5">
          <button
            onClick={onOpenPalette}
            aria-label="Open command palette"
            className="label-tech-sm flex w-full items-center justify-between border border-line px-3 py-2.5 text-faint transition-colors hover:border-accent hover:text-accent"
          >
            COMMAND <span className="mono">⌘K</span>
          </button>
          <DriverModeToggle />
        </div>
      </aside>

      {/* ═══════════════ MOBILE / TABLET TOP BAR ═══════════════ */}
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-line bg-void/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center gap-4 px-5">
          <NavLink to="/" className="flex shrink-0 items-baseline gap-2.5">
            <span className="font-display text-[1.0625rem] leading-none tracking-wider">
              {profile.team}
            </span>
            <span className="label-tech-sm hidden text-accent sm:inline">{profile.season}</span>
          </NavLink>

          <div className="ml-auto flex items-center gap-2">
            <DriverModeToggle />
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="label-tech border border-line px-2.5 py-1.5 text-muted"
            >
              {open ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-14 z-[99] overflow-y-auto bg-void lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col px-5 py-4">
            {navItems.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-baseline gap-4 border-b border-line py-4 transition-colors ${
                    isActive ? 'text-accent' : 'text-ink'
                  }`
                }
              >
                <span className="label-tech-sm w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[1.75rem] leading-none tracking-wide">
                  {item.label}
                </span>
              </NavLink>
            ))}
            <button
              onClick={onOpenPalette}
              className="label-tech mt-6 border border-line px-4 py-3 text-left text-muted"
            >
              Search everything →
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
