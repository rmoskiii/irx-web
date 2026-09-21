/**
 * Pass D proof harness — Act 1 through the warm hinge into Act 2.
 * Destination: irx-web/proof/main.ts (dev-only)
 */
import { camera, viewBox, frameFor, beatsFor, type Frame } from '../src/motion/camera';
import { NEIGHBOURHOOD_NIGHT, ACT1_BEATS } from '../src/motion/act1';
import { HERO_BIRTHDAY, ACT2_BEATS, HINGE_T } from '../src/motion/act2';
import {
  KITCHEN, BALCONY, KITCHEN_BEATS, BALCONY_BEATS,
  CHOICE, thresholdTail, THRESHOLD_T, type BranchId,
} from '../src/motion/act3';
import * as KIT from '../src/scene/kitchen.generated';
import * as BAL from '../src/scene/balcony.generated';
import { bandTransform, widestFrame } from '../src/scene/stage';
import { resolve, type SceneDef } from '../src/scene/scenePortal';
import * as EXT from '../src/scene/bands.generated';
import * as INT from '../src/scene/interior.generated';

const EXTERIOR: SceneDef = {
  id: 'neighbourhood_night', meta: NEIGHBOURHOOD_NIGHT, beats: ACT1_BEATS,
  bands: EXT.BANDS, style: EXT.STYLE, defs: EXT.DEFS,
};
const INTERIOR: SceneDef = {
  id: 'hero_birthday', meta: HERO_BIRTHDAY, beats: ACT2_BEATS,
  bands: INT.BANDS, style: INT.STYLE, defs: INT.DEFS,
};
const KITCHEN_SCENE: SceneDef = {
  id: 's1d4_kitchen', meta: KITCHEN, beats: KITCHEN_BEATS,
  bands: KIT.BANDS, style: KIT.STYLE, defs: KIT.DEFS,
};
const BALCONY_SCENE: SceneDef = {
  id: 's1d4_balcony', meta: BALCONY, beats: BALCONY_BEATS,
  bands: BAL.BANDS, style: BAL.STYLE, defs: BAL.DEFS,
};

/** The choice. Nothing is decided until the viewer decides it. */
let branch: BranchId | null = null;
const branchScene = () => (branch === 'kitchen' ? KITCHEN_SCENE : BALCONY_SCENE);

/** Act 2's beats gain a tail toward whichever threshold was chosen. */
const heroBeats = () =>
    branch ? [...ACT2_BEATS.filter((b) => b.t < 0.9), ...thresholdTail(branch)] : ACT2_BEATS;

const PORTAL = { from: EXTERIOR, to: INTERIOR, at: HINGE_T, overlap: 0.012 };

const label = document.getElementById('beat') as HTMLElement;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pin = document.getElementById('pin') as HTMLElement;

/** One stage per scene. Both exist; only one is driven at a time. */
function mount(scene: SceneDef) {
  const host = document.createElement('div');
  host.id = `stage-${scene.id}`;
  host.style.cssText = 'position:absolute;inset:0;visibility:hidden';
  const par = scene.bands.filter((b) => b.parallax);
  const atmo = scene.bands.filter((b) => !b.parallax);
  host.innerHTML = `
    <svg class="stage" preserveAspectRatio="xMidYMid slice"
         xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
      <style>${scene.style}</style><defs>${scene.defs}</defs>
      <g class="world">${par
      .map((b) => `<g id="${scene.id}-${b.id}" class="band">${b.svg}</g>`)
      .join('')}</g>
    </svg>
    <div class="atmo" style="position:absolute;inset:0;pointer-events:none">
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
           viewBox="0 0 100 100" style="width:100%;height:100%">
        <style>${scene.style}</style><defs>${scene.defs}</defs>
        ${atmo
      .map((b) =>
          b.svg.replace(/(<rect[^>]*fill="url\(#[a-z-]*vignette\)")/, '<g class="vig">$1</g>')
      )
      .join('')}
      </svg>
    </div>`;
  pin.appendChild(host);
  return host;
}
const HOSTS: Record<string, HTMLElement> = {
  [EXTERIOR.id]: mount(EXTERIOR),
  [INTERIOR.id]: mount(INTERIOR),
  [KITCHEN_SCENE.id]: mount(KITCHEN_SCENE),
  [BALCONY_SCENE.id]: mount(BALCONY_SCENE),
};
const ALL = [EXTERIOR, INTERIOR, KITCHEN_SCENE, BALCONY_SCENE];

/**
 * The choice UI. Two lines and a question, over the room, with the room still
 * visible. No modal, no card, no dashboard — it should read as belonging to
 * the world rather than arriving on top of it.
 */
