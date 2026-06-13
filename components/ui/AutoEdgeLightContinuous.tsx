"use client";

import * as React from "react";
import {
    motion,
    useAnimationFrame,
    useMotionTemplate,
    useMotionValue,
    useTransform,
} from "framer-motion";
import { useTheme } from "next-themes";

import {
    ThemeVars,
    sameTheme,
    DEFAULT_THEME,
    resolveThemeVars,
} from "./AutoEdgeLight";

export type AutoEdgeLightContinuousProps = {
    parentRef: React.RefObject<HTMLElement | null>;
    className?: string;
    reducedMotion?: boolean;

    /** 0=edge, negative outward, positive inward */
    inset?: number;

    /** explicit corner radius (recommended for hero tiny cards) */
    radius?: number;

    strokeWidth?: number;
    glowWidth?: number;
    glowBlur?: number;

    coreOpacity?: number;
    glowOpacity?: number;
    highlightOpacity?: number;

    colorA?: string; // kept for compatibility
    colorB?: string; // kept for compatibility
    highlightColor?: string; // kept for compatibility

    /** seconds per full segment orbit */
    durationSec?: number;

    /** hue degrees/sec for live color shift */
    colorSpeed?: number;

    /** visible dash segment ratio of total perimeter */
    segmentRatio?: number;
};

