import { useEffect, useMemo, useState } from 'react';

/**
 * ANTBOT · simulation bay.
 *
 * The inverse kinematics here is the real solution form from the paper —
 * closed-form, geometric, no iterative solver:
 *
 *   θ₁ (coxa)  = atan2(y, x)
 *   θ₂ (femur) = elevation angle + Law of Cosines term
 *   θ₃ (tibia) = Law of Cosines − 90° servo mounting offset
 *
 * Link lengths are not published, so they are exposed as model parameters
 * rather than presented as the robot's dimensions. Everything else — the
 * 3-DOF coxa/femur/tibia chain, the alternating tripod gait, the hardware —
 * is the built machine.
 */

const COXA = 26;
const FEMUR = 55;
const TIBIA = 85;

const DEG = 180 / Math.PI;

interface Solution {
  reachable: boolean;
  theta1: number;
  theta2: number;
  theta3: number;
  /** Planar reach from the coxa joint, and the 3D distance to the target. */
  L: number;
  H: number;
}

function solveIK(x: number, y: number, z: number): Solution {
  const theta1 = Math.atan2(y, x);
  const L = Math.hypot(x, y) - COXA;
  const H = Math.hypot(L, z);

  const reachable = H <= FEMUR + TIBIA && H >= Math.abs(FEMUR - TIBIA) && H > 0;
  if (!reachable) return { reachable, theta1: theta1 * DEG, theta2: 0, theta3: 0, L, H };

  const cos2 = (FEMUR * FEMUR + H * H - TIBIA * TIBIA) / (2 * FEMUR * H);
  const cos3 = (FEMUR * FEMUR + TIBIA * TIBIA - H * H) / (2 * FEMUR * TIBIA);

  const theta2 = Math.atan2(z, L) + Math.acos(Math.min(1, Math.max(-1, cos2)));
  const theta3 = Math.acos(Math.min(1, Math.max(-1, cos3))) - Math.PI / 2;

  return { reachable, theta1: theta1 * DEG, theta2: theta2 * DEG, theta3: theta3 * DEG, L, H };
}

const HARDWARE = [
  { k: 'Microcontroller', v: 'Arduino Mega 2560' },
  { k: 'Leg servos', v: '20× MG996R + 1× MG995' },
  { k: 'Auxiliary', v: '1× SG90 (face)' },
  { k: 'Chassis', v: '5 mm laser-cut acrylic' },
  { k: 'Battery', v: '11.1 V 1800 mAh LiPo' },
  { k: 'Regulation', v: 'DC-DC buck, 5 V logic rail' },
  { k: 'Link', v: 'HC-05 Bluetooth SPP' },
];

/** Tripod A lifts while tripod B carries, then they swap. */
const TRIPOD_A = [0, 3, 4];
const LEG_POSITIONS = [
  { x: -1, y: 1, label: 'L1' },
  { x: -1, y: 0, label: 'L2' },
  { x: -1, y: -1, label: 'L3' },
  { x: 1, y: 1, label: 'R1' },
  { x: 1, y: 0, label: 'R2' },
  { x: 1, y: -1, label: 'R3' },
];

