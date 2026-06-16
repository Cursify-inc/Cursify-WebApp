"use client";

import React, {RefObject, useCallback, useEffect, useId, useMemo, useRef, useState} from "react";
import {
    motion,
    MotionValue,
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

export type Geometry = {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    radii: CornerRadii;
    path: string;
    perimeter: number;
};

const roundedRectMetricsCache = new WeakMap<
    CornerRadii,
    {
        width: number;
        height: number;
        metrics: PathMetrics;
    }
>();

function getRoundedRectMetricsCached(width: number, height: number, r: CornerRadii): PathMetrics {
    const cached = roundedRectMetricsCache.get(r);

    if (cached && cached.width === width && cached.height === height) {
        return cached.metrics;
    }

    const metrics = buildRoundedRectMetrics(width, height, r);

    roundedRectMetricsCache.set(r, {
        width,
        height,
        metrics,
    });

    return metrics;
}
function useResolvedCssColors({
                                  parentRef,
                                  colorA,
                                  colorB,
                                  highlightColor,
                                  themeVars,
                              }: {
    parentRef: React.RefObject<HTMLElement | null>;
    colorA?: string;
    colorB?: string;
    highlightColor?: string;
    themeVars: ThemeVars;
}) {
    const [resolvedColors, setResolvedColors] = useState(() => ({
        colorA: colorA ?? themeVars.colorA,
        colorB: colorB ?? themeVars.colorB,
        highlightColor: highlightColor ?? themeVars.highlight,
    }));

    useEffect(() => {
        if (typeof document === "undefined") return;

        const colorBaseEl = parentRef.current ?? document.documentElement;

        setResolvedColors({
            colorA: resolveCssColorToken(colorBaseEl, colorA ?? themeVars.colorA),
            colorB: resolveCssColorToken(colorBaseEl, colorB ?? themeVars.colorB),
            highlightColor: resolveCssColorToken(
                colorBaseEl,
                highlightColor ?? themeVars.highlight
            ),
        });
    }, [
        parentRef,
        colorA,
        colorB,
        highlightColor,
        themeVars.colorA,
        themeVars.colorB,
        themeVars.highlight,
    ]);

    return resolvedColors;
}


export type AutoEdgeLightQuality = "ultra" | "balanced" | "performance";

function normalizeCssColor(baseEl: HTMLElement, value: string) {
    if (typeof document === "undefined") return value;

    const probe = document.createElement("span");
    probe.style.color = value;
    probe.style.display = "none";

    baseEl.appendChild(probe);

    const resolved = getComputedStyle(probe).color || value;

    probe.remove();

    return resolved;
}

function resolveCssColorToken(el: HTMLElement, value: string) {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;

    const varMatch = trimmed.match(/^var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)$/);

    if (varMatch) {
        const cssValue = getComputedStyle(el).getPropertyValue(varMatch[1]).trim();

        if (cssValue) {
            return resolveCssColorToken(el, cssValue);
        }

        const fallback = varMatch[2]?.trim();

        if (fallback) {
            return resolveCssColorToken(el, fallback);
        }

        return trimmed;
    }

    return normalizeCssColor(el, trimmed);
}


export type AutoEdgeLightProProps = {
    active: boolean;
    parentRef: RefObject<HTMLElement | null>;
    reducedMotion?: boolean;
    className?: string;
    inset?: number;

    strokeWidth?: number;
    glowWidth?: number;
    glowBlur?: number;

    trailCount?: number;

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
    colorA?: string;
    colorB?: string;
    highlightColor?: string;

    enableIdleScan?: boolean;
    enableCursorProximity?: boolean;
    enablePulse?: boolean;

    interactionBoostAmount?: number;
    interactionBoostDecay?: number;

    colorSpeed?: number;
    dashRatio?: number;

    dashCount?: number;
    syncColorToDash?: boolean;

    quality?: AutoEdgeLightQuality;
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
    colorA: "#006dff",
    colorB: "#7c3aed",
    highlight: "#10b981",
    gradStart: "#00263c",
    gradEnd: "#12001b",
    strokeWidth: 1.75,
    glowWidth: 7.5,
    glowBlur: 5.5,
    coreOpacity: 0.8,
    glowOpacity: 0.3,
    highlightOpacity: 0.15,
};



const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const wrap = (v: number, m: number) => (m <= 0 ? v : ((v % m) + m) % m);
const distSq = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
};

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
type ParsedColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

