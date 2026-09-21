/**
 * Act 3 — the choice, the threshold hinge, and where it takes you.
 *
 * Destination: irx-web/src/motion/act3.ts
 *
 * The interaction is the authored one. s1d4_frontroom offers "The kitchen."
 * and "The balcony.", and both destinations already exist as scenes with a
 * named character and a named register. Nothing is invented here; the choice
 * is read off the scenario and the camera answers it.
 *
 * The consequence is the camera. There is no score, no panel, no verdict —
 * you choose and the world moves. That is the whole product claim, and the
 * site should demonstrate it rather than describe it.
 */
import type { CameraBeat, SceneMeta, Rect } from './camera';

/**
 * The two thresholds in the front room, from hero_birthday.web.svg.
 *
 * KNOWN MISMATCH, kitchen side. hb-kit is painted as a flat --irx-lamp-warm
 * fill — a stylised bright doorway, measuring L 203 warmth 116 when the camera
 * is inside it. s1d4_kitchen is a real room at night, and a grid search of it
 * finds no field above L 98.5 / warmth 55.8 even with the key light. So the
 * kitchen swap lands at roughly ΔL 60% where the balcony swap lands at Δwarm
 * 0.9. It is a mismatch between a stylised opening and a rendered room, not a
 * camera fault, and it is not fixable by moving the anchor.
 *
 * Two ways out, both Pass G: dim hb-kit in the hero derivative so the doorway
 * reads as a dim night kitchen rather than a lightbox, or give the kitchen
 * derivative a genuine warm plane to arrive on. The first is more honest to
 * what is on the other side of that door.
 */
export const THRESHOLD_KITCHEN: Rect = { x: 1130, y: 126, w: 470, h: 476 };
export const THRESHOLD_BALCONY: Rect = { x: 546, y: 134, w: 406, h: 300 };

export type BranchId = 'kitchen' | 'balcony';

export const CHOICE = {
    prompt: 'Where do you go?',
    options: [
        { id: 'kitchen' as BranchId, label: 'The kitchen.' },
        { id: 'balcony' as BranchId, label: 'The balcony.' },
    ],
    /** Local progress within act 2 at which the choice becomes available. */
    at: 0.86,
};

/**
 * The tail of Act 2, after the choice is made: the camera leaves Bola and
 * moves into whichever threshold was picked.
 *
 * The two have opposite polarity and the hinge does not care. The kitchen bar
 * is --irx-lamp-warm, so pushing into it resolves to a warm field; the glazing
 * is --irx-outside-dark and resolves to a dark one. Low information is the
 * only property the swap needs, and both reach it.
 */
export function thresholdTail(branch: BranchId): CameraBeat[] {
    const region = branch === 'kitchen' ? THRESHOLD_KITCHEN : THRESHOLD_BALCONY;
    const cx = region.x + region.w / 2;
    const cy = region.y + region.h / 2;
    return [
        {
            t: 0.9,
            anchor: { x: (214 + cx) / 2, y: (706 + cy) / 2 },
            intent: { kind: 'cover', fovUnits: 900 },
            label: branch === 'kitchen' ? 'TURNING TOWARD THE KITCHEN' : 'TURNING TOWARD THE GLASS',
        },
        {
            t: 0.96,
            anchor: { x: cx, y: cy },
            intent: { kind: 'region', region, fill: 0.92 },
            label: 'THE THRESHOLD',
        },
        {
            t: 1.0,
            anchor: { x: cx, y: cy },
            intent: { kind: 'inside', region, depth: 0.1 },
            label: branch === 'kitchen' ? 'WARM FIELD — crossing' : 'DARK FIELD — crossing',
        },
    ];
}

const BRANCH_META: SceneMeta = {
    canvas: { w: 1600, h: 900 },
    cameraFrame: { x: 0, y: 0, w: 1600, h: 900 },
    maxFovUnits: 1300,
    overscan: {},
};

export const KITCHEN: SceneMeta = BRANCH_META;
export const BALCONY: SceneMeta = BRANCH_META;

/** Kai, performing, at the centre slot. s1d4_kitchen. */
const KAI: Rect = { x: 670, y: 340, w: 260, h: 340 };
/** Tunde, open, at the centre slot. s1d4_balcony. */
const TUNDE: Rect = { x: 670, y: 340, w: 260, h: 340 };

/**
 * The branch opens the same way the front room did: out of a flat field, with
 * the room assembling around it. Same shape of move on both sides of the
 * choice, so the two outcomes feel like the same world rather than two
 * different products.
 */
function openingBeats(who: Rect, label: string, fieldAnchor: { x: number; y: number }): CameraBeat[] {
    return [
        {
            t: 0.0,
            anchor: fieldAnchor,
            intent: { kind: 'cover', fovUnits: 46 },
            label: 'FIELD — you are through',
        },
        {
            t: 0.22,
            anchor: { x: (fieldAnchor.x + 800) / 2, y: (fieldAnchor.y + 500) / 2 },
            intent: { kind: 'cover', fovUnits: 320 },
            label: 'THE ROOM OPENS',
        },
        {
            t: 0.52,
            anchor: { x: 800, y: 470 },
            intent: { kind: 'region', region: who, fill: 0.62 },
            label,
        },
        {
            t: 1.0,
            anchor: { x: 800, y: 450 },
            intent: { kind: 'cover', fovUnits: 1300 },
            label: 'ESTABLISHED — the world moved because you did',
        },
    ];
}

/**
 * Grid-searched, not chosen: the flattest, warmest region in the night
 * kitchen is (640,120) at L 98.5, sd 0.64, warmth 55.8 — the upper wall under
 * the key light. It is the best field the scene has, and it still does not
 * match the threshold it arrives from. See the note on THRESHOLD_KITCHEN.
 */
export const KITCHEN_BEATS = openingBeats(
    KAI,
    'KAI — performing',
    { x: 640, y: 120 }
);

export const BALCONY_BEATS = openingBeats(
    TUNDE,
    'TUNDE — open',
    { x: 300, y: 250 } // inside the lit doorway behind him
);

/** Branch depth factors. Both are frontal interiors, like the front room. */
export const DEPTH: Record<string, number> = {
    background: 0.1,
    architecture: 0.3,
    environmental_detail: 0.45,
    furniture: 0.75,
    near: 0.95,
    atmosphere: 0,
};

/** Global progress at which the front room hands over to the branch. */
export const THRESHOLD_T = 0.88;