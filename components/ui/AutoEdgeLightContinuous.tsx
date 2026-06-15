"use client";

import * as React from "react";

import AutoEdgeLight, { AutoEdgeLightQuality } from "./AutoEdgeLight";

export type AutoEdgeLightContinuousProps = {
    parentRef: React.RefObject<HTMLElement | null>;
    className?: string;
    reducedMotion?: boolean;

    /** 0=edge, negative outward, positive inward */
    inset?: number;

    /**
     * Kept for API compatibility.
     * AutoEdgeLight reads the actual border radius from parentRef.
     * If you need a custom radius, set borderRadius on the parent element.
     */
    radius?: number;

    strokeWidth?: number;
    glowWidth?: number;
    glowBlur?: number;

    coreOpacity?: number;
    glowOpacity?: number;
    highlightOpacity?: number;

    colorA?: string;
    colorB?: string;
    highlightColor?: string;

    /** Seconds per full perimeter orbit */
    durationSec?: number;

    /** Gradient rotation multiplier when syncColorToDash is enabled */
    colorSpeed?: number;

    /** Visible dash segment ratio of total perimeter */
    segmentRatio?: number;

    /**
     * Rendering quality.
     * balanced is recommended for promo cards/buttons.
     */
    quality?: AutoEdgeLightQuality;

    /**
     * Number of simultaneous comets.
     * Keep this at 1 for best performance.
     */
    dashCount?: number;

    /**
     * Whether the gradient should rotate with the dash.
     * Disabled by default for performance.
     */
    syncColorToDash?: boolean;
};

export function AutoEdgeLightContinuous({
                                            parentRef,
                                            className = "",
                                            reducedMotion = false,

                                            inset = 0,
                                            radius,

                                            strokeWidth,
                                            glowWidth,
                                            glowBlur,

                                            coreOpacity,
                                            glowOpacity,
                                            highlightOpacity,

                                            colorA,
                                            colorB,
                                            highlightColor,

                                            durationSec = 6,
                                            colorSpeed = 1,
                                            segmentRatio = 0.22,

                                            quality = "balanced",
                                            dashCount = 1,
                                            syncColorToDash = false,
                                        }: AutoEdgeLightContinuousProps) {
    // AutoEdgeLight derives radius from the real parent styles.
    // This keeps the old prop from breaking callers while avoiding duplicate geometry code.
    void radius;

    const idleSpeed = React.useMemo(() => {
        return 1 / Math.max(0.2, durationSec);
    }, [durationSec]);

    return (
        <AutoEdgeLight
            active
            parentRef={parentRef}
            className={className}
            reducedMotion={reducedMotion}
            inset={inset}
            strokeWidth={strokeWidth}
            glowWidth={glowWidth}
            glowBlur={glowBlur}
            coreOpacity={coreOpacity}
            glowOpacity={glowOpacity}
            highlightOpacity={highlightOpacity}
            colorA={colorA}
            colorB={colorB}
            highlightColor={highlightColor}
            durationSec={durationSec}
            colorSpeed={colorSpeed}
            dashRatio={segmentRatio}
            dashCount={dashCount}
            quality={quality}
            syncColorToDash={syncColorToDash}
            enableIdleScan
            enableCursorProximity={false}
            enablePulse={false}
            hoverSpeedBoost={0}
            attractStrength={0}
            interactionBoostAmount={0}
            idleSpeed={idleSpeed}
        />
    );
}

export default AutoEdgeLightContinuous;