function parseCssChannel(value: string, scale = 255) {
    const trimmed = value.trim();

    if (trimmed.endsWith("%")) {
        const percentage = parseFloat(trimmed);
        return Number.isFinite(percentage) ? clamp((percentage / 100) * scale, 0, scale) : null;
    }

    const numeric = parseFloat(trimmed);
    return Number.isFinite(numeric) ? clamp(numeric, 0, scale) : null;
}

function parseCssAlpha(value: string | undefined) {
    if (!value) return 1;

    const trimmed = value.trim();

    if (trimmed.endsWith("%")) {
        const percentage = parseFloat(trimmed);
        return Number.isFinite(percentage) ? clamp(percentage / 100, 0, 1) : 1;
    }

    const numeric = parseFloat(trimmed);
    return Number.isFinite(numeric) ? clamp(numeric, 0, 1) : 1;
}

function parseCssColor(color: string): ParsedColor | null {
    const trimmed = color.trim();

    if (!trimmed || trimmed === "transparent") {
        return trimmed === "transparent" ? { r: 0, g: 0, b: 0, a: 0 } : null;
    }

    if (trimmed.startsWith("#")) {
        const hex = trimmed.slice(1);

        if (!/^[\da-f]+$/i.test(hex)) return null;

        if (hex.length === 3 || hex.length === 4) {
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16),
                a: hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1,
            };
        }

        if (hex.length === 6 || hex.length === 8) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
            };
        }

        return null;
    }

    const rgbMatch = trimmed.match(/^rgba?\((.+)\)$/i);
    if (!rgbMatch) return null;

    const [channelPart, alphaPart] = rgbMatch[1].split("/").map((part) => part.trim());

    const channels = channelPart
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    if (channels.length < 3) return null;

    const r = parseCssChannel(channels[0]);
    const g = parseCssChannel(channels[1]);
    const b = parseCssChannel(channels[2]);

    if (r === null || g === null || b === null) return null;

    const commaAlpha = channels[3];

    return {
        r,
        g,
        b,
        a: parseCssAlpha(alphaPart ?? commaAlpha),
    };
}

