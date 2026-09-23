// One instanced silicon object: sixteen layers, one draw call, no image textures.
const vertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
uniform mat4 projection, view;
uniform float opening, progress, clock;
uniform vec2 pointer;
out vec3 world, norm, local;
flat out float layer;
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0,-s,0,1,0,s,0,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0,-s,c,0,0,0,1);}
void main(){
 layer=float(gl_InstanceID); local=position;
 float arrival=smoothstep(layer*.022, .64+layer*.022, opening);
 float spread=smoothstep(.05,.8,progress);
 vec3 p=position;
 p.xz*=.97+layer*.002;
 p.y+=(layer-7.5)*(.042+spread*.12);
 p.x+=(1.-arrival)*(layer-7.5)*.065 + spread*sin(layer*.28)*.16;
 p.z+=(1.-arrival)*.45;
 mat3 rot=rz(-.22+pointer.y*.045)*ry(-.38+pointer.x*.13+sin(clock*.16)*.025);
 world=rot*p; norm=rot*normal;
 gl_Position=projection*view*vec4(world,1.);
}`;
const fragment = `#version 300 es
precision highp float;
in vec3 world, norm, local;
flat in float layer;
uniform vec3 eye;
uniform float clock, progress;
out vec4 color;
void main(){
 vec3 n=normalize(norm), v=normalize(eye-world);
 vec3 key=normalize(vec3(-2.2,4.5,2.8));
 vec3 fill=normalize(vec3(3.5,.9,-2.));
 float top=smoothstep(.5,.95,abs(norm.y));
 vec2 cell=local.xz*12.;
 vec2 edge=abs(fract(cell-.5)-.5)/max(fwidth(cell),vec2(.005));
 float grid=1.-smoothstep(.45,1.1,min(edge.x,edge.y));
 float micro=sin(local.x*890.)*sin(local.z*970.);
 vec3 base=mix(vec3(.12,.145,.15),vec3(.29,.325,.33),top);
 base*=.88+ .12*sin(layer*.7);
 base=mix(base,vec3(.035,.045,.044),grid*top*.17);
 float lambert=max(dot(n,key),0.);
 float spec=pow(max(dot(n,normalize(key+v)),0.),72.);
 float broad=pow(max(dot(n,normalize(normalize(vec3(-1.,3.,-2.))+v)),0.),12.);
 float rim=pow(1.-max(dot(n,v),0.),4.);
 float brushed=pow(max(dot(reflect(-key,n),v),0.),28.)*(.85+.15*sin(local.z*520.));
 float sweep=exp(-pow((local.x*.72+local.z*.35-sin(clock*.24)*1.45)/.16,2.));
 vec3 light=base*(.21+lambert*.55)+vec3(.78,.84,.87)*spec*.9;
 light+=vec3(.45,.55,.57)*broad*.2+vec3(.78,.55,.31)*rim*.34;
 light+=vec3(.55,.65,.66)*brushed*.22;
 light+=vec3(.36,.44,.45)*sweep*top*.055;
 light+=vec3(.76,.48,.25)*pow(max(dot(n,fill),0.),5.)*.17;
 float studio=exp(-pow((local.x*.65+local.z*.35-.3-sin(clock*.18)*.3)/.48,2.));
 light+=vec3(.28,.35,.36)*studio*top;
 light*=.68+smoothstep(-1.4,1.3,local.x)*.28;
 light+=micro*.002;
 // The copper reveal is at the cut edge, not a rainbow surface effect.
 if(abs(local.y)<.006 && abs(norm.y)<.8)light+=vec3(.46,.24,.08)*.14;
 light*=.82+.18*(layer/15.);
 color=vec4(pow(max(light,vec3(0.)),vec3(.82)),1.);
}`;
const normalize = (a) => {
  const l = Math.hypot(...a);
  return a.map((v) => v / l);
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
function camera(eye) {
  const z = normalize(eye),
    x = normalize(cross([0, 1, 0], z)),
    y = cross(z, x);
  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x, eye),
    -dot(y, eye),
    -dot(z, eye),
    1,
  ]);
}
function geometry() {
  const v = [],
    ix = [],
    segments = 160;
  const point = (a, r, y) => [
    Math.cos(a) * r,
    y,
    Math.min(Math.sin(a) * r, r * 0.97),
  ];
  // Bevel rings give the wafer real thickness under grazing light.
  const rings = [
    [1.69, -0.015, 0, -1],
    [1.72, -0.007, 1, -0.4],
    [1.72, 0.007, 1, 0.4],
    [1.69, 0.015, 0, 1],
  ];
  for (const [r, y, nr, ny] of rings)
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2,
        p = point(a, r, y),
        n = normalize([Math.cos(a) * nr, ny, Math.sin(a) * nr]);
      v.push(...p, ...n);
    }
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < segments; i++) {
      const a = r * (segments + 1) + i,
        b = a + segments + 1;
      ix.push(a, b, a + 1, a + 1, b, b + 1);
    }
  for (const [ring, ny] of [
    [0, -1],
    [3, 1],
  ]) {
    const center = v.length / 6;
    v.push(0, ny * 0.015, 0, 0, ny, 0);
    for (let i = 0; i < segments; i++)
      ix.push(center, ring * (segments + 1) + i, ring * (segments + 1) + i + 1);
  }
  return { v: new Float32Array(v), ix: new Uint16Array(ix) };
}
export function createHero(canvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!gl) return { render: () => false, resize: () => {} };
  let available = true,
    quality = 1,
    slow = 0;
  const program = gl.createProgram(),
    resources = [];
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
      resources.push(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program));
  } catch {
    resources.forEach((s) => gl.deleteShader(s));
    gl.deleteProgram(program);
    return { render: () => false, resize: () => {} };
  }
  const mesh = geometry(),
    vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.v, gl.STATIC_DRAW);
  for (let i = 0; i < 2; i++) {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 24, i * 12);
  }
  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.ix, gl.STATIC_DRAW);
  const u = Object.fromEntries(
    [
      "projection",
      "view",
      "opening",
      "progress",
      "clock",
      "pointer",
      "eye",
    ].map((n) => [n, gl.getUniformLocation(program, n)]),
  );
  let width = 1,
    height = 1,
    start = null;
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const dpr =
      Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.75) * quality;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  canvas.classList.add("ready");
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    available = false;
    canvas.classList.remove("ready");
  });
  return {
    resize,
    render(time, p, x, y, reduced, dt) {
      if (!available) return false;
      if (start === null) start = time;
      if (dt > 35 && !reduced) {
        if (++slow > 35 && quality === 1) {
          quality = 0.78;
          resize();
        }
      } else slow = Math.max(0, slow - 1);
      const t = (time - start) / 1000,
        aspect = width / Math.max(1, height),
        f = 1 / Math.tan(0.55 / 2),
        far = 35,
        near = 0.1;
      const proj = new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        0,
        0,
        (far + near) / (near - far),
        -1,
        0,
        0,
        (2 * far * near) / (near - far),
        0,
      ]);
      const distance = innerWidth < 700 ? 1.12 : 1;
      const eye = [
        (3.5 - p * 0.5) * distance,
        (3.4 + p * 1.5) * distance,
        (6.8 - p * 1.65) * distance,
      ];
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniformMatrix4fv(u.projection, false, proj);
      gl.uniformMatrix4fv(u.view, false, camera(eye));
      gl.uniform3fv(u.eye, eye);
      gl.uniform1f(u.opening, reduced ? 1 : Math.min(1, t / 2.6));
      gl.uniform1f(u.progress, reduced ? 0 : p);
      gl.uniform1f(u.clock, reduced ? 5 : t);
      gl.uniform2f(u.pointer, reduced ? 0 : x, reduced ? 0 : y);
      gl.drawElementsInstanced(
        gl.TRIANGLES,
        mesh.ix.length,
        gl.UNSIGNED_SHORT,
        0,
        16,
      );
      return !reduced;
    },
  };
}
