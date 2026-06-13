"use client";

import * as React from "react";
import {
    motion,
    useInView,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type MotionProps,
    type MotionStyle,
    type UseInViewOptions,
} from "framer-motion";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { CARD_MOTION } from "./card.tokens";
import type { AutoEdgeLightProProps } from "@/components/ui/AutoEdgeLight";

const AutoEdgeLight = dynamic(
    () => import("@/components/ui/AutoEdgeLight").then((mod) => mod.default),
    { ssr: false }
);

type ViewportMargin = UseInViewOptions["margin"];
const DEFAULT_VIEWPORT_MARGIN =
    CARD_MOTION.reveal.margin satisfies NonNullable<UseInViewOptions["margin"]>;

type CardElement = HTMLDivElement;

type ExtendedCardMotion = typeof CARD_MOTION & { pointerThrottleMs?: number };

const POINTER_THROTTLE_FALLBACK_MS = 24;
const pointerThrottleToken =
    (CARD_MOTION as ExtendedCardMotion).pointerThrottleMs ?? POINTER_THROTTLE_FALLBACK_MS;

export type CardProps = React.HTMLAttributes<CardElement> &
    MotionProps & {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;

    interactive?: boolean;
    glow?: boolean;
    sheen?: boolean;

    animateIn?: boolean;
    delay?: number;

    edgeLightProps?: Omit<AutoEdgeLightProProps, "active" | "parentRef">;

    activateGlowOnReveal?: boolean;
    revealGlowDurationMs?: number;
    revealGlowDelayMs?: number;
    revealViewportMargin?: ViewportMargin;
    revealOnce?: boolean;

    glowActiveOverride?: boolean;
    pointerThrottleMs?: number;

    withPerspective?: boolean;
    perspectivePx?: number;

    disableTiltOnCoarsePointer?: boolean;
    focusable?: boolean;

};

