import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  DoubleSide,
  Color,
  Group,
  DirectionalLight,
  HemisphereLight,
  PMREMGenerator,
  Vector3,
  ACESFilmicToneMapping,
  LineSegments,
  LineBasicMaterial,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { STRIPS, SEGMENTS, makeForm, mix, ease, clamp } from "./forms.js";

export async function createWorld(host) {
  // One measured surface opens into separate inputs, then aligned tools.
  // The brand symbol stays in the navigation; it is never motion geometry.
  const forms = ["surface", "friction", "structure", "system"].map((k) =>
    makeForm(k),
  );
  const count = STRIPS * (SEGMENTS + 1) * 2,
    positions = new Float32Array(count * 3),
    colors = new Float32Array(count * 4 * 3);
  const shell = new Float32Array(count * 4 * 3);
  const profile = [
    [-1, -0.6],
    [-0.94, -1],
    [0.94, -1],
    [1, -0.6],
    [1, 0.6],
    [0.94, 1],
    [-0.94, 1],
    [-1, 0.6],
  ];
  positions.set(forms[0]);
  const indices = [];
  for (let i = 0; i < STRIPS; i++)
    for (let j = 0; j < SEGMENTS; j++) {
      const a = i * (SEGMENTS + 1) * 8 + j * 8;
      for (let k = 0; k < 8; k++) {
        const n = (k + 1) % 8;
        indices.push(a + k, a + 8 + k, a + n, a + n, a + 8 + k, a + 8 + n);
      }
    }
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  let renderer,
    svg,
    svgPaths = [];
  const scene = new Scene(),
    camera = new PerspectiveCamera(36, 1, 0.1, 100),
    rig = new Group();
  scene.add(rig);
  camera.position.z = 12.8;
  const geo = new BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute("position", new BufferAttribute(shell, 3));
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.86,
    roughness: 0.3,
    side: DoubleSide,
    vertexColors: true,
  });
  const mesh = new Mesh(geo, material);
  mesh.frustumCulled = false;
  rig.add(mesh);
  const projection = new Vector3();
  const connectorPoints = new Float32Array(8 * 6),
    connectorGeo = new BufferGeometry();
  connectorGeo.setAttribute(
    "position",
    new BufferAttribute(connectorPoints, 3),
  );
  const connectors = new LineSegments(
    connectorGeo,
    new LineBasicMaterial({
      color: 0x667575,
      transparent: true,
      opacity: 0.55,
    }),
  );
  rig.add(connectors);
  const labels = document.createElement("div");
  labels.className = "world-labels";
  host.append(labels);
  const labelElements = Array.from({ length: 4 }, () => {
    const el = document.createElement("span");
    labels.append(el);
    return el;
  });
  let env, pmrem;
  if (context) {
    renderer = new WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x090b0c, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    env = pmrem.fromScene(room, 0.025);
    room.dispose();
    scene.environment = env.texture;
    const key = new DirectionalLight(0xf3e6d9, 2.6);
    key.position.set(-3, 5, 7);
    scene.add(key);
    const rim = new DirectionalLight(0xb7c9d4, 2);
    rim.position.set(4, 1, -2);
    scene.add(rim);
    scene.add(new HemisphereLight(0xe8e6de, 0x202629, 1.2));
    host.append(canvas);
    document.documentElement.classList.add("webgl");
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      document.documentElement.classList.remove("webgl");
    });
    canvas.addEventListener("webglcontextrestored", () => {
      document.documentElement.classList.add("webgl");
      host.dispatchEvent(new Event("worldrestore"));
    });
  } else {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "-4.5 -3.5 9 7");
    svg.style.cssText = "width:100%;height:100%;overflow:visible";
    for (let i = 0; i < 16; i++) {
      const p = document.createElementNS(svg.namespaceURI, "path");
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", i === 10 ? "#d69c79" : "#9babab");
      p.setAttribute("stroke-width", ".025");
      svg.append(p);
      svgPaths.push(p);
    }
    host.append(svg);
  }
  const pale = new Color("#7f9197"),
    accent = new Color("#b88255"),
    dark = new Color("#627c85"),
    brandColor = new Color("#586973");
  let rect,
    atlasForm = forms[3],
    selectedKey = "",
    selectedForm = forms[3],
    target = forms[0],
    lastTime = 0,
    frames = 0,
    lastColorKey = "",
    baseZ = 12.8;
  const scratch = new Float32Array(positions.length);
  function recolor(progress, selected) {
    const colorKey =
      (progress < 0.4 ? "opening" : "default") +
      (selected?.visualConcept || "");
    if (colorKey === lastColorKey) return;
    lastColorKey = colorKey;
    for (let i = 0; i < count * 4; i++) {
      const strip = Math.floor(i / ((SEGMENTS + 1) * 8)),
        special = selected?.visualConcept === "comparison";
      const c =
        progress < 0.4
          ? brandColor
          : (special ? strip === 10 || strip === 13 : strip === 10)
            ? accent
            : strip % 3 === 0
              ? dark
              : pale;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
  }
  function resize() {
    rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    baseZ = Math.max(12.8, 9.4 / camera.aspect);
    camera.position.z = baseZ;
    camera.updateProjectionMatrix();
    if (renderer) {
      const dpr = Math.min(
        devicePixelRatio,
        innerWidth < 701 ? 1.6 : 2,
        Math.sqrt(3400000 / (rect.width * rect.height)),
      );
      renderer.setPixelRatio(Math.max(0.75, dpr));
      renderer.setSize(rect.width, rect.height, false);
    }
    atlasForm = forms[3];
  }
  resize();
  if (renderer) {
    // Compile the sheet and connector programs before the first scroll.
    geo.computeVertexNormals();
    material.transparent = true;
    await renderer.compileAsync(scene, camera);
    material.transparent = false;
    material.needsUpdate = true;
    await renderer.compileAsync(scene, camera);
  }
  function render({
    progress,
    selected,
    study,
    px,
    py,
    velocity,
    reduced,
    time,
    intro = 1,
    scenePhase = 0,
  }) {
    const dt = Math.min(60, time - lastTime || 16);
    lastTime = time;
    frames++;
    const p = clamp(progress, 0, 4),
      a = Math.min(3, Math.floor(p)),
      t = ease((p - a - 0.12) / 0.76);
    if (selected && p > 3.5) {
      const key = selected.id + ":" + study.toFixed(3);
      if (key !== selectedKey) {
        selectedKey = key;
        selectedForm = makeForm(selected.visualConcept, study);
      }
      target = selectedForm;
    } else {
      const from = forms[a],
        to = a === 3 ? atlasForm : forms[a + 1];
      target = scratch;
      for (let i = 0; i < target.length; i++)
        target[i] = mix(from[i], to[i], t);
    }
    const damping = reduced ? 1 : 1 - Math.exp(-dt / (selected ? 145 : 75));
    let residual = 0;
    for (let i = 0; i < positions.length; i++) {
      const delta = target[i] - positions[i];
      positions[i] += delta * damping;
      residual = Math.max(residual, Math.abs(delta));
    }
    const atlas = p > 3 ? ease((p - 3 - 0.12) / 0.76) : 0;
    const poses = selected
      ? {
          topology: [-0.5, -0.12, -0.22],
          usage: [0.16, -0.24, 0.08],
          zones: [-0.35, 0.1, -0.2],
          difference: [0.12, -0.25, 0.05],
          diagnosis: [0.1, -0.25, -0.04],
          comparison: [0.04, -0.12, 0],
          configuration: [0.1, 0.17, -0.02],
        }[selected.visualConcept] || [0.1, -0.17, -0.03]
      : [
          mix(0.2, 0.04, clamp(p)),
          mix(-0.35, -0.12, clamp(p)),
          mix(-0.12, 0, clamp(p)),
        ];
    const factor = selected ? 1 : 1 - atlas;
    const rotationTarget = [
      (poses[0] + (reduced ? 0 : py * 0.065)) * factor,
      (poses[1] +
        (reduced ? 0 : px * 0.09 + (selected ? scenePhase * 0.12 : 0)) -
        (1 - intro) * 0.22) *
        factor,
      (poses[2] + clamp(velocity, -1, 1) * 0.012) * factor,
    ];
    const dampingRotation = reduced ? 1 : 1 - Math.exp(-dt / 170);
    let poseResidual = 0;
    ["x", "y", "z"].forEach((key, i) => {
      poseResidual += Math.abs(rig.rotation[key] - rotationTarget[i]);
      rig.rotation[key] = mix(
        rig.rotation[key],
        rotationTarget[i],
        dampingRotation,
      );
    });
    camera.position.z =
      (selected
        ? baseZ *
          (0.96 -
            (reduced ? 0 : Math.sin(clamp(scenePhase + 0.5) * Math.PI) * 0.045))
        : baseZ) -
      (reduced || selected
        ? 0
        : Math.sin((p - Math.floor(p)) * Math.PI) * 0.65);
    rig.position.x =
      reduced || selected
        ? 0
        : -2.2 * Math.sin((p - Math.floor(p)) * Math.PI) ** 4;
    rig.scale.setScalar(0.93 + intro * 0.07);
    const thickness = p < 0.5 ? 0.035 : 0.018;
    for (let i = 0; i < count / 2; i++) {
      const o = i * 6;
      for (let k = 0; k < 8; k++) {
        const f = (profile[k][0] + 1) / 2,
          s = i * 24 + k * 3;
        shell[s] = mix(positions[o], positions[o + 3], f);
        shell[s + 1] = mix(positions[o + 1], positions[o + 4], f);
        shell[s + 2] =
          mix(positions[o + 2], positions[o + 5], f) +
          profile[k][1] * thickness;
      }
    }
    recolor(p, selected);
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    const comparing = selected
      ? ["comparison", "configuration"].includes(selected.visualConcept)
      : false;
    connectors.visible = comparing;
    if (comparing)
      for (let i = 0; i < 8; i++) {
        const a = (i * (SEGMENTS + 1) * 2 + SEGMENTS * 2) * 3,
          b = (i + 8) * (SEGMENTS + 1) * 2 * 3,
          o = i * 6;
        for (let k = 0; k < 3; k++) {
          connectorPoints[o + k] = positions[a + k];
          connectorPoints[o + 3 + k] = positions[b + k];
        }
        connectorGeo.attributes.position.needsUpdate = true;
      }
    rig.updateMatrixWorld(true);
    let notes = [];
    if (comparing)
      notes = [
        ["Reference", -3.2, 2.2, 0],
        ["Compared", 0.5, 2.2, 0],
        ["Differences retained", 0.5, -2.15, 0],
      ];
    else if (selected) {
      const terms =
        {
          topology: ["Wafer measurements", "Surface variation"],
          diagnosis: ["Observations", "Recommended checks"],
          usage: ["Reactor usage", "Maintenance planning"],
          difference: ["Weight & temperature", "Baseplate arrangement"],
          zones: ["Inner region", "Outer region"],
          history: ["Process events", "Lot history"],
          schedule: ["Reactor schedules", "Shared timeline"],
          maintenance: ["Due dates & status", "Maintenance schedule"],
          compilation: ["Metrology inputs", "Calculated reports"],
          report: ["LayTec inputs", "Engineering report"],
          pathfinder: ["Parameter selection", "Direct chart access"],
          signals: ["Parameter signals", "Shared time axis"],
          observatory: ["GaN parameters", "SPC review"],
          legacy: ["Legacy parameters", "SPC review"],
        }[selected.visualConcept] || [];
      notes = terms.map((s, i) => [s, i ? 1.3 : -3, i ? -2.6 : 2.6, 0]);
    }
    labelElements.forEach((el, i) => {
      el.hidden = !notes[i];
      if (!notes[i]) return;
      const [text, x, y, z] = notes[i];
      el.textContent = text;
      projection.set(x, y, z).applyMatrix4(rig.matrixWorld).project(camera);
      el.style.transform =
        "translate(" +
        (projection.x * 0.5 + 0.5) * rect.width +
        "px," +
        (-0.5 * projection.y + 0.5) * rect.height +
        "px)";
    });
    if (renderer) {
      renderer.render(scene, camera);
    } else {
      for (let i = 0; i < 16; i++) {
        let d = "";
        for (let j = 0; j <= SEGMENTS; j++) {
          const k = (i * (SEGMENTS + 1) * 2 + j * 2) * 3;
          d +=
            (j ? "L" : "M") +
            positions[k].toFixed(3) +
            "," +
            (-positions[k + 1]).toFixed(3);
        }
        svgPaths[i].setAttribute("d", d);
      }
    }
    return residual > 0.0007 || poseResidual > 0.0005;
  }
  return {
    resize,
    render,
    get stats() {
      return {
        frames,
        drawCalls: renderer?.info.render.calls || 0,
        triangles: renderer?.info.render.triangles || 0,
        pixelRatio: renderer?.getPixelRatio() || 0,
        webgl: !!renderer,
      };
    },
    dispose() {
      geo.dispose();
      material.dispose();
      connectorGeo.dispose();
      connectors.material.dispose();
      env?.dispose();
      pmrem?.dispose();
      renderer?.dispose();
    },
  };
}
