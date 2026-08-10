import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carComponents } from '@/data/site';
import type { ComponentId } from '@/data/types';

/**
 * The K-01.
 *
 * A technical line drawing rather than a rendering — six zones, each mapping to
 * a discipline and each a real link. The car is the navigation model: exploring
 * the machine is exploring the work.
 *
 * Side profile, because a low wide silhouette reads as a car at any size and
 * gives the six callouts room to separate without crossing each other.
 */

interface Callout {
  id: ComponentId;
  /** Where the leader line meets the car. */
  from: [number, number];
  /** Which rail the label sits on. */
  rail: 'top' | 'bottom';
  /** Horizontal position of the label. */
  labelX: number;
  anchor: 'start' | 'middle' | 'end';
}

const CALLOUTS: Callout[] = [
  { id: 'aerodynamics', from: [76, 58], rail: 'top', labelX: 30, anchor: 'start' },
  { id: 'power-unit', from: [248, 131], rail: 'top', labelX: 216, anchor: 'start' },
  { id: 'control-system', from: [392, 110], rail: 'top', labelX: 428, anchor: 'start' },
  { id: 'research-division', from: [88, 196], rail: 'bottom', labelX: 30, anchor: 'start' },
  { id: 'telemetry', from: [344, 182], rail: 'bottom', labelX: 316, anchor: 'start' },
  { id: 'bodywork', from: [578, 166], rail: 'bottom', labelX: 556, anchor: 'start' },
];

const TOP_RAIL = 34;
const BOTTOM_RAIL = 232;

const componentById = (id: ComponentId) => carComponents.find((c) => c.id === id)!;

