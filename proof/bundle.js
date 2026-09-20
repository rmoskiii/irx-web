// src/motion/camera.ts
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function maxFov(aspect, canvasH) {
  return aspect * canvasH;
}
function frameFor(beat, aspect, scene) {
  const capW = maxFov(aspect, scene.canvas.h);
  let w;
  switch (beat.intent.kind) {
    case "cover":
      w = beat.intent.fovUnits;
      break;
    case "region": {
      const h2 = beat.intent.region.h / beat.intent.fill;
      w = h2 * aspect;
      break;
    }
    case "inside": {
      const h2 = beat.intent.region.h * beat.intent.depth;
      w = h2 * aspect;
      break;
    }
  }
  w = clamp(w, 8, capW);
  const h = w / aspect;
  const x = clamp(beat.anchor.x - w / 2, 0, Math.max(0, scene.canvas.w - w));
  const y = clamp(beat.anchor.y - h / 2, 0, Math.max(0, scene.canvas.h - h));
  return { x, y, w, h };
}
function beatsFor(beats, aspect) {
  return beats.filter(
    (b) => (b.maxAspect === void 0 || aspect <= b.maxAspect) && (b.minAspect === void 0 || aspect >= b.minAspect)
  ).sort((a, b) => a.t - b.t);
}
var lerp = (a, b, k) => a + (b - a) * k;
var ease = (k) => k * k * (3 - 2 * k);
function camera(scene, beats, progress, viewport2) {
  const aspect = viewport2.w / viewport2.h;
  const list = beatsFor(beats, aspect);
  if (list.length === 0) throw new Error("camera: no beats apply at this aspect");
  const p = clamp(progress, 0, 1);
  if (p <= list[0].t) return frameFor(list[0], aspect, scene);
  const last = list[list.length - 1];
  if (p >= last.t) return frameFor(last, aspect, scene);
  let i = 0;
  while (i < list.length - 1 && p > list[i + 1].t) i++;
  const a = list[i];
  const b = list[i + 1];
  const k = ease((p - a.t) / (b.t - a.t));
  const fa = frameFor(a, aspect, scene);
  const fb = frameFor(b, aspect, scene);
  const w = fa.w * Math.pow(fb.w / fa.w, k);
  const h = w / aspect;
  const cx = lerp(fa.x + fa.w / 2, fb.x + fb.w / 2, k);
  const cy = lerp(fa.y + fa.h / 2, fb.y + fb.h / 2, k);
  return {
    x: clamp(cx - w / 2, 0, Math.max(0, scene.canvas.w - w)),
    y: clamp(cy - h / 2, 0, Math.max(0, scene.canvas.h - h)),
    w,
    h
  };
}
function viewBox(f) {
  return `${f.x.toFixed(2)} ${f.y.toFixed(2)} ${f.w.toFixed(2)} ${f.h.toFixed(2)}`;
}

// src/motion/act1.ts
var NEIGHBOURHOOD_NIGHT = {
  canvas: { w: 2200, h: 900 },
  cameraFrame: { x: 300, y: 0, w: 1600, h: 900 },
  overscan: {
    background: 300,
    architecture: 180,
    environmental_detail: 200,
    furniture: 140,
    near: 100
  }
};
var APERTURE = { x: 1155, y: 360, w: 170, h: 120 };
var LIT_PANE = { x: 1240, y: 360, w: 85, h: 55 };
var WIDE = [
  {
    t: 0,
    anchor: { x: 1100, y: 450 },
    intent: { kind: "cover", fovUnits: 1600 },
    label: "WIDE \u2014 the street",
    minAspect: 0.75
  },
  {
    t: 0.38,
    anchor: { x: 1160, y: 458 },
    intent: { kind: "cover", fovUnits: 880 },
    label: "APPROACH \u2014 travel begins",
    minAspect: 0.75
  },
  {
    t: 0.66,
    anchor: { x: 1205, y: 464 },
    intent: { kind: "cover", fovUnits: 430 },
    label: "THE HOUSE \u2014 dominates",
    minAspect: 0.75
  },
  {
    t: 0.88,
    anchor: { x: 1240, y: 420 },
    intent: { kind: "region", region: APERTURE, fill: 1 },
    label: "THE WINDOW \u2014 destination",
    minAspect: 0.75
  },
  {
    t: 1,
    anchor: { x: 1284, y: 385 },
    intent: { kind: "inside", region: LIT_PANE, depth: 0.55 },
    label: "WARM PANE \u2014 near-flat field",
    minAspect: 0.75
  }
];
var NARROW = [
  {
    t: 0,
    anchor: { x: 620, y: 470 },
    intent: { kind: "cover", fovUnits: 416 },
    label: "PAN \u2014 left terrace",
    maxAspect: 0.75
  },
  {
    t: 0.15,
    anchor: { x: 880, y: 470 },
    intent: { kind: "cover", fovUnits: 416 },
    label: "PAN \u2014 corridor and cars",
    maxAspect: 0.75
  },
  {
    // PASS C FIX — the pan and the push overlap here rather than handing off.
    // Previously the pan ran at constant 416u to t=0.30 and the push started
    // cold: centre velocity fell 84.6u/step to ~1u in one step, a measurable
    // change of gear (|d2fov|/mean 1.27 against 0.69 on desktop). The tighten
    // now begins while the pan is still travelling, and the pan decelerates
    // into it, so both components taper rather than swapping over.
    t: 0.26,
    anchor: { x: 1160, y: 466 },
    intent: { kind: "cover", fovUnits: 398 },
    label: "PAN \u2014 tighten begins while still travelling",
    maxAspect: 0.75
  },
  {
    t: 0.38,
    anchor: { x: 1214, y: 458 },
    intent: { kind: "cover", fovUnits: 352 },
    label: "PAN settles into APPROACH",
    maxAspect: 0.75
  },
  {
    t: 0.52,
    anchor: { x: 1232, y: 448 },
    intent: { kind: "cover", fovUnits: 288 },
    label: "APPROACH",
    maxAspect: 0.75
  },
  {
    t: 0.72,
    anchor: { x: 1238, y: 432 },
    intent: { kind: "cover", fovUnits: 176 },
    label: "THE HOUSE \u2014 dominates",
    maxAspect: 0.75
  },
  {
    t: 0.88,
    anchor: { x: 1240, y: 410 },
    intent: { kind: "region", region: APERTURE, fill: 0.6 },
    label: "THE WINDOW \u2014 60% of viewport height",
    maxAspect: 0.75
  },
  {
    t: 1,
    anchor: { x: 1284, y: 385 },
    // 0.6, not 0.72: at 0.72 the 18u-wide portrait frame reached the pane's
    // lower edge and picked up the sill tone, measuring sd 23.7. 0.6 keeps the
    // frame wholly inside the lit glass. Measured, not guessed.
    intent: { kind: "inside", region: LIT_PANE, depth: 0.6 },
    label: "WARM PANE \u2014 near-flat field",
    maxAspect: 0.75
  }
];
var ACT1_BEATS = [...WIDE, ...NARROW];

