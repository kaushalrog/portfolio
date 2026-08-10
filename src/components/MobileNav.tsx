import { NavLink } from 'react-router-dom';
import { navItems } from '@/nav';

/**
 * Mobile gets its own navigation model rather than a collapsed desktop one:
 * four destinations always reachable with a thumb, plus search.
 */
export default function MobileNav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const primary = navItems.filter((n) => n.primary);

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-void/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? 'text-accent' : 'text-faint'
              }`
            }
          >
            <span aria-hidden className="text-[0.9375rem] leading-none">
              {item.glyph}
            </span>
            <span className="label-tech-sm text-current">{item.short ?? item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={onOpenPalette}
          className="flex flex-col items-center gap-1 py-2.5 text-faint"
        >
          <span aria-hidden className="text-[0.9375rem] leading-none">
            ⌕
          </span>
          <span className="label-tech-sm text-current">Search</span>
        </button>
      </div>
    </nav>
  );
}
