import { RefObject, useEffect, useRef } from "react";
import { MotionValue } from "framer-motion";

type CornerRadius = { rx: number; ry: number };
type CornerRadii = {
    tl: CornerRadius;
    tr: CornerRadius;
    br: CornerRadius;
    bl: CornerRadius;
};

type Geometry = {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    radii: CornerRadii;
};

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

    pulseStartRef: React.MutableRefObject<number | null>;
    releaseTimeoutRef: React.MutableRefObject<number | null>;

    getClosestPerimeterPoint: (
        x: number,
        y: number,
        width: number,
        height: number,
        r: CornerRadii,
        proximityRadius: number
    ) => { progress: number; proximity: number };
};

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
    const activePointerIdRef = useRef<number | null>(null);
    const downFallbackRef = useRef<number | null>(null);

    useEffect(() => {
        const el = parentRef.current;
        if (!el || reducedMotion || !enableCursorProximity) return;

        const clearTimer = (ref: React.MutableRefObject<number | null>) => {
            if (ref.current !== null) {
                window.clearTimeout(ref.current);
                ref.current = null;
            }
        };

        const clearAllTimers = () => {
            clearTimer(releaseTimeoutRef);
            clearTimer(downFallbackRef);
        };

        const updateFromClientPoint = (clientX: number, clientY: number) => {
            if (!geometry.width || !geometry.height) return;

            const rect = el.getBoundingClientRect();
            const localX = clientX - rect.left - geometry.offsetX;
            const localY = clientY - rect.top - geometry.offsetY;

            const result = getClosestPerimeterPoint(
                localX,
                localY,
                geometry.width,
                geometry.height,
                geometry.radii,
                proximityRadius
            );

            proximityRaw.set(result.proximity);

            if (pathLength > 0) {
                targetOffset.set(-result.progress * pathLength);
            }
        };

        const engage = () => {
            clearAllTimers();
            hoverRaw.set(1);
        };

        const scheduleDisengage = (delay = releaseDelayMs) => {
            clearTimer(releaseTimeoutRef);
            releaseTimeoutRef.current = window.setTimeout(() => {
                hoverRaw.set(0);
                proximityRaw.set(0);
                activePointerIdRef.current = null;
            }, delay);
        };

        const resetNow = () => {
            clearAllTimers();
            hoverRaw.set(0);
            proximityRaw.set(0);
            targetSpeed.set(0);
            pulse.set(0);
            activePointerIdRef.current = null;
        };

        const onPointerEnter = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            engage();
            updateFromClientPoint(e.clientX, e.clientY);
        };

        const onPointerMove = (e: PointerEvent) => {
            const isMouse = e.pointerType === "mouse";
            const isActivePointer =
                activePointerIdRef.current !== null &&
                e.pointerId === activePointerIdRef.current;

            if (!isMouse && !isActivePointer) return;

            engage();
            updateFromClientPoint(e.clientX, e.clientY);
        };

        const onPointerDown = (e: PointerEvent) => {
            activePointerIdRef.current = e.pointerId;
            engage();
            updateFromClientPoint(e.clientX, e.clientY);

            try {
                (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            } catch {}

            // Fallback for flaky ultra-fast taps
            clearTimer(downFallbackRef);
            downFallbackRef.current = window.setTimeout(() => {
                if (activePointerIdRef.current === e.pointerId) {
                    scheduleDisengage(0);
                }
            }, 220);

            if (enablePulse && active) {
                pulseStartRef.current = performance.now();
            }
        };

        const onPointerUpOrCancel = (e: PointerEvent) => {
            if (activePointerIdRef.current === null) return;

            // exact pointer match, OR tolerant touch/pen release
            const exactMatch = e.pointerId === activePointerIdRef.current;
            const touchLike = e.pointerType === "touch" || e.pointerType === "pen";

            if (exactMatch || touchLike) {
                scheduleDisengage();
            }
        };

        const onPointerLeave = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            if (
                activePointerIdRef.current !== null &&
                e.pointerId === activePointerIdRef.current
            ) {
                return;
            }
            scheduleDisengage();
        };

        const onVisibilityChange = () => {
            if (document.hidden) resetNow();
        };

        el.addEventListener("pointerenter", onPointerEnter, { passive: true });
        el.addEventListener("pointermove", onPointerMove, { passive: true });
        el.addEventListener("pointerdown", onPointerDown, { passive: true });
        el.addEventListener("pointerleave", onPointerLeave, { passive: true });

        window.addEventListener("pointerup", onPointerUpOrCancel, { passive: true });
        window.addEventListener("pointercancel", onPointerUpOrCancel, { passive: true });

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("blur", resetNow, { passive: true });
        window.addEventListener("pagehide", resetNow, { passive: true });

        return () => {
            clearAllTimers();

            el.removeEventListener("pointerenter", onPointerEnter);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointerleave", onPointerLeave);

            window.removeEventListener("pointerup", onPointerUpOrCancel);
            window.removeEventListener("pointercancel", onPointerUpOrCancel);

            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", resetNow);
            window.removeEventListener("pagehide", resetNow);
        };
    }, [
        parentRef,
        reducedMotion,
        enableCursorProximity,
        enablePulse,
        active,
        geometry,
        pathLength,
        proximityRadius,
        releaseDelayMs,
        proximityRaw,
        hoverRaw,
        targetOffset,
        targetSpeed,
        pulse,
        pulseStartRef,
        releaseTimeoutRef,
        getClosestPerimeterPoint,
    ]);
}
