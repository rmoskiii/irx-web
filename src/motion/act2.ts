/**
 * Act 2 — the interior, opening out from the warm hinge.
 *
 * Destination: irx-web/src/motion/act2.ts
 *
 * Metadata read from hero_birthday.web.svg, not re-derived:
 *   data-authoring-canvas="1600,900"
 *   data-camera-frame="0,0,1600,900"
 *   data-max-fov="1300"
 *   data-hinge-anchor="652,190,138,46"   (hb-shade, the pendant)
 */
import type { CameraBeat, SceneMeta, Rect } from './camera';

/**
 * maxFovUnits is the asset speaking, not the camera deciding. hero_birthday is
 * a composed 1600x900 frame with no overscan, so a camera at full canvas width
 * has zero margin and the first frame of parallax exposes a band edge. 1300
 * leaves 150 units each side, which covers the band displacement at the travel
 * distances below. It is also the better framing: you are in a room, not
 * surveying it.
 */
export const HERO_BIRTHDAY: SceneMeta = {
    canvas: { w: 1600, h: 900 },
    cameraFrame: { x: 0, y: 0, w: 1600, h: 900 },
    maxFovUnits: 1300,
    overscan: {},
};

/** hb-shade, the pendant. The interior end of the warm hinge. */
export const HINGE: Rect = { x: 652, y: 190, w: 138, h: 46 };

/** hb-win. Present for framing only — never the subject of the cut. */
export const INTERIOR_WINDOW: Rect = { x: 546, y: 134, w: 406, h: 300 };

/** hb-bola in the armchair. Mum, at ease. It is her night. */
export const BOLA: Rect = { x: 2, y: 546, w: 406, h: 354 };

/** hb-table-top and the props standing on it, prop.phone among them. */
export const TABLE: Rect = { x: 428, y: 690, w: 486, h: 190 };

export const ACT2_BEATS: CameraBeat[] = [
    {
        // The swap lands here. Inside the pendant shade: no structure, just warm.
        // Measured flat at sd 0.00, mean L 202.9 against the exterior's 196.1 —
        // a 3.5% step, and passing through glazing that was attenuating the light
        // SHOULD brighten it, so the step is left in rather than hidden.
        t: 0.0,
        anchor: { x: 721, y: 213 },
        intent: { kind: 'inside', region: HINGE, depth: 0.65 },
        label: 'HINGE — warm field',
    },
    {
        t: 0.12,
        anchor: { x: 721, y: 218 },
        intent: { kind: 'region', region: HINGE, fill: 0.55 },
        label: 'THE PENDANT — the room has a light in it',
    },
    {
        t: 0.3,
        anchor: { x: 730, y: 250 },
        intent: { kind: 'region', region: HINGE, fill: 0.16 },
        label: 'BUNTING — somebody decorated this',
    },
    {
        t: 0.52,
        anchor: { x: 749, y: 330 },
        intent: { kind: 'region', region: INTERIOR_WINDOW, fill: 0.72 },
        label: 'THE WINDOW AND THE HEADS',
    },
    {
        t: 0.78,
        anchor: { x: 790, y: 430 },
        intent: { kind: 'cover', fovUnits: 1020 },
        label: 'THE ROOM — six people, a table',
    },
    {
        // Capped by the asset at 1300.
        t: 0.7,
        anchor: { x: 790, y: 450 },
        intent: { kind: 'cover', fovUnits: 1300 },
        label: 'THE ROOM — established',
    },

    // ---- OBSERVATION ----------------------------------------------------
    // Before anything is asked of the viewer. IRX starts with context, and the
    // site should behave the way the product does: you read the room first.
    {
        t: 0.84,
        anchor: { x: 671, y: 764 },
        intent: { kind: 'region', region: TABLE, fill: 0.62 },
        label: 'THE TABLE — a drink not drunk, a card, somebody\'s phone',
    },
    {
        // The last thing before the choice. She is the reason everybody is here,
        // and she is the person the decision lands on.
        t: 1.0,
        anchor: { x: 214, y: 706 },
        intent: { kind: 'region', region: BOLA, fill: 0.86 },
        label: 'BOLA — at ease. It is her night.',
    },
];

/** Interior depth factors. A frontal room: fewer planes, shallower spread. */
export const DEPTH: Record<string, number> = {
    background: 0.1,
    architecture: 0.3,
    environmental_detail: 0.45,
    furniture: 0.75,
    near: 0.95,
    atmosphere: 0,
};

/**
 * Where Act 1 hands over. Chosen at the flat field rather than at a round
 * number: before this the exterior owns the stage, after it the interior does,
 * and at it neither scene is showing anything but warm light.
 */
export const HINGE_T = 0.46;