export default function RoboticsBay() {
  const [x, setX] = useState(70);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(-60);
  const [gait, setGait] = useState<'stance' | 'tripod'>('tripod');
  const [phase, setPhase] = useState(0);

  const sol = useMemo(() => solveIK(x, y, z), [x, y, z]);

  useEffect(() => {
    if (gait !== 'tripod') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => setPhase((p) => (p + 1) % 2), 900);
    return () => clearInterval(id);
  }, [gait]);

  // Side-view geometry: the coxa joint sits at the origin of the (L, z) plane.
  const ox = 60;
  const oz = 70;
  const scale = 0.85;
  const kneeAngle = -sol.theta2 / DEG;
  const kneeX = ox + Math.cos(kneeAngle) * FEMUR * scale;
  const kneeY = oz + Math.sin(kneeAngle) * FEMUR * scale;
  const footAngle = kneeAngle + (90 - sol.theta3) / DEG;
  const footX = kneeX + Math.cos(footAngle) * TIBIA * scale;
  const footY = kneeY + Math.sin(footAngle) * TIBIA * scale;

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:gap-14">
      <div>
        {/* ── leg kinematics ───────────────────────────────────────── */}
        <p className="label-tech mb-4">Leg 3-DOF chain — coxa → femur → tibia</p>

        <div className="border border-line">
          <svg viewBox="0 0 300 190" className="h-auto w-full">
            {/* body reference */}
            <line x1="0" y1="70" x2="60" y2="70" stroke="var(--color-line-strong)" strokeWidth="2" />
            <text x="6" y="62" fill="var(--color-faint)" style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.14em' }}>
              BODY
            </text>

            {/* ground */}
            <line x1="0" y1="176" x2="300" y2="176" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 4" />

            {sol.reachable ? (
              <>
                {/* femur */}
                <line x1={ox} y1={oz} x2={kneeX} y2={kneeY} stroke="var(--color-accent)" strokeWidth="2.2" />
                {/* tibia */}
                <line x1={kneeX} y1={kneeY} x2={footX} y2={footY} stroke="var(--color-accent)" strokeWidth="2.2" />
                {/* joints */}
                <circle cx={ox} cy={oz} r="4.5" fill="var(--color-void)" stroke="var(--color-ink)" strokeWidth="1.5" />
                <circle cx={kneeX} cy={kneeY} r="4" fill="var(--color-void)" stroke="var(--color-ink)" strokeWidth="1.5" />
                <circle cx={footX} cy={footY} r="3.5" fill="var(--color-accent)" />

                <text x={ox + 8} y={oz - 8} fill="var(--color-muted)" style={{ fontFamily: 'var(--font-mono)', fontSize: '8px' }}>
                  θ₂ {sol.theta2.toFixed(1)}°
                </text>
                <text x={kneeX + 8} y={kneeY - 6} fill="var(--color-muted)" style={{ fontFamily: 'var(--font-mono)', fontSize: '8px' }}>
                  θ₃ {sol.theta3.toFixed(1)}°
                </text>
              </>
            ) : (
              <text x="150" y="100" textAnchor="middle" fill="var(--color-warn)" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em' }}>
                TARGET OUT OF WORKSPACE
              </text>
            )}
          </svg>
        </div>

        {/* ── target controls ──────────────────────────────────────── */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { label: 'x', value: x, set: setX, min: 20, max: 150 },
            { label: 'y', value: y, set: setY, min: -80, max: 80 },
            { label: 'z', value: z, set: setZ, min: -120, max: 40 },
          ].map((c) => (
            <div key={c.label}>
              <label
                className="label-tech mb-2 flex items-baseline justify-between"
                htmlFor={`ik-${c.label}`}
              >
                Foot target {c.label}
                <span className="mono text-[0.75rem] text-accent">{c.value}</span>
              </label>
              <input
                id={`ik-${c.label}`}
                type="range"
                min={c.min}
                max={c.max}
                value={c.value}
                onChange={(e) => c.set(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          ))}
        </div>

        {/* ── gait ─────────────────────────────────────────────────── */}
        <div className="mt-12">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="label-tech mr-2">Gait</span>
            {(['stance', 'tripod'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGait(g)}
                className={`label-tech-sm border px-2.5 py-1.5 transition-colors ${
                  gait === g
                    ? 'border-accent bg-accent text-void'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                {g === 'stance' ? 'Stance' : 'Alternating tripod'}
              </button>
            ))}
          </div>

          <div className="border border-line p-6">
            <svg viewBox="0 0 260 160" className="mx-auto h-auto w-full max-w-xs">
              {/* chassis */}
              <rect x="105" y="40" width="50" height="80" rx="3" fill="rgba(255,255,255,0.03)" stroke="var(--color-line-strong)" strokeWidth="1.2" />

              {LEG_POSITIONS.map((leg, i) => {
                const inA = TRIPOD_A.includes(i);
                const lifted = gait === 'tripod' && (inA ? phase === 0 : phase === 1);
                const bx = leg.x < 0 ? 105 : 155;
                const by = 60 + (1 - leg.y) * 20;
                const fx = leg.x < 0 ? 46 : 214;
                const fy = by + (lifted ? -9 : 0);
                return (
                  <g key={leg.label}>
                    <line
                      x1={bx}
                      y1={by}
                      x2={fx}
                      y2={fy}
                      stroke={lifted ? 'var(--color-accent)' : 'var(--color-line-strong)'}
                      strokeWidth={lifted ? 2 : 1.4}
                      style={{ transition: 'all 400ms var(--ease-precise)' }}
                    />
                    <circle
                      cx={fx}
                      cy={fy}
                      r={lifted ? 4 : 3}
                      fill={lifted ? 'var(--color-accent)' : 'var(--color-faint)'}
                      style={{ transition: 'all 400ms var(--ease-precise)' }}
                    />
                    <text
                      x={leg.x < 0 ? fx - 8 : fx + 8}
                      y={fy + 3}
                      textAnchor={leg.x < 0 ? 'end' : 'start'}
                      fill={lifted ? 'var(--color-accent)' : 'var(--color-faint)'}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.1em' }}
                    >
                      {leg.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <p className="label-tech-sm mt-5 text-center normal-case">
              {gait === 'stance'
                ? 'All six feet loaded — statically stable at rest.'
                : `Tripod ${phase === 0 ? 'A' : 'B'} in swing · three feet always loaded, so the centre of mass never leaves the support polygon.`}
            </p>
          </div>
        </div>
      </div>

      {/* ── readout ────────────────────────────────────────────────── */}
      <aside className="space-y-8">
        <div className="border border-line p-5">
          <p className="label-tech mb-4 text-accent">Joint solution</p>
          <dl className="space-y-3">
            {[
              { k: 'θ₁ coxa', v: sol.theta1, f: 'atan2(y, x)' },
              { k: 'θ₂ femur', v: sol.theta2, f: 'elevation + Law of Cosines' },
              { k: 'θ₃ tibia', v: sol.theta3, f: 'Law of Cosines − 90°' },
            ].map((r) => (
              <div key={r.k} className="border-b border-line pb-3 last:border-0">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="label-tech-sm">{r.k}</dt>
                  <dd className={`mono text-[1.125rem] ${sol.reachable ? 'text-accent' : 'text-faint'}`}>
                    {sol.reachable ? `${r.v.toFixed(1)}°` : '—'}
                  </dd>
                </div>
                <p className="label-tech-sm mt-1 normal-case">{r.f}</p>
              </div>
            ))}
          </dl>

          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-baseline justify-between">
              <span className="label-tech-sm">Reach H</span>
              <span className="mono text-[0.875rem]">{sol.H.toFixed(1)}</span>
            </div>
            <p className={`mono mt-3 text-[0.8125rem] ${sol.reachable ? 'text-ok' : 'text-warn'}`}>
              {sol.reachable ? 'SOLVED — closed form, no iteration' : 'NO SOLUTION — outside workspace'}
            </p>
          </div>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-2 text-accent">Model parameters</p>
          <p className="label-tech-sm mb-4 normal-case">
            Link lengths are not published; these drive the drawing only.
          </p>
          <dl className="mono space-y-2 text-[0.75rem]">
            {[
              ['Coxa', COXA],
              ['Femur', FEMUR],
              ['Tibia', TIBIA],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between border-b border-line pb-2">
                <dt className="label-tech-sm">{k}</dt>
                <dd className="tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border border-line p-5">
          <p className="label-tech mb-4 text-accent">Hardware</p>
          <dl>
            {HARDWARE.map((h) => (
              <div key={h.k} className="border-b border-line py-2.5 last:border-0">
                <dt className="label-tech-sm mb-1">{h.k}</dt>
                <dd className="mono text-[0.75rem]">{h.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