function parseRadius(v?: string | null) {
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function getCornerRadius(el: HTMLElement, explicit?: number) {
    if (typeof explicit === "number") return explicit;
    const cs = getComputedStyle(el);
    return Math.max(
        parseRadius(cs.borderTopLeftRadius),
        parseRadius(cs.borderTopRightRadius),
        parseRadius(cs.borderBottomRightRadius),
        parseRadius(cs.borderBottomLeftRadius)
    );
}

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
                                            colorSpeed = 120,
                                            segmentRatio = 0.22,
                                        }: AutoEdgeLightContinuousProps) {
    const { resolvedTheme } = useTheme();
    const [themeVars, setThemeVars] = React.useState<ThemeVars>(DEFAULT_THEME);

    // Compatibility props intentionally unused (preserved API).
    void colorA;
    void colorB;
    void highlightColor;

    // Unified theme refresh on theme toggle (RAF so CSS vars settle first).
    React.useEffect(() => {
        const id = requestAnimationFrame(() => {
            const next = resolveThemeVars(parentRef.current ?? undefined);
            setThemeVars((prev) => (sameTheme(prev, next) ? prev : next));
        });
        return () => cancelAnimationFrame(id);
    }, [resolvedTheme, parentRef]);

    // Optional backstop: observe class/style changes that can affect CSS vars.
    React.useEffect(() => {
        const host = parentRef.current ?? document.documentElement;
        if (!host) return;

        let rafId: number | null = null;

        const scheduleRead = () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const base = parentRef.current ?? document.documentElement; // always HTMLElement
                const next = resolveThemeVars(base);
                setThemeVars((prev) => (sameTheme(prev, next) ? prev : next));
            });
        };



        const mo = new MutationObserver(scheduleRead);
        mo.observe(host, {
            attributes: true,
            attributeFilter: ["class", "style", "data-theme"],
            subtree: host === document.documentElement,
        });

        return () => {
            mo.disconnect();
            if (rafId != null) cancelAnimationFrame(rafId);
        };
    }, [parentRef]);

    const resolvedStrokeWidth = strokeWidth ?? themeVars.strokeWidth;
    const resolvedGlowWidth = glowWidth ?? themeVars.glowWidth;
    const resolvedGlowBlur = glowBlur ?? themeVars.glowBlur;

    const resolvedCoreOpacity = coreOpacity ?? themeVars.coreOpacity;
    const resolvedGlowOpacity = glowOpacity ?? themeVars.glowOpacity;
    const resolvedHighlightOpacity = highlightOpacity ?? themeVars.highlightOpacity;

    const [box, setBox] = React.useState({ w: 0, h: 0, r: 0 });

    React.useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        let rafId: number | null = null;

        const update = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            const inferred = getCornerRadius(el, radius);

            const rw = Math.max(0, w - inset * 2);
            const rh = Math.max(0, h - inset * 2);

            // radius corrected for inset and clamped
            const rr = Math.max(0, Math.min(inferred - inset, rw / 2, rh / 2));

            setBox((prev) =>
                prev.w === w && prev.h === h && prev.r === rr ? prev : { w, h, r: rr }
            );
        };

        const scheduleUpdate = () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(update);
        };

        const ro = new ResizeObserver(scheduleUpdate);
        ro.observe(el);
        update();

        return () => {
            ro.disconnect();
            if (rafId != null) cancelAnimationFrame(rafId);
        };
    }, [parentRef, inset, radius]);

    const x = inset;
    const y = inset;
    const rw = Math.max(0, box.w - inset * 2);
    const rh = Math.max(0, box.h - inset * 2);

    const pathLength = React.useMemo(() => {
        if (!rw || !rh) return 0;
        const rr = Math.min(box.r, rw / 2, rh / 2);
        return 2 * (rw + rh - 2 * rr) + 2 * Math.PI * rr;
    }, [rw, rh, box.r]);

    const pxPerSec = React.useMemo(() => {
        if (!pathLength) return 0;
        return pathLength / Math.max(0.2, durationSec);
    }, [pathLength, durationSec]);

    const dash = React.useMemo(() => {
        if (!pathLength) return "0 9999";
        const ratio = Math.max(0.02, Math.min(0.95, segmentRatio));
        const seg = Math.max(24, pathLength * ratio);
        const gap = Math.max(24, pathLength - seg);
        return `${seg} ${gap}`;
    }, [pathLength, segmentRatio]);

    const dashOffset = useMotionValue(0);
    const hue = useMotionValue(0);

    const glowHue = useTransform(hue, (v: number) => (v + 0) % 360);
    const coreHue = useTransform(hue, (v: number) => (v + 24) % 360);
    const hiHue = useTransform(hue, (v: number) => (v + 54) % 360);

    const glowColorMv = useMotionTemplate`hsl(${glowHue} 95% 52%)`;
    const coreColorMv = useMotionTemplate`hsl(${coreHue} 98% 62%)`;
    const hiColorMv = useMotionTemplate`hsl(${hiHue} 100% 74%)`;

    useAnimationFrame((_, delta) => {
        if (!pathLength || reducedMotion) return;
        const dt = delta / 1000;

        const nextDash = dashOffset.get() - pxPerSec * dt;
        dashOffset.set(((nextDash % pathLength) + pathLength) % pathLength);

        const nextHue = (hue.get() + Math.max(0, colorSpeed) * dt) % 360;
        hue.set(nextHue);
    });

    const rawGlowFilterId = React.useId();
    const glowFilterId = `aelc-glow-${rawGlowFilterId.replace(/:/g, "")}`;

    // Reactive filter motion value (avoids render-time motion .get())
    const filterEnabled = useMotionValue(reducedMotion ? 0 : 1);
    React.useEffect(() => {
        filterEnabled.set(reducedMotion ? 0 : 1);
    }, [reducedMotion, filterEnabled]);

    const glowFilterCss = useTransform(
        filterEnabled,
        (v: number) => (v > 0.5 ? `url(#${glowFilterId})` : "none")
    );

    if (!rw || !rh) return null;

    return (
        <svg
            className={`pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible rounded-[inherit] ${className}`}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <filter
                    id={glowFilterId}
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                    colorInterpolationFilters="sRGB"
                >
                    <feGaussianBlur stdDeviation={resolvedGlowBlur} result="none" />
                    <feMerge>
                        <feMergeNode in="none" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <motion.rect
                x={x}
                y={y}
                width={rw}
                height={rh}
                rx={box.r}
                ry={box.r}
                fill="none"
                stroke={glowColorMv}
                strokeWidth={resolvedGlowWidth}
                strokeLinecap="round"
                strokeDasharray={dash}
                style={{
                    opacity: reducedMotion ? 1 : resolvedGlowOpacity,
                    filter: glowFilterCss,
                    strokeDashoffset: dashOffset,
                }}
            />
        </svg>
    );
}

export default AutoEdgeLightContinuous;