// src/scene/stage.ts
function bandTransform(frame, ref, depth) {
  if (depth >= 1) return "";
  const cx = frame.x + frame.w / 2;
  const cy = frame.y + frame.h / 2;
  const c0x = ref.x + ref.w / 2;
  const c0y = ref.y + ref.h / 2;
  const dx = (cx - c0x) * (1 - depth);
  const dy = (cy - c0y) * (1 - depth);
  if (dx === 0 && dy === 0) return "";
  return `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`;
}
var VP = { x: 1240, y: 470 };
var lerp2 = (a, b, t) => a + (b - a) * t;
function terrace(nearX, nearGround, nearRoof, ts, fill) {
  let out = "";
  for (let i = 0; i < ts.length - 1; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    const x0 = lerp2(nearX, VP.x, t0), x1 = lerp2(nearX, VP.x, t1);
    const r0 = lerp2(nearRoof, VP.y, t0), r1 = lerp2(nearRoof, VP.y, t1);
    const g0 = lerp2(nearGround, VP.y, t0), g1 = lerp2(nearGround, VP.y, t1);
    const shade = i % 2 === 0 ? fill : "#5A4A44";
    out += `<path fill="${shade}" stroke="#241D19" stroke-width="${(3 - t0 * 1.6).toFixed(1)}"
      d="M${x0} ${r0} L${x1} ${r1} L${x1} ${g1} L${x0} ${g0} z"/>`;
    if (i % 2 === 1) {
      const wx = lerp2(x0, x1, 0.3), wx2 = lerp2(x0, x1, 0.55);
      const wy = lerp2(r0, g0, 0.28), wy2 = lerp2(r0, g0, 0.52);
      out += `<path fill="#C89A4E" d="M${wx} ${wy} L${wx2} ${wy} L${wx2} ${wy2} L${wx} ${wy2} z"/>`;
    }
  }
  return out;
}
var PLACEHOLDER_BANDS = [
  {
    id: "background",
    depth: 0.05,
    // overscan 300: spans the full 2200 canvas
    svg: `
      <rect x="-300" y="-200" width="2800" height="386" fill="#334051"/>
      <rect x="-300" y="186" width="2800" height="146" fill="#4D4656"/>
      <rect x="-300" y="332" width="2800" height="340" fill="#785A4F"/>
      <path fill="#2A333E" d="M760 470 v-96 h30 v-58 h26 v58 h22 v-132 h34 v132 h26 v-74 h30 v74
        h34 v-40 h28 v40 h30 v-108 h32 v108 h26 v-64 h34 v64 h28 v-92 h30 v92 h34 v-46 h26 v46
        h30 v-120 h32 v120 h28 v-70 h30 v70 h26 v-38 h34 v38 z"/>
      <circle cx="1636" cy="112" r="30" fill="#F2C77E" opacity="0.38"/>`
  },
  {
    id: "architecture",
    depth: 0.15,
    // overscan 180: content spans 120..2080
    svg: terrace(120, 838, 146, [0, 0.19, 0.36, 0.505, 0.63, 0.75, 0.877], "#7A6459") + terrace(2080, 838, 164, [0, 0.19, 0.36, 0.505, 0.63, 0.75, 0.877], "#7A6459") + ""
  },
  {
    // THE REFERENCE PLANE. The far terrace sits at the vanishing point and
    // holds the destination, so it moves with the camera: depth 1.0, no
    // transform. Everything else parallaxes against it.
    id: "architecture_far",
    depth: 1,
    svg: `<rect x="980" y="322" width="80" height="193" fill="#64514A" stroke="#241D19" stroke-width="2"/>
       <rect x="1060" y="180" width="340" height="335" fill="#7A6459" stroke="#241D19" stroke-width="3"/>
       <rect x="1400" y="330" width="80" height="185" fill="#64514A" stroke="#241D19" stroke-width="2"/>
       <rect x="1152" y="226" width="64" height="70" fill="#2A333E"/>
       <rect x="1256" y="226" width="64" height="70" fill="#2A333E"/>
       <rect x="1086" y="424" width="54" height="91" fill="#2A333E"/>
       <rect x="980" y="515" width="500" height="26" fill="#5A616A" stroke="#241D19" stroke-width="3"/>`
  },
  {
    id: "n-window-lit",
    depth: 1,
    // the destination IS the parallax reference — never translated
    // THE APERTURE, verbatim. 1155,360,170,120 with the lit pane 1240,360,85,55.
    svg: `
      <rect x="1155" y="360" width="170" height="120" fill="#C89A4E"/>
      <rect x="1163" y="368" width="154" height="74" fill="#F2C77E"/>
      <rect x="1163" y="442" width="154" height="30" fill="#FFC15E" opacity="0.55"/>
      <rect x="1163" y="368" width="34" height="104" fill="#424E56" opacity="0.9"/>
      <rect x="1240" y="360" width="3" height="120" fill="#241D19"/>
      <rect x="1155" y="414" width="170" height="3" fill="#241D19"/>
      <rect x="1155" y="360" width="170" height="120" fill="none" stroke="#241D19" stroke-width="3.4"/>
      <rect x="1145" y="480" width="190" height="12" fill="#64514A"/>`
  },
  {
    id: "environmental_detail",
    depth: 0.35,
    // overscan 200: content spans 100..2100
    svg: [0.06, 0.34, 0.6, 0.2, 0.5].map((t, i) => {
      const left = i < 3;
      const x = lerp2(left ? 100 : 2100, VP.x, t) + (left ? 46 : -46);
      const gy = lerp2(838, VP.y, t);
      const h = 250 * (1 - t * 0.72);
      const lw = 30 * (1 - t * 0.6);
      return `<path stroke="#241D19" stroke-width="${Math.max(5 * (1 - t * 0.6), 1.6).toFixed(1)}"
                 fill="none" d="M${x} ${gy} v${-h}"/>
                <rect x="${x}" y="${gy - h - lw * 0.6}" width="${lw}" height="${lw * 0.62}" fill="#F2C77E"/>`;
    }).join("")
  },
  {
    id: "furniture",
    depth: 0.75,
    // overscan 140: content spans 160..2040
    svg: `
      <path fill="#5A616A" d="M160 838 L1100 515 L1134 531 L186 874 z"/>
      <path fill="#5A616A" d="M2040 838 L1346 515 L1312 531 L2014 874 z"/>
      <path fill="#3C424A" d="M186 874 L1134 531 L1137 538 L196 914 z"/>
      <path fill="#3C424A" d="M2014 874 L1312 531 L1309 538 L2004 914 z"/>
      <path fill="#2A333E" d="M196 914 L1137 538 L1309 538 L2004 914 L2200 960 L-200 960 z"/>
      <rect x="1596" y="720" width="300" height="120" rx="40" fill="#5A5F66" stroke="#241D19" stroke-width="4"/>
      <rect x="1349" y="729" width="212" height="98" rx="34" fill="#5A5F66" stroke="#241D19" stroke-width="3"/>`
  },
  {
    id: "near",
    depth: 0.9,
    // overscan 100: content spans 200..2000, left-weighted
    svg: `
      <path fill="#35463A" d="M120 900 q46 -246 26 -400 q-12 -78 -46 -134 h104 q-28 64 -24 138
        q16 154 30 396 z"/>
      <path fill="#46584B" d="M-40 236 q-14 -102 78 -134 q26 -96 118 -84 q42 -74 122 -46
        q66 -58 118 6 q88 -22 92 62 q64 20 30 90 q40 62 -34 84 q-14 70 -96 56 q-40 54 -110 22
        q-64 44 -124 -6 q-88 24 -122 -42 z"/>
      <path fill="#35463A" d="M-200 900 q380 -96 620 -74 q220 20 372 62 v40 h-992 z"/>`
  }
];

