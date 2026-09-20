/**
 * Pass B proof harness. Vanilla driver over the SAME camera module the React
 * components use — no second implementation.
 *
 * Destination: irx-web/proof/main.ts (dev-only, not shipped)
 */
import { camera, viewBox, frameFor, beatsFor, maxFov, type Frame } from '../src/motion/camera';
import { NEIGHBOURHOOD_NIGHT, ACT1_BEATS } from '../src/motion/act1';
import { bandTransform } from '../src/scene/stage';
import { BANDS, STYLE, DEFS } from '../src/scene/bands.generated';

const svg = document.getElementById('stage') as unknown as SVGSVGElement;
const world = document.getElementById('world') as unknown as SVGGElement;
const label = document.getElementById('beat') as HTMLElement;

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Real bands. Style and defs are hoisted once — the defs hold the grain
// filter and vignette gradient that only the atmosphere band references, and
// repeating them per band would duplicate ids.
const parallaxing = BANDS.filter((b) => b.parallax);
const atmo = BANDS.filter((b) => !b.parallax);
svg.insertAdjacentHTML('afterbegin', `<style>${STYLE}</style><defs>${DEFS}</defs>`);
world.innerHTML = parallaxing
  .map((b) => `<g id="band-${b.id}" class="band" data-depth="${b.depth}">${b.svg}</g>`)
  .join('');
// Atmosphere is viewport-locked: its own SVG, its own viewBox, never inside
// the parallax world and never transformed.
document.getElementById('atmosphere')!.innerHTML =
  `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        viewBox="0 0 100 100" style="width:100%;height:100%">
     <style>${STYLE}</style><defs>${DEFS}</defs>
     ${atmo
       .map((b) =>
         b.svg.replace(
           /(<rect[^>]*fill="url\(#n-vignette\)")/,
           '<g id="atmo-vignette">$1</g>'
         )
       )
       .join('')}
   </svg>`;

let viewport = { w: window.innerWidth, h: window.innerHeight };
let refFrame: Frame;

function recomputeRef() {
  viewport = { w: window.innerWidth, h: window.innerHeight };
  const aspect = viewport.w / viewport.h;
  refFrame = frameFor(beatsFor(ACT1_BEATS, aspect)[0], aspect, NEIGHBOURHOOD_NIGHT);
}
recomputeRef();

function render(progress: number) {
  const f = camera(NEIGHBOURHOOD_NIGHT, ACT1_BEATS, progress, viewport);
  svg.setAttribute('viewBox', viewBox(f));
  for (const b of parallaxing) {
    const g = document.getElementById(`band-${b.id}`)!;
    const t = bandTransform(f, refFrame, b.depth);
    if (t) g.setAttribute('transform', t);
    else g.removeAttribute('transform');
  }
  // PASS C FINDING — viewport-locked is not the same as constant-strength.
  //
  // The atmosphere band holds two different kinds of thing and they do not
  // behave alike under a push:
  //
  //   grain     a capture artefact. Constant. It belongs to the lens, not the
  //             street, so it does not change when the camera moves.
  //   vignette  scene falloff, authored in `foreground` for the nominal
  //             1600x900 frame. It is the street getting darker at its edges.
  //             Held at full strength it crushed the terminal frame to mean
  //             luminance 88 — and the light-match hinge needs ~190 there, so
  //             the whole transition would have failed on a lighting layer
  //             rather than on the camera.
  //
  // Neither band ever translates. Only the vignette's strength tracks how
  // much of the scene the frame still covers.
  const cover = Math.min(1, f.w / NEIGHBOURHOOD_NIGHT.cameraFrame.w);
  const vig = document.getElementById('atmo-vignette');
  if (vig) vig.setAttribute('opacity', (cover * cover).toFixed(3));

  const aspect = viewport.w / viewport.h;
  const list = beatsFor(ACT1_BEATS, aspect);
  let cur = list[0];
  for (const b of list) if (progress >= b.t) cur = b;
  label.textContent =
    `${(progress * 100).toFixed(0)}%  ·  ${cur.label}  ·  fov ${f.w.toFixed(0)}u` +
    `  ·  aspect ${aspect.toFixed(3)}  ·  cap ${maxFov(aspect, 900).toFixed(0)}u`;
}

/** REDUCED MOTION: a single composed static state, no scroll binding at all. */
if (prefersReduced) {
  document.body.classList.add('reduced');
  render(0);
} else {
  const track = document.getElementById('track') as HTMLElement;
  const onScroll = () => {
    const max = track.scrollHeight - window.innerHeight;
    render(max > 0 ? window.scrollY / max : 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

window.addEventListener('resize', () => {
  recomputeRef();
  const track = document.getElementById('track') as HTMLElement;
  const max = track.scrollHeight - window.innerHeight;
  render(prefersReduced ? 0 : max > 0 ? window.scrollY / max : 0);
});

// test hook
(window as any).__render = (p: number) => render(p);
(window as any).__frame = (p: number) => camera(NEIGHBOURHOOD_NIGHT, ACT1_BEATS, p, viewport);
