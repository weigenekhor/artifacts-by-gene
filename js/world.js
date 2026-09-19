import { DESIGN } from "./tokens.js";
import { geometry, indices, nodePositions } from "./geometry.js";
import { wake, spring, motionAllowed, preferences } from "./motion.js";
const lerp = (a, b, t) => a + (b - a) * t;
export function createWorld(canvas, apps) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    depth: true,
    powerPreference: "low-power",
  });
  if (!gl) {
    canvas.dataset.renderer = "fallback";
    return { set() {}, highlight() {}, project: () => null, dispose() {} };
  }
  const derivatives = gl.getExtension("OES_standard_derivatives");
  if (!derivatives) {
    canvas.dataset.renderer = "fallback";
    return { set() {}, highlight() {}, project: () => null, dispose() {} };
  }
  let rows = innerWidth < DESIGN.compact ? DESIGN.mobileRows : DESIGN.rows,
    columns =
      innerWidth < DESIGN.compact ? DESIGN.mobileColumns : DESIGN.columns;
  let program,
    buffers,
    uniforms,
    indexBuffer,
    cache = new Map(),
    lost = false,
    visible = true,
    dirty = true,
    quality = 1,
    slow = 0;
  let target = {
      a: "material",
      b: "material",
      mix: 0,
      amountA: 0.18,
      amountB: 0.18,
      camera: [1.08, -0.35, -0.22, 1.03, 0.95, -0.32],
    },
    camera = [...target.camera],
    keys = ["", ""],
    blend = 0,
    selected = -1;
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  let elapsed = 0,
    lastDraw = 0;
  const vertex = `attribute vec3 aPosition;attribute vec3 bPosition;attribute vec3 meta;uniform float morph;uniform vec3 rotation;uniform vec3 view;uniform vec2 resolution;varying vec3 vPosition;varying vec3 vMeta;
 mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
 void main(){vec3 p=mix(aPosition,bPosition,morph);p=rz(rotation.z)*ry(rotation.y)*rx(rotation.x)*p;p.xy+=view.yz;vPosition=p;vMeta=meta;float distance=8.-p.z;gl_Position=vec4(p.x*2.7*view.x/(resolution.x/resolution.y),p.y*2.7*view.x,(distance-1.)*.82,distance);}`;
  const fragment = `#extension GL_OES_standard_derivatives : enable
 precision highp float;varying vec3 vPosition;varying vec3 vMeta;uniform float time;uniform float active;uniform float system;uniform float fragmentState;uniform float calm;uniform float surface;
 void main(){vec3 dx=dFdx(vPosition),dy=dFdy(vPosition);vec3 normal=normalize(cross(dx,dy));if(!gl_FrontFacing)normal=-normal;vec3 eye=normalize(vec3(0.,0.,8.)-vPosition);vec3 light=normalize(vec3(-2.5,4.8,5.5)-vPosition);vec3 halfDir=normalize(light+eye);
 float diffuse=abs(dot(normal,light));float spec=pow(abs(dot(normal,halfDir)),65.);float rim=pow(1.-abs(dot(normal,eye)),3.);float row=vMeta.y;float accent=step(.89,fract(row*7.1));vec3 base=mix(vec3(.39,.45,.48),vec3(.66,.35,.17),accent*mix(.5,.10,surface));
 float grain=fract(sin(dot(vPosition.xz,vec2(143.1,291.7)))*43758.5453)*.018;
 vec3 color=base*(.20+diffuse*.44)+vec3(.92,.87,.74)*spec*.5+vec3(.32,.42,.45)*rim*.13+grain;
 float edge=smoothstep(.78,1.,abs(vMeta.x));color+=edge*vec3(.07,.08,.08);
 float scan=1.-smoothstep(.0,.016,abs(vMeta.z-fract(time*.06)));color+=scan*vec3(.24,.14,.07)*calm;
 if(fragmentState>.01&&fract(vMeta.z*7.+floor(row*64.)*.31)>.70)discard;
 if(system>.01&&active>=0.){float index=floor(row*15.999);color*=mix(.27,1.6,1.-step(.4,abs(index-active)));}
 float fog=exp(-max(0.,-vPosition.z)*.12);color=mix(vec3(.027,.031,.035),color,fog);gl_FragColor=vec4(color,1.);}`;
  function shader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw Error(gl.getShaderInfoLog(s));
    return s;
  }
  function init() {
    try {
      gl.getExtension("OES_standard_derivatives");
      const vs = shader(gl.VERTEX_SHADER, vertex),
        fs = shader(gl.FRAGMENT_SHADER, fragment);
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      buffers = ["aPosition", "bPosition", "meta"].map((name) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        const a = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
        return b;
      });
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        indices(rows, columns),
        gl.STATIC_DRAW,
      );
      uniforms = Object.fromEntries(
        [
          "morph",
          "rotation",
          "view",
          "resolution",
          "time",
          "active",
          "system",
          "fragmentState",
          "calm",
          "surface",
        ].map((n) => [n, gl.getUniformLocation(program, n)]),
      );
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clearColor(...DESIGN.background, 1);
      keys = ["", ""];
      canvas.dataset.renderer = "webgl";
      resize();
    } catch (error) {
      canvas.dataset.renderer = "fallback";
      console.warn(
        "Procedural rendering unavailable; static diagrams remain available.",
      );
      lost = true;
    }
  }
  function shape(kind, amount) {
    const key =
      kind + ":" + amount.toFixed(2) + ":" + (innerWidth < DESIGN.compact);
    if (!cache.has(key)) {
      if (cache.size > 42) cache.clear();
      cache.set(
        key,
        geometry(
          kind,
          apps,
          rows,
          columns,
          amount,
          innerWidth < DESIGN.compact,
        ),
      );
    }
    return [key, cache.get(key)];
  }
  function bind() {
    for (let i = 0; i < 2; i++) {
      const [key, g] = shape(
        target[i ? "b" : "a"],
        target[i ? "amountB" : "amountA"],
      );
      if (keys[i] !== key) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, g.positions, gl.STATIC_DRAW);
        if (!keys[0] || i === 0) {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers[2]);
          gl.bufferData(gl.ARRAY_BUFFER, g.meta, gl.STATIC_DRAW);
        }
        keys[i] = key;
      }
    }
  }
  function resize() {
    const compact = innerWidth < DESIGN.compact;
    let dpr = Math.min(devicePixelRatio || 1, DESIGN.dpr) * quality;
    const budget = compact ? DESIGN.mobilePixelBudget : DESIGN.pixelBudget;
    dpr = Math.min(dpr, Math.sqrt(budget / (innerWidth * innerHeight)));
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    dirty = true;
    wake(draw);
  }
  function draw(dt, time, now) {
    if (lost || !visible) return false;
    const moving = motionAllowed();
    if (!moving)
      pointer.tx =
        pointer.ty =
        pointer.x =
        pointer.y =
        pointer.vx =
        pointer.vy =
          0;
    elapsed += moving ? dt : 0;
    let changing = false;
    for (let i = 0; i < 6; i++) {
      camera[i] = lerp(
        camera[i],
        target.camera[i],
        moving ? 1 - Math.exp(-DESIGN.cameraDamping * dt) : 1,
      );
      if (Math.abs(camera[i] - target.camera[i]) > 0.001) changing = true;
    }
    [pointer.x, pointer.vx] = spring(
      pointer.x,
      pointer.vx,
      moving ? pointer.tx : 0,
      dt,
      DESIGN.pointerDamping,
    );
    [pointer.y, pointer.vy] = spring(
      pointer.y,
      pointer.vy,
      moving ? pointer.ty : 0,
      dt,
      DESIGN.pointerDamping,
    );
    blend = lerp(blend, target.mix, moving ? 1 - Math.exp(-12 * dt) : 1);
    changing ||=
      Math.abs(blend - target.mix) > 0.001 ||
      Math.abs(pointer.x - pointer.tx) +
        Math.abs(pointer.y - pointer.ty) +
        Math.abs(pointer.vx) +
        Math.abs(pointer.vy) >
        0.005;
    // A low-frequency acquisition sweep has meaning only in measurement views.
    const acquisition =
      moving &&
      !target.quiet &&
      ["material", "topology", "signals", "observatory"].includes(target.a);
    if (!dirty && !changing && !acquisition) return false;
    const compact = innerWidth < DESIGN.compact;
    if (
      acquisition &&
      !changing &&
      !dirty &&
      now - lastDraw < 1000 / (compact ? 24 : 60)
    )
      return true;
    lastDraw = now;
    bind();
    gl.useProgram(program);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const rotation = [
      camera[0] + pointer.y * 0.055,
      camera[1] + pointer.x * 0.075,
      camera[2],
    ];
    const view = [
      camera[3] * Math.min(1, (innerWidth / innerHeight) * 0.89),
      compact ? 0 : camera[4],
      compact ? -0.75 : camera[5],
    ];
    gl.uniform1f(uniforms.morph, blend);
    gl.uniform3fv(uniforms.rotation, rotation);
    gl.uniform3fv(uniforms.view, view);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.active, selected);
    gl.uniform1f(uniforms.system, target.a === "universe" ? 1 : 0);
    gl.uniform1f(
      uniforms.fragmentState,
      target.a === "friction" && blend < 0.6 ? 1 : 0,
    );
    gl.uniform1f(uniforms.calm, moving ? 1 : 0);
    gl.uniform1f(
      uniforms.surface,
      ["material", "topology"].includes(target.a) ? 1 : 0,
    );
    gl.drawElements(gl.TRIANGLES, rows * columns * 6, gl.UNSIGNED_SHORT, 0);
    canvas.dataset.shape = blend < 0.5 ? target.a : target.b;
    canvas.dataset.draws = String((Number(canvas.dataset.draws) || 0) + 1);
    if (dt > 0.029 && !compact) {
      slow++;
      if (slow > 100 && quality > 0.72) {
        quality *= 0.88;
        resize();
        slow = 0;
      }
    } else slow = Math.max(0, slow - 1);
    dirty = false;
    return changing || acquisition;
  }
  function set(state) {
    if (state.a !== target.a || state.b !== target.b)
      blend = state.a === target.b ? 0 : state.b === target.a ? 1 : state.mix;
    target = { ...target, ...state };
    dirty = true;
    wake(draw);
  }
  function project(index) {
    let [x, y, z] = nodePositions[index];
    if (innerWidth < DESIGN.compact) y *= 1.45;
    const [rx, ry, rz, zoom, px, py] = camera;
    let c = Math.cos(rx),
      s = Math.sin(rx);
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(ry);
    s = Math.sin(ry);
    [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(rz);
    s = Math.sin(rz);
    [x, y] = [x * c - y * s, x * s + y * c];
    const compact = innerWidth < DESIGN.compact,
      factor = zoom * Math.min(1, (innerWidth / innerHeight) * 0.89);
    x += compact ? 0 : px;
    y += compact ? -0.75 : py;
    const d = 8 - z;
    return {
      x: innerWidth * 0.5 + ((x * 2.7 * factor) / d) * innerHeight * 0.5,
      y: innerHeight * 0.5 - ((y * 2.7 * factor) / d) * innerHeight * 0.5,
    };
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        dirty = true;
        wake(draw);
      }
    },
    { threshold: 0 },
  );
  observer.observe(document.querySelector("main"));
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (
        target.quiet ||
        !preferences.pointer ||
        !motionAllowed() ||
        e.pointerType !== "mouse"
      )
        return;
      pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
      wake(draw);
    },
    { passive: true },
  );
  window.addEventListener("artifacts:motion", () => {
    dirty = true;
    wake(draw);
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
    canvas.dataset.renderer = "fallback";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    lost = false;
    cache.clear();
    init();
  });
  init();
  return {
    set,
    project,
    highlight(i) {
      selected = i;
      dirty = true;
      wake(draw);
    },
    dispose() {
      observer.disconnect();
      buffers?.forEach((b) => gl.deleteBuffer(b));
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
      cache.clear();
    },
  };
}
