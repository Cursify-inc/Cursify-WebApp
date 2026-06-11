import { clamp } from "./utils";

/**
 * Returns a repeating dash pattern + cycle length.
 * No tail filler => no visual "recharge jump".
 */
export function buildContinuousDash(
    pathLength: number,
    segmentRatio: number,
    trailCount: number,
    trailGap: number
) {
    if (!pathLength) return { dashArray: "0 1", cycle: 1 };

    const visible = pathLength * clamp(segmentRatio, 0.04, 0.5);
    const gap = visible * clamp(trailGap, 0.3, 4);
    const count = Math.max(1, trailCount);

    // One repeat block
    const pattern: number[] = [];
    for (let i = 0; i < count; i++) pattern.push(visible, gap);

    const cycle = pattern.reduce((a, b) => a + b, 0);
    return { dashArray: pattern.join(" "), cycle };
}
