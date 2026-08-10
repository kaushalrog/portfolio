/** Single source of truth for site structure — nav, palette and mobile all read this. */
export interface NavItem {
  to: string;
  label: string;
  /** Shown in the route-transition sweep. */
  loading: string;
  /** Mobile bottom-bar glyph. */
  glyph: string;
  /** Bottom-bar label — the full one does not fit five across at 375px. */
  short?: string;
  /** Whether it appears in the mobile bottom bar. */
  primary?: boolean;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Paddock', loading: 'PADDOCK', glyph: '⌂', primary: true },
  { to: '/garage', label: 'Garage', loading: 'GARAGE', glyph: '◉', primary: true },
  {
    to: '/engineering',
    label: 'Engineering',
    loading: 'ENGINEERING LAB',
    glyph: '◇',
    short: 'Lab',
    primary: true,
  },
  { to: '/research', label: 'Research', loading: 'RESEARCH ARCHIVE', glyph: '◎', primary: true },
  { to: '/telemetry', label: 'Telemetry', loading: 'TELEMETRY', glyph: '▤' },
  { to: '/archive', label: 'Archive', loading: 'RACE ARCHIVE', glyph: '▦' },
  { to: '/championship', label: 'Championship', loading: 'CHAMPIONSHIP', glyph: '▲' },
  { to: '/off-track', label: 'Off Track', loading: 'OFF TRACK', glyph: '◐' },
  { to: '/radio', label: 'Team Radio', loading: 'TEAM RADIO', glyph: '☰' },
];

export const loadingLabelFor = (pathname: string): string => {
  if (pathname.startsWith('/garage/')) return 'ENGINEERING REPORT';
  const match = [...navItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)));
  return match?.loading ?? 'KAUSHAL GP';
};
