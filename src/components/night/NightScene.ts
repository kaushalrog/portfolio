import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildCar } from './car';
import { GRID_T, LAP_LENGTH, TRACK_WIDTH, carT, curve } from './circuit';

/**
 * The homepage night race. Everything is built procedurally at runtime —
 * no models, no image files — so the whole scene ships as code.
 *
 * The page owns time: `setProgress` receives scroll position, the scene
 * eases toward it, and the gap between the two is the car's speed.
 */

export interface SceneFrame {
  /** Eased progress actually rendered, 0..1. */
  p: number;
  /** Track position of the car, 0..1. */
  t: number;
  /** km/h, derived from how fast the car moved this frame. */
  speed: number;
}

interface Options {
  /** Render one still frame per change and skip all idle motion. */
  reducedMotion: boolean;
  /** Lower pixel ratio, no bloom, fewer particles. */
  lowPower: boolean;
  onFrame?: (f: SceneFrame) => void;
}

const UP = new THREE.Vector3(0, 1, 0);

/* ───────────────────────── textures ───────────────────────── */

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const glowTexture = () =>
  canvasTexture(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  });

/* ───────────────────────── ribbons ─────────────────────────
   Every strip that follows the track — asphalt, lines, kerbs, barriers —
   is the same operation: offset the centreline sideways and stitch. */

interface Frame {
  p: THREE.Vector3;
  side: THREE.Vector3;
  dist: number;
  curvature: number;
}

function sampleFrames(n: number): Frame[] {
  const frames: Frame[] = [];
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) tangents.push(curve.getTangentAt((i % n) / n));
  for (let i = 0; i <= n; i++) {
    const t = (i % n) / n;
    const tan = tangents[i]!;
    const prev = tangents[(i - 4 + n) % n]!;
    const next = tangents[(i + 4) % n]!;
    frames.push({
      p: curve.getPointAt(t),
      side: new THREE.Vector3().crossVectors(tan, UP).normalize(),
      dist: (i / n) * LAP_LENGTH,
      curvature: prev.angleTo(next),
    });
  }
  return frames;
}

