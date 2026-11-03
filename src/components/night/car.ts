import * as THREE from 'three';

/**
 * The K-01, built from primitives. Forward is +Z, up is +Y, units are
 * metres — 5.6 m long and 2 m wide, roughly to a modern open-wheel scale.
 *
 * Livery follows the site: F1 red body, white nose and spine, carbon
 * aerodynamics, the team number on the engine cover.
 */

const red = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xd80500,
    roughness: 0.28,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
const white = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xd9d9dc,
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
const carbon = () => new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.45, metalness: 0.5 });

function box(w: number, h: number, l: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat);
  m.position.set(x, y, z);
  return m;
}

/** Side-profile extrusion: points are (z, y) in car space, extruded across x. */
function profile(points: [number, number][], width: number, mat: THREE.Material) {
  const shape = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(-z, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 2,
  });
  g.rotateY(Math.PI / 2);
  g.translate(-width / 2, 0, 0);
  return new THREE.Mesh(g, mat);
}

function numberDecal(text: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.font = 'italic 900 92px "Titillium Web", Arial, sans-serif';
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.fillText(text, 128, 98);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4 });
}

export function buildCar() {
  const group = new THREE.Group();
  const body = red();
  const accent = white();
  const cf = carbon();

  // Floor and plank
  group.add(box(1.75, 0.05, 4.4, cf, 0, 0.1, -0.15));

  // Monocoque and cockpit surround
  group.add(profile([[1.5, 0.22], [1.5, 0.62], [0.95, 0.74], [0.2, 0.78], [-0.4, 0.6], [-0.4, 0.22]], 0.82, body));

  // Nose cone, tapering into the front wing
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 1.5, 18), accent);
  nose.rotation.x = Math.PI / 2;
  nose.scale.set(1, 1, 0.62);
  nose.position.set(0, 0.36, 2.2);
  group.add(nose);

  // Front wing: three elements and red endplates
  group.add(box(1.95, 0.04, 0.42, cf, 0, 0.12, 2.82));
  group.add(box(1.7, 0.035, 0.22, cf, 0, 0.2, 2.68));
  group.add(box(1.5, 0.03, 0.16, body, 0, 0.27, 2.56));
  for (const s of [1, -1]) group.add(box(0.04, 0.28, 0.6, body, s * 0.98, 0.22, 2.74));

  // Sidepods with undercut, white accent stripe
  for (const s of [1, -1]) {
    const pod = profile([[1.05, 0.2], [1.05, 0.62], [0.2, 0.66], [-1.25, 0.42], [-1.25, 0.2]], 0.5, body);
    pod.position.x = s * 0.66;
    group.add(pod);
    group.add(box(0.02, 0.06, 1.6, accent, s * 0.935, 0.52, 0.0));
    // inlet
    group.add(box(0.46, 0.3, 0.06, cf, s * 0.66, 0.44, 1.08));
  }

  // Engine cover and shark fin, with the airbox above the driver
  const spine = profile(
    [[0.35, 0.6], [0.3, 1.0], [-0.1, 1.04], [-1.4, 0.72], [-2.05, 0.44], [-2.05, 0.3], [-0.4, 0.3]],
    0.5,
    accent,
  );
  group.add(spine);
  group.add(profile([[-0.6, 0.85], [-0.4, 1.08], [-1.9, 1.02], [-1.9, 0.6]], 0.03, body));
  group.add(box(0.36, 0.22, 0.12, cf, 0, 0.98, 0.36));

  for (const s of [1, -1]) {
    const num = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), numberDecal('01'));
    num.position.set(s * 0.272, 0.68, -0.85);
    num.rotation.y = s * (Math.PI / 2);
    group.add(num);
  }

  // Driver: white helmet, dark visor band
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), accent);
  helmet.position.set(0, 0.86, 0.72);
  group.add(helmet);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 24, 8, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.4, Math.PI * 0.16),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.9 }),
  );
  visor.position.copy(helmet.position);
  group.add(visor);

  // Halo
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 28, Math.PI), cf);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 1.02, 0.62);
  group.add(halo);
  const pillar = box(0.05, 0.3, 0.05, cf, 0, 0.88, 1.02);
  pillar.rotation.x = -0.35;
  group.add(pillar);

  // Rear wing, DRS flap and endplates
  group.add(box(1.0, 0.05, 0.38, cf, 0, 0.98, -2.3));
  group.add(box(1.0, 0.04, 0.22, body, 0, 1.12, -2.42));
  for (const s of [1, -1]) group.add(box(0.04, 0.62, 0.62, body, s * 0.52, 0.86, -2.33));
  group.add(box(0.06, 0.5, 0.1, cf, 0, 0.7, -2.15));
  // diffuser
  const diff = box(1.0, 0.04, 0.5, cf, 0, 0.2, -2.3);
  diff.rotation.x = -0.25;
  group.add(diff);

  // Rain light
  const rearLamp = new THREE.MeshStandardMaterial({
    color: 0x330000,
    emissive: 0xff1a10,
    emissiveIntensity: 4,
  });
  group.add(box(0.12, 0.1, 0.04, rearLamp, 0, 0.62, -2.62));

  // Wheels: rubber, a red soft-compound band and a dark rim
  const wheels: THREE.Object3D[] = [];
  const tyre = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.92 });
  const band = new THREE.MeshStandardMaterial({ color: 0xe10600, emissive: 0xe10600, emissiveIntensity: 0.25 });
  const rim = new THREE.MeshStandardMaterial({ color: 0x2a2c31, metalness: 0.85, roughness: 0.3 });
  const spec: [number, number, number, number][] = [
    [0.86, 0.34, 1.78, 0.36],
    [-0.86, 0.34, 1.78, 0.36],
    [0.84, 0.36, -1.6, 0.44],
    [-0.84, 0.36, -1.6, 0.44],
  ];
  for (const [x, y, z, w] of spec) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(y, y, w, 30), tyre);
    t.rotation.z = Math.PI / 2;
    pivot.add(t);
    for (const side of [1, -1]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(y * 0.8, 0.018, 6, 30), band);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = side * (w / 2 + 0.002);
      pivot.add(ring);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(y * 0.6, y * 0.6, 0.02, 6), rim);
      hub.rotation.z = Math.PI / 2;
      hub.position.x = side * (w / 2 + 0.004);
      pivot.add(hub);
    }
    group.add(pivot);
    wheels.push(pivot);

    // Suspension wishbones
    const arm = box(Math.abs(x) - 0.35, 0.03, 0.05, cf, Math.sign(x) * (Math.abs(x) + 0.35) / 2, y + 0.06, z);
    group.add(arm);
    const arm2 = box(Math.abs(x) - 0.35, 0.03, 0.05, cf, Math.sign(x) * (Math.abs(x) + 0.35) / 2, y - 0.08, z + 0.12);
    group.add(arm2);
  }

  // Contact shadow
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sg = sc.getContext('2d')!;
  const grad = sg.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  return {
    group,
    rearLamp,
    /** Roll the wheels by distance travelled this frame. */
    spin(metres: number) {
      wheels.forEach((w, i) => {
        const r = i < 2 ? 0.34 : 0.36;
        w.rotation.x += metres / r;
      });
    },
  };
}