const ui = document.createElement('div');
ui.id = 'choice';
ui.innerHTML =
    `<p class="q">${CHOICE.prompt}</p>` +
    CHOICE.options.map((o) => `<button data-branch="${o.id}">${o.label}</button>`).join('');
document.body.appendChild(ui);
ui.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('button');
  if (!el) return;
  branch = el.getAttribute('data-branch') as BranchId;
  ui.classList.remove('on');
  render(lastProgress);
});
let lastProgress = 0;

let viewport = { w: window.innerWidth, h: window.innerHeight };
const REF: Record<string, Frame> = {};
function recomputeRefs() {
  viewport = { w: window.innerWidth, h: window.innerHeight };
  const a = viewport.w / viewport.h;
  for (const s of ALL) {
    const beats = s.id === INTERIOR.id ? heroBeats() : s.beats;
    REF[s.id] = widestFrame(beatsFor(beats, a).map((b) => frameFor(b, a, s.meta)));
  }
}
recomputeRefs();

function drive(scene: SceneDef, local: number) {
  const host = HOSTS[scene.id];
  const beats = scene.id === INTERIOR.id ? heroBeats() : scene.beats;
  const f = camera(scene.meta, beats, local, viewport);
  (host.querySelector('.stage') as SVGSVGElement).setAttribute('viewBox', viewBox(f));
  for (const b of scene.bands) {
    if (!b.parallax) continue;
    const g = host.querySelector(`#${CSS.escape(scene.id + '-' + b.id)}`)!;
    const t = bandTransform(f, REF[scene.id], b.depth);
    if (t) g.setAttribute('transform', t);
    else g.removeAttribute('transform');
  }
  // vignette strength tracks scene coverage; it never translates
  const cover = Math.min(1, f.w / scene.meta.cameraFrame.w);
  host.querySelectorAll('.vig').forEach((v) =>
      (v as SVGGElement).setAttribute('opacity', (cover * cover).toFixed(3))
  );
  return f;
}

function render(progress: number) {
  lastProgress = progress;

  // Two portals in sequence. The second only exists once a choice has been
  // made — before that the front room owns the stage to the end, and the
  // scroll simply holds on Bola.
  let own = resolve(PORTAL, progress);
  if (branch && progress >= HINGE_T) {
    const second = { from: INTERIOR, to: branchScene(), at: THRESHOLD_T, overlap: 0.012 };
    own = resolve(second, progress);
    if (own.active.id === INTERIOR.id) {
      own = { ...own, local: (progress - HINGE_T) / (THRESHOLD_T - HINGE_T) };
    }
  }

  for (const s of ALL) {
    const on = s.id === own.active.id || s.id === own.warming?.id;
    HOSTS[s.id].style.visibility = on ? 'visible' : 'hidden';
    HOSTS[s.id].style.zIndex = s.id === own.active.id ? '2' : '1';
  }
  if (own.warming) drive(own.warming, own.warming.id === own.active.id ? 1 : 0);
  const f = drive(own.active, own.local);

  // Observation before interaction: the choice only appears once the camera
  // has settled on Bola, and it goes away the moment it is answered.
  const showChoice =
      !branch && own.active.id === INTERIOR.id && own.local >= CHOICE.at;
  ui.classList.toggle('on', showChoice);

  const list = beatsFor(
      own.active.id === INTERIOR.id ? heroBeats() : own.active.beats,
      viewport.w / viewport.h
  );
  let cur = list[0];
  for (const b of list) if (own.local >= b.t) cur = b;
  label.textContent =
      `${(progress * 100).toFixed(0)}%  ·  ${own.active.id}  ·  ${cur.label}  ·  fov ${f.w.toFixed(0)}u`;
}

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
  recomputeRefs();
  const track = document.getElementById('track') as HTMLElement;
  const max = track.scrollHeight - window.innerHeight;
  render(prefersReduced ? 0 : max > 0 ? window.scrollY / max : 0);
});
(window as any).__render = (p: number) => render(p);
(window as any).__choose = (b: BranchId) => { branch = b; ui.classList.remove('on'); render(lastProgress); };
(window as any).__frame = (p: number) => {
  let own = resolve(PORTAL, p);
  if (branch && p >= HINGE_T) {
    const second = { from: INTERIOR, to: branchScene(), at: THRESHOLD_T, overlap: 0.012 };
    own = resolve(second, p);
    if (own.active.id === INTERIOR.id) own = { ...own, local: (p - HINGE_T) / (THRESHOLD_T - HINGE_T) };
  }
  const beats = own.active.id === INTERIOR.id ? heroBeats() : own.active.beats;
  return { scene: own.active.id, ...camera(own.active.meta, beats, own.local, viewport) };
};