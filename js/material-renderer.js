// One offscreen GPU context is shared by the visible study and origin scene.
// Canvas compositing keeps the existing clock, text layer and low-cost fallback.
let renderer;
function createRenderer() {
  const canvas = document.createElement("canvas"),
    gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
  if (!gl) return null;
  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const vertex = shader(
    gl.VERTEX_SHADER,
    `attribute vec3 aPosition;attribute vec3 aNormal;attribute vec4 aColor;attribute float aMode;uniform vec2 uSize;varying vec3 vNormal;varying vec4 vColor;varying float vMode;varying vec2 vPosition;void main(){gl_Position=vec4(aPosition.x/uSize.x*2.-1.,1.-aPosition.y/uSize.y*2.,-aPosition.z/1200.,1.);vNormal=aNormal;vColor=aColor;vMode=aMode;vPosition=aPosition.xy/uSize;}`,
  );
  const fragment = shader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;varying vec3 vNormal;varying vec4 vColor;varying float vMode;varying vec2 vPosition;void main(){vec3 color=vColor.rgb;if(vMode<.5){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.38,-.55,.78));float diffuse=abs(dot(n,light));float sheen=pow(max(0.,dot(n,normalize(vec3(-.3,-.2,1.)))),24.);float falloff=1.-.16*length(vPosition-vec2(.2,.15));color=color*(.46+.65*diffuse)*falloff+vec3(.17,.19,.16)*sheen;}gl_FragColor=vec4(color,vColor.a);}`,
  );
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const buffer = gl.createBuffer(),
    attributes = [
      ["aPosition", 3, 0],
      ["aNormal", 3, 3],
      ["aColor", 4, 6],
      ["aMode", 1, 10],
    ];
  let lost = false;
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    renderer = undefined;
  });
  return {
    canvas,
    gl,
    program,
    buffer,
    attributes,
    size: gl.getUniformLocation(program, "uSize"),
    get lost() {
      return lost;
    },
  };
}
export function renderMaterialField(ctx, queue, w, h) {
  if (renderer === undefined) renderer = createRenderer();
  if (!renderer || renderer.lost) return false;
  const { canvas, gl, program, buffer, attributes, size } = renderer,
    dpr = ctx.getTransform().a;
  const W = Math.max(1, Math.round(w * dpr)),
    H = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(size, w, h);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  attributes.forEach(([name, count, offset]) => {
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, count, gl.FLOAT, false, 44, offset * 4);
  });
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const solid = [],
    transparent = [],
    lines = [];
  const rgba = (str) => {
    const n = str.match(/[\d.]+/g).map(Number);
    return [n[0] / 255, n[1] / 255, n[2] / 255, n[3] ?? 1];
  };
  const vertex = (out, p, n, c, mode) =>
    out.push(...p.slice(0, 3), ...n, ...c, mode);
  for (const q of queue) {
    if (q.point) {
      const color = rgba(q.fill);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2,
          b = ((i + 1) / 10) * Math.PI * 2;
        for (const p of [
          q.point,
          [
            q.point[0] + Math.cos(a) * q.r,
            q.point[1] + Math.sin(a) * q.r,
            q.point[2],
          ],
          [
            q.point[0] + Math.cos(b) * q.r,
            q.point[1] + Math.sin(b) * q.r,
            q.point[2],
          ],
        ])
          vertex(solid, p, [0, 0, 1], color, 1);
      }
      continue;
    }
    if (q.fill) {
      const out = q.alpha < 1 ? transparent : solid,
        c = q.material.map((v) => v / 255).concat(q.alpha);
      for (let i = 1; i < q.pts.length - 1; i++)
        for (const j of [0, i, i + 1])
          vertex(
            out,
            q.pts[j],
            q.normal,
            q.vertexColors
              ? q.vertexColors[j].map((v) => v / 255).concat(q.alpha)
              : c,
            q.unlit ? 1 : 0,
          );
    }
    if (q.stroke) {
      const c = rgba(q.stroke);
      for (let i = 0; i < q.pts.length - 1; i++) {
        const a = q.pts[i],
          b = q.pts[i + 1],
          dx = b[0] - a[0],
          dy = b[1] - a[1],
          length = Math.hypot(dx, dy) || 1,
          x = (-dy / length) * q.width * 0.5,
          y = (dx / length) * q.width * 0.5,
          z = 0.6;
        const corners = [
          [a[0] + x, a[1] + y, a[2] + z],
          [a[0] - x, a[1] - y, a[2] + z],
          [b[0] - x, b[1] - y, b[2] + z],
          [b[0] + x, b[1] + y, b[2] + z],
        ];
        for (const j of [0, 1, 2, 0, 2, 3])
          vertex(lines, corners[j], [0, 0, 1], c, 1);
      }
    }
  }
  const draw = (data) => {
    if (!data.length) return;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 11);
  };
  gl.depthMask(true);
  draw(solid);
  gl.depthMask(false);
  draw(transparent);
  draw(lines);
  gl.depthMask(true);
  ctx.drawImage(canvas, 0, 0, w, h);
  return true;
}