// src/scene/bands.generated.ts
var STYLE = "\n        /* @tokens-begin */\n        :root {\n        /* line \u2014 shared craft language, unchanged */\n        --irx-line:          #241D19;\n        --irx-line-soft:     #3B302A;\n        --irx-shadow:        #2A231E;\n\n        /* sky \u2014 reused verbatim from scene.kitchen's window. The exterior and the\n        kitchen look at the same sky from opposite sides. */\n        --irx-sky-high:      #334051;\n        --irx-sky-mid:       #4D4656;\n        --irx-sky-low:       #785A4F;\n        --irx-outside-dark:  #2A333E;\n        --irx-curtain:       #424E56;\n\n        /* accent \u2014 neighbourhood district, warm light only */\n        --irx-accent:        #FFC15E;\n        --irx-accent-dim:    #C89A4E;\n        --irx-lamp-warm:     #F2C77E;\n        --irx-cool-spill:    #7E93A8;\n\n        /* new \u2014 neighbourhood exterior. Values held in the kitchen's large-area\n        luminance band (L 83-116) so the L=30 linework still reads. Night comes\n        from hue, silhouette and the vignette, not from dark fills. */\n        --irx-neighbourhood-brick:        #7A6459;\n        --irx-neighbourhood-brick-dark:   #64514A;\n        --irx-neighbourhood-roof:         #55606B;\n        --irx-neighbourhood-pavement:     #5A616A;\n        --irx-neighbourhood-kerb:         #3C424A;\n        --irx-neighbourhood-foliage:      #46584B;\n        --irx-neighbourhood-foliage-dark: #35463A;\n        --irx-neighbourhood-car:          #5A5F66;\n\n        /* stroke weights */\n        --irx-stroke-xheavy: 6.6;\n        --irx-stroke-heavy:  5;\n        --irx-stroke:        3.4;\n        --irx-stroke-fine:   2.1;\n        --irx-stroke-hair:   1.4;\n        }\n        /* @tokens-end */\n        .ln    { stroke: var(--irx-line); fill: none; stroke-linecap: round; stroke-linejoin: round; }\n        .soft  { stroke: var(--irx-line-soft); }\n        .sky   { fill: var(--irx-sky-high); }\n        .skym  { fill: var(--irx-sky-mid); }\n        .skyl  { fill: var(--irx-sky-low); }\n        .dark  { fill: var(--irx-outside-dark); }\n        .moon  { fill: var(--irx-lamp-warm); }\n        .brick { fill: var(--irx-neighbourhood-brick); }\n        .brickd{ fill: var(--irx-neighbourhood-brick-dark); }\n        .roof  { fill: var(--irx-neighbourhood-roof); }\n        .pave  { fill: var(--irx-neighbourhood-pavement); }\n        .kerb  { fill: var(--irx-neighbourhood-kerb); }\n        .fol   { fill: var(--irx-neighbourhood-foliage); }\n        .fold  { fill: var(--irx-neighbourhood-foliage-dark); }\n        .acc   { fill: var(--irx-accent); }\n        .accd  { fill: var(--irx-accent-dim); }\n        .lampwarm { fill: var(--irx-lamp-warm); }\n        .curt  { fill: var(--irx-curtain); }\n        .carbody { fill: var(--irx-neighbourhood-car); }\n        .shad  { fill: var(--irx-shadow); }\n    ";
var DEFS = '\n        <filter id="n-grain" x="0" y="0" width="100%" height="100%">\n            <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>\n            <feColorMatrix type="saturate" values="0"/>\n        </filter>\n        <radialGradient id="n-vignette" cx="56%" cy="50%" r="70%">\n            <stop offset="0.48" stop-color="#000000" stop-opacity="0"/>\n            <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>\n        </radialGradient>\n        <radialGradient id="n-nightspill" cx="56%" cy="52%" r="44%">\n            <stop offset="0" stop-color="var(--irx-cool-spill)" stop-opacity="0.10"/>\n            <stop offset="1" stop-color="var(--irx-cool-spill)" stop-opacity="0"/>\n        </radialGradient>\n    ';
var BANDS = [
  { id: "background", depth: 0.05, parallax: true, svg: '\n\n        <path class="sky" d="M0 0 h2200 v186 q-550 6.5 -1100 0.1 q-550 -4.8 -1100 0.0 z"/>\n        <path class="skym" d="M0 186 q550 5.5 1100 -0.0 q550 -5.4 1100 0.4 v146 q-550 6.2 -1100 3.8 q-550 -2.9 -1100 2.2 z"/>\n        <path class="skyl" d="M0 332 q550 2.5 1100 -0.2 q550 -6.4 1100 1.3 v140 h-2200 z"/>\n        <path class="moon" d="M1636 112 a30 30 0 1 0 0.1 0 z" opacity="0.38"/>\n        <path class="dark" d="M760 470 v-96 h30 v-58 h26 v58 h22 v-132 h34 v132 h26 v-74 h30 v74 h34 v-40 h28 v40 h30 v-108 h32 v108 h26 v-64 h34 v64 h28 v-92 h30 v92 h34 v-46 h26 v46 h30 v-120 h32 v120 h28 v-70 h30 v70 h26 v-38 h34 v38 z" opacity="0.92"/>\n        <path class="ln soft" stroke-width="2.0" d="M0 470 q550 -6 1100 -3 q550 3 1100 -1" opacity="0.45"/>\n    \n' },
  { id: "architecture", depth: 0.15, parallax: true, svg: '\n<path class="brick" d="M100.0 146.0 L316.6 207.6 L316.6 768.1 L100.0 838.0 z"/>\n<path class="roof" d="M100.0 120.0 L316.6 184.3 L316.6 207.6 L100.0 146.0 z"/>\n<path class="ln" stroke-width="5.0" d="M100.0 120.0 L316.6 184.3"/>\n<path class="ln" stroke-width="2.73" d="M316.6 207.6 L316.6 768.1" opacity="0.85"/>\n<path class="ln" stroke-width="3.4" d="M100.0 816.0 L316.6 748.6" opacity="0.85"/>\n<path class="ln" stroke-width="4.6" d="M100.0 838.0 L316.6 768.1"/>\n<path class="dark" d="M156.3 319.9 L204.0 326.5 L204.0 502.6 L156.3 504.1 z"/>\n<path class="ln" stroke-width="2.35" d="M156.3 319.9 L204.0 326.5 L204.0 502.6 L156.3 504.1 z"/>\n<path class="dark" d="M238.6 331.3 L286.3 337.9 L286.3 500.0 L238.6 501.5 z"/>\n<path class="ln" stroke-width="2.28" d="M238.6 331.3 L286.3 337.9 L286.3 500.0 L238.6 501.5 z"/>\n<path class="brickd" d="M316.6 189.6 L510.4 251.1 L510.4 705.5 L316.6 768.1 z"/>\n<path class="roof" d="M316.6 166.3 L510.4 230.3 L510.4 251.1 L316.6 189.6 z"/>\n<path class="ln" stroke-width="4.62" d="M316.6 166.3 L510.4 230.3"/>\n<path class="ln" stroke-width="2.5" d="M510.4 251.1 L510.4 705.5" opacity="0.85"/>\n<path class="ln" stroke-width="3.13" d="M316.6 748.6 L510.4 688.3" opacity="0.85"/>\n<path class="ln" stroke-width="4.22" d="M316.6 768.1 L510.4 705.5"/>\n<path class="accd" d="M367.0 349.1 L409.6 355.0 L409.6 496.1 L367.0 497.4 z"/>\n<path class="ln" stroke-width="2.17" d="M367.0 349.1 L409.6 355.0 L409.6 496.1 L367.0 497.4 z"/>\n<path class="dark" d="M440.6 359.3 L483.3 365.2 L483.3 493.8 L440.6 495.1 z"/>\n<path class="ln" stroke-width="2.1" d="M440.6 359.3 L483.3 365.2 L483.3 493.8 L440.6 495.1 z"/>\n<path class="brick" d="M510.4 272.6 L675.7 314.6 L675.7 652.2 L510.4 705.5 z"/>\n<path class="roof" d="M510.4 251.8 L675.7 295.8 L675.7 314.6 L510.4 272.6 z"/>\n<path class="ln" stroke-width="4.28" d="M510.4 251.8 L675.7 295.8"/>\n<path class="ln" stroke-width="2.29" d="M675.7 314.6 L675.7 652.2" opacity="0.85"/>\n<path class="ln" stroke-width="2.9" d="M510.4 688.3 L675.7 636.8" opacity="0.85"/>\n<path class="ln" stroke-width="3.88" d="M510.4 705.5 L675.7 652.2"/>\n<path class="dark" d="M553.4 374.9 L589.7 379.9 L589.7 490.4 L553.4 491.6 z"/>\n<path class="ln" stroke-width="2.0" d="M553.4 374.9 L589.7 379.9 L589.7 490.4 L553.4 491.6 z"/>\n<path class="dark" d="M616.2 383.6 L652.6 388.6 L652.6 488.5 L616.2 489.6 z"/>\n<path class="ln" stroke-width="1.95" d="M616.2 383.6 L652.6 388.6 L652.6 488.5 L616.2 489.6 z"/>\n<path class="brickd" d="M675.7 309.6 L784.0 340.4 L784.0 617.2 L675.7 652.2 z"/>\n<path class="roof" d="M675.7 290.8 L784.0 323.0 L784.0 340.4 L675.7 309.6 z"/>\n<path class="ln" stroke-width="3.99" d="M675.7 290.8 L784.0 323.0"/>\n<path class="ln" stroke-width="2.16" d="M784.0 340.4 L784.0 617.2" opacity="0.85"/>\n<path class="ln" stroke-width="2.69" d="M675.7 636.8 L784.0 603.1" opacity="0.85"/>\n<path class="ln" stroke-width="3.59" d="M675.7 652.2 L784.0 617.2"/>\n<path class="dark" d="M703.9 395.7 L727.7 399.0 L727.7 486.1 L703.9 486.9 z"/>\n<path class="ln" stroke-width="1.87" d="M703.9 395.7 L727.7 399.0 L727.7 486.1 L703.9 486.9 z"/>\n<path class="dark" d="M745.0 401.4 L768.8 404.7 L768.8 484.8 L745.0 485.6 z"/>\n<path class="ln" stroke-width="1.83" d="M745.0 401.4 L768.8 404.7 L768.8 484.8 L745.0 485.6 z"/>\n<path class="skyl" d="M784.0 617.2 L898.0 580.4 L898.0 368.6 L784.0 326.4 z" opacity="0.3"/>\n<path class="ln" stroke-width="3.0" d="M784.0 326.4 L784.0 617.2"/>\n<path class="ln soft" stroke-width="2.6" d="M898.0 368.6 L898.0 580.4" opacity="0.8"/>\n<path class="brickd" d="M898.0 378.8 L1000.6 403.2 L1000.6 547.3 L898.0 580.4 z"/>\n<path class="ln" stroke-width="3.6" d="M898.0 362.8 L1000.6 388.5"/>\n<path class="ln" stroke-width="1.89" d="M1000.6 403.2 L1000.6 547.3" opacity="0.85"/>\n<path class="ln" stroke-width="2.42" d="M898.0 567.6 L1000.6 535.7" opacity="0.85"/>\n<path class="ln" stroke-width="3.2" d="M898.0 580.4 L1000.6 547.3"/>\n<path class="dark" d="M924.7 426.3 L947.2 429.4 L947.2 479.2 L924.7 479.9 z"/>\n<path class="ln" stroke-width="1.68" d="M924.7 426.3 L947.2 429.4 L947.2 479.2 L924.7 479.9 z"/>\n<path class="brick" d="M1000.6 394.0 L1099.8 429.2 L1099.8 515.3 L1000.6 547.3 z"/>\n<path class="ln" stroke-width="3.42" d="M1000.6 379.3 L1099.8 415.7"/>\n<path class="ln" stroke-width="1.77" d="M1099.8 429.2 L1099.8 515.3" opacity="0.85"/>\n<path class="ln" stroke-width="2.29" d="M1000.6 535.7 L1099.8 504.8" opacity="0.85"/>\n<path class="ln" stroke-width="3.02" d="M1000.6 547.3 L1099.8 515.3"/>\n<path class="dark" d="M1026.4 440.4 L1048.2 443.4 L1048.2 476.0 L1026.4 476.7 z"/>\n<path class="ln" stroke-width="1.59" d="M1026.4 440.4 L1048.2 443.4 L1048.2 476.0 L1026.4 476.7 z"/>\n<path class="brickd" d="M2100.0 164.0 L1932.3 223.7 L1932.3 766.2 L2100.0 838.0 z"/>\n<path class="roof" d="M2100.0 138.0 L1932.3 200.5 L1932.3 223.7 L2100.0 164.0 z"/>\n<path class="ln" stroke-width="5.0" d="M2100.0 138.0 L1932.3 200.5"/>\n<path class="ln" stroke-width="2.73" d="M1932.3 223.7 L1932.3 766.2" opacity="0.85"/>\n<path class="ln" stroke-width="3.4" d="M2100.0 816.0 L1932.3 746.8" opacity="0.85"/>\n<path class="ln" stroke-width="4.6" d="M2100.0 838.0 L1932.3 766.2"/>\n<path class="accd" d="M2053.0 346.4 L2016.2 352.0 L2016.2 522.3 L2053.0 524.8 z"/>\n<path class="ln" stroke-width="2.25" d="M2053.0 346.4 L2016.2 352.0 L2016.2 522.3 L2053.0 524.8 z"/>\n<path class="dark" d="M1989.3 356.1 L1952.4 361.7 L1952.4 518.0 L1989.3 520.5 z"/>\n<path class="ln" stroke-width="2.17" d="M1989.3 356.1 L1952.4 361.7 L1952.4 518.0 L1989.3 520.5 z"/>\n<path class="brick" d="M1932.3 237.7 L1781.8 286.0 L1781.8 701.8 L1932.3 766.2 z"/>\n<path class="roof" d="M1932.3 214.5 L1781.8 265.3 L1781.8 286.0 L1932.3 237.7 z"/>\n<path class="ln" stroke-width="4.61" d="M1932.3 214.5 L1781.8 265.3"/>\n<path class="ln" stroke-width="2.48" d="M1781.8 286.0 L1781.8 701.8" opacity="0.85"/>\n<path class="ln" stroke-width="3.13" d="M1932.3 746.8 L1781.8 684.7" opacity="0.85"/>\n<path class="ln" stroke-width="4.21" d="M1932.3 766.2 L1781.8 701.8"/>\n<path class="dark" d="M1890.2 371.1 L1857.0 376.2 L1857.0 511.6 L1890.2 513.8 z"/>\n<path class="ln" stroke-width="2.06" d="M1890.2 371.1 L1857.0 376.2 L1857.0 511.6 L1890.2 513.8 z"/>\n<path class="dark" d="M1833.0 379.8 L1799.9 384.9 L1799.9 507.7 L1833.0 510.0 z"/>\n<path class="ln" stroke-width="1.99" d="M1833.0 379.8 L1799.9 384.9 L1799.9 507.7 L1833.0 510.0 z"/>\n<path class="brickd" d="M1781.8 261.2 L1657.1 313.8 L1657.1 648.5 L1781.8 701.8 z"/>\n<path class="roof" d="M1781.8 240.5 L1657.1 295.2 L1657.1 313.8 L1781.8 261.2 z"/>\n<path class="ln" stroke-width="4.26" d="M1781.8 240.5 L1657.1 295.2"/>\n<path class="ln" stroke-width="2.28" d="M1657.1 313.8 L1657.1 648.5" opacity="0.85"/>\n<path class="ln" stroke-width="2.88" d="M1781.8 684.7 L1657.1 633.3" opacity="0.85"/>\n<path class="ln" stroke-width="3.86" d="M1781.8 701.8 L1657.1 648.5"/>\n<path class="dark" d="M1746.9 392.9 L1719.5 397.1 L1719.5 502.3 L1746.9 504.2 z"/>\n<path class="ln" stroke-width="1.89" d="M1746.9 392.9 L1719.5 397.1 L1719.5 502.3 L1746.9 504.2 z"/>\n<path class="accd" d="M1699.5 400.1 L1672.1 404.3 L1672.1 499.1 L1699.5 501.0 z"/>\n<path class="ln" stroke-width="1.83" d="M1699.5 400.1 L1672.1 404.3 L1672.1 499.1 L1699.5 501.0 z"/>\n<path class="brick" d="M1657.1 327.6 L1562.5 357.5 L1562.5 608.0 L1657.1 648.5 z"/>\n<path class="roof" d="M1657.1 309.0 L1562.5 340.4 L1562.5 357.5 L1657.1 327.6 z"/>\n<path class="ln" stroke-width="3.97" d="M1657.1 309.0 L1562.5 340.4"/>\n<path class="ln" stroke-width="2.12" d="M1562.5 357.5 L1562.5 608.0" opacity="0.85"/>\n<path class="ln" stroke-width="2.68" d="M1657.1 633.3 L1562.5 594.2" opacity="0.85"/>\n<path class="ln" stroke-width="3.57" d="M1657.1 648.5 L1562.5 608.0"/>\n<path class="dark" d="M1630.6 410.6 L1609.8 413.8 L1609.8 494.9 L1630.6 496.3 z"/>\n<path class="ln" stroke-width="1.75" d="M1630.6 410.6 L1609.8 413.8 L1609.8 494.9 L1630.6 496.3 z"/>\n<path class="dark" d="M1594.7 416.1 L1573.9 419.2 L1573.9 492.5 L1594.7 493.9 z"/>\n<path class="ln" stroke-width="1.71" d="M1594.7 416.1 L1573.9 419.2 L1573.9 492.5 L1594.7 493.9 z"/>\n<path class="brickd" d="M1562.5 345.2 L1480.8 381.5 L1480.8 573.0 L1562.5 608.0 z"/>\n<path class="ln" stroke-width="3.75" d="M1562.5 328.2 L1480.8 365.8"/>\n<path class="ln" stroke-width="1.99" d="M1480.8 381.5 L1480.8 573.0" opacity="0.85"/>\n<path class="ln" stroke-width="2.52" d="M1562.5 594.2 L1480.8 560.5" opacity="0.85"/>\n<path class="ln" stroke-width="3.35" d="M1562.5 608.0 L1480.8 573.0"/>\n<path class="dark" d="M1539.6 424.4 L1521.7 427.2 L1521.7 489.0 L1539.6 490.2 z"/>\n<path class="ln" stroke-width="1.65" d="M1539.6 424.4 L1521.7 427.2 L1521.7 489.0 L1539.6 490.2 z"/>\n<path class="brick" d="M1480.8 392.3 L1412.0 410.4 L1412.0 543.6 L1480.8 573.0 z"/>\n<path class="ln" stroke-width="3.56" d="M1480.8 376.6 L1412.0 395.8"/>\n<path class="ln" stroke-width="1.88" d="M1412.0 410.4 L1412.0 543.6" opacity="0.85"/>\n<path class="ln" stroke-width="2.39" d="M1480.8 560.5 L1412.0 532.2" opacity="0.85"/>\n<path class="ln" stroke-width="3.16" d="M1480.8 573.0 L1412.0 543.6"/>\n<path class="dark" d="M1461.5 436.3 L1446.4 438.6 L1446.4 483.9 L1461.5 484.9 z"/>\n<path class="ln" stroke-width="1.56" d="M1461.5 436.3 L1446.4 438.6 L1446.4 483.9 L1461.5 484.9 z"/>\n<path class="brickd" d="M1412.0 402.8 L1345.8 431.6 L1345.8 515.3 L1412.0 543.6 z"/>\n<path class="ln" stroke-width="3.4" d="M1412.0 388.2 L1345.8 418.2"/>\n<path class="ln" stroke-width="1.77" d="M1345.8 431.6 L1345.8 515.3" opacity="0.85"/>\n<path class="ln" stroke-width="2.28" d="M1412.0 532.2 L1345.8 504.8" opacity="0.85"/>\n<path class="ln" stroke-width="3.0" d="M1412.0 543.6 L1345.8 515.3"/>\n<path class="dark" d="M1393.5 446.7 L1378.9 448.9 L1378.9 479.4 L1393.5 480.3 z"/>\n<path class="ln" stroke-width="1.48" d="M1393.5 446.7 L1378.9 448.9 L1378.9 479.4 L1393.5 480.3 z"/>\n' },
  { id: "architecture_far", depth: 1, parallax: true, svg: '\n<path class="brickd" d="M980 322 h80 v193 h-80 z"/>\n<path class="roof" d="M972 306 h96 v16 h-96 z"/>\n<path class="ln" stroke-width="3.4" d="M972 306 h96"/>\n<path class="ln soft" stroke-width="2.4" d="M1060 322 v193" opacity="0.8"/>\n<path class="ln" stroke-width="2.2" d="M1014 362 h44 v52 h-44 z"/>\n<path class="brick" d="M1060 180 h340 v335 h-340 z"/>\n<path class="roof" d="M1052 164 h356 v16 h-356 z"/>\n<path class="ln" stroke-width="4.6" d="M1052 164 h356"/>\n<path class="ln soft" stroke-width="2.4" d="M1400 180 v335" opacity="0.8"/>\n<path class="brickd" d="M1318 148 h40 v32 h-40 z"/>\n<path class="ln" stroke-width="2.6" d="M1318 148 h40 v32"/>\n<path class="dark" d="M1086 424 h54 v91 h-54 z"/>\n<path class="ln" stroke-width="3.0" d="M1086 424 h54 v91"/>\n<path class="dark" d="M1152 226 h64 v70 h-64 z"/>\n<path class="ln" stroke-width="2.8" d="M1152 226 h64 v70 h-64 z"/>\n<path class="dark" d="M1256 226 h64 v70 h-64 z"/>\n<path class="ln" stroke-width="2.8" d="M1256 226 h64 v70 h-64 z"/>\n<path class="ln soft" stroke-width="2.0" d="M1070 330 h320" opacity="0.45"/>\n<path class="brickd" d="M1400 330 h80 v185 h-80 z"/>\n<path class="roof" d="M1392 314 h96 v16 h-96 z"/>\n<path class="ln" stroke-width="3.4" d="M1392 314 h96"/>\n<path class="ln soft" stroke-width="2.4" d="M1480 330 v185" opacity="0.8"/>\n<path class="ln" stroke-width="2.2" d="M1434 370 h44 v52 h-44 z"/>\n<path class="ln" stroke-width="3.0" d="M1386 180 v335" opacity="0.7"/>\n<path class="kerb" d="M1080 503 h66 v12 h-66 z" opacity="0.8"/>\n<path class="ln soft" stroke-width="2.2" d="M1080 503 h66" opacity="0.7"/>\n<path class="accd" d="M1412 380 h42 v50 h-42 z" opacity="0.55"/>\n<path class="ln" stroke-width="2.4" d="M1412 380 h42 v50 h-42 z"/>\n<path class="dark" d="M1000 435 h38 v80 h-38 z"/>\n<path class="ln" stroke-width="2.6" d="M1000 435 h38 v80"/>\n<path class="ln" stroke-width="4.2" d="M1100 515 v-190"/>\n<path class="ln" stroke-width="4.2" d="M1346 515 v-185"/>\n<path class="ln soft" stroke-width="2.0" d="M1060 296 h340" opacity="0.4"/>\n<path class="ln soft" stroke-width="1.8" d="M1060 420 h340" opacity="0.35"/>\n<path class="ln" stroke-width="3.0" d="M1060 180 v335" opacity="0.75"/>\n<path class="ln" stroke-width="3.0" d="M1400 180 v335" opacity="0.75"/>\n<path class="pave" d="M980 515 h500 v26 h-500 z"/>\n<path class="ln" stroke-width="3.4" d="M980 515 h500"/>\n<path class="ln soft" stroke-width="2.4" d="M980 541 h500" opacity="0.7"/>\n' },
  { id: "n-window-lit", depth: 1, parallax: true, svg: '\n\n        <path class="accd" d="M1155 360 h170 v120 h-170 z"/>\n        <path class="lampwarm" d="M1163 368 h154 v74 h-154 z" opacity="0.85"/>\n        <path class="acc" d="M1163 442 h154 v30 h-154 z" opacity="0.55"/>\n        <path class="curt" d="M1163 368 h34 q-6 52 2 104 h-36 z" opacity="0.9"/>\n        <path class="ln soft" stroke-width="2.0" d="M1197 368 q-6 52 2 104" opacity="0.8"/>\n        <path class="ln" stroke-width="3.0" d="M1240 360 v120"/>\n        <path class="ln" stroke-width="3.0" d="M1155 415 h170"/>\n        <path class="ln" stroke-width="3.4" d="M1155 360 h170 v120 h-170 z"/>\n        <path class="brickd" d="M1145 480 h190 v12 h-190 z"/>\n        <path class="ln" stroke-width="2.8" d="M1145 480 h190 v12"/>\n        <path class="acc" d="M1149 492 q91 24 182 0 v46 q-91 18 -182 0 z" opacity="0.11"/>\n    \n' },
  { id: "environmental_detail", depth: 0.35, parallax: true, svg: '\n<path class="ln" stroke-width="4.82" d="M214.4 815.9 v-239.2"/>\n<path class="ln" stroke-width="4.34" d="M214.4 576.7 q4 -17.5 25.1 -20.1"/>\n<path class="lampwarm" d="M239.5 556.7 h28.9 v17.9 h-28.9 z" opacity="0.9"/>\n<path class="ln" stroke-width="3.86" d="M579.2 698.2 v-181.6"/>\n<path class="ln" stroke-width="3.47" d="M579.2 516.6 q4 -14.1 20.1 -16.1"/>\n<path class="lampwarm" d="M599.3 500.5 h23.2 v14.4 h-23.2 z" opacity="0.9"/>\n<path class="ln" stroke-width="3.02" d="M898.4 595.1 v-131.2"/>\n<path class="ln" stroke-width="2.72" d="M898.4 463.9 q4 -11.0 15.7 -12.6"/>\n<path class="lampwarm" d="M914.1 451.4 h18.1 v11.2 h-18.1 z" opacity="0.9"/>\n<path class="ln" stroke-width="4.34" d="M1864.8 757.0 v-210.4"/>\n<path class="ln" stroke-width="3.91" d="M1864.8 546.6 q4 -15.8 22.6 -18.1"/>\n<path class="lampwarm" d="M1887.4 528.6 h26.0 v16.1 h-26.0 z" opacity="0.9"/>\n<path class="ln" stroke-width="3.35" d="M1581.0 635.6 v-151.0"/>\n<path class="ln" stroke-width="3.01" d="M1581.0 484.6 q4 -12.2 17.4 -13.9"/>\n<path class="lampwarm" d="M1598.4 470.7 h20.1 v12.5 h-20.1 z" opacity="0.9"/>\n<path class="fol" d="M100.0 804.0 L350.8 728.3 L578.8 659.4 L784.0 597.5 L943.6 549.3 L1099.8 502.1 L1099.8 515.3 L100.0 838.0 z"/>\n<path class="ln" stroke-width="3.0" d="M100.0 804.0 L350.8 728.3 L578.8 659.4 L784.0 597.5 L943.6 549.3 L1099.8 502.1" opacity="0.9"/>\n<path class="fol" d="M2100.0 804.0 L1910.8 728.3 L1738.8 659.4 L1584.0 597.5 L1463.6 549.3 L1345.8 502.1 L1345.8 515.3 L2100.0 838.0 z"/>\n<path class="ln" stroke-width="3.0" d="M2100.0 804.0 L1910.8 728.3 L1738.8 659.4 L1584.0 597.5 L1463.6 549.3 L1345.8 502.1" opacity="0.9"/>\n<path class="ln" stroke-width="5.4" d="M368 726 v-402"/>\n<path class="ln" stroke-width="3.4" d="M326 354 h84"/>\n<path class="brickd" d="M403.6 703.5 h46 v46.2 h-46 z"/>\n<path class="ln" stroke-width="2.6" d="M403.6 703.5 h46 v46.2"/>\n<path class="brickd" d="M472.0 683.3 h46 v44.3 h-46 z"/>\n<path class="ln" stroke-width="2.6" d="M472.0 683.3 h46 v44.3"/>\n<path class="ln" stroke-width="2.2" d="M1556.8 632.6 a15 15 0 1 0 0.1 0"/>\n<path class="ln" stroke-width="2.2" d="M1604.8 632.6 a15 15 0 1 0 0.1 0"/>\n<path class="ln" stroke-width="2.0" d="M1560.8 630.6 l20 -26 h22 l16 26"/>\n<path class="ln" stroke-width="1.6" d="M1174 515 v-12 q4 -3 4 -9 v-4 h6 v4 q0 6 4 9 v12"/>\n<path class="ln" stroke-width="1.6" d="M1190 515 v-12 q4 -3 4 -9 v-4 h6 v4 q0 6 4 9 v12"/>\n<path class="ln" stroke-width="3.0" d="M1412 515 v-150"/>\n<path class="ln" stroke-width="2.6" d="M1412 365 q3 -12 17 -13"/>\n<path class="acc" d="M1392 510 q38 -9 76 0 q-37 10 -76 0 z" opacity="0.14"/>\n' },
  { id: "furniture", depth: 0.75, parallax: true, svg: '\n\n        <path class="pave" d="M100.0 838.0 L1099.8 515.3 L1133.8 531.3 L186.0 874.0 z"/>\n        <path class="ln" stroke-width="5.0" d="M186.0 874.0 L1133.8 531.3"/>\n        <path class="pave" d="M2100.0 838.0 L1345.8 515.3 L1311.8 531.3 L2014.0 874.0 z"/>\n        <path class="ln" stroke-width="5.0" d="M2014.0 874.0 L1311.8 531.3"/>\n        <path class="kerb" d="M186.0 874.0 L1133.8 531.3 L1136.8 538.3 L196.0 914.0 z"/>\n        <path class="kerb" d="M2014.0 874.0 L1311.8 531.3 L1308.8 538.3 L2004.0 914.0 z"/>\n        <path class="dark" d="M196.0 914.0 L1136.8 538.3 L1308.8 538.3 L2004.0 914.0 L2200 900 L0 900 z"/>\n        <path class="ln" stroke-width="3.4" d="M196.0 914.0 L1136.8 538.3" opacity="0.9"/>\n        <path class="ln" stroke-width="3.4" d="M2004.0 914.0 L1308.8 538.3" opacity="0.9"/>\n        <path class="ln soft" stroke-width="2.4" d="M1080 541 h60" opacity="0.6"/>\n        <path class="ln soft" stroke-width="2.4" d="M1330 541 h56" opacity="0.6"/>\n        <path class="ln soft" stroke-width="1.8" d="M1100 528 h246" opacity="0.4"/>\n        <path class="ln" stroke-width="4.93" d="M1112.6 894.9 L1130.4 820.9" opacity="0.32"/>\n        <path class="ln" stroke-width="4.3" d="M1136.0 849.2 L1150.6 791.2" opacity="0.32"/>\n        <path class="ln" stroke-width="3.67" d="M1159.4 803.5 L1170.7 761.5" opacity="0.32"/>\n        <path class="ln" stroke-width="3.11" d="M1180.2 762.8 L1188.6 732.8" opacity="0.32"/>\n        <path class="ln" stroke-width="2.62" d="M1198.4 727.3 L1204.2 707.3" opacity="0.32"/>\n        <path class="brickd" d="M100.0 768.0 L442.0 683.6 L442.0 727.6 L100.0 838.0 z"/>\n        <path class="ln" stroke-width="4.2" d="M100.0 768.0 L442.0 683.6"/>\n        <path class="ln soft" stroke-width="1.6" d="M271.0 725.8 L271.0 782.8" opacity="0.4"/>\n        <path class="carbody" d="M1349 776 q32 -44 104 -47 q74 -3 106 45 q23 5 24 27 q1 24 -21 27 q-107 8 -216 0 q-23 -3 -21 -27 q1 -23 24 -25 z"/>\n        <path class="ln" stroke-width="4.2" d="M1349 776 q32 -44 104 -47 q74 -3 106 45 q23 5 24 27 q1 24 -21 27 q-107 8 -216 0 q-23 -3 -21 -27 q1 -23 24 -25 z"/>\n        <path class="ln" stroke-width="2.4" d="M1381 770 q24 -31 70 -33 q47 -2 68 33"/>\n        <path class="ln soft" stroke-width="1.6" d="M1451 737 v33" opacity="0.55"/>\n        <path class="ln soft" stroke-width="2.0" d="M1352 800 q104 8 208 0" opacity="0.5"/>\n        <path class="dark" d="M1366 812 a18 18 0 1 0 0.1 0 z"/>\n        <path class="dark" d="M1556 812 a18 18 0 1 0 0.1 0 z"/>\n        <path class="ln" stroke-width="2.6" d="M1366 812 a18 18 0 1 0 0.1 0"/>\n        <path class="ln" stroke-width="2.6" d="M1556 812 a18 18 0 1 0 0.1 0"/>\n        <path class="carbody" d="M1596 786 q46 -62 148 -66 q106 -4 150 64 q32 7 34 39 q2 34 -30 39 q-152 11 -306 0 q-32 -5 -30 -39 q2 -32 34 -37 z"/>\n        <path class="ln" stroke-width="5.0" d="M1596 786 q46 -62 148 -66 q106 -4 150 64 q32 7 34 39 q2 34 -30 39 q-152 11 -306 0 q-32 -5 -30 -39 q2 -32 34 -37 z"/>\n        <path class="dark" d="M1642 780 q34 -44 102 -46 q69 -2 99 46 q-101 9 -201 0 z" opacity="0.85"/>\n        <path class="ln" stroke-width="2.8" d="M1642 780 q34 -44 102 -46 q69 -2 99 46"/>\n        <path class="ln soft" stroke-width="1.8" d="M1744 734 v46" opacity="0.6"/>\n        <path class="dark" d="M1610 834 a23 23 0 1 0 0.1 0 z"/>\n        <path class="dark" d="M1858 834 a23 23 0 1 0 0.1 0 z"/>\n        <path class="ln" stroke-width="3.0" d="M1610 834 a23 23 0 1 0 0.1 0"/>\n        <path class="ln" stroke-width="3.0" d="M1858 834 a23 23 0 1 0 0.1 0"/>\n        <path class="shad" d="M100.0 838.0 L442.0 727.6 L442.0 745.6 L100.0 868.0 z" opacity="0.45"/>\n        <path class="shad" d="M100.0 838.0 L852.4 595.1 L852.4 604.2 L100.0 864.0 z" opacity="0.5"/>\n        <path class="shad" d="M2100.0 838.0 L1532.4 595.1 L1532.4 604.2 L2100.0 864.0 z" opacity="0.5"/>\n        <path class="ln" stroke-width="2.4" d="M1346 525 q40 4 78 10" opacity="0.7"/>\n        <path class="ln soft" stroke-width="2.0" d="M1190 560 h34" opacity="0.45"/>\n        <path class="ln soft" stroke-width="1.4" d="M1195 566 h24" opacity="0.35"/>\n    \n' },
  { id: "overhead", depth: 0.95, parallax: true, svg: '\n<path class="ln soft" stroke-width="1.8" d="M368 324 q400 60 872 116" opacity="0.5"/>\n' },
  { id: "near", depth: 0.9, parallax: true, svg: '\n\n            <path class="fold" d="M120 900 q46 -246 26 -400 q-12 -78 -46 -134 h104 q-28 64 -24 138 q16 154 30 396 z"/>\n            <path class="ln" stroke-width="6.6" d="M132 900 q44 -250 24 -402 q-12 -78 -46 -134"/>\n            <path class="ln" stroke-width="5.0" d="M188 900 q-16 -244 -14 -394 q2 -78 22 -138"/>\n            <path class="ln" stroke-width="5.4" d="M150 470 q104 -38 190 -122 q66 -64 96 -156"/>\n            <path class="ln" stroke-width="4.2" d="M162 372 q70 -54 104 -140 q22 -56 26 -108"/>\n            <path class="ln" stroke-width="3.2" d="M258 348 q68 -22 112 -74"/>\n            <path class="ln" stroke-width="2.6" d="M300 268 q52 -34 74 -86"/>\n            <path class="ln" stroke-width="2.0" d="M344 198 q40 -32 54 -76"/>\n            <path class="fol" d="M-40 236 q-14 -102 78 -134 q26 -96 118 -84 q42 -74 122 -46 q66 -58 118 6 q88 -22 92 62 q64 20 30 90 q40 62 -34 84 q-14 70 -96 56 q-40 54 -110 22 q-64 44 -124 -6 q-88 24 -122 -42 q-84 -4 -72 -8 z" opacity="0.96"/>\n            <path class="ln" stroke-width="3.0" d="M-40 236 q-14 -102 78 -134 q26 -96 118 -84 q42 -74 122 -46 q66 -58 118 6 q88 -22 92 62 q64 20 30 90 q40 62 -34 84 q-14 70 -96 56 q-40 54 -110 22 q-64 44 -124 -6 q-88 24 -122 -42" opacity="0.5"/>\n            <path class="ln" stroke-width="2.2" d="M292 150 q76 -58 146 -10 q52 34 4 76 q-64 52 -134 12 q-58 -36 -16 -78 z" opacity="0.4"/>\n            <path class="fold" d="M0 900 q180 -96 420 -74 q220 20 372 62 v12 h-792 z"/>\n            <path class="ln" stroke-width="4.6" d="M0 826 q180 -96 420 -74 q220 20 372 62"/>\n            <path class="ln soft" stroke-width="1.8" d="M60 841.7 q10 -20 20.9 -25.0" opacity="0.4"/>\n            <path class="ln soft" stroke-width="1.8" d="M198 852.4 q10 -20 18.4 -26.9" opacity="0.4"/>\n            <path class="ln soft" stroke-width="1.8" d="M336 832.0 q10 -20 20.6 -27.2" opacity="0.4"/>\n            <path class="ln soft" stroke-width="1.8" d="M474 845.2 q10 -20 19.5 -26.8" opacity="0.4"/>\n            <path class="ln soft" stroke-width="1.8" d="M612 833.7 q10 -20 19.9 -24.9" opacity="0.4"/>\n        \n' },
  { id: "atmosphere", depth: 0, parallax: false, svg: '\n\n            <rect x="0" y="0" width="2200" height="900" fill="url(#n-nightspill)" pointer-events="none"/>\n            <rect x="0" y="0" width="2200" height="900" fill="url(#n-vignette)" pointer-events="none"/>\n            <rect x="0" y="0" width="2200" height="900" filter="url(#n-grain)" opacity="0.07" style="mix-blend-mode:multiply" pointer-events="none"/>\n        \n' }
];

