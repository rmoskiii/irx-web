/**
 * ScenePortal — a hinge between two continuous spaces.
 *
 * Destination: irx-web/src/scene/scenePortal.ts
 *
 * Deliberately thin. The visual requirement is simple and the architecture
 * should support it without obscuring the choreography.
 *
 *   scene A camera reaches its terminal frame
 *   the frame carries no structure — measured, not assumed
 *   ownership swaps
 *   scene B continues from a frame of equivalent content
 *
 * There is no dissolve. An earlier draft of the spec described this as "cross-
 * fades two SceneStages by opacity", which named a mechanism as if it were the
 * requirement — the same error as the shape-match cut. Whether both stages are
 * mounted for a frame, and for how long, is an implementation detail that must
 * not surface in the choreography.
 *
 * Generic by construction: source and target scene, source and target beats,
 * and the progress at which ownership changes. The warm hinge (exterior into
 * the front room) and the threshold hinge (front room into kitchen or balcony)
 * are the same object with different arguments.
 */
import type { CameraBeat, SceneMeta } from '../motion/camera';

export type SceneDef = {
    id: string;
    meta: SceneMeta;
    beats: CameraBeat[];
    bands: { id: string; depth: number; parallax: boolean; svg: string }[];
    style: string;
    defs: string;
};

export type PortalDef = {
    from: SceneDef;
    to: SceneDef;
    /** global progress at which ownership changes */
    at: number;
    /**
     * How long both stages stay mounted, in global progress. Purely to avoid a
     * blank frame while the incoming stage rasterises; it is not a fade window
     * and nothing is interpolated across it.
     */
    overlap?: number;
};

export type Ownership = {
    active: SceneDef;
    /** local progress 0..1 within the active scene's beats */
    local: number;
    /** kept mounted but not driven, purely to avoid a blank frame */
    warming: SceneDef | null;
};

export function resolve(portal: PortalDef, progress: number): Ownership {
    const { from, to, at } = portal;
    const overlap = portal.overlap ?? 0.01;
    if (progress < at) {
        return {
            active: from,
            local: Math.min(1, progress / at),
            warming: progress > at - overlap ? to : null,
        };
    }
    return {
        active: to,
        local: Math.min(1, (progress - at) / (1 - at)),
        warming: progress < at + overlap ? from : null,
    };
}