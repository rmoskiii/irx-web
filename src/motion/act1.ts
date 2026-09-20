/**
 * Act 1 — NEIGHBOURHOOD → APPROACH → WARM PANE
 *
 * Destination: irx-web/src/motion/act1.ts
 *
 * Metadata below is READ FROM scene.neighbourhood_night.svg, not re-derived:
 *   data-authoring-canvas="2200,900"
 *   data-camera-frame="300,0,1600,900"
 *   data-vanishing-point="1240,470"
 *   data-overscan on each band group
 *   n-window-lit data-aperture="1155,360,170,120"
 *
 * The aperture is the only region the beats name. Everything else is anchor
 * plus intent, so the asset stays the source of truth for geometry.
 */
import type { CameraBeat, SceneMeta, Rect } from './camera';

export const NEIGHBOURHOOD_NIGHT: SceneMeta = {
    canvas: { w: 2200, h: 900 },
    cameraFrame: { x: 300, y: 0, w: 1600, h: 900 },
    overscan: {
        background: 300,
        architecture: 180,
        environmental_detail: 200,
        furniture: 140,
        near: 100,
    },
};

/** n-window-lit, verbatim from data-aperture. 1.4167 : 1. */
export const APERTURE: Rect = { x: 1155, y: 360, w: 170, h: 120 };

/** Vanishing point. Sits inside the aperture — the street aims the camera. */
export const VANISHING_POINT = { x: 1240, y: 470 };

/**
 * The lit pane the camera pushes into: the upper-right quadrant of the
 * aperture, bounded by the centre mullion and the horizontal bar. Measured
 * from the shipped artwork's own glazing geometry, not chosen.
 */
export const LIT_PANE: Rect = { x: 1240, y: 360, w: 85, h: 55 };

/**
 * DESKTOP AND TABLET (aspect >= 0.75)
 *
 * A single continuous push. Anchors travel from the street's centre toward
 * the aperture, so the movement is forward travel down the corridor rather
 * than a scale-up around a fixed point: cx moves 1100 -> 1284 while the frame
 * narrows 1600 -> ~53. The two happening together is what reads as approach.
 */
const WIDE: CameraBeat[] = [
    {
        t: 0.0,
        anchor: { x: 1100, y: 450 },
        intent: { kind: 'cover', fovUnits: 1600 },
        label: 'WIDE — the street',
        minAspect: 0.75,
    },
    {
        t: 0.38,
        anchor: { x: 1160, y: 458 },
        intent: { kind: 'cover', fovUnits: 880 },
        label: 'APPROACH — travel begins',
        minAspect: 0.75,
    },
    {
        t: 0.66,
        anchor: { x: 1205, y: 464 },
        intent: { kind: 'cover', fovUnits: 430 },
        label: 'THE HOUSE — dominates',
        minAspect: 0.75,
    },
    {
        t: 0.88,
        anchor: { x: 1240, y: 420 },
        intent: { kind: 'region', region: APERTURE, fill: 1.0 },
        label: 'THE WINDOW — destination',
        minAspect: 0.75,
    },
    {
        t: 1.0,
        anchor: { x: 1284, y: 385 },
        intent: { kind: 'inside', region: LIT_PANE, depth: 0.55 },
        label: 'WARM PANE — near-flat field',
        minAspect: 0.75,
    },
];

/**
 * NARROW (aspect < 0.75) — SERIAL ESTABLISHING PAN
 *
 * The only aspect-specific exception in the system, and it is a different
 * LAYOUT of the same content rather than a crop of the desktop composition.
 *
 * At 390x844 the widest possible full-bleed frame is 0.462 x 900 = 416 units,
 * so the 1600-unit wide shot cannot be shown at once. It is shown over time
 * instead: the camera travels left-to-right across the terrace before the
 * approach begins, so a narrow viewport sees the same street, serially.
 *
 * From t=0.40 the two tracks converge — same anchors, same intents — so the
 * approach and the pane are one choreography at every aspect.
 */
const NARROW: CameraBeat[] = [
    {
        t: 0.0,
        anchor: { x: 620, y: 470 },
        intent: { kind: 'cover', fovUnits: 416 },
        label: 'PAN — left terrace',
        maxAspect: 0.75,
    },
    {
        t: 0.15,
        anchor: { x: 880, y: 470 },
        intent: { kind: 'cover', fovUnits: 416 },
        label: 'PAN — corridor and cars',
        maxAspect: 0.75,
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
        intent: { kind: 'cover', fovUnits: 398 },
        label: 'PAN — tighten begins while still travelling',
        maxAspect: 0.75,
    },
    {
        t: 0.38,
        anchor: { x: 1214, y: 458 },
        intent: { kind: 'cover', fovUnits: 352 },
        label: 'PAN settles into APPROACH',
        maxAspect: 0.75,
    },
    {
        t: 0.52,
        anchor: { x: 1232, y: 448 },
        intent: { kind: 'cover', fovUnits: 288 },
        label: 'APPROACH',
        maxAspect: 0.75,
    },
    {
        t: 0.72,
        anchor: { x: 1238, y: 432 },
        intent: { kind: 'cover', fovUnits: 176 },
        label: 'THE HOUSE — dominates',
        maxAspect: 0.75,
    },
    {
        t: 0.88,
        anchor: { x: 1240, y: 410 },
        intent: { kind: 'region', region: APERTURE, fill: 0.6 },
        label: 'THE WINDOW — 60% of viewport height',
        maxAspect: 0.75,
    },
    {
        t: 1.0,
        anchor: { x: 1284, y: 385 },
        // 0.6, not 0.72: at 0.72 the 18u-wide portrait frame reached the pane's
        // lower edge and picked up the sill tone, measuring sd 23.7. 0.6 keeps the
        // frame wholly inside the lit glass. Measured, not guessed.
        intent: { kind: 'inside', region: LIT_PANE, depth: 0.6 },
        label: 'WARM PANE — near-flat field',
        maxAspect: 0.75,
    },
];

export const ACT1_BEATS: CameraBeat[] = [...WIDE, ...NARROW];

/**
 * Band depth factors. Parallax is applied as a translation of the band
 * relative to camera travel; atmosphere is 0 and never moves.
 */
export const DEPTH: Record<string, number> = {
    background: 0.05,
    /** Receding side terraces only. */
    architecture: 0.15,
    /**
     * PASS B FINDING. The far terrace sits at the vanishing point and holds the
     * target house and n-window-lit. It is the plane the camera approaches, so
     * it IS the parallax reference and never translates.
     *
     * `architecture` in the shipped asset contains BOTH the receding side
     * terraces and this far terrace, so it cannot be a single parallax plane in
     * a one-point-perspective scene. split_bands.py must emit them separately —
     * a Pass C requirement discovered here, not assumed.
     */
    architecture_far: 1.0,
    environmental_detail: 0.35,
    furniture: 0.75,
    near: 0.9,
    atmosphere: 0,
};