// proof/main.ts
var svg = document.getElementById("stage");
var world = document.getElementById("world");
var label = document.getElementById("beat");
var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var parallaxing = BANDS.filter((b) => b.parallax);
var atmo = BANDS.filter((b) => !b.parallax);
svg.insertAdjacentHTML("afterbegin", `<style>${STYLE}</style><defs>${DEFS}</defs>`);
world.innerHTML = parallaxing.map((b) => `<g id="band-${b.id}" class="band" data-depth="${b.depth}">${b.svg}</g>`).join("");
document.getElementById("atmosphere").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        viewBox="0 0 100 100" style="width:100%;height:100%">
     <style>${STYLE}</style><defs>${DEFS}</defs>
     ${atmo.map(
  (b) => b.svg.replace(
    /(<rect[^>]*fill="url\(#n-vignette\)")/,
    '<g id="atmo-vignette">$1</g>'
  )
).join("")}
   </svg>`;
var viewport = { w: window.innerWidth, h: window.innerHeight };
var refFrame;
function recomputeRef() {
  viewport = { w: window.innerWidth, h: window.innerHeight };
  const aspect = viewport.w / viewport.h;
  refFrame = frameFor(beatsFor(ACT1_BEATS, aspect)[0], aspect, NEIGHBOURHOOD_NIGHT);
}
recomputeRef();
function render(progress) {
  const f = camera(NEIGHBOURHOOD_NIGHT, ACT1_BEATS, progress, viewport);
  svg.setAttribute("viewBox", viewBox(f));
  for (const b of parallaxing) {
    const g = document.getElementById(`band-${b.id}`);
    const t = bandTransform(f, refFrame, b.depth);
    if (t) g.setAttribute("transform", t);
    else g.removeAttribute("transform");
  }
  const cover = Math.min(1, f.w / NEIGHBOURHOOD_NIGHT.cameraFrame.w);
  const vig = document.getElementById("atmo-vignette");
  if (vig) vig.setAttribute("opacity", (cover * cover).toFixed(3));
  const aspect = viewport.w / viewport.h;
  const list = beatsFor(ACT1_BEATS, aspect);
  let cur = list[0];
  for (const b of list) if (progress >= b.t) cur = b;
  label.textContent = `${(progress * 100).toFixed(0)}%  \xB7  ${cur.label}  \xB7  fov ${f.w.toFixed(0)}u  \xB7  aspect ${aspect.toFixed(3)}  \xB7  cap ${maxFov(aspect, 900).toFixed(0)}u`;
}
if (prefersReduced) {
  document.body.classList.add("reduced");
  render(0);
} else {
  const track = document.getElementById("track");
  const onScroll = () => {
    const max = track.scrollHeight - window.innerHeight;
    render(max > 0 ? window.scrollY / max : 0);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
window.addEventListener("resize", () => {
  recomputeRef();
  const track = document.getElementById("track");
  const max = track.scrollHeight - window.innerHeight;
  render(prefersReduced ? 0 : max > 0 ? window.scrollY / max : 0);
});
window.__render = (p) => render(p);
window.__frame = (p) => camera(NEIGHBOURHOOD_NIGHT, ACT1_BEATS, p, viewport);
