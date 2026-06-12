"use client";

import * as React from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type UseInViewOptions,
} from "framer-motion";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { CARD_MOTION } from "./card.tokens";
import type { AutoEdgeLightProProps } from "@/components/ui/AutoEdgeLight";

const AutoEdgeLight = dynamic(
    () => import("@/components/ui/AutoEdgeLight").then((mod) => mod.AutoEdgeLight),
    { ssr: false }
);

type ViewportMargin = UseInViewOptions["margin"];

const DEFAULT_VIEWPORT_MARGIN =
    CARD_MOTION.reveal.margin satisfies NonNullable<UseInViewOptions["margin"]>;
export type CardProps = {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    interactive?: boolean;
    glow?: boolean;
    animateIn?: boolean;
    delay?: number;
    edgeLightProps?: Omit<AutoEdgeLightProProps, "active" | "parentRef">;
    activateGlowOnReveal?: boolean;
    revealGlowDurationMs?: number;
    revealGlowDelayMs?: number;
    revealViewportMargin?: ViewportMargin;
};

export function Card({
                         children,
                         className,
                         contentClassName,
                         interactive = false,
                         glow = false,
                         animateIn = false,
                         delay = 0,
                         edgeLightProps,
                         activateGlowOnReveal = false,
                         revealGlowDurationMs = CARD_MOTION.reveal.durationMs,
                         revealGlowDelayMs = CARD_MOTION.reveal.delayMs,
                         revealViewportMargin = DEFAULT_VIEWPORT_MARGIN,
                     }: CardProps) {
    const reducedMotion = useReducedMotion();
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [active, setActive] = React.useState(false);
    const surfaceRef = React.useRef<HTMLDivElement>(null);

    const showInteractive = interactive && !reducedMotion;

    // only track pointer when needed
    const needsPointerTracking = showInteractive || glow;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // rAF-throttled pointer updates
    const rafRef = React.useRef<number | null>(null);
    const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);

    const flushPointer = React.useCallback(() => {
        rafRef.current = null;
        const p = lastPointRef.current;
        if (!p) return;
        mouseX.set(p.x);
        mouseY.set(p.y);
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

    const pointerGlowActive = glow && active;

    const inView = useInView(cardRef, {
        once: true,
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
        if (!activateGlowOnReveal || !inView || hasRevealedRef.current) return;

        hasRevealedRef.current = true;

        startTimeoutRef.current = setTimeout(() => {
            setRevealActive(true);
            endTimeoutRef.current = setTimeout(() => {
                setRevealActive(false);
            }, Math.max(0, revealGlowDurationMs));
        }, Math.max(0, revealGlowDelayMs));

        return clearTimers;
    }, [activateGlowOnReveal, inView, revealGlowDelayMs, revealGlowDurationMs, clearTimers]);

    React.useEffect(() => clearTimers, [clearTimers]);

    const glowActive = pointerGlowActive || revealActive;

    const getRelativePointer = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    // throttle pointermove in handler itself (extra protection)
    const lastMoveTsRef = React.useRef(0);
    const MOVE_THROTTLE_MS = 40;

    const handlePointerMove = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!needsPointerTracking) return;
            const now = performance.now();
            if (now - lastMoveTsRef.current < MOVE_THROTTLE_MS) return;
            lastMoveTsRef.current = now;

            const p = getRelativePointer(e);
            if (!p) return;
            queuePointer(p.x, p.y);
        },
        [needsPointerTracking, getRelativePointer, queuePointer]
    );

    const handlePointerEnter = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!needsPointerTracking) return;
            setActive(true);
            const p = getRelativePointer(e);
            if (!p) return;
            queuePointer(p.x, p.y);
        },
        [needsPointerTracking, getRelativePointer, queuePointer]
    );

    const handlePointerLeave = React.useCallback(() => {
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

    return (
        <motion.div
            ref={cardRef}
            className={cn("relative w-full will-change-transform", className)}
            style={{
                transformStyle: "flat",
                backfaceVisibility: "hidden",
                rotateX: showInteractive ? rotateX : 0,
                rotateY: showInteractive ? rotateY : 0,
            }}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerLeave}
            whileHover={
                showInteractive
                    ? {
                        // removed scale to avoid text blur
                        y: CARD_MOTION.hover.y,
                        transition: { duration: CARD_MOTION.hover.duration, ease: "easeOut" },
                    }
                    : undefined
            }
            whileTap={
                showInteractive
                    ? {
                        // no scale on tap (prevents blur / raster resampling)
                        y: 0,
                    }
                    : undefined
            }
            initial={animateIn ? { opacity: 0, y: 10 } : undefined}
            animate={animateIn ? { opacity: 1, y: 0 } : undefined}
            transition={animateIn ? { duration: 0.32, ease: "easeOut", delay: delay * 0.05 } : undefined}
        >
            {glow ? (
                <AutoEdgeLight
                    active={glowActive}
                    reducedMotion={!!reducedMotion}
                    parentRef={surfaceRef}
                    className="rounded-[inherit]"
                    {...edgeLightProps}
                />
            ) : null}
            <div
                ref={surfaceRef}
                className={cn(
                    "card-surface relative h-full overflow-hidden rounded-[inherit] shadow-(--card-shadow)",
                    contentClassName
                )}
            >
                <div className="relative z-10 h-full">{children}</div>
            </div>
        </motion.div>
    );
}

export default Card;
