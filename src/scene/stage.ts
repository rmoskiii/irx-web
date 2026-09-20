/**
 * SceneStage maths — band parallax.
 *
 * Destination: irx-web/src/scene/stage.ts
 *
 * PASS B FINDING — parallax here is TRANSLATION ONLY, and that is not a
 * simplification.
 *
 * scene.neighbourhood_night is drawn in true one-point perspective: the
 * terraces recede to a vanishing point and the target house is already small
 * because it is already far away. The depth is baked into the geometry.
 *
 * The first implementation also scaled each band by its depth, the standard
 * model for flat stacked layers. Measured at the terminal beat it produced
 * k = 0.056 for `architecture` — and `architecture` is the band holding the
 * target house and the aperture. The camera zoomed from 1600u to 54u while
 * the destination rendered at 5.6% of that zoom, so the house never
 * approached. Differential band scale double-counts a perspective the artwork
 * already contains, and it cancels exactly the thing the act is for.
 *
 * So: uniform scale from the camera, differential translation per band.
 *
 *   c_d = c0 + (c - c0) * d          band pans a fraction d of the camera
 *   T(p) = p + (c - c_d)             = p + (c - c0) * (1 - d)
 *
 * A distant band (d small) is dragged furthest with the camera, so it appears
 * to move least against the frame — which is what parallax is. d = 1 is the
 * identity. Depth still reads on lateral travel, which is where the eye looks
 * for it, and the approach survives.
 *
 * A flat-stacked scene would want the scale term back; that is a property of
 * the scene, so it belongs in SceneMeta when a second scene needs it, not in
 * a second camera system.
 */
import type { Frame } from '../motion/camera';

/**
 * The parallax reference is the scene's WIDEST beat, not its first.
 *
 * Reference means "the framing the scene is composed for" — the datum every
 * band is in register at. For the exterior that is the opening wide shot,
 * which is also beat one, so first and widest coincided and the distinction
 * stayed hidden.
 *
 * The interior opens OUTWARD from the hinge. Taking beat one as the reference
 * put the datum inside a lamp shade at (721,213); by the room-established beat
 * the camera had travelled 237 units down and the background band lagged 213
 * behind it, leaving the top of frame empty. Widest gets both scenes right
 * without either declaring anything.
 */
export function widestFrame(frames: Frame[]): Frame {
  return frames.reduce((a, b) => (b.w > a.w ? b : a));
}

export function bandTransform(frame: Frame, ref: Frame, depth: number): string {
  if (depth >= 1) return '';
  const cx = frame.x + frame.w / 2;
  const cy = frame.y + frame.h / 2;
  const c0x = ref.x + ref.w / 2;
  const c0y = ref.y + ref.h / 2;
  const dx = (cx - c0x) * (1 - depth);
  const dy = (cy - c0y) * (1 - depth);
  if (dx === 0 && dy === 0) return '';
  return `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`;
}

/* ------------------------------------------------------------------ *
 * PLACEHOLDER GEOMETRY — Pass B only.
 *
 * Blocks on the real 2200x900 canvas, laid out on the real perspective
 * (VP 1240,470) with the real per-band overscan, and carrying the real
 * aperture at 1155,360,170,120 with its lit pane at 1240,360,85,55.
 *
 * Deliberately crude: the question Pass B answers is whether the CAMERA
 * feels cinematic before scene complexity is introduced. Replaced wholesale
 * by split_bands.py output in Pass C.
 * ------------------------------------------------------------------ */

const VP = { x: 1240, y: 470 };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A terrace of receding blocks, from a near corner toward the VP. */
function terrace(nearX: number, nearGround: number, nearRoof: number, ts: number[], fill: string) {
  let out = '';
  for (let i = 0; i < ts.length - 1; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    const x0 = lerp(nearX, VP.x, t0), x1 = lerp(nearX, VP.x, t1);
    const r0 = lerp(nearRoof, VP.y, t0), r1 = lerp(nearRoof, VP.y, t1);
    const g0 = lerp(nearGround, VP.y, t0), g1 = lerp(nearGround, VP.y, t1);
    const shade = i % 2 === 0 ? fill : '#5A4A44';
    out += `<path fill="${shade}" stroke="#241D19" stroke-width="${(3 - t0 * 1.6).toFixed(1)}"
      d="M${x0} ${r0} L${x1} ${r1} L${x1} ${g1} L${x0} ${g0} z"/>`;
    // one lit window per unit, so the street reads as inhabited at t=0
    if (i % 2 === 1) {
      const wx = lerp(x0, x1, 0.3), wx2 = lerp(x0, x1, 0.55);
      const wy = lerp(r0, g0, 0.28), wy2 = lerp(r0, g0, 0.52);
      out += `<path fill="#C89A4E" d="M${wx} ${wy} L${wx2} ${wy} L${wx2} ${wy2} L${wx} ${wy2} z"/>`;
    }
  }
  return out;
}

