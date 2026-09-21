import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  Mesh,
  InstancedMesh,
  BufferGeometry,
  BufferAttribute,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  Line,
  LineSegments,
  LineBasicMaterial,
  DirectionalLight,
  HemisphereLight,
  Color,
  Object3D,
  Vector3,
  PMREMGenerator,
  ACESFilmicToneMapping,
  DoubleSide,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { contourSegments } from "./contours.js";
import {
  COUNT,
  element,
  field,
  nodePosition,
  GROUPS,
  STARTS,
  SIZES,
  stageBlend,
} from "./forms.js";
import { clamp, mix, bell, interval, MOTION } from "./motion.js";
import { apps } from "./apps.js";

const CAMERAS = [
  [0, 3.8, 11.8, 0, 0, 0],
  [-0.6, 1.5, 12.8, 0, 0.5, 0],
  [0, 0, 14, 0, 0, 0],
  [1.8, 1.4, 7.8, 0, 0, 0],
  [0, 3.4, 15.5, 0, 0, 0],
  [1.3, 1.6, 11.5, 0, 0, 0],
  [0, 0.3, 10.8, 0, 0, 0],
  [0.5, 5.2, 10.4, 0, 0, 0],
  [1.9, 8.2, 10.5, 0, 0, 0.2],
  [-1.2, 7.2, 10.4, 0, 0, 0.2],
  [0, 1, 11.8, 0, 0, 0],
  [0, 0.6, 11.5, 0, 0, 0],
  [0, 1.1, 17.8, 0, -0.4, 0],
  [0, 1.8, 19, 0, -0.4, 0],
];
export function createWorld(host) {
  const canvas = document.createElement("canvas");
  let context;
  try {
    context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {}
  const scene = new Scene(),
    camera = new PerspectiveCamera(38, 1, 0.1, 100),
    rig = new Group();
  scene.add(rig);
  const dummy = new Object3D(),
    color = new Color(),
    projector = new Vector3();
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.72,
    roughness: 0.29,
  });
  const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);
  const pieces = new InstancedMesh(geometry, material, COUNT);
  pieces.frustumCulled = false;
  rig.add(pieces);
  const warm = new Color("#d9a77a"),
    silver = new Color("#8a9da4"),
    cool = new Color("#638a93");
  const key = new DirectionalLight(0xffecd7, 2.4);
  key.position.set(-3, 6, 8);
  scene.add(key);
  const rim = new DirectionalLight(0x9bbecb, 2.2);
  rim.position.set(5, 0, -3);
  scene.add(rim);
  scene.add(new HemisphereLight(0xd9e6ec, 0x182125, 1.2));
  let renderer,
    env,
    pmrem,
    svg,
    paths = [],
    lost = false,
    width = 1,
    height = 1,
    mobile = false,
    last = 0,
    frames = 0;
  if (context) {
    renderer = new WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x080b0d, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    env = pmrem.fromScene(room, 0.025);
    room.dispose();
    scene.environment = env.texture;
    host.append(canvas);
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      lost = true;
      makeFallback();
      host.dispatchEvent(new Event("worldrestore"));
    });
    canvas.addEventListener("webglcontextrestored", () => {
      lost = false;
      svg?.remove();
      svg = null;
      host.dispatchEvent(new Event("worldrestore"));
    });
  } else makeFallback();
  function makeFallback() {
    if (svg) return;
    paths = [];
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "-7 -5 14 10");
    svg.classList.add("fallback-world");
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElementNS(svg.namespaceURI, "path");
      p.setAttribute("stroke", i % 12 === 0 ? "#d9a77a" : "#9bafb5");
      p.setAttribute("stroke-width", ".055");
      svg.append(p);
      paths.push(p);
    }
    host.append(svg);
  }

  // A real surface is grown from the same spatial samples. No screenshot texture.
  const resolution = 64,
    surfacePositions = [],
    surfaceIndices = [],
    surfaceColors = [];
  for (let r = 0; r <= resolution; r++)
    for (let a = 0; a <= resolution; a++) {
      const radius = (r / resolution) * 2.75,
        angle = (a / resolution) * Math.PI * 2;
      surfacePositions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      );
      surfaceColors.push(0.3, 0.5, 0.55);
      if (r < resolution && a < resolution) {
        const k = r * (resolution + 1) + a;
        surfaceIndices.push(
          k,
          k + 1,
          k + resolution + 1,
          k + 1,
          k + resolution + 2,
          k + resolution + 1,
        );
      }
    }
  const surfaceGeo = new BufferGeometry();
  surfaceGeo.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(surfacePositions), 3),
  );
  surfaceGeo.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(surfaceColors), 3),
  );
  surfaceGeo.setIndex(surfaceIndices);
  const surfaceMat = new MeshPhysicalMaterial({
    vertexColors: true,
    metalness: 0.24,
    roughness: 0.58,
    envMapIntensity: 0.28,
    side: DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    clearcoat: 0.05,
  });
  const surface = new Mesh(surfaceGeo, surfaceMat);
  rig.add(surface);
  const contourSource = contourSegments(field);
  const contourPositions = new Float32Array(contourSource.length),
    contourGeo = new BufferGeometry();
  contourGeo.setAttribute("position", new BufferAttribute(contourPositions, 3));
  const contourMat = new LineBasicMaterial({
    color: 0xbce0df,
    transparent: true,
    opacity: 0,
  });
  const contours = new LineSegments(contourGeo, contourMat);
  rig.add(contours);
  // One continuous guide: comparison links, measurement axes, diagnosis and terraces.
  const guideGeo = new BufferGeometry(),
    guidePositions = new Float32Array(720 * 3);
  guideGeo.setAttribute("position", new BufferAttribute(guidePositions, 3));
  const guideMat = new LineBasicMaterial({
    color: 0x93adb5,
    transparent: true,
    opacity: 0.32,
  });
  const guides = new LineSegments(guideGeo, guideMat);
  guides.frustumCulled = false;
  rig.add(guides);
  const relationGeo = new BufferGeometry();
  relationGeo.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(16 * 6), 3),
  );
  const relationMat = new LineBasicMaterial({
    color: 0xd8a57a,
    transparent: true,
    opacity: 0.75,
  });
  const relations = new LineSegments(relationGeo, relationMat);
  rig.add(relations);
  const carrierGeo = new BufferGeometry();
  carrierGeo.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(101 * 3), 3),
  );
  const carrier = new Line(
    carrierGeo,
    new LineBasicMaterial({ color: 0xd6a57b, transparent: true, opacity: 0.8 }),
  );
  rig.add(carrier);
  const nodeCoordinates = Array.from({ length: 16 }, () => [0, 0]);
  function resize() {
    const b = host.getBoundingClientRect();
    width = b.width;
    height = b.height;
    mobile = width < 701 || (height < 440 && width < 1100);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    if (renderer) {
      const d = Math.min(
        devicePixelRatio,
        mobile ? 1.5 : 2,
        Math.sqrt(3200000 / (width * height)),
      );
      renderer.setPixelRatio(d);
      renderer.setSize(width, height, false);
    }
  }
  let cameraReady = false,
    previousP = -1,
    previousGroup = -1,
    previousSelection = "",
    lastSurface = -1;
  function render({
    progress: p,
    px = 0,
    py = 0,
    velocity = 0,
    time = 0,
    reduced = false,
    intro = 1,
    group = 0,
    selected = null,
  }) {
    frames++;
    const dt = Math.min(50, time - last || 16);
    last = time;
    const [a, b, t] = stageBlend(p),
      ca = CAMERAS[a],
      cb = CAMERAS[b];
    const map = interval(p, 11.25, 12),
      exit = interval(p, 12.4, 13),
      opening = 1 - interval(p, 0.25, 1);
    const cameraTarget = new Vector3(
      mix(ca[0], cb[0], t) + (reduced ? 0 : px * 0.25),
      mix(ca[1], cb[1], t) + (reduced ? 0 : py * 0.16),
      mix(ca[2], cb[2], t),
    );
    if (!mobile)
      cameraTarget.z *= mix(1, Math.max(1, 1.2 / camera.aspect), map);
    if (mobile) {
      const portrait = height >= 450;
      cameraTarget.x = mix(cameraTarget.x, 0, portrait ? 1 : map);
      cameraTarget.y *= mix(1, 0.45, portrait ? 1 : map);
      cameraTarget.z = mix(
        cameraTarget.z * (portrait ? 1.72 : 1),
        portrait ? 21 : 13,
        map,
      );
    }
    const look = new Vector3(
      mix(ca[3], cb[3], t),
      mix(ca[4], cb[4], t),
      mix(ca[5], cb[5], t),
    );
    if (!cameraReady || reduced) camera.position.copy(cameraTarget);
    else camera.position.lerp(cameraTarget, 1 - Math.exp(-dt / MOTION.camera));
    cameraReady = true;
    camera.lookAt(look);
    rig.position.set(
      mobile && height >= 450 ? 0 : mix(2.3, 0, map),
      mobile
        ? mix(height >= 450 ? -1.7 : -0.65 - opening * 0.55, -0.2, map)
        : mix(-0.65 - opening * 0.55, -0.4, map),
      0,
    );
    rig.rotation.set(
      mobile ? -0.08 : mix(-0.12, 0, map),
      reduced ? 0 : px * 0.035,
      opening * -0.24 + (reduced ? 0 : velocity * 0.008),
    );
    rig.scale.setScalar(mix(0.8, 1, intro));
    key.position.x = -3 + px * 2 + (1 - intro) * 9;
    let moving = camera.position.distanceTo(cameraTarget) > 0.002;
    const changed =
      Math.abs(p - previousP) > 0.00004 ||
      group !== previousGroup ||
      selected !== previousSelection ||
      moving ||
      intro < 1;
    if (changed) {
      for (let i = 0; i < COUNT; i++) {
        const from = element(a, i, mobile, group, height < 450),
          to = element(b, i, mobile, group, height < 450),
          v = from.map((n, k) => mix(n, to[k], t));
        // Tool accumulation has a staggered physical arrival inside its own interval.
        if (p > 3 && p < 4) {
          const reveal = interval(
            p,
            3.15 + Math.floor(i / 12) * 0.022,
            3.48 + Math.floor(i / 12) * 0.025,
          );
          v[2] += (1 - reveal) * 2;
        }
        dummy.position.set(v[0], v[1], v[2]);
        dummy.scale.set(v[3], v[4], v[5]);
        dummy.rotation.set(0, 0, v[6]);
        dummy.updateMatrix();
        pieces.setMatrixAt(i, dummy.matrix);
        color.copy(i % 12 === 0 ? warm : silver);
        if (p < 1) color.multiplyScalar(mix(0.16, 1, interval(p, 0.05, 0.9)));
        color.multiplyScalar(1 - bell(p, 1.7, 2, 2.25, 2.85) * 0.82);
        if (mobile && p > 11.5 && GROUPS[Math.floor(i / 12)] !== group)
          dummy.scale.setScalar(0.0001);
        if (p > 11.6 && selected === apps[Math.floor(i / 12)].id)
          dummy.position.z += 0.25;
        dummy.updateMatrix();
        pieces.setMatrixAt(i, dummy.matrix);
        if (p >= 5 && p <= 6.8) {
          const row = Math.floor((i % 96) / 12);
          color.copy(row === 2 || row === 5 ? warm : row === 6 ? cool : silver);
        }
        if (p >= 9.5 && p < 11) {
          const row = Math.floor(i / 24);
          color
            .copy(row === 3 || row === 4 ? warm : cool)
            .multiplyScalar(row === 3 || row === 4 ? 1 : 0.4);
        }
        if (map > 0.7 && selected) {
          const app = apps[Math.floor(i / 12)],
            focus = apps.find((x) => x.id === selected);
          color
            .copy(app.id === selected ? warm : silver)
            .multiplyScalar(
              app.id === selected || focus?.relationships.includes(app.id)
                ? 1
                : 0.28,
            );
        }
        pieces.setColorAt(i, color);
        if (svg) {
          const scale = mobile ? 0.85 : 1;
          paths[i]?.setAttribute(
            "d",
            `M ${v[0] * scale - v[3] / 2} ${-v[1] * scale} h ${Math.max(0.035, v[3])}`,
          );
        }
      }
      pieces.instanceMatrix.needsUpdate = true;
      pieces.instanceColor.needsUpdate = true;
      const growth = interval(p, 7.05, 8.05),
        surfaceVisible = Math.max(
          1 - interval(p, 0.05, 0.85),
          bell(p, 7.05, 7.65, 9.15, 10),
        ),
        thermal = interval(p, 8.35, 9.1);
      surface.visible = surfaceVisible > 0.001;
      contours.visible = surface.visible;
      surfaceMat.opacity = 0.96 * surfaceVisible;
      contourMat.opacity = 0.56 * surfaceVisible * growth;
      if (surface.visible && Math.abs(p - lastSurface) > 0.00004) {
        const pos = surfaceGeo.attributes.position.array,
          colors = surfaceGeo.attributes.color.array;
        for (let j = 0; j < pos.length; j += 3) {
          const x = pos[j],
            y = pos[j + 1],
            h = field(x, y);
          pos[j + 2] = h * growth * 2.1;
          color
            .setRGB(
              0.016 + 0.04 * growth,
              0.03 + 0.09 * growth,
              0.038 + 0.1 * growth,
            )
            .lerp(warm, clamp((h + 0.3) * thermal * 0.38));
          colors[j] = color.r;
          colors[j + 1] = color.g;
          colors[j + 2] = color.b;
        }
        surfaceGeo.attributes.position.needsUpdate = true;
        surfaceGeo.attributes.color.needsUpdate = true;
        surfaceGeo.computeVertexNormals();
        for (let k = 0; k < contourSource.length; k += 3) {
          contourPositions[k] = contourSource[k];
          contourPositions[k + 1] = contourSource[k + 1];
          contourPositions[k + 2] = contourSource[k + 2] * growth * 2.1 + 0.018;
        }
        contourGeo.attributes.position.needsUpdate = true;
        lastSurface = p;
      }
      guidePositions.fill(0);
      let j = 0;
      function segment(x1, y1, z1, x2, y2, z2) {
        if (j + 6 > guidePositions.length) return;
        guidePositions.set([x1, y1, z1, x2, y2, z2], j);
        j += 6;
      }
      if (p >= 4.5 && p < 7) {
        const align = interval(p, 5.05, 6);
        for (let r = 0; r < 8; r++) {
          const left = element(5, r * 12 + 11),
            right = element(5, 96 + r * 12);
          segment(
            left[0],
            left[1],
            mix(0.8, 0, align),
            right[0],
            mix(right[1], left[1], align),
            mix(-1.1, r === 2 || r === 5 ? 0.45 : 0, align),
          );
        }
      }
      if (p >= 6.5 && p < 9.5) {
        segment(-3.4, 0, 0, 3.4, 0, 0);
        segment(0, -3.4, 0, 0, 3.4, 0);
        for (let k = -6; k <= 6; k++) {
          segment(k * 0.5, -0.055, 0, k * 0.5, 0.055, 0);
          segment(-0.055, k * 0.5, 0, 0.055, k * 0.5, 0);
        }
      }
      if (p >= 10.4 && p < 11.65) {
        for (let r = 0; r < 8; r++)
          for (let n = 0; n < 47; n++) {
            const x1 = (n / 47) * 6 - 3,
              x2 = ((n + 1) / 47) * 6 - 3;
            const yy = (x) =>
              (r - 3.5) * 0.46 +
              Math.sin(((x + 3) / 6) * 18 + r) * 0.12 +
              Math.sin(((x + 3) / 6) * 43 + r * 2) * 0.04;
            segment(x1, yy(x1), (r % 2) * 0.15, x2, yy(x2), (r % 2) * 0.15);
          }
      }
      if (p >= 11.5) {
        for (let g = 0; g < 4; g++) {
          if (mobile && g !== group) continue;
          const n = SIZES[g];
          if (!mobile) {
            const first = nodePosition(STARTS[g]);
            segment(-5.65, first[1], -0.12, first[0], first[1], -0.12);
          }
          for (let k = 0; k < n - 1; k++) {
            const aa = nodePosition(STARTS[g] + k, mobile, group, height < 450),
              bb = nodePosition(STARTS[g] + k + 1, mobile, group, height < 450);
            for (let s = 0; s < 12; s++) {
              const u = s / 12,
                v = (s + 1) / 12;
              segment(
                mix(aa[0], bb[0], u),
                mix(aa[1], bb[1], u) - 0.18 * Math.sin(u * Math.PI),
                -0.12,
                mix(aa[0], bb[0], v),
                mix(aa[1], bb[1], v) - 0.18 * Math.sin(v * Math.PI),
                -0.12,
              );
            }
          }
        }
      }
      guideGeo.setDrawRange(0, j / 3);
      guideGeo.attributes.position.needsUpdate = true;
      const carrierArray = carrierGeo.attributes.position.array;
      for (let n = 0; n <= 100; n++) {
        const u = n / 100;
        const introY = 2 - u * 11;
        const mapY = 2.3 - u * 5.2;
        carrierArray[n * 3] = mix(-1.7 + Math.sin(u * 2) * 0.4, -5.65, map);
        carrierArray[n * 3 + 1] = mix(introY, mapY, map);
        carrierArray[n * 3 + 2] = -1.1 + Math.sin(u * Math.PI) * 0.3;
      }
      carrierGeo.attributes.position.needsUpdate = true;
      carrier.material.opacity = mix(0.5, 0.18, exit);
      carrier.visible = !(p > 4.5 && p < 11.5);
      previousP = p;
      previousGroup = group;
      previousSelection = selected;
    }
    rig.updateMatrixWorld();
    camera.updateMatrixWorld();
    for (let i = 0; i < 16; i++) {
      const n = nodePosition(i, mobile, group, height < 450);
      projector
        .set(...n)
        .applyMatrix4(rig.matrixWorld)
        .project(camera);
      nodeCoordinates[i] = [
        (projector.x * 0.5 + 0.5) * width,
        (-projector.y * 0.5 + 0.5) * height,
      ];
    }
    relations.visible = p > 11.5 && !!selected && !mobile;
    if (relations.visible) {
      const focus = apps.find((a) => a.id === selected),
        buf = relationGeo.attributes.position.array;
      let k = 0;
      for (const id of focus?.relationships || []) {
        const to = apps.findIndex((a) => a.id === id);
        if (to < 0) continue;
        buf.set([...nodePosition(focus.index - 1), ...nodePosition(to)], k);
        k += 6;
      }
      relationGeo.setDrawRange(0, k / 3);
      relationGeo.attributes.position.needsUpdate = true;
    }
    if (renderer && !lost) renderer.render(scene, camera);
    const labelPoints =
      {
        1: [
          [-3.5, 3.55, -1.3],
          [-0.1, 3.5, 0],
          [3.2, 3.5, 1.3],
          [-3.6, -2.7, 0],
          [-0.1, -2.3, 0],
          [3.4, -2.2, 1],
        ],
        5: [
          [-2.6, 2.2, 0.8],
          [0.5, 2.2, -1.1],
          [0, -2.3, 0],
        ],
        6: [
          [-2.6, 2.2, 0],
          [0.5, 2.2, 0],
          [-0.3, 0.3, 0],
          [2.8, 0.7, 0.45],
          [2.8, -1.9, 0],
        ],
        7: [
          [-2.3, 2.4, 0],
          [2.3, -2.6, 0],
        ],
        8: [
          [-2.3, 2.5, 0],
          [2.1, -2.65, 0],
        ],
        9: [
          [-2.1, 2.5, 0],
          [2, -2.6, 0],
        ],
        10: [
          [-3.2, 0.3, 0],
          [2.65, 2.2, 0],
          [2.65, -2.1, 0],
        ],
        11: [
          [-2.7, 2.3, 0],
          [1.8, -2.3, 0],
        ],
      }[Math.round(p)] || [];
    const labels = labelPoints.map((n) => {
      projector
        .set(...n)
        .applyMatrix4(rig.matrixWorld)
        .project(camera);
      return [
        (projector.x * 0.5 + 0.5) * width,
        (-projector.y * 0.5 + 0.5) * height,
      ];
    });
    return {
      moving,
      nodes: nodeCoordinates,
      labels,
      mobile,
      frames,
      drawCalls: renderer?.info.render.calls || 0,
      triangles: renderer?.info.render.triangles || 0,
      webgl: !!renderer && !lost,
      pixelRatio: renderer?.getPixelRatio() || 1,
    };
  }
  resize();
  return {
    render,
    resize,
    dispose() {
      geometry.dispose();
      material.dispose();
      surfaceGeo.dispose();
      surfaceMat.dispose();
      contourGeo.dispose();
      contourMat.dispose();
      guideGeo.dispose();
      guideMat.dispose();
      relationGeo.dispose();
      relationMat.dispose();
      carrierGeo.dispose();
      carrier.material.dispose();
      env?.dispose();
      pmrem?.dispose();
      renderer?.dispose();
    },
  };
}
