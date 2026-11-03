import * as THREE from 'three';

/**
 * The Kaushal GP night circuit, as data. The 3D scene, the HUD minimap and
 * the sector readout all sample this one curve, so the dot on the map is
 * always where the car is.
 *
 * Coordinates are metres on the ground plane (x, z). The start/finish line
 * sits at t = 0 on the main straight; the car runs in increasing t.
 */
const CONTROL: [number, number][] = [
  [0, 0],
  [130, 0],
  [240, 0],
  [300, -24],
  [318, -78],
  [282, -124],
  [214, -134],
  [172, -176],
  [186, -238],
  [252, -262],
  [306, -306],
  [286, -366],
  [204, -386],
  [106, -364],
  [44, -322],
  [-18, -284],
  [-86, -304],
  [-158, -334],
  [-228, -302],
  [-258, -232],
  [-236, -162],
  [-186, -120],
  [-156, -58],
  [-118, -4],
  [-60, 0],
];

export const TRACK_WIDTH = 15;

export const curve = new THREE.CatmullRomCurve3(
  CONTROL.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  true,
  'centripetal',
);

export const LAP_LENGTH = curve.getLength();

/** Where the car sits on the grid, just behind the line. */
export const GRID_T = 1 - 9 / LAP_LENGTH;

/** Fraction of the lap the page covers, so the finish lands on the line. */
export const RACE_SPAN = 9 / LAP_LENGTH + 0.995;

export const SECTORS = [0, 1 / 3, 2 / 3] as const;

/** Car track position for page progress p in [0, 1]. */
export function carT(p: number): number {
  return (GRID_T + p * RACE_SPAN) % 1;
}

export function sectorAt(t: number): 0 | 1 | 2 {
  return t < SECTORS[1] ? 0 : t < SECTORS[2] ? 1 : 2;
}

/** A 2D outline for the minimap, fitted into a 100×100 box. */
export function outline(samples = 220) {
  const pts = curve.getSpacedPoints(samples);
  const xs = pts.map((p) => p.x);
  const zs = pts.map((p) => p.z);
  const minX = Math.min(...xs);
  const minZ = Math.min(...zs);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...zs) - minZ);
  const pad = 6;
  const s = (100 - pad * 2) / span;
  const project = (v: THREE.Vector3) => ({
    x: pad + (v.x - minX) * s,
    y: pad + (v.z - minZ) * s,
  });
  const d =
    pts
      .map((v, i) => {
        const { x, y } = project(v);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ') + ' Z';
  return { d, project: (t: number) => project(curve.getPointAt(t)) };
}
