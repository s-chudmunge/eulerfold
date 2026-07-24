'use client';

import { useEffect, useRef } from 'react';
import styles from './FluidGradient.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FluidGradientProps {
  /** Animation speed multiplier. Default: 0.5 */
  speed?: number;
  /** Wave intensity / amplitude. Default: 1.0 */
  intensity?: number;
  /** The type of flow pattern. Default: 'wave' */
  pattern?: 'wave' | 'crisscross' | 'diagonal';
  /** Number of wave layers. Default: 5 */
  waveLayers?: number;
  /**
   * Five gradient stop colours in CSS hex format.
   * Default: blue/cyan palette from the reference image.
   */
  colors?: [string, string, string, string, string];
  /** CSS className applied to the container div */
  className?: string;
  /** Inline style applied to the container div */
  style?: React.CSSProperties;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** Sample a 5-stop palette at position t ∈ [0,1] */
function samplePalette(
  palette: [string, string, string, string, string],
  t: number
): [number, number, number] {
  const stops = palette.map(hexToRgb);
  const seg = Math.min(t, 0.9999) * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  // cubic smoothstep
  const smooth = f * f * (3 - 2 * f);
  return lerpRgb(stops[i] as [number,number,number], stops[i + 1] as [number,number,number], smooth);
}

// ─── WebGL detection ──────────────────────────────────────────────────────────

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── WebGL renderer (GPU path) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vertex shader — minimal pass-through.
 */
