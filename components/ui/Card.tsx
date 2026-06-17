"use client";

import * as React from "react";
import {
    motion,
    useInView,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    type MotionProps,
    type MotionStyle,
    type UseInViewOptions,
} from "framer-motion";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { CARD_MOTION, type EdgeLightOptions } from "./card.tokens";

const AutoEdgeLight = dynamic(
    () => import("@/components/ui/AutoEdgeLight").then((mod) => mod.default),
    { ssr: false }
);

type ViewportMargin = UseInViewOptions["margin"];

type CardElement = HTMLDivElement;

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

    edgeLightProps?: EdgeLightOptions;
    revealViewportMargin?: ViewportMargin;
    revealOnce?: boolean;

    glowActiveOverride?: boolean;
    pointerThrottleMs?: number;
    focusable?: boolean;
};

const POINTER_THROTTLE_MS = 24;

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
                         pointerThrottleMs = POINTER_THROTTLE_MS,
                         focusable,
                         onFocus,
                         onBlur,
                         onPointerEnter,
                         onPointerMove,
                         onPointerLeave,
                         onPointerCancel,
                         style,
                         ...rest
                     }: CardProps) {
    const reducedMotion = useReducedMotion();
    const cardRef = React.useRef<HTMLDivElement>(null);

    const [active, setActive] = React.useState(false);

    // Pointer tracking is only needed for the sheen overlay.
    const needsPointerTracking = !reducedMotion && sheen;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rafRef = React.useRef<number | null>(null);
    const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);
    const lastMoveTsRef = React.useRef(0);

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
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
            }
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

    const sheenBackground = useMotionTemplate`
        radial-gradient(220px circle at ${mouseX}px ${mouseY}px, var(--surface-specular), transparent 60%)
    `;

    const edgeLightInView = useInView(cardRef, {
        once: false,
        margin: "240px 0px 240px 0px",
    });

    const shouldRenderEdgeLight = glow && edgeLightInView;

    const handlePointerDown = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            rest.onPointerDown?.(e);
            setActive(true);
        },
        [rest]
    );

    const getRelativePointer = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return null;

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

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
            setActive(true);

            if (!needsPointerTracking) return;

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

            if (glow || interactive || sheen) {
                setActive(true);
            }
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

    return (
        <motion.div
            ref={cardRef}
            className={cn(
                "card-root relative isolate w-full h-full overflow-visible outline-none focus-ring theme-color-fade",
                interactive && "ui-card--interactive",
                className
            )}
            style={{ backfaceVisibility: "hidden", ...style }}
            tabIndex={isFocusable ? 0 : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPointerDown={handlePointerDown}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerCancel}
            whileHover={
                interactive && !reducedMotion
                    ? {
                        y: CARD_MOTION.hover.y,
                        scale: CARD_MOTION.hover.scale,
                        transition: {
                            duration: CARD_MOTION.hover.duration,
                            ease: "easeOut",
                        },
                    }
                    : undefined
            }
            whileTap={
                interactive && !reducedMotion
                    ? {
                        scale: 1.04,
                        transition: { duration: 0.12, ease: "easeOut" },
                    }
                    : undefined
            }
            initial={animateIn ? { opacity: 0, y: 0 } : undefined}
            animate={animateIn ? { opacity: 1, y: 0 } : undefined}
            transition={
                animateIn
                    ? {
                        duration: 0.32,
                        ease: "easeOut",
                        delay: delay * 0.05,
                    }
                    : undefined
            }
            {...rest}
        >
            {shouldRenderEdgeLight ? (
                <AutoEdgeLight
                    inset={0}
                    {...edgeLightProps}
                    active={glow}
                    reducedMotion={!!reducedMotion}
                    parentRef={cardRef}
                    className="pointer-events-none absolute inset-0 z-[20] overflow-visible rounded-[inherit]"
                />
            ) : null}

            <div className="card-shadow-host relative z-[10] h-full overflow-visible rounded-[inherit]">
                <div
                    className={cn(
                        "card-surface relative flex h-full flex-col overflow-hidden rounded-[inherit]",
                        contentClassName
                    )}
                >
                    <div
                        aria-hidden
                        className="card-overlay pointer-events-none absolute inset-0 z-[5] rounded-[inherit]"
                    />

                    {sheen ? (
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[30] rounded-[inherit]"
                            style={sheenStyle}
                        />
                    ) : null}

                    <div className="relative z-[40] flex h-full flex-col">{children}</div>
                </div>
            </div>

        </motion.div>
    );
}

export default Card;
