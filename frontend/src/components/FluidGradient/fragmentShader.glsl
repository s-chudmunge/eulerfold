precision highp float;

uniform float uTime;
uniform float uSpeed;
uniform float uIntensity;
uniform float uWarpStrength;
uniform vec2  uResolution;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;

varying vec2 vUv;

// ─── Hash & Value Noise ────────────────────────────────────────────────────────
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// ─── Smooth Value Noise ────────────────────────────────────────────────────────
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x),
             mix(c, d, u.x), u.y);
}

// ─── Fractional Brownian Motion (fBm) ─────────────────────────────────────────
float fbm(vec2 p) {
  float value  = 0.0;
  float amp    = 0.5;
  float freq   = 1.0;
  float total  = 0.0;

  for (int i = 0; i < 6; i++) {
    value += amp * noise(p * freq);
    total += amp;
    amp   *= 0.5;
    freq  *= 2.1;
    // Rotate slightly each octave for more variety
    float angle = 0.4;
    float c = cos(angle);
    float s = sin(angle);
    p = mat2(c, -s, s, c) * p;
  }
  return value / total;
}

// ─── Domain Warping ────────────────────────────────────────────────────────────
// "Warps" the UV domain using fbm so the final sample looks fluid/ribbon-like.
vec2 domainWarp(vec2 p, float t) {
  float warp = uWarpStrength;

  // First level of warping
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + 0.12 * t),
    fbm(p + vec2(5.2, 1.3) + 0.12 * t)
  );

  // Second level – warp of the warp for the silky ribbon look
  vec2 r = vec2(
    fbm(p + warp * q + vec2(1.7, 9.2) + 0.11 * t),
    fbm(p + warp * q + vec2(8.3, 2.8) + 0.11 * t)
  );

  return r;
}

// ─── Palette ───────────────────────────────────────────────────────────────────
// Cosine-based smooth palette used to blend the 5 user colours.
vec3 palette(float t) {
  // Map t (0-1) into segments across the 5 colours
  float seg = t * 4.0;
  int   idx = int(floor(seg));
  float f   = fract(seg);
  f = f * f * (3.0 - 2.0 * f); // smooth

  vec3 cols[5];
  cols[0] = uColor1;
  cols[1] = uColor2;
  cols[2] = uColor3;
  cols[3] = uColor4;
  cols[4] = uColor5;

  // clamp idx to avoid out-of-bounds
  int  i0 = clamp(idx,     0, 4);
  int  i1 = clamp(idx + 1, 0, 4);

  vec3 c0 = cols[i0];
  vec3 c1 = cols[i1];
  return mix(c0, c1, f);
}

// ─── Specular Highlight ────────────────────────────────────────────────────────
float specular(vec2 uv, float t) {
  // Fake light moving across the surface
  vec2 lightDir = normalize(vec2(sin(t * 0.3), cos(t * 0.25)));
  vec2 normal   = normalize(vec2(
    fbm(uv + vec2(0.01, 0.0)) - fbm(uv - vec2(0.01, 0.0)),
    fbm(uv + vec2(0.0, 0.01)) - fbm(uv - vec2(0.0, 0.01))
  ));
  float diff = max(0.0, dot(normal, lightDir));
  return pow(diff, 4.0) * 0.45;
}

void main() {
  // Correct aspect ratio so the effect doesn't stretch
  float aspect = uResolution.x / uResolution.y;
  vec2  uv     = vUv;
  uv.x        *= aspect;

  float t = uTime * uSpeed;

  // ── Domain warped coordinates ──
  vec2 warped = domainWarp(uv * 1.8, t);

  // ── Colour sample using the warped coords ──
  float colIdx = fbm(warped * 2.5 + t * 0.08) * uIntensity;
  colIdx = clamp(colIdx, 0.0, 1.0);

  vec3 color = palette(colIdx);

  // ── Ribbon highlight (brighter bands) ──
  float highlight = pow(fbm(warped * 3.0 - t * 0.05), 3.0);
  color += highlight * 0.35 * uColor1;   // tint highlights with primary colour

  // ── Fake specular sheen ──
  color += specular(uv, t);

  // ── Slight vignette to keep edges dark and cinematic ──
  vec2  centred  = vUv - 0.5;
  float vignette = 1.0 - dot(centred, centred) * 1.2;
  color         *= vignette;

  // ── Gamma correction (approximate) ──
  color = pow(max(color, 0.0), vec3(0.95));

  gl_FragColor = vec4(color, 1.0);
}
