"use strict";

// CONTENT PLACEHOLDERS: replace these profiles with verified descriptions,
// screenshots, technical notes, and project links before publishing full case studies.
const systems = {
  gan: {
    title: "GaN Temp Diagnoser",
    category: "SEMICONDUCTOR ENGINEERING",
    id: "A—01",
    label: "THERMAL / STUDY 01",
    description:
      "Part of the ARTIFACTS semiconductor engineering collection. A detailed walkthrough, verified capabilities, and selected interface views will be added here.",
    curve:
      "M50 248C110 250 122 214 175 220S255 132 300 152S380 90 425 99S502 60 550 72",
    secondary:
      "M50 250C110 248 135 232 175 238S260 172 300 185S375 140 425 145S505 117 550 127",
    point: [300, 152],
  },
  aix: {
    title: "AIX ΔT Assistant",
    category: "SEMICONDUCTOR ENGINEERING",
    id: "A—02",
    label: "DELTA / STUDY 02",
    description:
      "A system in the ARTIFACTS semiconductor engineering collection. Project context, verified functionality, and selected examples will be documented here.",
    curve:
      "M50 180C110 180 140 120 200 120S260 180 300 160S380 95 425 125S510 150 550 90",
    secondary:
      "M50 210C110 210 140 180 200 180S260 210 300 195S380 150 425 175S510 190 550 150",
    point: [300, 160],
  },
  lt: {
    title: "LT Zone Assistant",
    category: "SEMICONDUCTOR ENGINEERING",
    id: "A—03",
    label: "ZONES / STUDY 03",
    description:
      "One of the engineering tools that make up ARTIFACTS. A closer look at its purpose, interface, and verified capabilities is planned for this profile.",
    curve:
      "M50 240L130 240L130 190L230 190L230 140L330 140L330 105L440 105L440 75L550 75",
    secondary:
      "M50 255L130 255L130 225L230 225L230 195L330 195L330 165L440 165L440 140L550 140",
    point: [330, 105],
  },
  anko: {
    title: "ANKO Helper",
    category: "ENGINEERING SOFTWARE",
    id: "A—04",
    label: "PROCESS / STUDY 04",
    description:
      "Part of Gene’s ARTIFACTS software ecosystem. A project walkthrough, verified feature overview, and interface views will be added as the collection is documented.",
    curve:
      "M50 250C130 250 130 250 175 220S210 70 300 85S390 170 425 130S500 65 550 65",
    secondary:
      "M50 260C130 260 130 250 175 240S220 135 300 145S390 210 425 180S500 115 550 115",
    point: [300, 85],
  },
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const tabs = [...document.querySelectorAll(".system-tab")];
const panel = document.querySelector("#system-panel");
let activeSystem = "gan";
function selectSystem(key, focus = false) {
  const system = systems[key];
  if (!system) return;
  activeSystem = key;
  tabs.forEach((tab) => {
    const selected = tab.dataset.system === key;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  panel.setAttribute("aria-labelledby", `tab-${key}`);
  document.querySelector("#panel-title").textContent = system.title;
  document.querySelector("#panel-description").textContent = system.description;
  document.querySelector("#panel-id").textContent = system.id;
  document.querySelector("#panel-category").textContent = system.category;
  document.querySelector("#diagram-label").textContent = system.label;
  document.querySelector("#diagram-primary").setAttribute("d", system.curve);
  document
    .querySelector("#diagram-area")
    .setAttribute("d", `${system.curve}V280H50Z`);
  document
    .querySelector("#diagram-secondary")
    .setAttribute("d", system.secondary);
  document.querySelector("#diagram-point").setAttribute("cx", system.point[0]);
  document.querySelector("#diagram-point").setAttribute("cy", system.point[1]);
  panel.classList.remove("is-changing");
  requestAnimationFrame(() => panel.classList.add("is-changing"));
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSystem(tab.dataset.system));
  tab.addEventListener("keydown", (event) => {
    const moves = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next;
    if (event.key in moves)
      next = (index + moves[event.key] + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectSystem(tabs[next].dataset.system, true);
  });
});

const projectDialog = document.querySelector("#project-dialog");
document.querySelector("#open-project").addEventListener("click", () => {
  const system = systems[activeSystem];
  document.querySelector("#dialog-title").textContent = system.title;
  document.querySelector("#dialog-description").textContent =
    system.description;
  document.querySelector("#dialog-id").textContent = system.id;
  projectDialog.showModal();
});
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => projectDialog.close());
projectDialog.addEventListener("click", (event) => {
  const bounds = projectDialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    projectDialog.close();
});
document.querySelector("#year").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  document.documentElement.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => revealObserver.observe(element));
}

