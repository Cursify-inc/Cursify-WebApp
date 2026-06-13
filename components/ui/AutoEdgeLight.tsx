"use client";

import React, {RefObject, useEffect, useId, useMemo, useRef, useState} from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import { useUnifiedPointerGlow } from "./useUnifiedPointerGlow";
import { useTheme } from "next-themes";

type CornerRadius = { rx: number; ry: number };
type CornerRadii = {
    tl: CornerRadius;
    tr: CornerRadius;
    br: CornerRadius;
    bl: CornerRadius;
};

function roundedRectPerimeter(width: number, height: number, radius: number) {
    return 2 * (width + height) - 8 * radius + 2 * Math.PI * radius;
}

export type Geometry = {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    radii: CornerRadii;
    path: string;
    perimeter: number;
};

export type AutoEdgeLightProProps = {
    active: boolean;
    parentRef: RefObject<HTMLElement | null>;
    reducedMotion?: boolean;
    className?: string;
    inset?: number;

    strokeWidth?: number;
    glowWidth?: number;
    glowBlur?: number;

    segmentRatio?: number;
    trailCount?: number;
    trailGap?: number;

    idleSpeed?: number;
    hoverSpeedBoost?: number;
    attractStrength?: number;

    speedSpring?: { stiffness?: number; damping?: number; mass?: number };
    proximitySpring?: { stiffness?: number; damping?: number; mass?: number };
    activationSpring?: { stiffness?: number; damping?: number; mass?: number };

    proximityRadius?: number;
    pulseDurationMs?: number;
    pulseIntensity?: number;

    coreOpacity?: number;
    glowOpacity?: number;
    highlightOpacity?: number;

    colorA?: string;
    colorB?: string;
    highlightColor?: string;

    enableIdleScan?: boolean;
    enableCursorProximity?: boolean;
    enablePulse?: boolean;

    interactionBoostAmount?: number;
    interactionBoostDecay?: number;

    durationSec?: number;
    colorSpeed?: number;
    dashRatio?: number;

    dashCount?: number;          // number of dashes around the path
    dashAccel?: number;          // px/s^2 acceleration
    maxDashSpeed?: number;       // px/s cap (0 or undefined = uncapped)
    initialDashSpeed?: number;   // px/s starting speed

};

export type ThemeVars = {
    colorA: string;
    colorB: string;
    highlight: string;
    gradStart: string;
    gradEnd: string;
    strokeWidth: number;
    glowWidth: number;
    glowBlur: number;
    coreOpacity: number;
    glowOpacity: number;
    highlightOpacity: number;
};

export const DEFAULT_THEME: ThemeVars = {
    colorA: "rgb(77 163 255)",
    colorB: "rgb(111 93 255)",
    highlight: "rgb(129 140 248)",
    gradStart: "rgba(77,163,255,0)",
    gradEnd: "rgba(111,93,255,0)",
    strokeWidth: 2,
    glowWidth: 8,
    glowBlur: 6,
    coreOpacity: 0.86,
    glowOpacity: 0.32,
    highlightOpacity: 0.12,
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dist = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);
const wrap = (v: number, m: number) => (m <= 0 ? v : ((v % m) + m) % m);

