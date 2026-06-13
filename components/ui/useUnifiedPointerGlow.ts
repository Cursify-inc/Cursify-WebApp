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

type NumberRef = RefObject<number | null>;

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

    pulseStartRef: NumberRef;
    releaseTimeoutRef: NumberRef;

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

    const rafIdRef = useRef<number | null>(null);
    const pendingPointRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const el = parentRef.current;
        if (!el || reducedMotion || !enableCursorProximity) return;

        const clearTimer = (ref: NumberRef) => {
            if (ref.current !== null) {
                window.clearTimeout(ref.current);
                // cast to writable in case your RefObject typing is readonly in this setup
                (ref as { current: number | null }).current = null;
            }
        };

        const cancelRaf = () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };

        const clearAllTimers = () => {
            clearTimer(releaseTimeoutRef);
            clearTimer(downFallbackRef);
            cancelRaf();
            pendingPointRef.current = null;
        };

        const flushPointUpdate = () => {
            rafIdRef.current = null;
            const p = pendingPointRef.current;
            if (!p) return;
            pendingPointRef.current = null;

            if (!geometry.width || !geometry.height) return;

            const rect = el.getBoundingClientRect();
            const localX = p.x - rect.left - geometry.offsetX;
            const localY = p.y - rect.top - geometry.offsetY;

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

        const queuePointUpdate = (clientX: number, clientY: number) => {
            pendingPointRef.current = { x: clientX, y: clientY };
            if (rafIdRef.current === null) {
                rafIdRef.current = requestAnimationFrame(flushPointUpdate);
            }
        };

        const engage = () => {
            clearTimer(releaseTimeoutRef);
            clearTimer(downFallbackRef);
            hoverRaw.set(1);
        };

        const scheduleDisengage = (delay = releaseDelayMs) => {
            clearTimer(releaseTimeoutRef);
            (releaseTimeoutRef as { current: number | null }).current = window.setTimeout(() => {
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
            queuePointUpdate(e.clientX, e.clientY);
        };

        const onPointerMove = (e: PointerEvent) => {
            const isMouse = e.pointerType === "mouse";
            const isActivePointer =
                activePointerIdRef.current !== null &&
                e.pointerId === activePointerIdRef.current;

            if (!isMouse && !isActivePointer) return;

            engage();
            queuePointUpdate(e.clientX, e.clientY);
        };

        const onPointerDown = (e: PointerEvent) => {
            activePointerIdRef.current = e.pointerId;
            engage();
            queuePointUpdate(e.clientX, e.clientY);

            try {
                (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            } catch {}

            clearTimer(downFallbackRef);
            downFallbackRef.current = window.setTimeout(() => {
                if (activePointerIdRef.current === e.pointerId) {
                    scheduleDisengage(0);
                }
            }, 220);

            if (enablePulse && active) {
                (pulseStartRef as { current: number | null }).current = performance.now();
            }
        };

        const onPointerUpOrCancel = (e: PointerEvent) => {
            const activeId = activePointerIdRef.current;
            if (activeId === null) return;

            const exactMatch = e.pointerId === activeId;
            const tolerantTouchFallback =
                (e.pointerType === "touch" || e.pointerType === "pen") && true;

            if (!exactMatch && !tolerantTouchFallback) return;

            activePointerIdRef.current = null;
            clearTimer(downFallbackRef);

            if (exactMatch) {
                try {
                    if (el.hasPointerCapture?.(e.pointerId)) {
                        el.releasePointerCapture?.(e.pointerId);
                    }
                } catch {}
            }

            scheduleDisengage();
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
        geometry.width,
        geometry.height,
        geometry.offsetX,
        geometry.offsetY,
        geometry.radii,
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
