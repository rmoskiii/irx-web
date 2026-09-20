/**
 * The camera. One function, every viewport.
 *
 * Destination: irx-web/src/motion/camera.ts
 *
 * A beat declares INTENT — what we are looking at and how tightly — not a
 * viewBox. The frame is derived from that intent plus the viewport aspect, so
 * a 16:9 laptop, a 4:3 tablet and a 390x844 phone all get a correct frame from
 * the same authored beats. There is no device branching and no second track.
 *
 * Coordinates are always the scene's own authoring canvas (2200x900 for
 * scene.neighbourhood_night), never pixels.
 */

export type Vec2 = { x: number; y: number };

/** What a beat is trying to show. */
export type FramingIntent =
/** Hold a target at a given fraction of the frame's LONGER axis. Used for
 *  wide establishing work where horizontal reach is the point. */
    | { kind: 'cover'; fovUnits: number }
    /** Fit a named region so it occupies `fill` of viewport HEIGHT. Aspect-safe:
     *  the region keeps its own proportions at every viewport because we solve
     *  for height and let width follow. */
    | { kind: 'region'; region: Rect; fill: number }
    /** Push inside a region until the frame carries no structure. `depth` is the
     *  fraction of the region's height the frame spans; < 1 means we are inside
     *  it. This is how the warm pane resolves. */
    | { kind: 'inside'; region: Rect; depth: number };

export type Rect = { x: number; y: number; w: number; h: number };

export type CameraBeat = {
    /** scroll progress 0..1 within the act */
    t: number;
    /** frame centre in authoring coordinates */
    anchor: Vec2;
    intent: FramingIntent;
    label: string;
    /** Optional: only applies at or below this viewport aspect. */
    maxAspect?: number;
    /** Optional: only applies at or above this viewport aspect. */
    minAspect?: number;
};

export type SceneMeta = {
    /** authoring canvas, e.g. 2200 x 900 */
    canvas: { w: number; h: number };
    /** nominal camera frame declared by the asset's data-camera-frame */
    cameraFrame: Rect;
    /** per-band overscan in authoring units, from data-overscan */
    overscan: Record<string, number>;
};

export type Frame = { x: number; y: number; w: number; h: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The hard limit every viewport obeys: a full-bleed frame can never be taller
 * than the canvas, so the widest possible field of view is aspect x canvasH.
 * 16:9 over a 900-tall canvas gives 1600; 390x844 gives 416. This is geometry,
 * not a preference, and it is why narrow viewports get a serial pan instead of
 * the same composition shrunk.
 */
export function maxFov(aspect: number, canvasH: number): number {
    return aspect * canvasH;
}

/** Resolve one beat's intent to a frame at this viewport aspect. */
export function frameFor(beat: CameraBeat, aspect: number, scene: SceneMeta): Frame {
    const capW = maxFov(aspect, scene.canvas.h);
    let w: number;

    switch (beat.intent.kind) {
        case 'cover':
            w = beat.intent.fovUnits;
            break;
        case 'region': {
            // Solve for height first so the region keeps its proportions everywhere,
            // then let width follow the viewport. This is what stops a narrow
            // viewport from distorting or losing the subject.
            const h = beat.intent.region.h / beat.intent.fill;
            w = h * aspect;
            break;
        }
        case 'inside': {
            const h = beat.intent.region.h * beat.intent.depth;
            w = h * aspect;
            break;
        }
    }

    w = clamp(w, 8, capW);
    const h = w / aspect;

    // Keep the frame inside the canvas so no band edge is ever exposed. The
    // clamp is on the FRAME, not the anchor, so the subject drifts rather than
    // the camera jumping.
    const x = clamp(beat.anchor.x - w / 2, 0, Math.max(0, scene.canvas.w - w));
    const y = clamp(beat.anchor.y - h / 2, 0, Math.max(0, scene.canvas.h - h));
    return { x, y, w, h };
}

/** Beats applicable at this aspect, in t order. */
export function beatsFor(beats: CameraBeat[], aspect: number): CameraBeat[] {
    return beats
        .filter(
            (b) =>
                (b.maxAspect === undefined || aspect <= b.maxAspect) &&
                (b.minAspect === undefined || aspect >= b.minAspect)
        )
        .sort((a, b) => a.t - b.t);
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * Smoothstep between beats. Linear interpolation of frames reads as a machine
 * moving; easing each segment is what makes travel feel like a camera. Applied
 * per-segment rather than globally so no beat is overshot.
 */
const ease = (k: number) => k * k * (3 - 2 * k);

/**
 * The camera: (scene, progress, viewport) -> frame.
 *
 * Interpolates in FRAME space, not in intent space, so a beat that resolves
 * differently at two aspects still produces continuous motion at each one.
 */
export function camera(
    scene: SceneMeta,
    beats: CameraBeat[],
    progress: number,
    viewport: { w: number; h: number }
): Frame {
    const aspect = viewport.w / viewport.h;
    const list = beatsFor(beats, aspect);
    if (list.length === 0) throw new Error('camera: no beats apply at this aspect');

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

    // Field of view interpolates GEOMETRICALLY, centre linearly.
    //
    // Perceived scale goes as 1/fov, so a linear fov ramp does not read as a
    // steady push - it accelerates into the close. Measured across the act, the
    // sharpest camera acceleration sat at t=0.93 on every aspect alike (ratio
    // ~6x mean speed), which located it in the interpolation rather than in any
    // one beat or fitting. Interpolating log(fov) makes the perceived zoom rate
    // constant through a segment, which is what a dolly does.
    const w = fa.w * Math.pow(fb.w / fa.w, k);
    const h = w / aspect;
    const cx = lerp(fa.x + fa.w / 2, fb.x + fb.w / 2, k);
    const cy = lerp(fa.y + fa.h / 2, fb.y + fb.h / 2, k);
    return {
        x: clamp(cx - w / 2, 0, Math.max(0, scene.canvas.w - w)),
        y: clamp(cy - h / 2, 0, Math.max(0, scene.canvas.h - h)),
        w,
        h,
    };
}

/** Serialise a frame to an SVG viewBox. */
export function viewBox(f: Frame): string {
    return `${f.x.toFixed(2)} ${f.y.toFixed(2)} ${f.w.toFixed(2)} ${f.h.toFixed(2)}`;
}