function mixParsedCssColor(
    parsedA: ParsedColor | null,
    parsedB: ParsedColor | null,
    fallbackA: string,
    fallbackB: string,
    t: number
) {
    if (!parsedA || !parsedB) return t < 0.5 ? fallbackA : fallbackB;

    const clampedT = clamp(t, 0, 1);

    const r = Math.round(lerp(parsedA.r, parsedB.r, clampedT));
    const g = Math.round(lerp(parsedA.g, parsedB.g, clampedT));
    const b = Math.round(lerp(parsedA.b, parsedB.b, clampedT));
    const a = Number(lerp(parsedA.a, parsedB.a, clampedT).toFixed(4));

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function emptyRadii(): CornerRadii {
    return {
        tl: { rx: 0, ry: 0 },
        tr: { rx: 0, ry: 0 },
        br: { rx: 0, ry: 0 },
        bl: { rx: 0, ry: 0 },
    };
}

function parseCornerRadii(style: CSSStyleDeclaration, width: number, height: number): CornerRadii {
    const raw = style.borderRadius.trim();
    if (!raw) return emptyRadii();

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

    return {
        tl: { rx: tlx * hScale, ry: tly * vScale },
        tr: { rx: trx * hScale, ry: try_ * vScale },
        br: { rx: brx * hScale, ry: bry * vScale },
        bl: { rx: blx * hScale, ry: bly * vScale },
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

function ellipseQuarterArcLength(rx: number, ry: number) {
    if (rx <= 0 || ry <= 0) return 0;

    const a = Math.max(rx, ry);
    const b = Math.min(rx, ry);
    const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
    const ellipseCirc = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

    return ellipseCirc / 4;
}

type SegmentLine = {
    kind: "line";
    length: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

type SegmentArc = {
    kind: "arc";
    length: number;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    startAngle: number;
    endAngle: number;
};

type Segment = SegmentLine | SegmentArc;

type PathMetrics = {
    perimeter: number;
    segments: Segment[];
};

function buildRoundedRectMetrics(width: number, height: number, r: CornerRadii): PathMetrics {
    const topLen = Math.max(0, width - r.tl.rx - r.tr.rx);
    const rightLen = Math.max(0, height - r.tr.ry - r.br.ry);
    const bottomLen = Math.max(0, width - r.bl.rx - r.br.rx);
    const leftLen = Math.max(0, height - r.tl.ry - r.bl.ry);

    const trArc = ellipseQuarterArcLength(r.tr.rx, r.tr.ry);
    const brArc = ellipseQuarterArcLength(r.br.rx, r.br.ry);
    const blArc = ellipseQuarterArcLength(r.bl.rx, r.bl.ry);
    const tlArc = ellipseQuarterArcLength(r.tl.rx, r.tl.ry);

    const segments: Segment[] = [
        {
            kind: "line",
            length: topLen,
            x1: r.tl.rx,
            y1: 0,
            x2: width - r.tr.rx,
            y2: 0,
        },
        {
            kind: "arc",
            length: trArc,
            cx: width - r.tr.rx,
            cy: r.tr.ry,
            rx: r.tr.rx,
            ry: r.tr.ry,
            startAngle: -Math.PI / 2,
            endAngle: 0,
        },
        {
            kind: "line",
            length: rightLen,
            x1: width,
            y1: r.tr.ry,
            x2: width,
            y2: height - r.br.ry,
        },
        {
            kind: "arc",
            length: brArc,
            cx: width - r.br.rx,
            cy: height - r.br.ry,
            rx: r.br.rx,
            ry: r.br.ry,
            startAngle: 0,
            endAngle: Math.PI / 2,
        },
        {
            kind: "line",
            length: bottomLen,
            x1: width - r.br.rx,
            y1: height,
            x2: r.bl.rx,
            y2: height,
        },
        {
            kind: "arc",
            length: blArc,
            cx: r.bl.rx,
            cy: height - r.bl.ry,
            rx: r.bl.rx,
            ry: r.bl.ry,
            startAngle: Math.PI / 2,
            endAngle: Math.PI,
        },
        {
            kind: "line",
            length: leftLen,
            x1: 0,
            y1: height - r.bl.ry,
            x2: 0,
            y2: r.tl.ry,
        },
        {
            kind: "arc",
            length: tlArc,
            cx: r.tl.rx,
            cy: r.tl.ry,
            rx: r.tl.rx,
            ry: r.tl.ry,
            startAngle: Math.PI,
            endAngle: Math.PI * 1.5,
        },
    ];

    return {
        perimeter: segments.reduce((sum, segment) => sum + segment.length, 0),
        segments,
    };
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

    const metrics = getRoundedRectMetricsCached(width, height, radii);

    return {
        width,
        height,
        offsetX: inset,
        offsetY: inset,
        radii,
        path: buildRoundedRectPath(width, height, radii),
        perimeter: metrics.perimeter,
    };
}

function closestPointOnLine(x: number, y: number, segment: SegmentLine) {
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    const denom = dx * dx + dy * dy;
    const t = denom <= 0 ? 0 : clamp(((x - segment.x1) * dx + (y - segment.y1) * dy) / denom, 0, 1);

    return {
        x: segment.x1 + dx * t,
        y: segment.y1 + dy * t,
        t,
    };
}

function closestPointOnArc(x: number, y: number, segment: SegmentArc) {
    let angle = Math.atan2(y - segment.cy, x - segment.cx);

    if (segment.startAngle >= Math.PI && angle < Math.PI) {
        angle += Math.PI * 2;
    }

    angle = clamp(angle, segment.startAngle, segment.endAngle);

    return {
        x: segment.cx + Math.cos(angle) * segment.rx,
        y: segment.cy + Math.sin(angle) * segment.ry,
        t: (angle - segment.startAngle) / Math.max(segment.endAngle - segment.startAngle, 0.0001),
    };
}

function getClosestPerimeterPoint(
    x: number,
    y: number,
    width: number,
    height: number,
    r: CornerRadii,
    proximityRadius: number
): { progress: number; proximity: number } {

    const metrics = getRoundedRectMetricsCached(width, height, r);
    const perimeter = metrics.perimeter;

    if (perimeter <= 0) {
        return { progress: 0, proximity: 0 };
    }

    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let bestProgress = 0;
    let accumulated = 0;

    for (const segment of metrics.segments) {
        if (segment.length <= 0) continue;

        const point = segment.kind === "line" ? closestPointOnLine(x, y, segment) : closestPointOnArc(x, y, segment);
        const dSq = distSq(x, y, point.x, point.y);

        if (dSq < bestDistanceSq) {
            bestDistanceSq = dSq;
            bestProgress = accumulated + point.t * segment.length;
        }

        accumulated += segment.length;
    }

    const distance = Math.sqrt(bestDistanceSq);
    const proximity = 1 - clamp(distance / Math.max(proximityRadius, 1), 0, 1);

    return {
        progress: wrap(bestProgress, perimeter) / perimeter,
        proximity,
    };
}


export function resolveThemeVars(base?: HTMLElement): ThemeVars {
    const el = base ?? document.documentElement;

    return {
        colorA: getCssVar(el, "--ael-color-a", DEFAULT_THEME.colorA),
        colorB: getCssVar(el, "--ael-color-b", DEFAULT_THEME.colorB),
        highlight: getCssVar(el, "--ael-highlight", DEFAULT_THEME.highlight),
        gradStart: getCssVar(el, "--ael-gradient-start", DEFAULT_THEME.gradStart),
        gradEnd: getCssVar(el, "--ael-gradient-end", DEFAULT_THEME.gradEnd),
        strokeWidth: parseNum(getCssVar(el, "--ael-stroke-width", String(DEFAULT_THEME.strokeWidth)), DEFAULT_THEME.strokeWidth),
        glowWidth: parseNum(getCssVar(el, "--ael-glow-width", String(DEFAULT_THEME.glowWidth)), DEFAULT_THEME.glowWidth),
        glowBlur: parseNum(getCssVar(el, "--ael-glow-blur", String(DEFAULT_THEME.glowBlur)), DEFAULT_THEME.glowBlur),
        coreOpacity: parseNum(getCssVar(el, "--ael-core-opacity", String(DEFAULT_THEME.coreOpacity)), DEFAULT_THEME.coreOpacity),
        glowOpacity: parseNum(getCssVar(el, "--ael-glow-opacity", String(DEFAULT_THEME.glowOpacity)), DEFAULT_THEME.glowOpacity),
        highlightOpacity: parseNum(
            getCssVar(el, "--ael-highlight-opacity", String(DEFAULT_THEME.highlightOpacity)),
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



type TailLayer = {
    length: number;
    opacity: number;
    width: number;
    blur: boolean;
    distanceFromHead?: number;
};


interface CometDashProps {
    geometry: Geometry;
    effectivePathLength: number;
    offset: number;
    dashLen: number;
    perimeterOffset: MotionValue<number>;
    glowStrokeOpacity: MotionValue<number>;
    tailLayers: TailLayer[];
    headStrokeWidth: number;
    quality: AutoEdgeLightQuality;
    colorTravel: MotionValue<number>;
    colorSeed: number;
    colorA: string;
    colorB: string;
    highlightColor: string;
    parsedColorA: ParsedColor | null;
    parsedColorB: ParsedColor | null;
    colorSpeed: number;
}





interface CometTailLayerProps {
    geometry: Geometry;
    effectivePathLength: number;
    offset: number;
    dashLen: number;
    perimeterOffset: MotionValue<number>;
    layer: TailLayer;
    strokeColor: MotionValue<string>;
}

const CometTailLayer = React.memo(function CometTailLayer({
                                                              geometry,
                                                              effectivePathLength,
                                                              offset,
                                                              dashLen,
                                                              perimeterOffset,
                                                              layer,
                                                              strokeColor,
                                                          }: CometTailLayerProps) {
    const tailDashoffset = useTransform(perimeterOffset, (base: number) => {
        const head = base + offset;
        const distanceFromHead = layer.distanceFromHead ?? 0;

        return -wrap(head + dashLen + distanceFromHead, effectivePathLength);
    });

    return (
        <motion.path
            d={geometry.path}
            fill="none"
            strokeWidth={layer.width}
            strokeLinecap="round"
            strokeDasharray={`${layer.length} ${Math.max(1, effectivePathLength - layer.length)}`}
            style={{
                stroke: strokeColor,
                strokeDashoffset: tailDashoffset,
                mixBlendMode: "screen",
            }}
            opacity={layer.opacity}
        />
    );
});


const CometDash = React.memo(function CometDash({
                                                    geometry,
                                                    effectivePathLength,
                                                    offset,
                                                    dashLen,
                                                    perimeterOffset,
                                                    glowStrokeOpacity,
                                                    tailLayers,
                                                    headStrokeWidth,
                                                    quality,
                                                    colorTravel,
                                                    colorSeed,
                                                    colorA,
                                                    colorB,
                                                    highlightColor,
                                                    parsedColorA,
                                                    parsedColorB,
                                                    colorSpeed,
                                                }: CometDashProps) {

    const headDashoffset = useTransform(perimeterOffset, (base: number) => {
        return -wrap(base + offset, effectivePathLength);
    });

    const cometColorMix = useTransform(colorTravel, (travel: number) => {
        const pathLoops = travel / effectivePathLength;
        const phase = pathLoops * colorSpeed + colorSeed;
        const wrappedPhase = phase - Math.floor(phase);

        return 0.5 - 0.5 * Math.cos(wrappedPhase * Math.PI * 2);
    });

    const cometColor = useTransform(cometColorMix, (mix: number) => {
        return mixParsedCssColor(parsedColorA, parsedColorB, colorA, colorB, mix);
    });

    const glowLen = Math.max(7, dashLen * 0.72);
    const coreLen = Math.max(5, dashLen * 0.24);
    const glowHeadWidth = Math.max(headStrokeWidth * 2.1, headStrokeWidth + 2);
    const showInteractionHalo = quality !== "performance";
    const haloLen = Math.max(6, dashLen * 4);
    const haloWidth = Math.max(headStrokeWidth * 1.45, headStrokeWidth + 1.2);

    return (
        <motion.g style={{ opacity: glowStrokeOpacity }}>
            {tailLayers.map((layer, index) => (
                <CometTailLayer
                    key={index}
                    geometry={geometry}
                    effectivePathLength={effectivePathLength}
                    offset={offset}
                    dashLen={dashLen}
                    perimeterOffset={perimeterOffset}
                    layer={layer}
                    strokeColor={cometColor}
                />
            ))}

            <motion.path
                d={geometry.path}
                fill="none"
                strokeWidth={glowHeadWidth}
                strokeLinecap="round"
                strokeDasharray={`${glowLen} ${Math.max(1, effectivePathLength - glowLen)}`}
                style={{
                    stroke: cometColor,
                    strokeDashoffset: headDashoffset,
                }}
                opacity={4}
            />

            {showInteractionHalo ? (
                <motion.path
                    d={geometry.path}
                    fill="none"
                    strokeWidth={haloWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${haloLen} ${Math.max(1, effectivePathLength - haloLen)}`}
                    style={{
                        stroke: cometColor,
                        strokeDashoffset: headDashoffset,
                    }}
                    opacity={1}
                />
            ) : null}

            <motion.path
                d={geometry.path}
                fill="none"
                stroke={highlightColor}
                strokeWidth={headStrokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${coreLen} ${Math.max(1, effectivePathLength - coreLen)}`}
                style={{ strokeDashoffset: headDashoffset }}
                opacity={2}
            />
        </motion.g>
    );
});




export function AutoEdgeLight({
                                  active,
                                  parentRef,
                                  reducedMotion = false,
                                  className = "",
                                  inset,
                                  strokeWidth,
                                  glowWidth,
                                  glowBlur,
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
                                  highlightColor,
                                  enableIdleScan = false,
                                  enableCursorProximity = true,
                                  enablePulse = true,
                                  interactionBoostAmount = 0.75,
                                  interactionBoostDecay = 2.2,
                                  colorSpeed = 1,
                                  dashRatio = 0.22,
                                  trailCount,
                                  dashCount = 1,
                                  syncColorToDash,
                                  quality = "balanced",
                              }: AutoEdgeLightProProps) {
    const { resolvedTheme } = useTheme();

    const [themeVars, setThemeVars] = useState<ThemeVars>(DEFAULT_THEME);
    const [isVisible, setIsVisible] = useState(false);
    const [isUserEngaged, setIsUserEngaged] = useState(false);

    const safeInset = inset ?? -2;
    const effectiveActive = active && isUserEngaged;

    const [geometry, setGeometry] = useState<Geometry>({
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0,
        radii: emptyRadii(),
        path: "",
        perimeter: 0,
    });

    const lastEffectiveActiveRef = useRef(effectiveActive);
    const pulseStartRef = useRef<number | null>(null);
    const releaseTimeoutRef = useRef<number | null>(null);
    const engagementReleaseRef = useRef<number | null>(null);
    const prevPathLengthRef = useRef<number>(0);

    const rawGradientId = useId();
    const gradientId = `auto-edge-gradient-${rawGradientId.replace(/:/g, "")}`;

    const perimeterOffset = useMotionValue(0);
    const targetOffset = useMotionValue(0);
    const targetSpeed = useMotionValue(0);
    const smoothSpeed = useSpring(targetSpeed, speedSpring);

    const proximityRaw = useMotionValue(0);
    const proximity = useSpring(proximityRaw, proximitySpring);

    const activeProgressRaw = useMotionValue(effectiveActive ? 1 : 0);
    const activeProgress = useSpring(activeProgressRaw, activationSpring);

    const hoverRaw = useMotionValue(0);
    const hover = useSpring(hoverRaw, { stiffness: 180, damping: 22, mass: 0.7 });

    const pulse = useMotionValue(0);
    const interactionBoost = useMotionValue(0);
    const colorTravel = useMotionValue(0);

    const resetTransientMotion = useCallback(() => {
        proximityRaw.set(0);
        hoverRaw.set(0);
        targetSpeed.set(0);
        interactionBoost.set(0);
        pulse.set(0);
        pulseStartRef.current = null;

        if (releaseTimeoutRef.current !== null) {
            window.clearTimeout(releaseTimeoutRef.current);
            releaseTimeoutRef.current = null;
        }
    }, [hoverRaw, interactionBoost, proximityRaw, pulse, targetSpeed]);

    const clearEngagementRelease = useCallback(() => {
        if (engagementReleaseRef.current !== null) {
            window.clearTimeout(engagementReleaseRef.current);
            engagementReleaseRef.current = null;
        }
    }, []);

    const activateUserEngagement = useCallback(
        (options?: { pulse?: boolean }) => {
            if (!active) return;

            clearEngagementRelease();
            setIsUserEngaged(true);

            interactionBoost.set(Math.max(interactionBoost.get(), interactionBoostAmount));

            if (options?.pulse && enablePulse) {
                pulseStartRef.current = performance.now();
            }
        },
        [
            active,
            clearEngagementRelease,
            enablePulse,
            interactionBoost,
            interactionBoostAmount,
        ]
    );

    const releaseUserEngagement = useCallback(() => {
        clearEngagementRelease();

        engagementReleaseRef.current = window.setTimeout(() => {
            setIsUserEngaged(false);
            resetTransientMotion();
            engagementReleaseRef.current = null;
        }, 160);
    }, [clearEngagementRelease, resetTransientMotion]);

    const qualityConfig = useMemo(() => {
        if (quality === "ultra") {
            return {
                trailCount: trailCount ?? 3,
                syncColorToDash: syncColorToDash ?? true,
                blurDuringIdle: false,
                maxDashCount: 3,
            };
        }

        if (quality === "performance") {
            return {
                trailCount: trailCount ?? 1,
                syncColorToDash: syncColorToDash ?? false,
                blurDuringIdle: false,
                maxDashCount: 1,
            };
        }

        return {
            trailCount: trailCount ?? 2,
            syncColorToDash: syncColorToDash ?? false,
            blurDuringIdle: false,
            maxDashCount: 200,
        };
    }, [quality, syncColorToDash, trailCount]);

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

    const resolvedStrokeWidth = strokeWidth ?? themeVars.strokeWidth;
    const resolvedGlowWidth = glowWidth ?? themeVars.glowWidth;
    const resolvedGlowBlur = glowBlur ?? themeVars.glowBlur;

    const {
        colorA: resolvedColorA,
        colorB: resolvedColorB,
        highlightColor: resolvedHighlightColor,
    } = useResolvedCssColors({
        parentRef,
        colorA,
        colorB,
        highlightColor,
        themeVars,
    });

    const parsedColors = useMemo(
        () => ({
            a: parseCssColor(resolvedColorA),
            b: parseCssColor(resolvedColorB),
        }),
        [resolvedColorA, resolvedColorB]
    );

    const resolvedGlowOpacity = glowOpacity ?? themeVars.glowOpacity;

    useEffect(() => {
        activeProgressRaw.set(effectiveActive ? 1 : 0);
    }, [activeProgressRaw, effectiveActive]);

    // useEffect(() => {
    //     if (active) return;
    //
    //     clearEngagementRelease();
    //     setIsUserEngaged(false);
    //     activeProgressRaw.set(0);
    //     resetTransientMotion();
    // }, [active, activeProgressRaw, clearEngagementRelease, resetTransientMotion]);
    //
    // useEffect(() => {
    //     if (isVisible) return;
    //
    //     setIsUserEngaged(false);
    //     activeProgressRaw.set(0);
    //     resetTransientMotion();
    // }, [activeProgressRaw, isVisible, resetTransientMotion]);

    useEffect(() => {
        return () => {
            clearEngagementRelease();
            resetTransientMotion();
        };
    }, [clearEngagementRelease, resetTransientMotion]);

    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const update = () => {
            const next = readGeometry(el, safeInset);

            setGeometry((prev) => {
                const same =
                    prev.width === next.width &&
                    prev.height === next.height &&
                    prev.offsetX === next.offsetX &&
                    prev.offsetY === next.offsetY &&
                    prev.path === next.path &&
                    Math.abs(prev.perimeter - next.perimeter) < 0.01;

                return same ? prev : next;
            });
        };

        const ro = new ResizeObserver(update);
        ro.observe(el);
        update();

        return () => {
            ro.disconnect();
        };
    }, [parentRef, safeInset]);

    useEffect(() => {
        const el = parentRef.current;

        if (!el || typeof IntersectionObserver === "undefined") {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const nextVisible = Boolean(entry?.isIntersecting);
                setIsVisible((prev) => (prev === nextVisible ? prev : nextVisible));
            },
            { root: null, threshold: 0 }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [parentRef]);

    useUnifiedPointerGlow({
        parentRef,
        reducedMotion,
        enableCursorProximity:
            enableCursorProximity && isVisible && effectiveActive && !reducedMotion,
        enablePulse: enablePulse && effectiveActive,
        active: effectiveActive,
        geometry,
        pathLength: geometry.perimeter,
        proximityRadius,
        releaseDelayMs: 140,
        proximityRaw,
        hoverRaw,
        targetOffset,
        targetSpeed,
        pulse,
        pulseStartRef,
        releaseTimeoutRef,
        getClosestPerimeterPoint,
    });

    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        let lastMoveBoostTs = 0;
        const moveThrottleMs = 60;

        const onPointerEnter = () => {
            activateUserEngagement();
        };

        const onPointerDown = () => {
            activateUserEngagement({ pulse: true });
        };

        const onPointerMove = () => {
            if (!isUserEngaged) return;

            const now = performance.now();

            if (now - lastMoveBoostTs >= moveThrottleMs) {
                lastMoveBoostTs = now;
                activateUserEngagement();
            }
        };

        const onPointerLeave = () => {
            releaseUserEngagement();
        };

        const onPointerCancel = () => {
            releaseUserEngagement();
        };

        const onFocusIn = () => {
            activateUserEngagement();
        };

        const onFocusOut = () => {
            releaseUserEngagement();
        };

        el.addEventListener("pointerenter", onPointerEnter, { passive: true });
        el.addEventListener("pointerdown", onPointerDown, { passive: true });
        el.addEventListener("pointermove", onPointerMove, { passive: true });
        el.addEventListener("pointerleave", onPointerLeave, { passive: true });
        el.addEventListener("pointercancel", onPointerCancel, { passive: true });
        el.addEventListener("focusin", onFocusIn);
        el.addEventListener("focusout", onFocusOut);

        return () => {
            el.removeEventListener("pointerenter", onPointerEnter);
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerleave", onPointerLeave);
            el.removeEventListener("pointercancel", onPointerCancel);
            el.removeEventListener("focusin", onFocusIn);
            el.removeEventListener("focusout", onFocusOut);
        };
    }, [
        activateUserEngagement,
        isUserEngaged,
        parentRef,
        releaseUserEngagement,
    ]);

    useEffect(() => {
        if (effectiveActive && !lastEffectiveActiveRef.current && enablePulse) {
            pulseStartRef.current = performance.now();
        }

        lastEffectiveActiveRef.current = effectiveActive;
    }, [effectiveActive, enablePulse]);

    useEffect(() => {
        const oldLen = prevPathLengthRef.current;
        const newLen = geometry.perimeter;

        if (oldLen > 0 && newLen > 0 && oldLen !== newLen) {
            const phase = wrap(perimeterOffset.get(), oldLen) / oldLen;
            const targetPhase = wrap(targetOffset.get(), oldLen) / oldLen;

            perimeterOffset.set(phase * newLen);
            targetOffset.set(targetPhase * newLen);
        }

        prevPathLengthRef.current = newLen;
    }, [geometry.perimeter, perimeterOffset, targetOffset]);

    useAnimationFrame((time, delta) => {
        if (!isVisible || !effectiveActive || !geometry.path || geometry.perimeter <= 0) {
            return;
        }

        const ap = activeProgress.get();
        const pr = proximity.get();
        const pu = pulse.get();
        const hv = hover.get();
        const ibCurrent = interactionBoost.get();

        if (
            reducedMotion ||
            (ap < 0.001 &&
                pr < 0.001 &&
                pu < 0.001 &&
                hv < 0.001 &&
                ibCurrent < 0.001)
        ) {
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
            ? geometry.perimeter *
            ((enableIdleScan ? idleSpeed : 0) + hoverSpeedBoost * engagement) *
            visibility
            : 0;

        targetSpeed.set(desiredSpeed);

        if (wantsAnimation) {
            const scannerOffset = perimeterOffset.get() - smoothSpeed.get() * dt;
            const followMix = clamp(attractStrength * engagement * dt, 0, 0.24);

            perimeterOffset.set(
                wrap(
                    lerp(scannerOffset, targetOffset.get(), followMix),
                    geometry.perimeter
                )
            );

            colorTravel.set(colorTravel.get() + Math.abs(smoothSpeed.get()) * dt);
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
            return clamp(
                (resolvedGlowOpacity + p * 0.18 + pu * 0.24 + ib * 0.22) * ap,
                0,
                1
            );
        }
    );

    const glowFilterStrength = useTransform(
        [activeProgress, proximity, pulse, interactionBoost],
        (values: number[]) => {
            const [ap, p, pu, ib] = values;
            const interaction = Math.max(p, pu, ib);

            if (ap <= 0.01) return 0;
            if (qualityConfig.blurDuringIdle) return 1;

            return interaction > 0.03 ? clamp(interaction, 0.35, 1) : 0;
        }
    );

    const effectivePathLength = Math.max(geometry.perimeter, 1);
    const isReady = geometry.perimeter > 0;

    const { dashLen, segment, clampedDashCount } = useMemo(() => {
        const requestedDashCount = Math.max(1, Math.floor(dashCount));
        const safeDashCount = Math.min(requestedDashCount, qualityConfig.maxDashCount);
        const safeDashRatio = clamp(dashRatio, 0.01, 0.99);
        const safeSegment = effectivePathLength / safeDashCount;

        return {
            dashLen: safeSegment * safeDashRatio,
            segment: safeSegment,
            clampedDashCount: safeDashCount,
        };
    }, [dashCount, dashRatio, effectivePathLength, qualityConfig.maxDashCount]);

    const headStrokeWidth = Math.max(1, resolvedStrokeWidth * 1.35);

    const tailLayers = useMemo<TailLayer[]>(
        () => [
            {
                distanceFromHead: dashLen * 1.75,
                length: dashLen * 0.7,
                width: Math.max(1, headStrokeWidth * 0.55),
                opacity: 0.08,
                blur: false,
            },
        ],
        [dashLen, headStrokeWidth]
    );

    if (!geometry.path) return null;

    const bleed = Math.max(16, resolvedGlowWidth * 2, headStrokeWidth * 3.5);

    return (
        <svg
            className={className}
            viewBox={`${geometry.offsetX - bleed} ${geometry.offsetY - bleed} ${
                geometry.width + bleed * 2
            } ${geometry.height + bleed * 2}`}
            preserveAspectRatio="none"
            style={{
                position: "absolute",
                inset: safeInset - bleed,
                width: "auto",
                height: "auto",
                pointerEvents: "none",
                overflow: "visible",
            }}
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2={geometry.width}
                    y2={geometry.height}
                >
                    <stop offset="0%" stopColor={resolvedColorA} />
                    <stop offset="100%" stopColor={resolvedColorB} />
                </linearGradient>
            </defs>

            {reducedMotion ? (
                <motion.path
                    d={geometry.path}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={Math.max(1, resolvedGlowWidth)}
                    strokeLinecap="round"
                    opacity={effectiveActive ? resolvedGlowOpacity : 0}
                    style={{}}
                />
            ) : isReady ? (
                Array.from({ length: clampedDashCount }, (_, cometIndex) => {
                    const offset = cometIndex * segment;

                    return (
                        <CometDash
                            key={cometIndex}
                            geometry={geometry}
                            effectivePathLength={effectivePathLength}
                            offset={offset}
                            dashLen={dashLen}
                            perimeterOffset={perimeterOffset}
                            glowStrokeOpacity={glowStrokeOpacity}
                            headStrokeWidth={headStrokeWidth}
                            quality={quality}
                            colorTravel={colorTravel}
                            colorSeed={
                                clampedDashCount <= 1
                                    ? 0
                                    : cometIndex / clampedDashCount
                            }
                            colorA={resolvedColorA}
                            colorB={resolvedColorB}
                            highlightColor={resolvedHighlightColor}
                            parsedColorA={parsedColors.a}
                            parsedColorB={parsedColors.b}
                            colorSpeed={colorSpeed}
                            tailLayers={tailLayers}
                        />
                    );
                })
            ) : null}
        </svg>
    );
}

export default AutoEdgeLight;
