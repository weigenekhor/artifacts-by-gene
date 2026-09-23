// THE ARTIFACT: faceted software-bearing leaves open into a camera passage.
const vertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
uniform mat4 projection,view;
uniform vec2 orbit,pointer;
uniform float index,opening,passage,selected,part;
out vec3 world,norm,local;
out vec2 uv;
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0,-s,0,1,0,s,0,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,s,0,-s,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0,-s,c,0,0,0,1);}
void main(){
 local=position;uv=position.xy/vec2(3.3,2.2)+.5;
 float side=mod(index,2.)<.5?-1.:1.;float pair=floor(index*.5);
 float chosen=1.-smoothstep(.1,.9,abs(index-selected));
 float release=smoothstep(.10+pair*.015,.88,opening);
 mat3 leaf=ry(-side*release*.22)*rz(side*release*(pair-3.5)*.018);
 vec3 p=leaf*position;
 if(part>.5){
  float side=index<.5?-1.:1.;
  p=position; p.x*=side;p.y*=side;
  p.x+=side*smoothstep(.0,.45,opening)*1.25;
  p.z-=smoothstep(.3,.8,opening)*1.8;
  mat3 body=ry((-.25+orbit.x+pointer.x*.025)*(1.-passage))*rx((.12+orbit.y+pointer.y*.018)*(1.-passage));
  world=body*p;norm=body*vec3(normal.x*side,normal.y*side,normal.z);
  gl_Position=projection*view*vec4(world,1.);return;
 }
 p.xy*=.64+release*.36;
 p.x+=(pair-3.5)*.075*(1.-release);
 p.y+=sin(index*.45)*.09*(1.-release);
 p.x+=side*release*(2.22+pair*.13)+side*chosen*release*.22;
 p.y+=(pair-3.5)*opening*.10;
 p.z-=index*(.105+opening*.23);p.z+=chosen*opening*.16;
 p.x+=pointer.x*index*.0015*(1.-passage);p.y+=pointer.y*index*.001*(1.-passage);
 mat3 body=ry((-.30+orbit.x+pointer.x*.035)*(1.-passage))*rx((.12+orbit.y+pointer.y*.025)*(1.-passage));
 world=body*p;norm=body*leaf*normal;
 gl_Position=projection*view*vec4(world,1.);
}`;
const fragment = `#version 300 es
precision highp float;
in vec3 world,norm,local;
in vec2 uv;
uniform sampler2D capture;
uniform vec3 eye;
uniform vec2 pointer;
uniform float opening,index,selected,clock,ready,part;
out vec4 color;
void main(){
 vec3 n=normalize(norm),v=normalize(eye-world),l=normalize(vec3(-3.+pointer.x,4.+pointer.y*.6,5.));
 float rim=pow(1.-abs(dot(n,v)),3.);
 float broad=pow(max(dot(n,normalize(l+v)),0.),24.);
 float groove=step(.989,fract((local.x+1.65)*20.));
 float grain=sin(local.x*1200.)*sin(local.y*1380.)*.002;
 vec3 metal=vec3(.09,.12,.13)*(.32+.7*abs(dot(n,l)))+vec3(.60,.67,.65)*broad*.8;
 float edgeKey=pow(max(dot(n,normalize(vec3(4.,1.,-2.)+v)),0.),48.);
 metal+=vec3(.42,.44,.40)*rim*.35+vec3(.53,.64,.65)*edgeKey*.8+grain;
 float stripe=exp(-pow((local.x+local.y*.6-sin(clock*.13)*.4)/.31,2.));
 metal+=vec3(.12,.17,.18)*stripe;
 metal*=1.-groove*.15;
 // Captures are recessed, continuous structural surfaces, revealed from within.
 float inset=step(.033,uv.x)*step(uv.x,.967)*step(.04,uv.y)*step(uv.y,.96);
 float face=step(.028,abs(local.z));
 float reveal=inset*face*ready*(1.-step(.5,part));
 vec2 imageUV=(uv-vec2(.033,.04))/vec2(.934,.92);
 vec3 software=texture(capture,vec2(imageUV.x,1.-imageUV.y)).rgb;
 float selectedFace=1.-smoothstep(.1,.9,abs(index-selected));
 vec3 material=mix(metal,software*(.57+selectedFace*.33+opening*.1)+metal*.04,reveal);
 float seam=step(.982,abs(local.y)/1.1)+step(.985,abs(local.x)/1.65);
 material+=vec3(.55,.41,.25)*seam*(.26+opening*.3);
 color=vec4(material,1.);
}`;
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const mix = (a, b, t) => a + (b - a) * t;
const norm = (a) => {
  const l = Math.hypot(...a);
  return a.map((v) => v / l);
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
function lookAt(eye, target) {
  const z = norm(eye.map((v, i) => v - target[i])),
    x = norm(cross([0, 1, 0], z)),
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
  const ring = [
      [-1.5, -1.1],
      [1.43, -1.1],
      [1.65, -0.88],
      [1.65, 0.82],
      [1.37, 1.1],
      [-1.48, 1.1],
      [-1.65, 0.93],
      [-1.65, -0.94],
    ],
    v = [];
  const tri = (a, b, c, n) => v.push(...a, ...n, ...b, ...n, ...c, ...n);
  for (const z of [-0.031, 0.031])
    for (let i = 0; i < 8; i++) {
      const a = ring[i],
        b = ring[(i + 1) % 8];
      tri(
        [0, 0, z],
        [a[0] * 0.986, a[1] * 0.979, z],
        [b[0] * 0.986, b[1] * 0.979, z],
        [0, 0, Math.sign(z)],
      );
    }
  for (let i = 0; i < 8; i++) {
    const a = ring[i],
      b = ring[(i + 1) % 8],
      n = norm([b[1] - a[1], a[0] - b[0], 0]);
    for (const sign of [-1, 1]) {
      const p = [a[0], a[1], sign * 0.018],
        q = [b[0], b[1], sign * 0.018],
        r = [a[0] * 0.986, a[1] * 0.979, sign * 0.031],
        s = [b[0] * 0.986, b[1] * 0.979, sign * 0.031],
        bevel = norm([n[0], n[1], sign]);
      tri(p, q, r, bevel);
      tri(q, s, r, bevel);
    }
    tri([...a, -0.018], [...b, -0.018], [...a, 0.018], n);
    tri([...b, -0.018], [...b, 0.018], [...a, 0.018], n);
  }
  return new Float32Array(v);
}

// Two articulated yokes hold the application leaves; the centre is an open cavity.
function frameGeometry() {
  const v = [];
  function beam(a, b, width, depth) {
    const dir = norm(b.map((x, i) => x - a[i]));
    let across = norm(
      cross(dir, Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]),
    );
    const up = cross(dir, across);
    const pt = (end, u, w) =>
      end.map(
        (x, i) => x + (across[i] * u * width) / 2 + (up[i] * w * depth) / 2,
      );
    const ring = [
      [-0.76, -1],
      [0.76, -1],
      [1, -0.76],
      [1, 0.76],
      [0.76, 1],
      [-0.76, 1],
      [-1, 0.76],
      [-1, -0.76],
    ];
    const caps = [a, b].map((end) => ring.map(([u, w]) => pt(end, u, w)));
    const tri = (a, b, c, n) => v.push(...a, ...n, ...b, ...n, ...c, ...n);
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 8; i++)
        tri(
          j ? b : a,
          caps[j][i],
          caps[j][(i + 1) % 8],
          dir.map((x) => x * (j ? 1 : -1)),
        );
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8,
        A = caps[0][i],
        B = caps[0][j],
        C = caps[1][i],
        D = caps[1][j],
        n = norm(
          cross(
            B.map((x, k) => x - A[k]),
            dir,
          ),
        );
      tri(A, B, C, n);
      tri(B, D, C, n);
    }
  }
  // A broken perimeter, two depth rails and discrete retention ribs.
  beam([1.54, -0.9, 0.35], [1.54, 0.78, 0.35], 0.095, 0.13);
  beam([1.54, 0.78, 0.35], [1.23, 1.08, 0.35], 0.095, 0.13);
  beam([1.23, 1.08, 0.35], [-0.48, 1.08, 0.35], 0.095, 0.13);
  beam([1.54, -0.9, 0.35], [1.29, -1.12, 0.35], 0.095, 0.13);
  beam([1.29, -1.12, 0.35], [0.88, -1.12, 0.35], 0.095, 0.13);
  beam([1.54, 0.72, 0.32], [1.54, 0.72, -1.92], 0.09, 0.11);
  beam([1.3, -1.08, 0.32], [1.3, -1.08, -1.92], 0.09, 0.11);
  beam([1.54, 0.78, -1.92], [1.22, 1.06, -1.92], 0.1, 0.13);
  beam([1.22, 1.06, -1.92], [-0.28, 1.06, -1.92], 0.1, 0.13);
  for (let i = 0; i < 8; i++) {
    const z = 0.12 - i * 0.245;
    beam([1.48, 0.72, z], [1.13, 0.72, z], 0.045, 0.07);
    beam([1.3, -1.04, z], [0.99, -0.8, z], 0.045, 0.07);
  }
  return new Float32Array(v);
}

export function createHero(canvas, apps, wake) {
  const fallback = { render: () => false, resize: () => {} },
    gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  if (!gl) return fallback;
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      gl.deleteProgram(program);
      return fallback;
    }
    gl.attachShader(program, s);
    gl.deleteShader(s);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return fallback;
  }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const leafVertices = geometry(),
    frameVertices = frameGeometry(),
    vertices = new Float32Array([...leafVertices, ...frameVertices]),
    buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  for (let i = 0; i < 2; i++) {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 24, i * 12);
  }
  const uniforms = [
      "part",
      "projection",
      "view",
      "orbit",
      "pointer",
      "index",
      "opening",
      "passage",
      "selected",
      "capture",
      "eye",
      "clock",
      "ready",
    ],
    u = Object.fromEntries(
      uniforms.map((n) => [n, gl.getUniformLocation(program, n)]),
    );
  const ext = gl.getExtension("EXT_texture_filter_anisotropic");
  const textures = apps.map(() => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([18, 24, 23, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { texture: t, ready: false, requested: false };
  });
  let available = true,
    requested = false,
    width = 1,
    height = 1,
    start = null,
    quality = 1,
    slow = 0;
  async function loadSurface(i) {
    const t = textures[i];
    if (t.requested) return;
    t.requested = true;
    try {
      const image = new Image();
      image.src = apps[i].evidence.full;
      await image.decode();
      if (!available) return;
      const c = document.createElement("canvas"),
        limit = innerWidth < 700 ? 640 : 1024;
      c.width = Math.min(limit, image.naturalWidth);
      c.height = Math.round(
        (c.width * image.naturalHeight) / image.naturalWidth,
      );
      c.getContext("2d").drawImage(image, 0, 0, c.width, c.height);
      gl.bindTexture(gl.TEXTURE_2D, t.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      if (ext)
        gl.texParameterf(
          gl.TEXTURE_2D,
          ext.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)),
        );
      t.ready = true;
      wake();
    } catch {
      t.ready = false;
    }
  }
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const d =
      Math.min(devicePixelRatio, innerWidth < 700 ? 1.4 : 1.7) * quality;
    canvas.width = Math.max(1, Math.round(width * d));
    canvas.height = Math.max(1, Math.round(height * d));
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
    render(time, p, px, py, reduced, dt, interaction) {
      if (!available) return false;
      if (start === null) start = time;
      const open = Math.max(
          reduced ? 0 : smooth((p - 0.06) / 0.46),
          interaction.spread,
        ),
        pass = reduced ? 0 : smooth((p - 0.48) / 0.35),
        travel = reduced ? 0 : smooth((p - 0.58) / 0.42);
      if (!requested) {
        requested = true;
        [0, 1, 3, 4, 7].forEach(loadSurface);
      }
      if (open > 0.025) textures.forEach((_, i) => loadSurface(i));
      if (dt > 35 && !reduced) {
        if (++slow > 40 && quality === 1) {
          quality = 0.8;
          resize();
        }
      } else slow = Math.max(0, slow - 1);
      const t = reduced ? 5 : (time - start) / 1000,
        aspect = width / Math.max(1, height),
        f = 1 / Math.tan(0.51 / 2),
        near = 0.08,
        far = 50;
      const projection = new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        -0.34 * (1 - open) * (1 - pass) * (innerWidth < 700 ? 0 : 1),
        0,
        (far + near) / (near - far),
        -1,
        0,
        0,
        (2 * far * near) / (near - far),
        0,
      ]);
      const eye = [
          3.4 * (1 - open * 0.65) * (1 - pass),
          mix(1.65, 0, pass),
          mix((innerWidth < 700 ? 13.4 : 9.7) + open * 3.2, -9.5, travel),
        ],
        target = [0, 0, mix(-0.4, eye[2] - 7, pass)];
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniformMatrix4fv(u.projection, false, projection);
      gl.uniformMatrix4fv(u.view, false, lookAt(eye, target));
      gl.uniform3fv(u.eye, eye);
      gl.uniform2f(u.orbit, interaction.yaw * 0.38, interaction.pitch * 0.5);
      gl.uniform2f(u.pointer, reduced ? 0 : px, reduced ? 0 : py);
      gl.uniform1f(u.opening, open);
      gl.uniform1f(u.passage, pass);
      gl.uniform1f(u.selected, interaction.selected);
      gl.uniform1f(u.clock, t);
      gl.uniform1i(u.capture, 0);
      gl.uniform1f(u.part, 0);
      for (let i = 15; i >= 0; i--) {
        gl.uniform1f(u.index, i);
        gl.uniform1f(u.ready, textures[i].ready ? 1 : 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[i].texture);
        gl.drawArrays(gl.TRIANGLES, 0, leafVertices.length / 6);
      }
      gl.uniform1f(u.part, 1);
      gl.uniform1f(u.ready, 0);
      for (let i = 0; i < 2; i++) {
        gl.uniform1f(u.index, i);
        gl.drawArrays(
          gl.TRIANGLES,
          leafVertices.length / 6,
          frameVertices.length / 6,
        );
      }
      canvas.dataset.surfaces = String(textures.filter((t) => t.ready).length);
      return !reduced && p < 0.98;
    },
  };
}
