import {
  preferences,
  motionAllowed,
  spring,
  wake,
  sleep,
  clamp,
} from "./motion.js";

export function initializeSurface() {
  const canvas = document.querySelector("#wafer-canvas");
  const visual = document.querySelector(".hero-visual");
  const hero = document.querySelector(".hero");
  // An analytic slab, not a mesh or ray marcher: one draw call, no textures.
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) {
    canvas.dataset.renderer = "fallback";
    return;
  }
  let program, buffer, locations;
  let lost = false,
    visible = false,
    dirty = true;
  let width = 1,
    height = 1,
    heroWidth = 1;
  let rotationTime = 0,
    accumulated = 0,
    scroll = 0,
    quality = 1;
  let slowFrames = 0;
  const pose = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  const light = { x: 0, y: 0, vx: 0, vy: 0 };

  function initializeGL() {
    const derivatives = gl.getExtension("OES_standard_derivatives");
    const highp =
      gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision >
      0;
    const vertexSource =
      "attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}";
    const fragmentSource = `${derivatives ? "#extension GL_OES_standard_derivatives : enable" : ""}
      precision ${highp ? "highp" : "mediump"} float;
      uniform vec2 resolution;
      uniform vec2 pose;
      uniform vec2 lightPosition;
      uniform float time;
      uniform float scroll;
      uniform float entrance;
      mat2 rotate(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 screen=(gl_FragCoord.xy-.5*resolution)/resolution.y;
        screen.x-=.04+pose.x*.018;
        screen.y-=sin(time*.18)*.009+pose.y*.012;
        vec3 eye=vec3(0.,0.,3.8);
        vec3 ray=normalize(vec3(screen*mix(3.1,2.55,entrance),-3.8));
        float tilt=mix(1.43,.76,entrance)+sin(time*.12)*.025+pose.y*.12+scroll*.55;
        float roll=mix(-.58,-.36,entrance)+sin(time*.09)*.022+pose.x*.10-scroll*.24;
        vec3 face=normalize(vec3(sin(roll)*sin(tilt),cos(roll)*sin(tilt),cos(tilt)));
        vec3 tangent=normalize(cross(vec3(0.,1.,0.),face));
        vec3 bitangent=cross(face,tangent);
        float hit=-dot(eye,face)/dot(ray,face);
        vec3 world=eye+ray*hit;
        vec2 p=vec2(dot(world,tangent),dot(world,bitangent));
        float radius=1.15;
        float r=length(p);
        float aa=2.0/resolution.y;
        vec2 q=rotate(time*.022)*p;
        float notch=1.-smoothstep(.022,.036,length(q-vec2(0.,-radius)));
        float front=(1.-smoothstep(radius-aa,radius+aa,r))*(1.-notch);
        float backHit=(-.023-dot(eye,face))/dot(ray,face);
        vec3 backWorld=eye+ray*backHit;
        vec2 backP=vec2(dot(backWorld,tangent),dot(backWorld,bitangent));
        float backNotch=1.-smoothstep(.022,.036,length(rotate(time*.022)*backP-vec2(0.,-radius)));
        float back=(1.-smoothstep(radius-aa,radius+aa,length(backP)))*(1.-backNotch);
        float alpha=max(front,back);
        if(alpha<.001){gl_FragColor=vec4(0.);return;}

        vec2 tile=floor(q*14.);
        vec2 f=fract(q*14.);
        float boundary=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
        float lineAA=${derivatives ? "max(fwidth(q.x*14.),fwidth(q.y*14.))*.7" : "24./resolution.y"};
        float grid=1.-smoothstep(.006,.006+lineAA,boundary);
        float variation=(hash(tile)-.5)*.007;
        float bevel=smoothstep(radius-.015,radius-.001,r);
        vec3 edgeNormal=normalize(tangent*p.x+bitangent*p.y);
        vec3 normal=normalize(mix(face,edgeNormal,bevel*.68));
        vec3 view=normalize(eye-world);
        vec3 reflection=reflect(-view,normal);
        vec3 key=normalize(vec3(-.7+lightPosition.x*.30,1.9+lightPosition.y*.20,.9));
        float diffuse=max(dot(normal,key),0.);
        float fresnel=pow(1.-max(dot(normal,view),0.),4.);
        // The strip lights are evaluated in reflected world space. Their shape
        // moves across the fixed surface as the viewing angle and light change.
        float strip=exp(-pow((reflection.x+reflection.z*.34+.24-lightPosition.x*.11)*7.,2.));
        float stripEdge=exp(-pow((reflection.x+reflection.z*.34+.37-lightPosition.x*.11)*24.,2.));
        float fill=pow(max(dot(reflection,normalize(vec3(.5,.7,.45))),0.),10.);
        float film=sin(q.x*2.5+q.y*.6+time*.08)*.5+.5;
        vec3 silicon=vec3(.044,.053,.063)+variation;
        vec3 color=silicon*(.65+diffuse*.35);
        color+=strip*vec3(.23,.25,.26)+stripEdge*vec3(.085,.09,.085)+fill*vec3(.09,.11,.13);
        color+=strip*.026*mix(vec3(.30,.40,.55),vec3(.67,.38,.18),film);
        color*=1.-grid*.22;
        color+=bevel*(.12+.46*max(dot(edgeNormal,key),0.))*vec3(.70,.78,.82);
        color+=fresnel*vec3(.05,.064,.076);
        color+=vec3((hash(gl_FragCoord.xy)-.5)*.003);
        vec3 rim=vec3(.036,.044,.052)+max(dot(edgeNormal,key),0.)*vec3(.09,.11,.12);
        color=mix(rim,color,front);
        color=pow(max(color,vec3(0.)),vec3(.83));
        gl_FragColor=vec4(color*alpha,alpha);
      }`;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error("Surface shader unavailable");
      }
      return shader;
    };
    try {
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Surface unavailable");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const attribute = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      locations = Object.fromEntries(
        [
          "resolution",
          "pose",
          "lightPosition",
          "time",
          "scroll",
          "entrance",
        ].map((name) => [name, gl.getUniformLocation(program, name)]),
      );
      canvas.dataset.renderer = "webgl";
      return true;
    } catch {
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      canvas.dataset.renderer = "fallback";
      return false;
    }
  }

  function resize() {
    width = visual.clientWidth;
    height = visual.clientHeight;
    heroWidth = hero.clientWidth;
    if (lost || !locations) return;
    const compact = preferences.compact;
    const maxPixels = compact ? 420000 : 1100000;
    const density =
      Math.min(
        devicePixelRatio || 1,
        compact ? 1.2 : 1.5,
        Math.sqrt(maxPixels / (width * height)),
      ) * quality;
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(locations.resolution, canvas.width, canvas.height);
    dirty = true;
    wake(render);
  }
  function render(delta) {
    if (!visible || lost || !locations) return false;
    const moving = motionAllowed();
    const compact = preferences.compact;
    if (moving) {
      rotationTime += delta;
      [pose.x, pose.vx] = spring(pose.x, pose.vx, pose.tx, delta);
      [pose.y, pose.vy] = spring(pose.y, pose.vy, pose.ty, delta);
      [light.x, light.vx] = spring(light.x, light.vx, pose.tx, delta, 4.2);
      [light.y, light.vy] = spring(light.y, light.vy, pose.ty, delta, 4.2);
    } else {
      pose.x =
        pose.y =
        pose.vx =
        pose.vy =
        light.x =
        light.y =
        light.vx =
        light.vy =
          0;
    }
    accumulated += delta;
    const interval = 1 / (compact ? 24 : 60);
    if (dirty || accumulated >= interval - 0.001) {
      accumulated %= interval;
      gl.uniform2f(locations.pose, pose.x, pose.y);
      gl.uniform2f(locations.lightPosition, light.x, light.y);
      gl.uniform1f(locations.time, rotationTime);
      gl.uniform1f(
        locations.entrance,
        moving ? 1 - Math.pow(1 - clamp(rotationTime / 1.8), 3) : 1,
      );
      gl.uniform1f(locations.scroll, moving ? scroll : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (dirty) visual.classList.add("is-ready");
      dirty = false;
    }
    // Reduce pixel work on consistently slow displays; never oscillate quality.
    slowFrames =
      moving && delta > 0.026 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 90 && quality > 0.6) {
      quality *= 0.8;
      slowFrames = 0;
      resize();
    }
    return moving;
  }
  if (!initializeGL()) return;
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        dirty = true;
        wake(render);
      } else sleep(render);
    },
    { threshold: 0 },
  ).observe(visual);
  new ResizeObserver(resize).observe(visual);
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (
        !motionAllowed() ||
        !preferences.pointer ||
        event.pointerType !== "mouse"
      )
        return;
      pose.tx = clamp((event.clientX / heroWidth) * 2 - 1, -1, 1);
      pose.ty = clamp(-((event.clientY / innerHeight) * 2 - 1), -1, 1);
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    pose.tx = pose.ty = 0;
  });
  window.addEventListener("artifacts:scroll", (event) => {
    scroll = event.detail;
  });
  window.addEventListener("artifacts:motion", () => {
    dirty = true;
    wake(render);
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    sleep(render);
    visual.classList.remove("is-ready");
    canvas.dataset.renderer = "fallback";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    lost = false;
    if (initializeGL()) resize();
  });
  resize();
}