export default function K01() {
  const [hovered, setHovered] = useState<ComponentId | null>(null);
  const navigate = useNavigate();

  const isOn = (id: ComponentId) => hovered === id;
  const stroke = (id: ComponentId) =>
    isOn(id) ? 'var(--color-accent)' : 'var(--color-line-strong)';
  const fill = (id: ComponentId) =>
    isOn(id) ? 'rgba(200,255,0,0.10)' : 'rgba(255,255,255,0.022)';

  const activate = (id: ComponentId) => navigate(componentById(id).href);

  /** Hover, focus, click and keyboard all behave identically for a zone. */
  const zone = (id: ComponentId) => ({
    tabIndex: 0,
    role: 'link',
    'aria-label': `${componentById(id).label} — ${componentById(id).discipline}`,
    className: 'cursor-pointer outline-none',
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(id),
    onBlur: () => setHovered(null),
    onClick: () => activate(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(id);
      }
    },
  });

  const active = hovered ? componentById(hovered) : null;

  return (
    <div className="flex w-full flex-col items-center">
      <svg
        viewBox="0 0 680 250"
        className="h-auto w-full"
        role="group"
        aria-label="K-01 — interactive component diagram"
      >
        {/* ground reference */}
        <line x1="20" y1="214" x2="660" y2="214" stroke="var(--color-line)" strokeWidth="1" />
        <g stroke="var(--color-line)" strokeWidth="0.6" opacity="0.6">
          {Array.from({ length: 17 }, (_, i) => 20 + i * 40).map((x) => (
            <line key={x} x1={x} y1="214" x2={x - 7} y2="221" />
          ))}
        </g>

        {/* ── wheels (structure, not a zone) ─────────────────────────── */}
        {[165, 505].map((cx) => (
          <g key={cx}>
            <circle
              cx={cx}
              cy="166"
              r="46"
              fill="rgba(255,255,255,0.025)"
              stroke="var(--color-line-strong)"
              strokeWidth="1.2"
            />
            <circle cx={cx} cy="166" r="25" fill="var(--color-void)" stroke="var(--color-line)" strokeWidth="1" />
            <circle cx={cx} cy="166" r="9" fill="none" stroke="var(--color-line)" strokeWidth="1" />
            <g stroke="var(--color-line)" strokeWidth="0.7">
              {[0, 60, 120].map((deg) => {
                const r = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={cx - Math.cos(r) * 24}
                    y1={166 - Math.sin(r) * 24}
                    x2={cx + Math.cos(r) * 24}
                    y2={166 + Math.sin(r) * 24}
                  />
                );
              })}
            </g>
          </g>
        ))}

        {/* ── 1. wings — AERODYNAMICS ────────────────────────────────── */}
        <g {...zone('aerodynamics')}>
          {/* rear wing */}
          <rect x="32" y="74" width="94" height="11" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1.2" />
          <rect x="38" y="60" width="82" height="8" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1.1" />
          <rect x="24" y="54" width="9" height="104" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1.2" />
          <path d="M74,85 L78,150 L92,150 L88,85 Z" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1" />
          {/* front wing */}
          <rect x="556" y="184" width="104" height="10" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1.2" />
          <rect x="572" y="171" width="80" height="7" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1.1" />
          <rect x="652" y="158" width="9" height="48" fill={fill('aerodynamics')} stroke={stroke('aerodynamics')} strokeWidth="1.2" />
        </g>

        {/* ── 2. diffuser — RESEARCH DIVISION ────────────────────────── */}
        <g {...zone('research-division')}>
          <path d="M126,176 L58,188 L58,204 L126,194 Z" fill={fill('research-division')} stroke={stroke('research-division')} strokeWidth="1.2" />
          <g stroke={stroke('research-division')} strokeWidth="0.7">
            <line x1="78" y1="185" x2="78" y2="201" />
            <line x1="94" y1="182" x2="94" y2="198" />
            <line x1="110" y1="179" x2="110" y2="196" />
          </g>
        </g>

        {/* ── 3. engine cover — POWER UNIT ───────────────────────────── */}
        <g {...zone('power-unit')}>
          <path
            d="M126,192 L124,148 L286,126 L336,120 L342,178 L300,186 L126,192 Z"
            fill={fill('power-unit')}
            stroke={stroke('power-unit')}
            strokeWidth="1.2"
          />
          {/* airbox / roll hoop */}
          <path d="M330,120 L348,92 L374,97 L360,122 Z" fill={fill('power-unit')} stroke={stroke('power-unit')} strokeWidth="1.2" />
          <g stroke={stroke('power-unit')} strokeWidth="0.7">
            <line x1="150" y1="156" x2="150" y2="188" />
            <line x1="176" y1="152" x2="176" y2="188" />
            <line x1="202" y1="148" x2="202" y2="188" />
          </g>
          {isOn('power-unit') && (
            <circle r="2.6" fill="var(--color-accent)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M336,134 L134,166" />
            </circle>
          )}
        </g>

        {/* ── 4. sidepod — TELEMETRY ─────────────────────────────────── */}
        <g {...zone('telemetry')}>
          <path d="M300,142 L392,138 L400,180 L302,188 Z" fill={fill('telemetry')} stroke={stroke('telemetry')} strokeWidth="1.2" />
          <g stroke={stroke('telemetry')} strokeWidth="0.7">
            <line x1="384" y1="146" x2="316" y2="150" />
            <line x1="386" y1="157" x2="314" y2="161" />
            <line x1="388" y1="168" x2="312" y2="172" />
          </g>
        </g>

        {/* ── 5. cockpit + halo — CONTROL SYSTEM ─────────────────────── */}
        <g {...zone('control-system')}>
          <path d="M348,120 L432,128 L436,146 L352,142 Z" fill={fill('control-system')} stroke={stroke('control-system')} strokeWidth="1.2" />
          {/* helmet */}
          <path d="M368,122 A15,15 0 0,1 398,125 L398,132 L368,130 Z" fill="var(--color-void)" stroke={stroke('control-system')} strokeWidth="1.1" />
          {/* halo */}
          <path d="M352,118 Q392,96 434,124" fill="none" stroke={stroke('control-system')} strokeWidth="1.6" />
          <line x1="428" y1="120" x2="430" y2="132" stroke={stroke('control-system')} strokeWidth="1.3" />
        </g>

        {/* ── 6. nose — BODYWORK ─────────────────────────────────────── */}
        <g {...zone('bodywork')}>
          <path d="M432,130 L604,152 L626,158 L626,172 L602,175 L436,178 Z" fill={fill('bodywork')} stroke={stroke('bodywork')} strokeWidth="1.2" />
          <line x1="470" y1="140" x2="600" y2="158" stroke={stroke('bodywork')} strokeWidth="0.7" />
          {/* front wing pylons */}
          <g stroke={stroke('bodywork')} strokeWidth="1">
            <line x1="600" y1="175" x2="598" y2="185" />
            <line x1="622" y1="174" x2="620" y2="185" />
          </g>
        </g>

        {/* ── callouts ───────────────────────────────────────────────
            At phone widths the 8px labels are below the legibility floor, so
            they are hidden and the tappable list below carries the same links. */}
        {CALLOUTS.map((c) => {
          const comp = componentById(c.id);
          const on = isOn(c.id);
          const railY = c.rail === 'top' ? TOP_RAIL : BOTTOM_RAIL;
          const color = on ? 'var(--color-accent)' : 'var(--color-line)';
          return (
            <g key={c.id} className="pointer-events-none hidden sm:[display:inline]">
              <line
                x1={c.from[0]}
                y1={c.from[1]}
                x2={c.from[0]}
                y2={railY + (c.rail === 'top' ? 4 : -4)}
                stroke={color}
                strokeWidth="0.7"
                strokeDasharray="2 3"
              />
              <circle cx={c.from[0]} cy={c.from[1]} r={on ? 2.6 : 1.6} fill={on ? 'var(--color-accent)' : 'var(--color-faint)'} />
              <text
                x={c.labelX}
                y={railY}
                textAnchor={c.anchor}
                fill={on ? 'var(--color-accent)' : 'var(--color-faint)'}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8.5px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                {comp.label}
              </text>
            </g>
          );
        })}

        {/* designation */}
        <text
          x="660"
          y="34"
          textAnchor="end"
          fill="var(--color-muted)"
          style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.06em' }}
        >
          K-01
        </text>
      </svg>

      {/* Readout for the hovered zone. Fixed height so the layout never shifts
          as the visitor moves across the car. Pointer devices only — on touch
          there is no hover, so the list below does this job instead. */}
      <div className="mt-5 hidden min-h-[5rem] w-full max-w-lg border-t border-line pt-4 text-center sm:block">
        {active ? (
          <>
            <p className="label-tech text-accent">
              {active.label} — {active.discipline}
            </p>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">{active.description}</p>
          </>
        ) : (
          <p className="label-tech">Select a component to explore that discipline</p>
        )}
      </div>

      {/* Touch equivalent of the callouts. */}
      <ul className="mt-6 w-full border-t border-line sm:hidden">
        {carComponents.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => navigate(c.href)}
              className="flex w-full items-baseline gap-4 border-b border-line py-3.5 text-left"
            >
              <span className="label-tech-sm w-4 shrink-0 text-accent">›</span>
              <span className="min-w-0 flex-1">
                <span className="mono block text-[0.8125rem] text-ink">{c.label}</span>
                <span className="label-tech-sm mt-1 block">{c.discipline}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