// A single full-screen triangle shades an analytic disc, with no 3D library,
// textures, meshes, or ray-marching loop. Lighting moves; the surface stays precise.
function initializeSurface() {
  const canvas = document.querySelector("#wafer-canvas");
  const visual = document.querySelector(".hero-visual");
  const hero = document.querySelector(".hero");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  if (!gl) return;
  const derivatives = gl.getExtension("OES_standard_derivatives");
  const vertexSource =
    "attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.,1.);}";
  const fragmentSource = `${derivatives ? "#extension GL_OES_standard_derivatives : enable" : ""}
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;
    mat2 rotate(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
      vec2 screen=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
      screen.x-=.045;
      vec3 ro=vec3(0.,0.,3.6);
      vec3 rd=normalize(vec3(screen*2.55,-3.6));
      float tilt=.79+u_pointer.y*.045;
      float angle=-.36+u_pointer.x*.045;
      vec3 normal=normalize(vec3(sin(angle)*sin(tilt),cos(angle)*sin(tilt),cos(tilt)));
      vec3 tangent=normalize(cross(vec3(0.,1.,0.),normal));
      vec3 bitangent=cross(normal,tangent);
      float t=-dot(ro,normal)/dot(rd,normal);
      vec3 world=ro+rd*t;
      vec2 p=vec2(dot(world,tangent),dot(world,bitangent));
      float radius=1.15;
      float r=length(p);
      float aa=3.0/u_resolution.y;
      float disc=1.-smoothstep(radius-aa,radius+aa,r);
      // An offset analytic back-plane gives the wafer a measured edge thickness.
      float tb=(-.016-dot(ro,normal))/dot(rd,normal);
      vec3 backWorld=ro+rd*tb;
      vec2 backP=vec2(dot(backWorld,tangent),dot(backWorld,bitangent));
      float back=1.-smoothstep(radius-aa,radius+aa,length(backP));
      vec2 q=rotate(u_time*.014)*p;
      float notch=1.-smoothstep(.020,.037,length(q-vec2(0.,-radius)));
      disc*=1.-notch;
      vec2 cell=floor(q*15.);
      vec2 f=fract(q*15.);
      float distanceToLine=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
      float lineAA=${derivatives ? "max(fwidth(q.x*15.),fwidth(q.y*15.))*.65" : "25./u_resolution.y"};
      float grid=1.-smoothstep(.008,.008+lineAA,distanceToLine);
      float tile=hash(cell);
      vec3 light=normalize(vec3(-1.2+u_pointer.x*.5,1.6+u_pointer.y*.4,2.2));
      vec3 view=normalize(ro-world);
      vec3 halfV=normalize(light+view);
      float diffuse=max(dot(normal,light),0.);
      float specular=pow(max(dot(normal,halfV),0.),48.);
      float broad=pow(max(dot(normal,halfV),0.),8.);
      float sweep=exp(-pow((q.x+q.y*.26+.35+u_pointer.x*.1)*2.7,2.));
      float edge=smoothstep(radius-.018,radius-.002,r);
      float fresnel=pow(1.-max(dot(normal,view),0.),3.);
      vec3 base=mix(vec3(.075,.089,.101),vec3(.16,.18,.19),tile*.2);
      vec3 color=base*(.5+diffuse*.6)+vec3(.29,.33,.34)*broad*.35;
      color+=vec3(.47,.50,.49)*specular*.52+sweep*vec3(.18,.20,.205)*(.35+broad);
      color*=1.-grid*.40;
      // Restrained thin-film warmth appears only in the specular region.
      color+=specular*vec3(.09,.055,.026)*(.5+.5*sin(q.x*4.));
      color+=edge*(vec3(.31,.35,.37)+fresnel*.2);
      color+=vec3(hash(gl_FragCoord.xy)*.009);
      color=pow(color,vec3(.87));
      float alpha=max(disc,back*.85);
      vec3 rim=vec3(.18,.21,.23);
      gl_FragColor=vec4(mix(rim,color,disc)*alpha,alpha);
    }`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error("Surface shader could not compile.");
    }
    return shader;
  }
  let program;
  try {
    program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Surface could not initialize.");
  } catch {
    if (program) gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const attribute = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const pointerLocation = gl.getUniformLocation(program, "u_pointer");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let frame = 0;
  let visible = true;
  let contextLost = false;
  let previousTime = 0;
  let surfaceTime = 0;
  let lastDraw = 0;
  let mobile = matchMedia("(max-width: 700px)").matches;
  function resize() {
    mobile = matchMedia("(max-width: 700px)").matches;
    const scale = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
    canvas.width = Math.round(visual.clientWidth * scale);
    canvas.height = Math.round(visual.clientHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    schedule();
  }
  function draw(time) {
    frame = 0;
    if (contextLost || document.hidden || !visible) {
      previousTime = 0;
      return;
    }
    // Touch devices get one still frame; pointer devices have a capped 60 Hz loop.
    if (time - lastDraw < 1000 / 60 && !reducedMotion.matches && !mobile) {
      schedule();
      return;
    }
    const delta = previousTime
      ? Math.min((time - previousTime) / 1000, 0.05)
      : 0;
    previousTime = time;
    lastDraw = time;
    const interpolation = 1 - Math.exp(-delta * 5);
    pointer.x += (pointer.targetX - pointer.x) * interpolation;
    pointer.y += (pointer.targetY - pointer.y) * interpolation;
    if (!reducedMotion.matches && !mobile) surfaceTime += delta;
    gl.uniform2f(
      pointerLocation,
      reducedMotion.matches ? 0 : pointer.x,
      reducedMotion.matches ? 0 : pointer.y,
    );
    gl.uniform1f(timeLocation, surfaceTime);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    visual.classList.add("is-ready");
    if (!reducedMotion.matches && !mobile) schedule();
  }
  function schedule() {
    if (!frame && visible && !document.hidden && !contextLost)
      frame = requestAnimationFrame(draw);
  }
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches || mobile)
        return;
      const bounds = hero.getBoundingClientRect();
      pointer.targetX =
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.targetY =
        -((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });
  const surfaceObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      } else schedule();
    },
    { threshold: 0 },
  );
  surfaceObserver.observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    } else schedule();
  });
  reducedMotion.addEventListener("change", () => {
    previousTime = 0;
    schedule();
  });
  new ResizeObserver(resize).observe(visual);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    visual.classList.remove("is-ready");
  });
  resize();
}
initializeSurface();