/** Flat strip between two lateral offsets, from frame a to frame b. */
function flatRibbon(
  frames: Frame[],
  from: number,
  to: number,
  inner: number,
  outer: number,
  y: number,
  vScale: number,
) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = from; i <= to; i++) {
    const f = frames[i]!;
    const a = f.p.clone().addScaledVector(f.side, inner);
    const b = f.p.clone().addScaledVector(f.side, outer);
    pos.push(a.x, y, a.z, b.x, y, b.z);
    uv.push(0, f.dist / vScale, 1, f.dist / vScale);
    if (i < to) {
      const k = (i - from) * 2;
      // Winding chosen so the top face points up whichever side we are on.
      if (outer > inner) idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      else idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Vertical wall following the track at a lateral offset. */
function wallRibbon(frames: Frame[], offset: number, height: number, vScale: number, flip = false) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  frames.forEach((f, i) => {
    const a = f.p.clone().addScaledVector(f.side, offset);
    pos.push(a.x, 0, a.z, a.x, height, a.z);
    const u = ((flip ? -1 : 1) * f.dist) / vScale;
    uv.push(u, 0, u, 1);
    if (i < frames.length - 1) {
      const k = i * 2;
      idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Contiguous runs of frames where the track bends hard enough for kerbs. */
function kerbRuns(frames: Frame[], threshold: number) {
  const runs: [number, number][] = [];
  let start = -1;
  frames.forEach((f, i) => {
    const on = f.curvature > threshold;
    if (on && start < 0) start = i;
    if ((!on || i === frames.length - 1) && start >= 0) {
      if (i - start > 6) runs.push([Math.max(0, start - 4), Math.min(frames.length - 1, i + 4)]);
      start = -1;
    }
  });
  return runs;
}

/* ───────────────────────── camera script ─────────────────────────
   Keyframes in the car's own frame: x = right, y = up, z = forward.
   `look` is where the lens points, also car-relative. */

interface Shot {
  at: number;
  eye: [number, number, number];
  look: [number, number, number];
  fov: number;
}

const SHOTS: Shot[] = [
  { at: 0.0, eye: [-4.2, 1.15, 6.4], look: [0.2, 0.75, 0], fov: 34 },
  { at: 0.07, eye: [-6.5, 1.6, 2.5], look: [0, 0.7, 0.5], fov: 38 },
  { at: 0.2, eye: [0, 2.4, -8.5], look: [0, 1.0, 8], fov: 52 },
  { at: 0.36, eye: [7.5, 1.4, 1.5], look: [0, 0.7, 1.5], fov: 40 },
  { at: 0.52, eye: [-10, 22, -16], look: [0, 0, 6], fov: 46 },
  { at: 0.68, eye: [0.9, 1.05, -3.2], look: [0, 0.9, 14], fov: 62 },
  { at: 0.84, eye: [-8, 2.2, -4], look: [0, 0.6, 2], fov: 38 },
  { at: 1.0, eye: [0, 5.5, 15], look: [0, 0.6, 0], fov: 40 },
];

const smooth = (x: number) => x * x * (3 - 2 * x);

function shotAt(p: number) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1]!.at) i++;
  const a = SHOTS[i]!;
  const b = SHOTS[i + 1]!;
  const k = smooth(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1));
  const mix = (u: number[], v: number[]) => u.map((x, j) => x + (v[j]! - x) * k);
  return { eye: mix(a.eye, b.eye), look: mix(a.look, b.look), fov: a.fov + (b.fov - a.fov) * k };
}

/* ───────────────────────── the scene ───────────────────────── */

export class NightScene {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 4000);
  private car = buildCar();
  private carLight = new THREE.PointLight(0xfff1e0, 70, 40, 1.6);
  private startLamps: THREE.MeshStandardMaterial[] = [];
  private startGlows: THREE.Sprite[] = [];
  private crowd!: THREE.Points;
  private crowdBase!: Float32Array;
  private streaks!: THREE.LineSegments;
  private streakSeeds: { x: number; y: number; z: number }[] = [];
  private rearLamp!: THREE.MeshStandardMaterial;

  private target = 0;
  private p = 0;
  private lastT = GRID_T;
  private speed = 0;
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private camPrimed = false;
  private raf = 0;
  private clock = new THREE.Clock();
  private idleAcc = 0;
  private disposed = false;
  private dirty = true;
  private opts: Options;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, opts: Options) {
    this.canvas = canvas;
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !opts.lowPower,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.background = new THREE.Color(0x04050a);
    this.scene.fog = new THREE.FogExp2(0x070812, 0.0024);

    this.buildWorld();
    this.scene.add(this.car.group);
    this.scene.add(this.carLight);
    this.rearLamp = this.car.rearLamp;

    if (!opts.lowPower) {
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.5, 0.92));
      composer.addPass(new OutputPass());
      this.composer = composer;
    }

    this.resize();
    this.placeCar(GRID_T, 0);
    this.loop();
  }

  /* ── public API ── */

  setProgress(p: number) {
    this.target = THREE.MathUtils.clamp(p, 0, 1);
    this.dirty = true;
  }

  /** Number of red start lamps lit, 0–5. */
  setStartLights(n: number) {
    this.startLamps.forEach((m, i) => {
      m.emissiveIntensity = i < n ? 6 : 0.04;
    });
    this.startGlows.forEach((s, i) => {
      s.visible = Math.floor(i / 2) < n;
    });
    this.dirty = true;
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer?.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => {
        Object.values(m).forEach((v) => v instanceof THREE.Texture && v.dispose());
        m.dispose();
      });
    });
    this.composer?.dispose();
    this.renderer.dispose();
  }

  /* ── world ── */

  private buildWorld() {
    const s = this.scene;
    const lowPower = this.opts.lowPower;

    s.add(new THREE.HemisphereLight(0x5a6a9a, 0x0a0806, 0.9));
    const moon = new THREE.DirectionalLight(0x9fb4ff, 0.7);
    moon.position.set(-300, 400, 200);
    s.add(moon);

    const frames = sampleFrames(lowPower ? 700 : 1200);
    const n = frames.length - 1;
    const half = TRACK_WIDTH / 2;

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(4000, 4000),
      new THREE.MeshStandardMaterial({ color: 0x0b0f0c, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    s.add(ground);

    // Run-off: a wider dark-grey apron under the circuit
    const apron = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.95 });
    s.add(new THREE.Mesh(flatRibbon(frames, 0, n, -half - 9, half + 9, -0.01, 40), apron));

    // Asphalt, with grain and a darker rubbered-in racing line
    const asphaltTex = canvasTexture(256, 512, (g) => {
      g.fillStyle = '#2a2c31';
      g.fillRect(0, 0, 256, 512);
      const rnd = seeded(7);
      for (let i = 0; i < 9000; i++) {
        const v = 30 + rnd() * 40;
        g.fillStyle = `rgba(${v},${v},${v + 4},0.5)`;
        g.fillRect(rnd() * 256, rnd() * 512, 1.5, 1.5);
      }
      const line = g.createLinearGradient(0, 0, 256, 0);
      line.addColorStop(0.25, 'rgba(0,0,0,0)');
      line.addColorStop(0.5, 'rgba(0,0,0,0.32)');
      line.addColorStop(0.75, 'rgba(0,0,0,0)');
      g.fillStyle = line;
      g.fillRect(0, 0, 256, 512);
    });
    asphaltTex.wrapS = asphaltTex.wrapT = THREE.RepeatWrapping;
    s.add(
      new THREE.Mesh(
        flatRibbon(frames, 0, n, -half, half, 0, 24),
        new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.62, metalness: 0.08 }),
      ),
    );

    // White edge lines
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.12,
    });
    s.add(new THREE.Mesh(flatRibbon(frames, 0, n, half - 0.55, half - 0.2, 0.012, 10), lineMat));
    s.add(new THREE.Mesh(flatRibbon(frames, 0, n, -half + 0.2, -half + 0.55, 0.012, 10), lineMat));

    // Kerbs on the bends, both sides
    const kerbTex = canvasTexture(16, 64, (g) => {
      g.fillStyle = '#e10600';
      g.fillRect(0, 0, 16, 32);
      g.fillStyle = '#f2f2f2';
      g.fillRect(0, 32, 16, 32);
    });
    kerbTex.wrapS = kerbTex.wrapT = THREE.RepeatWrapping;
    const kerbMat = new THREE.MeshStandardMaterial({
      map: kerbTex,
      emissive: 0xffffff,
      emissiveMap: kerbTex,
      emissiveIntensity: 0.18,
      roughness: 0.5,
    });
    const kerbs: THREE.BufferGeometry[] = [];
    for (const [a, b] of kerbRuns(frames, 0.12)) {
      kerbs.push(flatRibbon(frames, a, b, half, half + 1.7, 0.03, 3.2));
      kerbs.push(flatRibbon(frames, a, b, -half, -half - 1.7, 0.03, 3.2));
    }
    if (kerbs.length) s.add(new THREE.Mesh(mergeGeometries(kerbs), kerbMat));

    // Start/finish line and grid slots
    const checkerTex = canvasTexture(64, 16, (g) => {
      for (let x = 0; x < 16; x++)
        for (let y = 0; y < 4; y++) {
          g.fillStyle = (x + y) % 2 ? '#0b0b0b' : '#f5f5f5';
          g.fillRect(x * 4, y * 4, 4, 4);
        }
    });
    const startIdx = 0;
    const sf = frames[startIdx]!;
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_WIDTH, 1.6),
      new THREE.MeshStandardMaterial({ map: checkerTex, roughness: 0.6 }),
    );
    line.rotation.x = -Math.PI / 2;
    line.position.copy(sf.p).setY(0.02);
    line.rotation.z = Math.atan2(sf.side.z, sf.side.x) * -1;
    s.add(line);
    for (let k = 1; k <= 6; k++) {
      const t = 1 - (k * 8) / LAP_LENGTH;
      const p = curve.getPointAt(t);
      const side = new THREE.Vector3().crossVectors(curve.getTangentAt(t), UP).normalize();
      const offset = k % 2 ? -3.2 : 3.2;
      const slot = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.22), lineMat);
      slot.rotation.x = -Math.PI / 2;
      slot.rotation.z = -Math.atan2(side.z, side.x);
      slot.position.copy(p).addScaledVector(side, offset).setY(0.02);
      s.add(slot);
    }

    // Barriers, wrapped in team boards
    const boardTex = canvasTexture(2048, 128, (g) => {
      const blocks = ['KAUSHAL GP', 'K-01', 'SEASON 2026', 'BUILD · BREAK · UNDERSTAND · REBUILD'];
      let x = 0;
      let i = 0;
      while (x < 2048) {
        const label = blocks[i % blocks.length]!;
        const red = i % 2 === 0;
        g.font = 'italic 900 68px "Titillium Web", Arial, sans-serif';
        const w = g.measureText(label).width + 120;
        g.fillStyle = red ? '#d10500' : '#f4f4f4';
        g.fillRect(x, 0, w, 128);
        g.fillStyle = red ? '#ffffff' : '#0a0a0b';
        g.fillText(label, x + 60, 90);
        x += w;
        i++;
      }
    });
    boardTex.wrapS = THREE.RepeatWrapping;
    const boardMat = new THREE.MeshStandardMaterial({
      map: boardTex,
      emissive: 0xffffff,
      emissiveMap: boardTex,
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
    });
    // The right-hand wall is seen from its other face, so its boards run backwards.
    s.add(new THREE.Mesh(wallRibbon(frames, half + 10, 1.25, 60, true), boardMat));
    s.add(new THREE.Mesh(wallRibbon(frames, -half - 10, 1.25, 60), boardMat));

    // Floodlight towers and the pools of light they throw on the asphalt
    const glow = glowTexture();
    const poleGeo = new THREE.CylinderGeometry(0.25, 0.35, 28, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1c22, metalness: 0.6, roughness: 0.5 });
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff4dc,
      emissiveIntensity: 5,
    });
    const poolMat = new THREE.MeshBasicMaterial({
      map: glow,
      color: 0xffe9c4,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flareMat = new THREE.SpriteMaterial({
      map: glow,
      color: 0xfff1d6,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const towerEvery = 52;
    const towers = Math.floor(LAP_LENGTH / towerEvery);
    const poles: THREE.BufferGeometry[] = [];
    const heads: THREE.BufferGeometry[] = [];
    for (let i = 0; i < towers; i++) {
      const f = frames[Math.floor((i / towers) * n)]!;
      const dir = i % 2 ? 1 : -1;
      const base = f.p.clone().addScaledVector(f.side, dir * (half + 16));
      poles.push(poleGeo.clone().translate(base.x, 14, base.z));
      const head = base.clone().addScaledVector(f.side, -dir * 1.5).setY(28.5);
      heads.push(new THREE.BoxGeometry(3.6, 1.2, 1.2).translate(head.x, head.y, head.z));

      const flare = new THREE.Sprite(flareMat);
      flare.position.copy(head);
      flare.scale.setScalar(14);
      s.add(flare);

      const pool = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.copy(f.p).addScaledVector(f.side, dir * 3).setY(0.05);
      s.add(pool);
    }
    s.add(new THREE.Mesh(mergeGeometries(poles), poleMat));
    s.add(new THREE.Mesh(mergeGeometries(heads), headMat));

    // Grandstand along the main straight, with a crowd of phone flashes
    const standMat = new THREE.MeshStandardMaterial({ color: 0x16181e, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0d0e12,
      emissive: 0xe10600,
      emissiveIntensity: 0.0,
    });
    const crowdPos: number[] = [];
    const crowdCol: number[] = [];
    const rnd = seeded(42);
    for (let k = 0; k < 4; k++) {
      const t0 = 0.012 + k * 0.03;
      const p = curve.getPointAt(t0);
      const tan = curve.getTangentAt(t0);
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const centre = p.clone().addScaledVector(side, -(half + 26));
      const ang = Math.atan2(tan.x, tan.z);
      const stand = new THREE.Group();
      for (let r = 0; r < 8; r++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(56, 1.2, 2.2), standMat);
        step.position.set(0, 0.6 + r * 1.2, -r * 2.2);
        stand.add(step);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 20), roofMat);
      roof.position.set(0, 14, -8);
      stand.add(roof);
      const fascia = new THREE.Mesh(
        new THREE.BoxGeometry(60, 1.4, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xe10600, emissive: 0xe10600, emissiveIntensity: 1.6 }),
      );
      fascia.position.set(0, 13.2, 2);
      stand.add(fascia);
      stand.position.copy(centre);
      stand.rotation.y = ang - Math.PI / 2;
      // rows of spectators
      stand.updateMatrixWorld();
      const v = new THREE.Vector3();
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < (lowPower ? 40 : 90); c++) {
          v.set(-27 + rnd() * 54, 1.6 + r * 1.2, -r * 2.2 + 0.2).applyMatrix4(stand.matrixWorld);
          crowdPos.push(v.x, v.y, v.z);
          const warm = rnd();
          crowdCol.push(0.25 + warm * 0.2, 0.22 + warm * 0.12, 0.2);
        }
      s.add(stand);
    }
    const crowdGeo = new THREE.BufferGeometry();
    crowdGeo.setAttribute('position', new THREE.Float32BufferAttribute(crowdPos, 3));
    crowdGeo.setAttribute('color', new THREE.Float32BufferAttribute(crowdCol, 3));
    this.crowdBase = new Float32Array(crowdCol);
    this.crowd = new THREE.Points(
      crowdGeo,
      new THREE.PointsMaterial({ size: 0.55, vertexColors: true, sizeAttenuation: true }),
    );
    s.add(this.crowd);

    // Start gantry over the line: five pairs of red lamps
    const gantry = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0x23252c, metalness: 0.7, roughness: 0.4 });
    const postGeo = new THREE.BoxGeometry(0.6, 9, 0.6);
    for (const x of [-half - 1.5, half + 1.5]) {
      const post = new THREE.Mesh(postGeo, steel);
      post.position.set(x, 4.5, 0);
      gantry.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(TRACK_WIDTH + 4, 1.0, 0.8), steel);
    beam.position.set(0, 8.6, 0);
    gantry.add(beam);
    const lampGeo = new THREE.CircleGeometry(0.28, 20);
    const lampGlow = new THREE.SpriteMaterial({
      map: glow,
      color: 0xff1a10,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let i = 0; i < 5; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.5), steel);
      const x = (i - 2) * 1.5;
      box.position.set(x, 7.2, 0.2);
      gantry.add(box);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x220000,
        emissive: 0xff1208,
        emissiveIntensity: 0.04,
      });
      this.startLamps.push(mat);
      for (const y of [7.6, 6.85]) {
        for (const face of [1, -1]) {
          const lamp = new THREE.Mesh(lampGeo, mat);
          lamp.position.set(x, y, 0.2 + face * 0.26);
          if (face < 0) lamp.rotation.y = Math.PI;
          gantry.add(lamp);
        }
        const flare = new THREE.Sprite(lampGlow);
        flare.position.set(x, y, 0.8);
        flare.scale.setScalar(2.4);
        flare.visible = false;
        this.startGlows.push(flare);
        gantry.add(flare);
      }
    }
    gantry.position.copy(sf.p);
    const sfTan = curve.getTangentAt(0);
    gantry.rotation.y = Math.atan2(sfTan.x, sfTan.z);
    s.add(gantry);

    // City skyline ringing the circuit
    const towersByMat: THREE.BufferGeometry[][] = [[], [], []];
    const winMats = [0, 1, 2].map((k) =>
      new THREE.MeshStandardMaterial({
        color: 0x0a0b10,
        emissive: 0xffffff,
        emissiveMap: canvasTexture(64, 128, (g) => {
          g.fillStyle = '#000';
          g.fillRect(0, 0, 64, 128);
          const r = seeded(100 + k);
          const tints = ['#ffd9a0', '#bcd4ff', '#ffffff', '#ff8a6a'];
          for (let y = 4; y < 128; y += 8)
            for (let x = 4; x < 64; x += 8)
              if (r() < 0.32) {
                g.fillStyle = tints[Math.floor(r() * tints.length)]!;
                g.fillRect(x, y, 4, 5);
              }
        }),
        emissiveIntensity: 0.9,
        roughness: 0.8,
      }),
    );
    winMats.forEach((m) => {
      m.emissiveMap!.wrapS = m.emissiveMap!.wrapT = THREE.RepeatWrapping;
    });
    const sky = seeded(9);
    const buildings = lowPower ? 70 : 140;
    for (let i = 0; i < buildings; i++) {
      const a = (i / buildings) * Math.PI * 2 + sky() * 0.04;
      const r = 620 + sky() * 380;
      const w = 18 + sky() * 34;
      const d = 18 + sky() * 30;
      const h = 30 + Math.pow(sky(), 2) * 190;
      const g = new THREE.BoxGeometry(w, h, d);
      const uv = g.getAttribute('uv') as THREE.BufferAttribute;
      for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * (w / 16), uv.getY(j) * (h / 32));
      g.translate(Math.cos(a) * r, h / 2, Math.sin(a) * r - 180);
      towersByMat[i % 3]!.push(g);
    }
    towersByMat.forEach((list, k) => s.add(new THREE.Mesh(mergeGeometries(list), winMats[k])));

    // Stars and a sodium haze on the horizon
    const starPos: number[] = [];
    const sr = seeded(3);
    for (let i = 0; i < (lowPower ? 500 : 1400); i++) {
      const th = sr() * Math.PI * 2;
      const ph = sr() * 0.45 + 0.08;
      const R = 1800;
      starPos.push(R * Math.cos(th) * Math.cos(ph), R * Math.sin(ph), R * Math.sin(th) * Math.cos(ph));
    }
    const stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3)),
      new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: false, fog: false }),
    );
    s.add(stars);
    for (const [x, z, c] of [
      [0, -1400, 0xff5a1f],
      [1300, -300, 0xff3a2a],
      [-1300, -200, 0x5b6cff],
    ] as const) {
      const haze = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glow,
          color: c,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
        }),
      );
      haze.position.set(x, 60, z);
      haze.scale.set(1600, 420, 1);
      s.add(haze);
    }

    // Speed streaks: drawn in camera space, only visible when moving
    const count = lowPower ? 90 : 220;
    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(count * 6), 3));
    const sr2 = seeded(11);
    for (let i = 0; i < count; i++) {
      const ang = sr2() * Math.PI * 2;
      const rad = 3 + sr2() * 12;
      this.streakSeeds.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.6, z: -sr2() * 120 });
    }
    this.streaks = new THREE.LineSegments(
      streakGeo,
      new THREE.LineBasicMaterial({
        color: 0xdfe6ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    );
    this.streaks.frustumCulled = false;
    this.camera.add(this.streaks);
    s.add(this.camera);
  }

  /* ── per-frame ── */

  private placeCar(t: number, travelled: number) {
    const pos = curve.getPointAt(t);
    const ahead = curve.getPointAt((t + 0.002) % 1);
    this.car.group.position.copy(pos);
    this.car.group.lookAt(ahead.x, pos.y, ahead.z);
    this.car.spin(travelled);
    this.carLight.position.copy(pos).setY(14);
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const { reducedMotion } = this.opts;

    // Ease toward the scroll target. The lag is what makes it feel driven.
    const prevP = this.p;
    const ease = reducedMotion ? 1 : 1 - Math.exp(-dt * 2.6);
    this.p += (this.target - this.p) * ease;
    if (Math.abs(this.target - this.p) < 1e-5) this.p = this.target;
    const moving = this.p !== prevP;

    // Idle frames throttle to ~30fps; the crowd and rain light still live.
    this.idleAcc += dt;
    if (!moving && !this.dirty) {
      if (reducedMotion || this.idleAcc < 1 / 30) return;
    }
    this.idleAcc = 0;
    this.dirty = false;

    const t = carT(this.p);
    let dT = t - this.lastT;
    if (dT < -0.5) dT += 1;
    if (dT > 0.5) dT -= 1;
    this.lastT = t;
    const metres = Math.abs(dT) * LAP_LENGTH;
    const instant = dt > 0 ? (metres / dt) * 3.6 * 1.9 : 0;
    this.speed += (Math.min(instant, 342) - this.speed) * (1 - Math.exp(-dt * 6));
    if (this.speed < 0.5) this.speed = 0;

    this.placeCar(t, metres);
    this.updateCamera(t);
    if (!reducedMotion) this.animateAmbient(dt);

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);

    this.opts.onFrame?.({ p: this.p, t, speed: this.speed });
  };

  private updateCamera(t: number) {
    const shot = shotAt(this.p);
    const pos = curve.getPointAt(t);
    const fwd = curve.getTangentAt(t);
    const right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
    const toWorld = (v: number[]) =>
      pos
        .clone()
        .addScaledVector(right, v[0]!)
        .addScaledVector(UP, v[1]!)
        .addScaledVector(fwd, v[2]!);
    const eye = toWorld(shot.eye);
    const look = toWorld(shot.look);

    // Light shake that grows with speed — a camera bolted to something fast.
    if (!this.opts.reducedMotion && this.speed > 40) {
      const k = (this.speed / 340) * 0.05;
      eye.x += (Math.random() - 0.5) * k;
      eye.y += (Math.random() - 0.5) * k;
    }

    if (!this.camPrimed || this.opts.reducedMotion) {
      this.camPos.copy(eye);
      this.camLook.copy(look);
      this.camPrimed = true;
    } else {
      this.camPos.lerp(eye, 0.2);
      this.camLook.lerp(look, 0.25);
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    const fov = shot.fov + (this.speed / 340) * 8;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  private animateAmbient(dt: number) {
    const time = this.clock.elapsedTime;

    // Rain light blinks like the real thing
    this.rearLamp.emissiveIntensity = Math.sin(time * 9) > 0.2 ? 5 : 0.4;

    // Phone flashes in the stands
    const col = this.crowd.geometry.getAttribute('color') as THREE.BufferAttribute;
    const arr = col.array as Float32Array;
    for (let k = 0; k < 24; k++) {
      const i = Math.floor(Math.random() * col.count) * 3;
      const flash = Math.random() < 0.18;
      arr[i] = flash ? 3 : this.crowdBase[i]!;
      arr[i + 1] = flash ? 3 : this.crowdBase[i + 1]!;
      arr[i + 2] = flash ? 3 : this.crowdBase[i + 2]!;
    }
    col.needsUpdate = true;

    // Streaks stretch and brighten with speed
    const v = this.speed / 340;
    const mat = this.streaks.material as THREE.LineBasicMaterial;
    mat.opacity = Math.max(0, v - 0.15) * 0.55;
    if (mat.opacity > 0) {
      const pos = this.streaks.geometry.getAttribute('position') as THREE.BufferAttribute;
      const len = 2 + v * 26;
      this.streakSeeds.forEach((s, i) => {
        s.z += dt * (40 + v * 260);
        if (s.z > -2) s.z -= 120;
        pos.setXYZ(i * 2, s.x, s.y, s.z);
        pos.setXYZ(i * 2 + 1, s.x, s.y, s.z - len);
      });
      pos.needsUpdate = true;
    }
  }
}