export function parseNum(v: string, fallback: number) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
}
export function getCssVar(el: HTMLElement, name: string, fallback: string) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
}
function parseLengthToken(token: string, base: number) {
    const v = token.trim();
    if (!v) return 0;
    if (v.endsWith("%")) return (parseFloat(v) / 100) * base;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function parseCornerRadii(style: CSSStyleDeclaration, width: number, height: number): CornerRadii {
    const raw = style.borderRadius.trim();
    if (!raw) {
        return {
            tl: { rx: 0, ry: 0 },
            tr: { rx: 0, ry: 0 },
            br: { rx: 0, ry: 0 },
            bl: { rx: 0, ry: 0 },
        };
    }

    const [hPart, vPart] = raw.split("/").map((s) => s.trim());
    const hTokens = hPart.split(/\s+/);
    const vTokens = (vPart || hPart).split(/\s+/);

    const expand4 = (tokens: string[], base: number) => {
        const vals = tokens.map((t) => parseLengthToken(t, base));
        if (vals.length === 1) return [vals[0], vals[0], vals[0], vals[0]];
        if (vals.length === 2) return [vals[0], vals[1], vals[0], vals[1]];
        if (vals.length === 3) return [vals[0], vals[1], vals[2], vals[1]];
        return [vals[0] ?? 0, vals[1] ?? 0, vals[2] ?? 0, vals[3] ?? 0];
    };

    let [tlx, trx, brx, blx] = expand4(hTokens, width);
    let [tly, try_, bry, bly] = expand4(vTokens, height);

    tlx = clamp(tlx, 0, width);
    trx = clamp(trx, 0, width);
    brx = clamp(brx, 0, width);
    blx = clamp(blx, 0, width);

    tly = clamp(tly, 0, height);
    try_ = clamp(try_, 0, height);
    bry = clamp(bry, 0, height);
    bly = clamp(bly, 0, height);

    const hScale = Math.min(1, width / Math.max(tlx + trx, 1), width / Math.max(blx + brx, 1));
    const vScale = Math.min(1, height / Math.max(tly + bly, 1), height / Math.max(try_ + bry, 1));

    tlx *= hScale;
    trx *= hScale;
    brx *= hScale;
    blx *= hScale;
    tly *= vScale;
    try_ *= vScale;
    bry *= vScale;
    bly *= vScale;

    return {
        tl: { rx: tlx, ry: tly },
        tr: { rx: trx, ry: try_ },
        br: { rx: brx, ry: bry },
        bl: { rx: blx, ry: bly },
    };
}

function buildRoundedRectPath(width: number, height: number, r: CornerRadii) {
    return `
    M ${r.tl.rx} 0
    H ${width - r.tr.rx}
    A ${r.tr.rx} ${r.tr.ry} 0 0 1 ${width} ${r.tr.ry}
    V ${height - r.br.ry}
    A ${r.br.rx} ${r.br.ry} 0 0 1 ${width - r.br.rx} ${height}
    H ${r.bl.rx}
    A ${r.bl.rx} ${r.bl.ry} 0 0 1 0 ${height - r.bl.ry}
    V ${r.tl.ry}
    A ${r.tl.rx} ${r.tl.ry} 0 0 1 ${r.tl.rx} 0
    Z
  `
        .replace(/\s+/g, " ")
        .trim();
}

function readGeometry(el: HTMLElement, inset: number): Geometry {
    const style = window.getComputedStyle(el);
    const fullWidth = el.offsetWidth;
    const fullHeight = el.offsetHeight;

    const width = Math.max(0, fullWidth - inset * 2);
    const height = Math.max(0, fullHeight - inset * 2);

    const fullRadii = parseCornerRadii(style, fullWidth, fullHeight);
    const shrinkCorner = (corner: CornerRadius): CornerRadius => ({
        rx: Math.max(0, corner.rx - inset),
        ry: Math.max(0, corner.ry - inset),
    });

    const radii: CornerRadii = {
        tl: shrinkCorner(fullRadii.tl),
        tr: shrinkCorner(fullRadii.tr),
        br: shrinkCorner(fullRadii.br),
        bl: shrinkCorner(fullRadii.bl),
    };

    return {
        width,
        height,
        offsetX: inset,
        offsetY: inset,
        radii,
        path: buildRoundedRectPath(width, height, radii),
        perimeter: 0
    };
}

function getClosestPerimeterPoint(
    x: number,
    y: number,
    width: number,
    height: number,
    r: CornerRadii,
    proximityRadius: number
) {
    const candidates: Array<{ d: number; progress: number }> = [];
    const topLen = Math.max(0, width - r.tl.rx - r.tr.rx);
    const rightLen = Math.max(0, height - r.tr.ry - r.br.ry);
    const bottomLen = Math.max(0, width - r.bl.rx - r.br.rx);
    const leftLen = Math.max(0, height - r.tl.ry - r.bl.ry);

    const qArc = (rx: number, ry: number) => {
        if (rx === 0 || ry === 0) return 0;
        const a = Math.max(rx, ry);
        const b = Math.min(rx, ry);
        const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
        const ellipseCirc = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
        return ellipseCirc / 4;
    };

    const trArc = qArc(r.tr.rx, r.tr.ry);
    const brArc = qArc(r.br.rx, r.br.ry);
    const blArc = qArc(r.bl.rx, r.bl.ry);
    const tlArc = qArc(r.tl.rx, r.tl.ry);

    const perimeter = topLen + trArc + rightLen + brArc + bottomLen + blArc + leftLen + tlArc;
    if (perimeter <= 0) return { progress: 0, proximity: 0 };
    const add = (d: number, progress: number) =>
        candidates.push({ d, progress: ((progress % perimeter) + perimeter) % perimeter });

    {
        const x1 = r.tl.rx;
        const x2 = width - r.tr.rx;
        const px = clamp(x, x1, x2);
        add(dist(x, y, px, 0), px - r.tl.rx);
    }

    if (r.tr.rx > 0 && r.tr.ry > 0) {
        const cx = width - r.tr.rx;
        const cy = r.tr.ry;
        const angle = clamp(Math.atan2(y - cy, x - cx), -Math.PI / 2, 0);
        const px = cx + Math.cos(angle) * r.tr.rx;
        const py = cy + Math.sin(angle) * r.tr.ry;
        add(dist(x, y, px, py), topLen + ((angle + Math.PI / 2) / (Math.PI / 2)) * trArc);
    }

    {
        const y1 = r.tr.ry;
        const y2 = height - r.br.ry;
        const py = clamp(y, y1, y2);
        add(dist(x, y, width, py), topLen + trArc + (py - r.tr.ry));
    }

    if (r.br.rx > 0 && r.br.ry > 0) {
        const cx = width - r.br.rx;
        const cy = height - r.br.ry;
        const angle = clamp(Math.atan2(y - cy, x - cx), 0, Math.PI / 2);
        const px = cx + Math.cos(angle) * r.br.rx;
        const py = cy + Math.sin(angle) * r.br.ry;
        add(dist(x, y, px, py), topLen + trArc + rightLen + (angle / (Math.PI / 2)) * brArc);
    }

    {
        const x1 = r.bl.rx;
        const x2 = width - r.br.rx;
        const px = clamp(x, x1, x2);
        add(dist(x, y, px, height), topLen + trArc + rightLen + brArc + (width - r.br.rx - px));
    }

    if (r.bl.rx > 0 && r.bl.ry > 0) {
        const cx = r.bl.rx;
        const cy = height - r.bl.ry;
        const angle = clamp(Math.atan2(y - cy, x - cx), Math.PI / 2, Math.PI);
        const px = cx + Math.cos(angle) * r.bl.rx;
        const py = cy + Math.sin(angle) * r.bl.ry;
        add(
            dist(x, y, px, py),
            topLen + trArc + rightLen + brArc + bottomLen + ((angle - Math.PI / 2) / (Math.PI / 2)) * blArc
        );
    }

    {
        const y1 = r.tl.ry;
        const y2 = height - r.bl.ry;
        const py = clamp(y, y1, y2);
        add(
            dist(x, y, 0, py),
            topLen + trArc + rightLen + brArc + bottomLen + blArc + (height - r.bl.ry - py)
        );
    }

    if (r.tl.rx > 0 && r.tl.ry > 0) {
        const cx = r.tl.rx;
        const cy = r.tl.ry;
        let angle = Math.atan2(y - cy, x - cx);
        if (angle < Math.PI) angle += Math.PI * 2;
        angle = clamp(angle, Math.PI, Math.PI * 1.5);
        const px = cx + Math.cos(angle) * r.tl.rx;
        const py = cy + Math.sin(angle) * r.tl.ry;
        add(
            dist(x, y, px, py),
            topLen + trArc + rightLen + brArc + bottomLen + blArc + leftLen + ((angle - Math.PI) / (Math.PI / 2)) * tlArc
        );
    }

    const best = candidates.reduce((a, b) => (a.d < b.d ? a : b));
    const proximity = 1 - clamp(best.d / proximityRadius, 0, 1);
    return { progress: best.progress / perimeter, proximity };
}

export function resolveThemeVars(base: HTMLElement): ThemeVars {
    return {
        colorA: getCssVar(base, "--ael-color-a", DEFAULT_THEME.colorA),
        colorB: getCssVar(base, "--ael-color-b", DEFAULT_THEME.colorB),
        highlight: getCssVar(base, "--ael-highlight", DEFAULT_THEME.highlight),
        gradStart: getCssVar(base, "--ael-gradient-start", DEFAULT_THEME.gradStart),
        gradEnd: getCssVar(base, "--ael-gradient-end", DEFAULT_THEME.gradEnd),
        strokeWidth: parseNum(getCssVar(base, "--ael-stroke-width", String(DEFAULT_THEME.strokeWidth)), DEFAULT_THEME.strokeWidth),
        glowWidth: parseNum(getCssVar(base, "--ael-glow-width", String(DEFAULT_THEME.glowWidth)), DEFAULT_THEME.glowWidth),
        glowBlur: parseNum(getCssVar(base, "--ael-glow-blur", String(DEFAULT_THEME.glowBlur)), DEFAULT_THEME.glowBlur),
        coreOpacity: parseNum(getCssVar(base, "--ael-core-opacity", String(DEFAULT_THEME.coreOpacity)), DEFAULT_THEME.coreOpacity),
        glowOpacity: parseNum(getCssVar(base, "--ael-glow-opacity", String(DEFAULT_THEME.glowOpacity)), DEFAULT_THEME.glowOpacity),
        highlightOpacity: parseNum(
            getCssVar(base, "--ael-highlight-opacity", String(DEFAULT_THEME.highlightOpacity)),
            DEFAULT_THEME.highlightOpacity
        ),
    };
}

export function sameTheme(a: ThemeVars, b: ThemeVars) {
    return (
        a.colorA === b.colorA &&
        a.colorB === b.colorB &&
        a.highlight === b.highlight &&
        a.gradStart === b.gradStart &&
        a.gradEnd === b.gradEnd &&
        a.strokeWidth === b.strokeWidth &&
        a.glowWidth === b.glowWidth &&
        a.glowBlur === b.glowBlur &&
        a.coreOpacity === b.coreOpacity &&
        a.glowOpacity === b.glowOpacity &&
        a.highlightOpacity === b.highlightOpacity
    );
}

function AutoEdgeLight({
                                  active,
                                  parentRef,
                                  reducedMotion = false,
                                  className = "",
                                  inset,
                                  glowWidth,
                                  idleSpeed = 0.06,
                                  hoverSpeedBoost = 0.34,
                                  attractStrength = 8,
                                  speedSpring = { stiffness: 120, damping: 24, mass: 0.9 },
                                  proximitySpring = { stiffness: 150, damping: 20, mass: 0.65 },
                                  activationSpring = { stiffness: 140, damping: 26, mass: 0.9 },
                                  proximityRadius = 150,
                                  pulseDurationMs = 700,
                                  pulseIntensity = 1,
                                  glowOpacity,
                                  colorA,
                                  colorB,
                                  enableIdleScan = true,
                                  enableCursorProximity = true,
                                  enablePulse = true,
                                  interactionBoostAmount = 0.75,
                                  interactionBoostDecay = 2.2,
                                  durationSec = 6,
                                  colorSpeed = 1,
                                  dashRatio = 0.22,
                           dashCount = 6,
                           dashAccel: dashAccelProp = 1200,
                           maxDashSpeed = 4000,
                           initialDashSpeed = 0,


                       }: AutoEdgeLightProProps) {
    const { resolvedTheme } = useTheme();

    const [themeVars, setThemeVars] = useState<ThemeVars>(DEFAULT_THEME);
    const safeInset = inset ?? -2;

    const [geometry, setGeometry] = useState<Geometry>({
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0,
        radii: { tl: { rx: 0, ry: 0 }, tr: { rx: 0, ry: 0 }, br: { rx: 0, ry: 0 }, bl: { rx: 0, ry: 0 } },
        path: "",
        perimeter: roundedRectPerimeter(320, 180, 20),
    });
    const [pathLength, setPathLength] = useState(0);

    const pathMeasureRef = useRef<SVGPathElement>(null);
    const lastActiveRef = useRef(active);
    const pulseStartRef = useRef<number | null>(null);
    const releaseTimeoutRef = useRef<number | null>(null);
    const prevPathLengthRef = useRef<number>(0);

    const rawGradientId = useId();
    const rawGlowFilterId = useId();
    const gradientId = `auto-edge-gradient-${rawGradientId.replace(/:/g, "")}`;
    const glowFilterId = `auto-edge-glow-${rawGlowFilterId.replace(/:/g, "")}`;

    const perimeterOffset = useMotionValue(0);
    const targetOffset = useMotionValue(0);
    const targetSpeed = useMotionValue(0);
    const smoothSpeed = useSpring(targetSpeed, speedSpring);

    const proximityRaw = useMotionValue(0);
    const proximity = useSpring(proximityRaw, proximitySpring);

    const activeProgressRaw = useMotionValue(active ? 1 : 0);
    const activeProgress = useSpring(activeProgressRaw, activationSpring);

    const hoverRaw = useMotionValue(0);
    const hover = useSpring(hoverRaw, { stiffness: 180, damping: 22, mass: 0.7 });

    const pulse = useMotionValue(0);
    const interactionBoost = useMotionValue(0);
    const clampedDashCount = Math.max(1, Math.floor(dashCount));
    useEffect(() => {
        const base = parentRef.current ?? document.documentElement;
        if (!base) return;

        const read = () => {
            const target = parentRef.current ?? document.documentElement;
            const next = resolveThemeVars(target);
            setThemeVars((prev) => (sameTheme(prev, next) ? prev : next));
        };

        const raf = requestAnimationFrame(read);
        const mo = new MutationObserver(read);
        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "style"],
        });

        return () => {
            cancelAnimationFrame(raf);
            mo.disconnect();
        };
    }, [parentRef, resolvedTheme]);

    const resolvedGlowWidth = glowWidth ?? themeVars.glowWidth;
    const resolvedColorA = colorA ?? themeVars.colorA;
    const resolvedColorB = colorB ?? themeVars.colorB;
    const resolvedGlowOpacity = glowOpacity ?? themeVars.glowOpacity;

    useEffect(() => {
        activeProgressRaw.set(active ? 1 : 0);
    }, [active, activeProgressRaw]);

    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        let raf = 0;
        const update = () => {
            const next = readGeometry(el, safeInset);
            setGeometry((prev) => {
                const same =
                    prev.width === next.width &&
                    prev.height === next.height &&
                    prev.offsetX === next.offsetX &&
                    prev.offsetY === next.offsetY &&
                    prev.path === next.path;
                return same ? prev : next;
            });

            raf = requestAnimationFrame(() => {
                const p = pathMeasureRef.current;
                if (!p) return;
                const nextLen = p.getTotalLength();
                setPathLength((prev) => (Math.abs(prev - nextLen) < 0.01 ? prev : nextLen));
            });
        };

        const ro = new ResizeObserver(update);
        ro.observe(el);
        update();

        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [parentRef, safeInset]);

    useUnifiedPointerGlow({
        parentRef,
        reducedMotion,
        enableCursorProximity,
        enablePulse,
        active,

        geometry,
        pathLength,
        proximityRadius,
        releaseDelayMs: 140,

        proximityRaw,
        hoverRaw,
        targetOffset,
        targetSpeed,
        pulse,
        pulseStartRef: pulseStartRef as RefObject<number | null>,
        releaseTimeoutRef: releaseTimeoutRef as RefObject<number | null>,

        getClosestPerimeterPoint,
    });

    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const triggerBoost = () => {
            interactionBoost.set(Math.max(interactionBoost.get(), interactionBoostAmount));
        };

        let lastMoveBoostTs = 0;
        const MOVE_THROTTLE_MS = 40;

        const onPointerEnter = () => triggerBoost();
        const onPointerDown = () => triggerBoost();
        const onPointerMove = () => {
            const now = performance.now();
            if (now - lastMoveBoostTs >= MOVE_THROTTLE_MS) {
                lastMoveBoostTs = now;
                triggerBoost();
            }
        };

        el.addEventListener("pointerenter", onPointerEnter, { passive: true });
        el.addEventListener("pointerdown", onPointerDown, { passive: true });
        el.addEventListener("pointermove", onPointerMove, { passive: true });

        return () => {
            el.removeEventListener("pointerenter", onPointerEnter);
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
        };
    }, [parentRef, interactionBoost, interactionBoostAmount]);

    useEffect(() => {
        if (active && !lastActiveRef.current && enablePulse) {
            pulseStartRef.current = performance.now();
        }
        lastActiveRef.current = active;
    }, [active, enablePulse]);

    useEffect(() => {
        const oldLen = prevPathLengthRef.current;
        const newLen = pathLength;

        if (oldLen > 0 && newLen > 0 && oldLen !== newLen) {
            const p = perimeterOffset.get();
            const phase = wrap(p, oldLen) / oldLen;
            perimeterOffset.set(phase * newLen);

            const t = targetOffset.get();
            const tPhase = wrap(t, oldLen) / oldLen;
            targetOffset.set(tPhase * newLen);
        }

        prevPathLengthRef.current = newLen;
    }, [pathLength, perimeterOffset, targetOffset]);

    useAnimationFrame((time, delta) => {
        if (!pathLength || !geometry.path) return;

        const ap = activeProgress.get();
        const pr = proximity.get();
        const pu = pulse.get();
        const hv = hover.get();
        const ibCurrent = interactionBoost.get();

        if (reducedMotion || (ap < 0.001 && pr < 0.001 && pu < 0.001 && hv < 0.001 && ibCurrent < 0.001)) {
            return;
        }

        const dt = delta / 1000;

        if (ibCurrent > 0) {
            interactionBoost.set(Math.max(0, ibCurrent - dt * interactionBoostDecay));
        }

        const interaction = interactionBoost.get();
        const engagement = clamp(Math.max(pr, hv * 0.5) + interaction * 0.7, 0, 1);

        const visibility = ap;
        const wantsAnimation = !reducedMotion && visibility > 0.001;
        const desiredSpeed = wantsAnimation
            ? pathLength * ((enableIdleScan ? idleSpeed : 0) + hoverSpeedBoost * engagement) * visibility
            : 0;

        targetSpeed.set(desiredSpeed);

        if (wantsAnimation) {
            const scannerOffset = perimeterOffset.get() - smoothSpeed.get() * dt;
            const followMix = clamp(attractStrength * engagement * dt, 0, 0.24);
            perimeterOffset.set(lerp(scannerOffset, targetOffset.get(), followMix));
        }

        if (pulseStartRef.current !== null) {
            const t = clamp((time - pulseStartRef.current) / pulseDurationMs, 0, 1);
            const fade = 1 - Math.pow(1 - t, 3);
            pulse.set((1 - fade) * pulseIntensity);
            if (t >= 1) {
                pulse.set(0);
                pulseStartRef.current = null;
            }
        }
    });

    const glowStrokeOpacity = useTransform(
        [proximity, pulse, activeProgress, interactionBoost],
        (values: number[]) => {
            const [p, pu, ap, ib] = values;
            return clamp((resolvedGlowOpacity + p * 0.18 + pu * 0.24 + ib * 0.22) * ap, 0, 1);
        }
    );

    const glowFilterStrength = useTransform(
        [activeProgress, proximity, pulse, interactionBoost],
        (values: number[]) => {
            const [ap, p, pu, ib] = values;
            return ap > 0.01 && Math.max(p, pu, ib) > 0.03 ? 1 : 0;
        }
    );

    const shouldAnimate = active && !reducedMotion;
    const effectivePathLength = Math.max(1, pathLength);
    const clampedDashRatio = Math.max(0.05, Math.min(0.95, dashRatio));
    const dashOffsetAnim = [0, -effectivePathLength];
    const glowFilterCss = useTransform(glowFilterStrength, (v: number) =>
        v > 0.5 ? `url(#${glowFilterId})` : "none"
    );
    const staticReducedOpacity = active ? 1 : 0;
    const isReady = Boolean(geometry.path) && pathLength > 0;

    // Derive dash pattern from dashCount, evenly distributed around the path.
    const { dashLen, gapLen, segment } = useMemo(() => {
        const clampedDashCount = Math.max(1, Math.floor(dashCount));
        const clampedDashRatio = Math.min(0.99, Math.max(0.01, dashRatio));
        const effectivePathLength = Math.max(1, pathLength);
        const seg = effectivePathLength / clampedDashCount;
        const dLen = seg * clampedDashRatio;
        const gLen = Math.max(1, seg - dLen);
        return { dashLen: dLen, gapLen: gLen, segment: seg };
    }, [dashCount, dashRatio, pathLength]);

    const cx = geometry.width / 2;
    const cy = geometry.height / 2;

    const dashOffsetMV = useMotionValue(0);
    const dashSpeedMV = useMotionValue(initialDashSpeed);
    const dashAccel = 120; // px/s^2

    useAnimationFrame((_, delta) => {
        if (!isReady || reducedMotion || !active) {
            dashSpeedMV.set(0);
            return;
        }
        const dt = delta / 1000;
        const v = dashSpeedMV.get() + dashAccelProp * dt;
        dashSpeedMV.set(v);
        // wrap so the number never grows unbounded
        dashOffsetMV.set(wrap(dashOffsetMV.get() - v * dt, segment));
    });

    if (!geometry.path) return null;

    return (
        <svg
            className={`pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible rounded-[inherit] ${className}`}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <motion.linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2={geometry.width}
                    y2={geometry.height}
                    animate={
                        shouldAnimate
                            ? {
                                gradientTransform: [
                                    `rotate(0 ${cx} ${cy})`,
                                    `rotate(360 ${cx} ${cy})`,
                                ],
                            }
                            : { gradientTransform: `rotate(0 ${cx} ${cy})` }
                    }
                    transition={
                        shouldAnimate
                            ? {
                                duration: Math.max(0.1, durationSec / Math.max(0.1, colorSpeed)),
                                repeat: Infinity,
                                ease: "linear",
                            }
                            : undefined
                    }
                >
                    <stop offset="0%" stopColor={resolvedColorA} />
                    <stop offset="35%" stopColor={resolvedColorB} />
                    <stop offset="100%" stopColor={resolvedColorA} />
                </motion.linearGradient>
            </defs>

            <g transform={`translate(${geometry.offsetX}, ${geometry.offsetY})`}>
                <path ref={pathMeasureRef} d={geometry.path} fill="none" stroke={`url(#${gradientId})`} opacity={0} />

                {reducedMotion ? (
                    <path
                        d={geometry.path}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={resolvedGlowWidth * 0.55}
                        opacity={staticReducedOpacity ? resolvedGlowOpacity * 0.55 : 0}
                    />
                ) : isReady ? (
                    <motion.path
                        d={geometry.path!}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={Math.max(1, resolvedGlowWidth)}
                        strokeLinecap="round"
                        strokeDasharray={`${dashLen} ${gapLen}`}
                        style={{
                            strokeDashoffset: dashOffsetMV,
                            opacity: glowStrokeOpacity,
                            filter: glowFilterCss,
                        }}
                        shapeRendering="geometricPrecision"
                    />
                ) : null}
            </g>
        </svg>
    );
}

export default AutoEdgeLight
