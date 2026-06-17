import { RefObject, useEffect, useRef } from "react";
import { MotionValue } from "framer-motion";
import type { Geometry } from "./AutoEdgeLight";

type ClosestPerimeterPoint = {
    progress: number;
    proximity: number;
};

type GetClosestPerimeterPoint = (
    x: number,
    y: number,
    width: number,
    height: number,
    radii: Geometry["radii"],
    proximityRadius: number
) => ClosestPerimeterPoint;

type UseUnifiedPointerGlowParams = {
    parentRef: RefObject<HTMLElement | null>;
    reducedMotion: boolean;
    enableCursorProximity: boolean;
    enablePulse: boolean;
    active: boolean;
    geometry: Geometry;
    pathLength: number;
    proximityRadius: number;
    releaseDelayMs?: number;

    proximityRaw: MotionValue<number>;
    hoverRaw: MotionValue<number>;
    targetOffset: MotionValue<number>;
    targetSpeed: MotionValue<number>;
    pulse: MotionValue<number>;

    pulseStartRef: RefObject<number | null>;
    releaseTimeoutRef: RefObject<number | null>;

    getClosestPerimeterPoint: GetClosestPerimeterPoint;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

function clearTimer(ref: RefObject<number | null>) {
    if (ref.current !== null) {
        window.clearTimeout(ref.current);
        ref.current = null;
    }
}

export function useUnifiedPointerGlow({
                                          parentRef,
                                          reducedMotion,
                                          enableCursorProximity,
                                          enablePulse,
                                          active,
                                          geometry,
                                          pathLength,
                                          proximityRadius,
                                          releaseDelayMs = 140,
                                          proximityRaw,
                                          hoverRaw,
                                          targetOffset,
                                          targetSpeed,
                                          pulse,
                                          pulseStartRef,
                                          releaseTimeoutRef,
                                          getClosestPerimeterPoint,
                                      }: UseUnifiedPointerGlowParams) {
    const frameRef = useRef<number | null>(null);
    const latestPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);

    useEffect(() => {
        const resetPointerState = () => {
            proximityRaw.set(0);
            hoverRaw.set(0);
            targetSpeed.set(0);
            pulse.set(0);
            pulseStartRef.current = null;
            latestPointerRef.current = null;

            clearTimer(releaseTimeoutRef);

            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
        };

        if (
            !active ||
            reducedMotion ||
            !enableCursorProximity ||
            !parentRef.current ||
            !geometry.path ||
            pathLength <= 0
        ) {
            resetPointerState();
            return;
        }

        const el = parentRef.current;

        const flushPointer = () => {
            frameRef.current = null;

            const pointer = latestPointerRef.current;
            if (!pointer) return;

            const rect = el.getBoundingClientRect();

            const localX = pointer.clientX - rect.left - geometry.offsetX;
            const localY = pointer.clientY - rect.top - geometry.offsetY;

            const closest = getClosestPerimeterPoint(
                localX,
                localY,
                geometry.width,
                geometry.height,
                geometry.radii,
                proximityRadius
            );

            const proximity = clamp(closest.proximity, 0, 1);
            const progress = clamp(closest.progress, 0, 1);

            proximityRaw.set(proximity);
            hoverRaw.set(proximity > 0 ? 1 : 0);
            targetOffset.set(progress * pathLength);
        };

        const schedulePointerFlush = (event: PointerEvent) => {
            latestPointerRef.current = {
                clientX: event.clientX,
                clientY: event.clientY,
            };

            clearTimer(releaseTimeoutRef);

            if (frameRef.current === null) {
                frameRef.current = window.requestAnimationFrame(flushPointer);
            }
        };

        const releasePointer = () => {
            clearTimer(releaseTimeoutRef);

            releaseTimeoutRef.current = window.setTimeout(() => {
                proximityRaw.set(0);
                hoverRaw.set(0);
                latestPointerRef.current = null;
                releaseTimeoutRef.current = null;
            }, releaseDelayMs);
        };

        const triggerPulse = () => {
            if (!enablePulse) return;
            pulseStartRef.current = performance.now();
        };

        el.addEventListener("pointermove", schedulePointerFlush, { passive: true });
        el.addEventListener("pointerenter", schedulePointerFlush, { passive: true });
        el.addEventListener("pointerdown", triggerPulse, { passive: true });
        el.addEventListener("pointerleave", releasePointer, { passive: true });
        el.addEventListener("pointercancel", releasePointer, { passive: true });

        return () => {
            el.removeEventListener("pointermove", schedulePointerFlush);
            el.removeEventListener("pointerenter", schedulePointerFlush);
            el.removeEventListener("pointerdown", triggerPulse);
            el.removeEventListener("pointerleave", releasePointer);
            el.removeEventListener("pointercancel", releasePointer);

            resetPointerState();
        };
    }, [
        active,
        enableCursorProximity,
        enablePulse,
        geometry.height,
        geometry.offsetX,
        geometry.offsetY,
        geometry.path,
        geometry.radii,
        geometry.width,
        getClosestPerimeterPoint,
        hoverRaw,
        parentRef,
        pathLength,
        proximityRadius,
        proximityRaw,
        pulse,
        pulseStartRef,
        reducedMotion,
        releaseDelayMs,
        releaseTimeoutRef,
        targetOffset,
        targetSpeed,
    ]);
}