export const PLACEHOLDER_BANDS: { id: string; depth: number; svg: string }[] = [
  {
    id: 'background',
    depth: 0.05,
    // overscan 300: spans the full 2200 canvas
    svg: `
      <rect x="-300" y="-200" width="2800" height="386" fill="#334051"/>
      <rect x="-300" y="186" width="2800" height="146" fill="#4D4656"/>
      <rect x="-300" y="332" width="2800" height="340" fill="#785A4F"/>
      <path fill="#2A333E" d="M760 470 v-96 h30 v-58 h26 v58 h22 v-132 h34 v132 h26 v-74 h30 v74
        h34 v-40 h28 v40 h30 v-108 h32 v108 h26 v-64 h34 v64 h28 v-92 h30 v92 h34 v-46 h26 v46
        h30 v-120 h32 v120 h28 v-70 h30 v70 h26 v-38 h34 v38 z"/>
      <circle cx="1636" cy="112" r="30" fill="#F2C77E" opacity="0.38"/>`,
  },
  {
    id: 'architecture',
    depth: 0.15,
    // overscan 180: content spans 120..2080
    svg:
      terrace(120, 838, 146, [0, 0.19, 0.36, 0.505, 0.63, 0.75, 0.877], '#7A6459') +
      terrace(2080, 838, 164, [0, 0.19, 0.36, 0.505, 0.63, 0.75, 0.877], '#7A6459') +
      '',
  },
  {
    // THE REFERENCE PLANE. The far terrace sits at the vanishing point and
    // holds the destination, so it moves with the camera: depth 1.0, no
    // transform. Everything else parallaxes against it.
    id: 'architecture_far',
    depth: 1.0,
    svg: `<rect x="980" y="322" width="80" height="193" fill="#64514A" stroke="#241D19" stroke-width="2"/>
       <rect x="1060" y="180" width="340" height="335" fill="#7A6459" stroke="#241D19" stroke-width="3"/>
       <rect x="1400" y="330" width="80" height="185" fill="#64514A" stroke="#241D19" stroke-width="2"/>
       <rect x="1152" y="226" width="64" height="70" fill="#2A333E"/>
       <rect x="1256" y="226" width="64" height="70" fill="#2A333E"/>
       <rect x="1086" y="424" width="54" height="91" fill="#2A333E"/>
       <rect x="980" y="515" width="500" height="26" fill="#5A616A" stroke="#241D19" stroke-width="3"/>`,
  },
  {
    id: 'n-window-lit',
    depth: 1.0, // the destination IS the parallax reference — never translated
    // THE APERTURE, verbatim. 1155,360,170,120 with the lit pane 1240,360,85,55.
    svg: `
      <rect x="1155" y="360" width="170" height="120" fill="#C89A4E"/>
      <rect x="1163" y="368" width="154" height="74" fill="#F2C77E"/>
      <rect x="1163" y="442" width="154" height="30" fill="#FFC15E" opacity="0.55"/>
      <rect x="1163" y="368" width="34" height="104" fill="#424E56" opacity="0.9"/>
      <rect x="1240" y="360" width="3" height="120" fill="#241D19"/>
      <rect x="1155" y="414" width="170" height="3" fill="#241D19"/>
      <rect x="1155" y="360" width="170" height="120" fill="none" stroke="#241D19" stroke-width="3.4"/>
      <rect x="1145" y="480" width="190" height="12" fill="#64514A"/>`,
  },
  {
    id: 'environmental_detail',
    depth: 0.35,
    // overscan 200: content spans 100..2100
    svg: [0.06, 0.34, 0.6, 0.2, 0.5]
      .map((t, i) => {
        const left = i < 3;
        const x = lerp(left ? 100 : 2100, VP.x, t) + (left ? 46 : -46);
        const gy = lerp(838, VP.y, t);
        const h = 250 * (1 - t * 0.72);
        const lw = 30 * (1 - t * 0.6);
        return `<path stroke="#241D19" stroke-width="${Math.max(5 * (1 - t * 0.6), 1.6).toFixed(1)}"
                 fill="none" d="M${x} ${gy} v${-h}"/>
                <rect x="${x}" y="${gy - h - lw * 0.6}" width="${lw}" height="${lw * 0.62}" fill="#F2C77E"/>`;
      })
      .join(''),
  },
  {
    id: 'furniture',
    depth: 0.75,
    // overscan 140: content spans 160..2040
    svg: `
      <path fill="#5A616A" d="M160 838 L1100 515 L1134 531 L186 874 z"/>
      <path fill="#5A616A" d="M2040 838 L1346 515 L1312 531 L2014 874 z"/>
      <path fill="#3C424A" d="M186 874 L1134 531 L1137 538 L196 914 z"/>
      <path fill="#3C424A" d="M2014 874 L1312 531 L1309 538 L2004 914 z"/>
      <path fill="#2A333E" d="M196 914 L1137 538 L1309 538 L2004 914 L2200 960 L-200 960 z"/>
      <rect x="1596" y="720" width="300" height="120" rx="40" fill="#5A5F66" stroke="#241D19" stroke-width="4"/>
      <rect x="1349" y="729" width="212" height="98" rx="34" fill="#5A5F66" stroke="#241D19" stroke-width="3"/>`,
  },
  {
    id: 'near',
    depth: 0.9,
    // overscan 100: content spans 200..2000, left-weighted
    svg: `
      <path fill="#35463A" d="M120 900 q46 -246 26 -400 q-12 -78 -46 -134 h104 q-28 64 -24 138
        q16 154 30 396 z"/>
      <path fill="#46584B" d="M-40 236 q-14 -102 78 -134 q26 -96 118 -84 q42 -74 122 -46
        q66 -58 118 6 q88 -22 92 62 q64 20 30 90 q40 62 -34 84 q-14 70 -96 56 q-40 54 -110 22
        q-64 44 -124 -6 q-88 24 -122 -42 z"/>
      <path fill="#35463A" d="M-200 900 q380 -96 620 -74 q220 20 372 62 v40 h-992 z"/>`,
  },
];

/** Viewport-locked. Never transformed, never inside a parallax band. */
export const ATMOSPHERE = `
  <defs>
    <radialGradient id="n-vignette" cx="56%" cy="50%" r="70%">
      <stop offset="0.48" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>
    <filter id="n-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#n-vignette)" pointer-events="none"/>
  <rect x="0" y="0" width="100%" height="100%" filter="url(#n-grain)" opacity="0.07"
        style="mix-blend-mode:multiply" pointer-events="none"/>`;
