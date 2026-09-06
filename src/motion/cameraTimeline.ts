/**
 * Act 1 camera timeline — scene.neighbourhood_night
 *
 * Destination: irx-web/src/motion/cameraTimeline.ts
 *
 * Source of truth for the Act 1 choreography. Phase 2's ScrollTrigger reads
 * these beats and interpolates between them; nothing re-derives them.
 *
 * Frames are expressed in AUTHORING COORDINATES on the 2200x900 canvas, not in
 * pixels. `fw` is the horizontal field of view in scene units; frame height is
 * derived from the breakpoint aspect, so a frame is fully described by
 * (cx, cy, fw).
 *
 * Desktop and mobile are separate choreographies against the same artwork.
 * Mobile is not a scaled desktop timeline: it uses its own centres, its own
 * corridor and steeper travel, converging on the desktop framing only as it
 * approaches the window, which is what makes the match cut identical on both.
 */

export type CameraBeat = {
    /** scroll progress 0..1 within Act 1 */
    t: number;
    /** frame centre, authoring coordinates */
    cx: number;
    cy: number;
    /** horizontal field of view in scene units */
    fw: number;
    label: string;
};

export type CameraTrack = {
    /** viewport aspect the frame heights are derived from */
    aspect: number;
    /** widest usable field of view at full canvas height, for clamping */
    maxFov: number;
    beats: CameraBeat[];
};

/** The semantic target. Never hard-code the artwork id in choreography. */
export const CAMERA_ANCHOR = '[data-camera-anchor="primary"]';

/**
 * n-window-lit aperture, authoring coordinates. Aspect 1.4167 : 1 — unchanged,
 * as is its size and its anchor. Its y moved 410 -> 360 in the v4 perspective
 * re-author: the deeper terrace run puts the far terrace base at y515, so a
 * window at y410-530 would have extended below ground level. At y360-480 it
 * sits inside the facade and still contains the vanishing point at y470.
 */
export const APERTURE = { x: 1155, y: 360, w: 170, h: 120 } as const;

/** Vanishing point. Sits inside the aperture — the street aims the camera. */
export const VANISHING_POINT = { x: 1240, y: 470 } as const;

export const DESKTOP: CameraTrack = {
    aspect: 16 / 9,
    maxFov: 1600,
    beats: [
        { t: 0.0, cx: 1100, cy: 450, fw: 1600, label: 'WIDE' },
        { t: 0.35, cx: 1147, cy: 458, fw: 940, label: 'MEDIUM' },
        { t: 0.7, cx: 1185, cy: 464, fw: 500, label: 'HOUSE DOMINATES' },
        { t: 0.92, cx: 1207, cy: 467, fw: 214, label: 'WINDOW TARGET' },
    ],
};

/**
 * True 390:844 portrait, full-bleed. Max field of view at full canvas height is
 * 416 scene units — the mobile camera never sees more than x 1150-1566, which
 * is 19% of the 2200-wide canvas. That is why detail in the artwork is
 * corridor-weighted rather than spread evenly, and why a second vehicle was
 * added: the near car alone is out of reach of any portrait frame that also
 * holds the aperture.
 *
 * v4 re-author: the terraces now run the full depth to the junction (t=0.877),
 * so their tails land at x1100 and x1346 — 246 apart. A 416-unit portrait frame
 * centred on 1223 therefore holds 85 units of terrace on each side, the target
 * house between them, and the window with 38 units of facade either side. That
 * is the "left house -> corridor -> target -> right house" reading.
 */
export const MOBILE: CameraTrack = {
    aspect: 390 / 844,
    maxFov: 416,
    beats: [
        { t: 0.0, cx: 1223, cy: 450, fw: 416, label: 'WIDE — both terrace tails frame the corridor' },
        { t: 0.35, cx: 1230, cy: 448, fw: 315, label: 'MEDIUM' },
        { t: 0.7, cx: 1236, cy: 442, fw: 200, label: 'HOUSE DOMINATES' },
        { t: 0.92, cx: 1240, cy: 410, fw: 93, label: 'WINDOW TARGET — 60% viewport height' },
    ],
};

/** Breakpoint at which the mobile track is used. */
export const MOBILE_MAX_WIDTH = 640;

export function trackFor(viewportWidth: number): CameraTrack {
    return viewportWidth <= MOBILE_MAX_WIDTH ? MOBILE : DESKTOP;
}

/** Resolve a beat to an SVG viewBox string on the 2200x900 authoring canvas. */
export function viewBoxFor(beat: CameraBeat, aspect: number): string {
    const fh = beat.fw / aspect;
    return `${beat.cx - beat.fw / 2} ${beat.cy - fh / 2} ${beat.fw} ${fh}`;
}