const VERT = /* glsl */`
  attribute vec2 a_position;
  varying   vec2 v_uv;
  void main() {
    v_uv        = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/**
 * Fragment shader — layered diagonal sine waves, no expensive fBm.
 * Wave-based distortion is O(N) additions/sines, not recursive noise loops.
 */
const FRAG = /* glsl */`
  precision mediump float;

  uniform float u_time;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_aspect;
  uniform int   u_pattern;
  uniform vec3  u_c0;
  uniform vec3  u_c1;
  uniform vec3  u_c2;
  uniform vec3  u_c3;
  uniform vec3  u_c4;

  varying vec2 v_uv;

  // ── Cheap smooth hash ──────────────────────────────────────────────────────
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // ── 2-octave value noise (very cheap) ─────────────────────────────────────
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),           hash(i + vec2(1,0)), u.x),
      mix(hash(i+vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  // ── 5-stop palette ─────────────────────────────────────────────────────────
  vec3 palette(float t) {
    t = clamp(t, 0.0, 0.99999) * 4.0;
    int   s = int(t);
    float f = fract(t);
    f = f * f * (3.0 - 2.0 * f); // smoothstep

    if      (s == 0) return mix(u_c0, u_c1, f);
    else if (s == 1) return mix(u_c1, u_c2, f);
    else if (s == 2) return mix(u_c2, u_c3, f);
    else             return mix(u_c3, u_c4, f);
  }

  // ── Diagonal wave distortion ───────────────────────────────────────────────
  // Uses layered sines in different directions — very cheap, wave-like ribbons.
  vec2 waveWarp(vec2 uv, float t) {
    float amp = 0.13 * u_intensity;
    
    if (u_pattern == 2) { // crisscross
      float w1 = sin(uv.x * 4.5 + t * 1.2) * amp * 1.5;
      float w2 = cos(uv.y * 4.5 + t * 1.1) * amp * 1.5;
      float w3 = sin(uv.x * 2.0 - uv.y * 2.0 + t) * amp;
      return uv + vec2(w1 + w3, w2 - w3);
    }
    else if (u_pattern == 3) { // diagonal
      float w1 = sin(uv.x * 3.5 + uv.y * 3.5 + t * 1.2) * amp * 1.5;
      float w2 = cos(uv.x * 2.5 - uv.y * 2.5 + t * 1.0) * amp * 1.5;
      return uv + vec2(w1, w2);
    }
    else { // wave (default 0)
      float w1 = sin(uv.x * 3.2 + uv.y * 2.1 + t * 0.9) * amp;
      float w2 = sin(uv.x * 2.4 - uv.y * 3.1 + t * 0.7) * amp * 0.65;
      float w3 = cos(uv.x * 4.5 + uv.y * 1.3 - t * 0.55) * amp * 0.40;
      float w4 = sin(uv.x * 1.2 + uv.y * 1.8 + t * 0.35) * amp * 0.55;
      float n  = noise(uv * 2.5 + t * 0.18) * amp * 0.50;
      return uv + vec2(w1 + w2 + n, w3 + w4 + n);
    }
  }

  void main() {
    float aspect = u_aspect;
    vec2  uv     = v_uv;
    uv.x        *= aspect;

    float t = u_time * u_speed;

    // Warp the UV coordinates with waves
    vec2 warped = waveWarp(uv, t);

    // A second lighter pass of warping for extra depth
    warped = waveWarp(warped * 0.9, t * 0.6) * (1.0 / 0.9);

    // Sample palette along the warped X+Y diagonal
    float idx = (warped.x / aspect + warped.y) * 0.42;
    // Add a slow noise drift so colours shift gently over time
    idx += noise(uv * 1.8 - t * 0.10) * 0.3;

    // Ping-pong wave to seamlessly bounce the index between 0.0 and 1.0.
    // This completely eliminates any hard edges when the UV coordinates drift out of bounds.
    idx = abs(fract(idx * 0.5) * 2.0 - 1.0);

    vec3 color = palette(idx);

    // Bright crest highlight on wave peaks
    float crest = sin(warped.x * 5.0 + warped.y * 4.0 + t * 1.2);
    crest = max(0.0, crest);
    crest = pow(crest, 6.0) * 0.35;
    color += crest * u_c0;

    // Vignette
    vec2  cen = v_uv - 0.5;
    float vig = 1.0 - dot(cen, cen) * 1.35;
    color    *= max(vig, 0.0);

    // Mild gamma lift
    color = pow(max(color, vec3(0.0)), vec3(0.94));

    gl_FragColor = vec4(color, 1.0);
  }
`;

function runWebGL(
  canvas: HTMLCanvasElement,
  props: Required<Pick<FluidGradientProps, 'speed' | 'intensity' | 'colors' | 'pattern'>>,
  state: { isVisible: boolean }
): () => void {
  const gl =
    (canvas.getContext('webgl', { powerPreference: 'low-power', antialias: false }) ||
     canvas.getContext('experimental-webgl', { powerPreference: 'low-power', antialias: false })) as WebGLRenderingContext | null;

  if (!gl) throw new Error('no-webgl');

  // Compile shader
  function compile(type: number, src: string): WebGLShader {
    const sh = gl!.createShader(type)!;
    gl!.shaderSource(sh, src);
    gl!.compileShader(sh);
    if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS))
      throw new Error(gl!.getShaderInfoLog(sh) ?? 'shader error');
    return sh;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog) ?? 'link error');
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const posLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const uTime      = gl.getUniformLocation(prog, 'u_time');
  const uSpeed     = gl.getUniformLocation(prog, 'u_speed');
  const uIntensity = gl.getUniformLocation(prog, 'u_intensity');
  const uAspect    = gl.getUniformLocation(prog, 'u_aspect');
  const uPattern   = gl.getUniformLocation(prog, 'u_pattern');
  const uC         = [0,1,2,3,4].map(i => gl.getUniformLocation(prog, `u_c${i}`));

  gl.uniform1f(uSpeed, props.speed);
  gl.uniform1f(uIntensity, props.intensity);
  
  let patternInt = 0;
  if (props.pattern === 'crisscross') patternInt = 2;
  else if (props.pattern === 'diagonal') patternInt = 3;
  gl.uniform1i(uPattern, patternInt);

  function setColors(cols: [string,string,string,string,string]) {
    cols.forEach((hex, i) => {
      const [r, g, b] = hexToRgb(hex);
      gl!.uniform3f(uC[i], r / 255, g / 255, b / 255);
    });
  }
  setColors(props.colors);

  // Resize
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5x
    const w = canvas.clientWidth  * dpr | 0;
    const h = canvas.clientHeight * dpr | 0;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
    }
    gl!.uniform1f(uAspect, w / Math.max(h, 1));
  }
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  let start = performance.now();

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!state.isVisible) return;
    const elapsed = (performance.now() - start) / 1000;
    gl!.uniform1f(uTime, elapsed);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
  }
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Canvas 2D renderer (CPU fallback) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Draws 7 large radial gradients whose centres oscillate on sine/cosine paths.
 * Runs at a fixed 30 fps max to keep CPU usage minimal.
 * The canvas is rendered at half resolution and CSS-scaled up — the bilinear
 * upscaling gives a natural softness identical to a GPU blur pass.
 */
function runCanvas2D(
  canvas: HTMLCanvasElement,
  props: Required<Pick<FluidGradientProps, 'speed' | 'intensity' | 'colors' | 'pattern'>>,
  state: { isVisible: boolean }
): () => void {
  const ctx = canvas.getContext('2d')!;

  // Render at half resolution for performance (CSS upscale handles the blur)
  const SCALE = 0.5;

  function resize() {
    canvas.width  = (canvas.clientWidth  * SCALE) | 0;
    canvas.height = (canvas.clientHeight * SCALE) | 0;
  }
  resize();
  window.addEventListener('resize', resize);

  // We use highly stretched ellipses to simulate flowing ribbons of colour,
  // preventing them from looking like distinct "blobs".
  const ribbons = [
    { px: 0.0, py: 0.0, rx: 3.5, ry: 0.4, r: 0.65, ci: 0.0,  angle: 0.4 },
    { px: 1.2, py: 0.8, rx: 4.0, ry: 0.3, r: 0.60, ci: 0.25, angle: 0.7 },
    { px: 2.4, py: 1.6, rx: 3.2, ry: 0.5, r: 0.55, ci: 0.50, angle: -0.2 },
    { px: 3.6, py: 2.4, rx: 4.5, ry: 0.3, r: 0.52, ci: 0.75, angle: 0.8 },
    { px: 4.8, py: 0.4, rx: 3.8, ry: 0.4, r: 0.65, ci: 1.00, angle: -0.4 },
    { px: 0.6, py: 3.2, rx: 3.5, ry: 0.4, r: 0.50, ci: 0.38, angle: 0.5 },
  ];

  let raf = 0;
  let last = 0;
  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (!state.isVisible) return;
    if (now - last < 33) return; // ~30 fps cap
    last = now;

    const t   = now / 1000 * props.speed;
    const W   = canvas.width;
    const H   = canvas.height;

    // Dark base
    ctx.fillStyle = '#03031a';
    ctx.fillRect(0, 0, W, H);

    // Blend mode: lighter stacks colours additively like emissive lights
    ctx.globalCompositeOperation = 'lighter';

    ribbons.forEach((b) => {
      // Smooth sinusoidal motion in two axes, kept mostly central so edges don't reveal the ribbon ends
      const cx = (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.7 + b.px))) * W;
      const cy = (0.3 + 0.4 * (0.5 + 0.5 * Math.cos(t * 0.6 + b.py))) * H;

      // Wave ripple — displace position further based on pattern
      let waveX = 0, waveY = 0;
      if (props.pattern === 'crisscross') {
        waveX = Math.sin(t * 1.2 + b.py * 1.5) * W * 0.15 * props.intensity;
        waveY = Math.cos(t * 1.2 + b.px * 1.5) * H * 0.15 * props.intensity;
      } else if (props.pattern === 'diagonal') {
        waveX = Math.sin(t * 1.1 + (b.px + b.py) * 0.8) * W * 0.12 * props.intensity;
        waveY = Math.cos(t * 0.9 + (b.px - b.py) * 0.8) * H * 0.12 * props.intensity;
      } else { // default wave
        waveX = Math.sin(t * 1.1 + b.py * 0.8) * W * 0.1 * props.intensity;
        waveY = Math.cos(t * 0.9 + b.px * 0.7) * H * 0.1 * props.intensity;
      }

      const x = cx + waveX;
      const y = cy + waveY;
      const r = Math.min(W, H) * b.r * props.intensity;

      // Colour shifts gently over time
      const drift = (Math.sin(t * 0.25 + b.ci * 6.28) * 0.5 + 0.5) * 0.3;
      const [cr, cg, cb] = samplePalette(props.colors, (b.ci + drift) % 1);

      // Create a highly stretched radial gradient that looks like a linear ribbon
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0,   `rgba(${cr|0},${cg|0},${cb|0},0.85)`);
      grad.addColorStop(0.3, `rgba(${cr|0},${cg|0},${cb|0},0.40)`);
      grad.addColorStop(1,   `rgba(${cr|0},${cg|0},${cb|0},0.00)`);

      const rotation = b.angle + Math.sin(t * 0.3 + b.px) * 0.3;

      ctx.beginPath();
      ctx.ellipse(x, y, r * b.rx, r * b.ry, rotation, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H) * 0.75);
    vig.addColorStop(0,   'rgba(0,0,0,0)');
    vig.addColorStop(0.6, 'rgba(0,0,0,0)');
    vig.addColorStop(1,   'rgba(0,0,0,0.6)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── React Component ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_COLORS: [string, string, string, string, string] = [
  '#00e5ff', // cyan
  '#1565ff', // electric blue
  '#0d1fff', // deep blue
  '#6a00d4', // vivid purple
  '#0a0a2a', // near-black navy
];

export default function FluidGradient({
  speed      = 0.5,
  intensity  = 1.0,
  pattern    = 'wave',
  waveLayers = 5,
  colors     = DEFAULT_COLORS,
  className,
  style,
}: FluidGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void waveLayers; // kept in API for future use

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const propsSnapshot = { speed, intensity, colors, pattern };
    const state = { isVisible: false };

    const observer = new IntersectionObserver((entries) => {
      state.isVisible = entries[0].isIntersecting;
    }, { rootMargin: '100px' });
    observer.observe(canvas);

    let cleanup: (() => void) | undefined;

    if (supportsWebGL()) {
      try {
        cleanup = runWebGL(canvas, propsSnapshot, state);
      } catch {
        cleanup = runCanvas2D(canvas, propsSnapshot, state);
      }
    } else {
      cleanup = runCanvas2D(canvas, propsSnapshot, state);
    }

    return () => {
      observer.disconnect();
      cleanup?.();
    };
  // Re-run when config changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, intensity, JSON.stringify(colors)]);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${className ?? ''}`}
      style={style}
      aria-hidden="true"
    />
  );
}