export function Card({
                         children,
                         className,
                         contentClassName,
                         interactive = false,
                         glow = false,
                         sheen = false,
                         animateIn = false,
                         delay = 0,
                         edgeLightProps,
                         activateGlowOnReveal = false,
                         revealGlowDurationMs = CARD_MOTION.reveal.durationMs,
                         revealGlowDelayMs = CARD_MOTION.reveal.delayMs,
                         revealViewportMargin = DEFAULT_VIEWPORT_MARGIN,
                         revealOnce = true,
                         glowActiveOverride,
                         pointerThrottleMs = pointerThrottleToken,
                         withPerspective = true,
                         perspectivePx = 1000,
                         disableTiltOnCoarsePointer = true,
                         focusable,
                         onFocus,
                         onBlur,
                         onPointerEnter,
                         onPointerMove,
                         onPointerLeave,
                         onPointerCancel,
                         ...rest
                     }: CardProps) {
    const reducedMotion = useReducedMotion();
    const cardRef = React.useRef<HTMLDivElement>(null);
    const surfaceRef = React.useRef<HTMLDivElement>(null);

    const [active, setActive] = React.useState(false);

    const [isCoarsePointer, setIsCoarsePointer] = React.useState(false);
    React.useEffect(() => {
        if (!disableTiltOnCoarsePointer || typeof window === "undefined") return;
        const mql = window.matchMedia("(pointer: coarse)");

        const update = () => setIsCoarsePointer(mql.matches);
        update();

        if (typeof mql.addEventListener === "function") {
            mql.addEventListener("change", update);
            return () => mql.removeEventListener("change", update);
        }
        mql.addListener(update);
        return () => mql.removeListener(update);
    }, [disableTiltOnCoarsePointer]);

    const showInteractive =
        interactive && !reducedMotion && !(disableTiltOnCoarsePointer && isCoarsePointer);
    const needsPointerTracking = showInteractive || glow || sheen;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rafRef = React.useRef<number | null>(null);
    const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);

    const flushPointer = React.useCallback(() => {
        rafRef.current = null;
        const point = lastPointRef.current;
        if (!point) return;
        mouseX.set(point.x);
        mouseY.set(point.y);
    }, [mouseX, mouseY]);

    const queuePointer = React.useCallback(
        (x: number, y: number) => {
            if (!needsPointerTracking) return;
            lastPointRef.current = { x, y };
            if (rafRef.current != null) return;
            rafRef.current = requestAnimationFrame(flushPointer);
        },
        [flushPointer, needsPointerTracking]
    );

    React.useEffect(() => {
        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    React.useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const setCenter = () => {
            mouseX.set(el.clientWidth / 2);
            mouseY.set(el.clientHeight / 2);
        };
        setCenter();

        const ro = new ResizeObserver(setCenter);
        ro.observe(el);
        return () => ro.disconnect();
    }, [mouseX, mouseY]);

    const rotateXRaw = useTransform(mouseY, (y) => {
        if (!showInteractive) return 0;
        const el = cardRef.current;
        if (!el) return 0;
        const py = y / (el.clientHeight || 1) - 0.5;
        return -(py * CARD_MOTION.tiltMaxDeg);
    });

    const rotateYRaw = useTransform(mouseX, (x) => {
        if (!showInteractive) return 0;
        const el = cardRef.current;
        if (!el) return 0;
        const px = x / (el.clientWidth || 1) - 0.5;
        return px * CARD_MOTION.tiltMaxDeg;
    });

    const rotateX = useSpring(rotateXRaw, CARD_MOTION.spring);
    const rotateY = useSpring(rotateYRaw, CARD_MOTION.spring);

    const sheenBackground = useMotionTemplate`
    radial-gradient(220px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.22), transparent 60%)
  `;

    const inView = useInView(cardRef, {
        once: revealOnce,
        margin: revealViewportMargin,
    });

    const [revealActive, setRevealActive] = React.useState(false);
    const hasRevealedRef = React.useRef(false);
    const startTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const endTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = React.useCallback(() => {
        if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current);
            startTimeoutRef.current = null;
        }
        if (endTimeoutRef.current) {
            clearTimeout(endTimeoutRef.current);
            endTimeoutRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        if (!activateGlowOnReveal || !inView) return;
        if (revealOnce && hasRevealedRef.current) return;

        hasRevealedRef.current = true;

        startTimeoutRef.current = setTimeout(() => {
            setRevealActive(true);
            endTimeoutRef.current = setTimeout(
                () => setRevealActive(false),
                Math.max(0, revealGlowDurationMs)
            );
        }, Math.max(0, revealGlowDelayMs));

        return clearTimers;
    }, [
        activateGlowOnReveal,
        inView,
        revealGlowDelayMs,
        revealGlowDurationMs,
        clearTimers,
        revealOnce,
    ]);

    React.useEffect(() => clearTimers, [clearTimers]);

    const pointerGlowActive = glow && active;
    const computedGlowActive = pointerGlowActive || revealActive;
    const glowActive = glowActiveOverride ?? computedGlowActive;

    const getRelativePointer = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const lastMoveTsRef = React.useRef(0);

    const handlePointerMove = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            onPointerMove?.(e);
            if (!needsPointerTracking) return;
            const now = performance.now();
            if (now - lastMoveTsRef.current < Math.max(0, pointerThrottleMs)) return;
            lastMoveTsRef.current = now;

            const point = getRelativePointer(e);
            if (!point) return;
            queuePointer(point.x, point.y);
        },
        [needsPointerTracking, getRelativePointer, queuePointer, pointerThrottleMs, onPointerMove]
    );

    const handlePointerEnter = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            onPointerEnter?.(e);
            if (!needsPointerTracking) return;
            setActive(true);
            const point = getRelativePointer(e);
            if (!point) return;
            queuePointer(point.x, point.y);
        },
        [needsPointerTracking, getRelativePointer, queuePointer, onPointerEnter]
    );

    const resetToCenter = React.useCallback(() => {
        setActive(false);
        const el = cardRef.current;
        if (!el) {
            mouseX.set(0);
            mouseY.set(0);
            return;
        }
        mouseX.set(el.clientWidth / 2);
        mouseY.set(el.clientHeight / 2);
    }, [mouseX, mouseY]);

    const handlePointerLeave = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            onPointerLeave?.(e);
            resetToCenter();
        },
        [onPointerLeave, resetToCenter]
    );

    const handlePointerCancel = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            onPointerCancel?.(e);
            resetToCenter();
        },
        [onPointerCancel, resetToCenter]
    );

    const handleFocus = React.useCallback(
        (e: React.FocusEvent<HTMLDivElement>) => {
            onFocus?.(e);
            if (glow || interactive || sheen) setActive(true);
        },
        [onFocus, glow, interactive, sheen]
    );

    const handleBlur = React.useCallback(
        (e: React.FocusEvent<HTMLDivElement>) => {
            onBlur?.(e);
            resetToCenter();
        },
        [onBlur, resetToCenter]
    );

    const isFocusable = focusable ?? (interactive || glow || sheen);
    const sheenStyle: MotionStyle = sheen
        ? {
            opacity: active ? 0.28 : 0,
            background: sheenBackground,
        }
        : {};

    const cardNode = (
        <motion.div
            ref={cardRef}
            className={cn(
                "relative w-full rounded-[inherit] will-change-transform outline-none",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--card-focus-ring,theme(colors.blue.500))]",
                className
            )}
            style={{
                backfaceVisibility: "hidden",
                rotateX: showInteractive ? rotateX : 0,
                rotateY: showInteractive ? rotateY : 0,
            }}
            tabIndex={isFocusable ? 0 : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerCancel}
            whileHover={
                showInteractive
                    ? {
                        y: CARD_MOTION.hover.y,
                        scale: 1.01,
                        transition: { duration: CARD_MOTION.hover.duration, ease: "easeOut" },
                    }
                    : undefined
            }
            whileTap={showInteractive ? { y: 0, scale: 1 } : undefined}
            initial={animateIn ? { opacity: 0, y: 0 } : undefined}
            animate={animateIn ? { opacity: 1, y: 0 } : undefined}
            transition={animateIn ? { duration: 0.32, ease: "easeOut", delay: delay * 0.05 } : undefined}
            {...rest}
        >
            {glow ? (
                <AutoEdgeLight
                    inset={10}
                    active={glowActive}
                    reducedMotion={!!reducedMotion}
                    parentRef={surfaceRef}
                    className="pointer-events-none rounded-[inherit]"
                    {...edgeLightProps}
                />

            ) : null}

            <div
                className={cn(
                    "relative z-[1] rounded-[inherit] shadow-(--card-shadow)",
                    showInteractive &&
                    "transition-shadow duration-200 hover:shadow-[var(--card-shadow-hover,var(--card-shadow))]"
                )}
            >
                <div
                    ref={surfaceRef}
                    className={cn(
                        "card-surface relative z-[2] h-full overflow-hidden rounded-[inherit]",
                        contentClassName
                    )}
                >
                    {sheen ? (
                        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[2]" style={sheenStyle} />
                    ) : null}

                    <div className="relative z-[3]">{children}</div>
                </div>
            </div>
        </motion.div>
    );

    if (!withPerspective) return cardNode;

    return (
        <div style={{ perspective: `${perspectivePx}px` }} className="w-full rounded-[inherit]">
            {cardNode}
        </div>
    );
}

export default Card;
