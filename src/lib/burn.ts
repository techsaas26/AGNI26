/**
 * Full-screen "the loader catches fire" effect, drawn by a WebGL fragment shader.
 * The shader repaints what the loader shows (ink backdrop + ember glow + the logo) and eats it from
 * the bottom up along a ragged front: behind the front is transparent (the page shows through),
 * on it flames, heat and embers. Progress `v` (0 → 1) is the only input, apart from the clock.
 * Returns null when WebGL is unavailable.
 */
export interface Burn {
  draw(v: number, seconds: number): void;
  destroy(): void;
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;      // canvas px
uniform vec4 uLogo;     // x, y (from bottom), w, h in canvas px
uniform sampler2D uTex;
uniform float uP;       // front position
uniform float uT;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}

vec3 fireRamp(float h){
  h=clamp(h,0.,1.);
  vec3 c=vec3(0.);
  c+=vec3(0.95,0.1,0.0)*smoothstep(0.0,0.4,h);
  c+=vec3(0.05,0.5,0.0)*smoothstep(0.25,0.8,h);
  c+=vec3(0.0,0.2,0.3)*smoothstep(0.85,1.0,h);
  return c;
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 uv=fc/uRes;
  float asp=uRes.x/uRes.y;
  vec2 q=vec2(uv.x*asp,uv.y);

  // what the loader looked like
  vec3 ink=vec3(.043,.016,.012);
  float glow=exp(-pow(length((uv-vec2(.5,.46))*vec2(1.0,1.25)),2.)*5.);
  vec3 scene=ink+vec3(1.,.42,.1)*.16*glow;
  scene*=1.-.55*smoothstep(.55,1.15,length((uv-.5)*vec2(1.1,1.)));
  vec2 lt=(fc-uLogo.xy)/uLogo.zw;
  if(lt.x>0.&&lt.x<1.&&lt.y>0.&&lt.y<1.){vec4 l=texture2D(uTex,lt);scene=scene*(1.-l.a)+l.rgb;}

  // heat field: ragged, rises from the bottom, with a couple of extra ignition points
  float n=fbm(q*3.2+vec2(0.,uT*.05));
  float m=fbm(q*9.+vec2(3.1,uT*.2));
  float h=n*.55+m*.08+uv.y*.4;
  float d=h-uP;            // >0 not yet burned, <0 burned

  float scorch=smoothstep(.2,.0,d);  // dark char just before the front
  scene*=1.-.85*scorch;

  // glowing line of embers on the front, crackling
  float crack=fbm(q*22.+vec2(0.,-uT*.8));
  float rim=smoothstep(.07,.0,abs(d-.012))*(.45+.9*crack);
  vec3 col=scene+fireRamp(rim*.9)*rim*1.5;

  // flames licking up over the revealed page (d < 0), taller where the front is fresh
  float up=-d;
  float fl=fbm(vec2(q.x*11.,q.y*2.2-uT*2.8)+n*2.);
  fl=fl*smoothstep(.34,.0,up)*smoothstep(-.02,.03,up);
  float flame=clamp(pow(fl*1.9,3.),0.,.92);
  vec3 fcol=fireRamp(flame*.9+.1)*flame*1.1;

  // embers drifting up
  float em=0.;
  for(int i=0;i<3;i++){
    float s=float(i);
    vec2 g=q*(11.+s*7.)+vec2(s*7.3,-uT*(1.2+s*.7));
    vec2 id=floor(g);vec2 f=fract(g)-.5;
    float r=hash(id+s);
    vec2 o=vec2(hash(id+9.)-.5,hash(id+4.)-.5)*.6+vec2(sin(uT*3.+r*20.)*.15,0.);
    float dd=length(f-o);
    em+=smoothstep(.09+.04*r,.0,dd)*step(.55,r)*(.5+.5*sin(uT*10.+r*50.));
  }
  em*=smoothstep(.55,-.02,up)*step(0.,up+.02);
  fcol+=vec3(1.,.55,.15)*em*2.;

  float fa=clamp(flame+em*.8,0.,1.);
  // premultiplied: unburned = opaque scene, burned = only flames/embers over the page
  gl_FragColor=d>0.?vec4(col,1.):vec4(fcol,fa);
}
`;

export function createBurn(logo: HTMLImageElement): Burn | null {
  const canvas = document.createElement("canvas");
  const dpr = 1; // soft fire does not need more, and the shader is per-pixel heavy
  const W = Math.round(window.innerWidth * dpr);
  const H = Math.round(window.innerHeight * dpr);
  canvas.width = W;
  canvas.height = H;
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "10001", pointerEvents: "none" });
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logo);
  } catch {
    return null;
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const r = logo.getBoundingClientRect();
  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform2f(u("uRes"), W, H);
  gl.uniform4f(u("uLogo"), r.left * dpr, H - (r.top + r.height) * dpr, r.width * dpr, r.height * dpr);
  gl.uniform1i(u("uTex"), 0);
  const uP = u("uP");
  const uT = u("uT");
  gl.viewport(0, 0, W, H);
  document.body.appendChild(canvas);

  return {
    draw(v, seconds) {
      // `v` is already eased by the caller (a GSAP tween): 0 = untouched, 1 = nothing left
      gl.uniform1f(uP, -0.28 + v * 1.62);
      gl.uniform1f(uT, seconds);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
