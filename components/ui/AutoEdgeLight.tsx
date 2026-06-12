"use client"
import { buildContinuousDash } from "./auto-edge-light/dash";
import React, {
    RefObject,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import { useUnifiedPointerGlow } from "./useUnifiedPointerGlow";
import { useTheme } from "next-themes";
type CornerRadius = {
    rx: number;
    ry: number;
};

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

    speedSpring?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };

    proximitySpring?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };

    activationSpring?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };

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
    /** NEW: short interaction burst strength (0..1 recommended) */
    interactionBoostAmount?: number;

    /** NEW: burst decay per second */
    interactionBoostDecay?: number;
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

const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1);

export function getCssVar(el: HTMLElement, name: string, fallback: string) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
}

export function parseNum(v: string, fallback: number) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
}


function wrap(v: number, m: number) {
    if (m <= 0) return v;
    return ((v % m) + m) % m;
}

function remapOffsetToNewCycle(offset: number, oldCycle: number, newCycle: number) {
    if (oldCycle <= 0 || newCycle <= 0) return offset;
    const phase01 = wrap(offset, oldCycle) / oldCycle; // [0..1)
    return phase01 * newCycle;
}

function parseLengthToken(token: string, base: number) {
    const v = token.trim();

    if (!v) return 0;
    if (v.endsWith("%")) return (parseFloat(v) / 100) * base;

    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function parseCornerRadii(
    style: CSSStyleDeclaration,
    width: number,
    height: number
): CornerRadii {
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

        return [
            vals[0] ?? 0,
            vals[1] ?? 0,
            vals[2] ?? 0,
            vals[3] ?? 0,
        ];
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

    const hScale = Math.min(
        1,
        width / Math.max(tlx + trx, 1),
        width / Math.max(blx + brx, 1)
    );

    const vScale = Math.min(
        1,
        height / Math.max(tly + bly, 1),
        height / Math.max(try_ + bry, 1)
    );

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

export function readGeometry(el: HTMLElement, inset: number): Geometry {
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

    const path = buildRoundedRectPath(width, height, radii);

    return {
        width,
        height,
        offsetX: inset,
        offsetY: inset,
        radii,
        path,
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

        const ellipseCirc =
            Math.PI *
            (a + b) *
            (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

        return ellipseCirc / 4;
    };

    const trArc = qArc(r.tr.rx, r.tr.ry);
    const brArc = qArc(r.br.rx, r.br.ry);
    const blArc = qArc(r.bl.rx, r.bl.ry);
    const tlArc = qArc(r.tl.rx, r.tl.ry);

    const perimeter =
        topLen + trArc + rightLen + brArc + bottomLen + blArc + leftLen + tlArc;

    if (perimeter <= 0) {
        return { progress: 0, proximity: 0 };
    }

    const add = (d: number, progress: number) => {
        candidates.push({
            d,
            progress: ((progress % perimeter) + perimeter) % perimeter,
        });
    };

    {
        const x1 = r.tl.rx;
        const x2 = width - r.tr.rx;
        const px = clamp(x, x1, x2);
        const py = 0;
        add(dist(x, y, px, py), px - r.tl.rx);
    }

    if (r.tr.rx > 0 && r.tr.ry > 0) {
        const cx = width - r.tr.rx;
        const cy = r.tr.ry;
        const angle = clamp(Math.atan2(y - cy, x - cx), -Math.PI / 2, 0);
        const px = cx + Math.cos(angle) * r.tr.rx;
        const py = cy + Math.sin(angle) * r.tr.ry;
        const arcProgress = ((angle + Math.PI / 2) / (Math.PI / 2)) * trArc;
        add(dist(x, y, px, py), topLen + arcProgress);
    }

    {
        const y1 = r.tr.ry;
        const y2 = height - r.br.ry;
        const px = width;
        const py = clamp(y, y1, y2);
        add(dist(x, y, px, py), topLen + trArc + (py - r.tr.ry));
    }

    if (r.br.rx > 0 && r.br.ry > 0) {
        const cx = width - r.br.rx;
        const cy = height - r.br.ry;
        const angle = clamp(Math.atan2(y - cy, x - cx), 0, Math.PI / 2);
        const px = cx + Math.cos(angle) * r.br.rx;
        const py = cy + Math.sin(angle) * r.br.ry;
        const arcProgress = (angle / (Math.PI / 2)) * brArc;
        add(dist(x, y, px, py), topLen + trArc + rightLen + arcProgress);
    }

    {
        const x1 = r.bl.rx;
        const x2 = width - r.br.rx;
        const px = clamp(x, x1, x2);
        add(
            dist(x, y, px, height),
            topLen + trArc + rightLen + brArc + (width - r.br.rx - px)
        );
    }

    if (r.bl.rx > 0 && r.bl.ry > 0) {
        const cx = r.bl.rx;
        const cy = height - r.bl.ry;
        const angle = clamp(Math.atan2(y - cy, x - cx), Math.PI / 2, Math.PI);
        const px = cx + Math.cos(angle) * r.bl.rx;
        const py = cy + Math.sin(angle) * r.bl.ry;
        const arcProgress = ((angle - Math.PI / 2) / (Math.PI / 2)) * blArc;
        add(
            dist(x, y, px, py),
            topLen + trArc + rightLen + brArc + bottomLen + arcProgress
        );
    }

    {
        const y1 = r.tl.ry;
        const y2 = height - r.bl.ry;
        const px = 0;
        const py = clamp(y, y1, y2);
        add(
            dist(x, y, px, py),
            topLen +
            trArc +
            rightLen +
            brArc +
            bottomLen +
            blArc +
            (height - r.bl.ry - py)
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
        const arcProgress = ((angle - Math.PI) / (Math.PI / 2)) * tlArc;
        add(
            dist(x, y, px, py),
            topLen + trArc + rightLen + brArc + bottomLen + blArc + leftLen + arcProgress
        );
    }

    const best = candidates.reduce((a, b) => (a.d < b.d ? a : b));
    const proximity = 1 - clamp(best.d / proximityRadius, 0, 1);

    return {
        progress: best.progress / perimeter,
        proximity,
    };
}

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

function readVar(style: CSSStyleDeclaration, name: string, fallback: string) {
    const v = style.getPropertyValue(name).trim();
    return v || fallback;
}

function readNum(style: CSSStyleDeclaration, name: string, fallback: number) {
    const v = style.getPropertyValue(name).trim();
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
}

export function resolveThemeVars(): ThemeVars {
    const style = getComputedStyle(document.documentElement);
    return {
        colorA: readVar(style, "--ael-color-a", DEFAULT_THEME.colorA),
        colorB: readVar(style, "--ael-color-b", DEFAULT_THEME.colorB),
        highlight: readVar(style, "--ael-highlight", DEFAULT_THEME.highlight),
        gradStart: readVar(style, "--ael-gradient-start", DEFAULT_THEME.gradStart),
        gradEnd: readVar(style, "--ael-gradient-end", DEFAULT_THEME.gradEnd),
        strokeWidth: readNum(style, "--ael-stroke-width", DEFAULT_THEME.strokeWidth),
        glowWidth: readNum(style, "--ael-glow-width", DEFAULT_THEME.glowWidth),
        glowBlur: readNum(style, "--ael-glow-blur", DEFAULT_THEME.glowBlur),
        coreOpacity: readNum(style, "--ael-core-opacity", DEFAULT_THEME.coreOpacity),
        glowOpacity: readNum(style, "--ael-glow-opacity", DEFAULT_THEME.glowOpacity),
        highlightOpacity: readNum(style, "--ael-highlight-opacity", DEFAULT_THEME.highlightOpacity),
    };
}


function parseRadius(v?: string | null) {
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function getCornerRadius(el: HTMLElement, explicit?: number) {
    if (typeof explicit === "number") return explicit;
    const cs = getComputedStyle(el);
    const r = Math.max(
        parseRadius(cs.borderTopLeftRadius),
        parseRadius(cs.borderTopRightRadius),
        parseRadius(cs.borderBottomRightRadius),
        parseRadius(cs.borderBottomLeftRadius)
    );
    return r;
}
export function AutoEdgeLight({
                                  active,
                                  parentRef,
                                  reducedMotion = false,
                                  className = "",
                                  inset,

                                  strokeWidth,
                                  glowWidth,
                                  glowBlur,

                                  segmentRatio = 0.14,
                                  trailCount = 2,
                                  trailGap = 1.15,

                                  idleSpeed = 0.06,
                                  hoverSpeedBoost = 0.34,
                                  attractStrength = 8,

                                  speedSpring = { stiffness: 120, damping: 24, mass: 0.9 },
                                  proximitySpring = { stiffness: 150, damping: 20, mass: 0.65 },
                                  activationSpring = { stiffness: 140, damping: 26, mass: 0.9 },

                                  proximityRadius = 150,
                                  pulseDurationMs = 700,
                                  pulseIntensity = 1,

                                  coreOpacity,
                                  glowOpacity,
                                  highlightOpacity,

                                  colorA,
                                  colorB,
                                  highlightColor,

                                  enableIdleScan = true,
                                  enableCursorProximity = true,
                                  enablePulse = true,

                                  interactionBoostAmount = 0.75,
                                  interactionBoostDecay = 2.2,
                              }: AutoEdgeLightProProps) {
    const { resolvedTheme } = useTheme();
    const [themeVars, setThemeVars] = useState<ThemeVars>(DEFAULT_THEME);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const id = requestAnimationFrame(() => {
            setThemeVars(resolveThemeVars());
        });
        return () => cancelAnimationFrame(id);
    }, [resolvedTheme]);

    // keep CSS-var read logic as-is (drop-in safe)
    useEffect(() => {
        const host = parentRef.current ?? document.documentElement;
        if (!host) return;

        const read = () => {
            const base = parentRef.current ?? document.documentElement;
            setThemeVars({
                colorA: getCssVar(base, "--ael-color-a", DEFAULT_THEME.colorA),
                colorB: getCssVar(base, "--ael-color-b", DEFAULT_THEME.colorB),
                highlight: getCssVar(base, "--ael-highlight", DEFAULT_THEME.highlight),
                gradStart: getCssVar(base, "--ael-gradient-start", DEFAULT_THEME.gradStart),
                gradEnd: getCssVar(base, "--ael-gradient-end", DEFAULT_THEME.gradEnd),
                strokeWidth: parseNum(
                    getCssVar(base, "--ael-stroke-width", String(DEFAULT_THEME.strokeWidth)),
                    DEFAULT_THEME.strokeWidth
                ),
                glowWidth: parseNum(
                    getCssVar(base, "--ael-glow-width", String(DEFAULT_THEME.glowWidth)),
                    DEFAULT_THEME.glowWidth
                ),
                glowBlur: parseNum(
                    getCssVar(base, "--ael-glow-blur", String(DEFAULT_THEME.glowBlur)),
                    DEFAULT_THEME.glowBlur
                ),
                coreOpacity: parseNum(
                    getCssVar(base, "--ael-core-opacity", String(DEFAULT_THEME.coreOpacity)),
                    DEFAULT_THEME.coreOpacity
                ),
                glowOpacity: parseNum(
                    getCssVar(base, "--ael-glow-opacity", String(DEFAULT_THEME.glowOpacity)),
                    DEFAULT_THEME.glowOpacity
                ),
                highlightOpacity: parseNum(
                    getCssVar(base, "--ael-highlight-opacity", String(DEFAULT_THEME.highlightOpacity)),
                    DEFAULT_THEME.highlightOpacity
                ),
            });
        };

        read();

        const mo = new MutationObserver(read);
        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });

        return () => mo.disconnect();
    }, [parentRef]);

    const resolvedStrokeWidth = strokeWidth ?? themeVars.strokeWidth;
    const resolvedGlowWidth = glowWidth ?? themeVars.glowWidth;
    const resolvedGlowBlur = glowBlur ?? themeVars.glowBlur;

    const resolvedColorA = colorA ?? themeVars.colorA;
    const resolvedColorB = colorB ?? themeVars.colorB;
    const resolvedHighlight = highlightColor ?? themeVars.highlight;

    const resolvedCoreOpacity = coreOpacity ?? themeVars.coreOpacity;
    const resolvedGlowOpacity = glowOpacity ?? themeVars.glowOpacity;
    const resolvedHighlightOpacity = highlightOpacity ?? themeVars.highlightOpacity;

    const safeInset = inset ?? -2;


    const [geometry, setGeometry] = useState<Geometry>({
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0,
        radii: {
            tl: { rx: 0, ry: 0 },
            tr: { rx: 0, ry: 0 },
            br: { rx: 0, ry: 0 },
            bl: { rx: 0, ry: 0 },
        },
        path: "",
    });

    const [pathLength, setPathLength] = useState(0);

    const pathMeasureRef = useRef<SVGPathElement>(null);
    const lastActiveRef = useRef(active);
    const pulseStartRef = useRef<number | null>(null);
    const releaseTimeoutRef = useRef<number | null>(null);

    const prevPathLengthRef = useRef<number>(0);
    const lastMeasuredLenRef = useRef<number>(0);

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
    const hover = useSpring(hoverRaw, {
        stiffness: 180,
        damping: 22,
        mass: 0.7,
    });

    const pulse = useMotionValue(0);
    const interactionBoost = useMotionValue(0);

    useEffect(() => {
        activeProgressRaw.set(active ? 1 : 0);
    }, [active, activeProgressRaw]);

    React.useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        let raf = 0;

        const roundedRectPath = (w: number, h: number, r: number) => {
            // path starts at top-left corner arc start
            return [
                `M ${r} 0`,
                `H ${w - r}`,
                `A ${r} ${r} 0 0 1 ${w} ${r}`,
                `V ${h - r}`,
                `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
                `H ${r}`,
                `A ${r} ${r} 0 0 1 0 ${h - r}`,
                `V ${r}`,
                `A ${r} ${r} 0 0 1 ${r} 0`,
                "Z",
            ].join(" ");
        };

        const update = () => {
            const rect = el.getBoundingClientRect();
            const fullW = Math.max(0, rect.width);
            const fullH = Math.max(0, rect.height);

            const x = safeInset;
            const y = safeInset;
            const w = Math.max(0, fullW - safeInset * 2);
            const h = Math.max(0, fullH - safeInset * 2);

            const inferred = getCornerRadius(el); // uses computed styles
            const r = Math.max(0, Math.min(inferred - safeInset, w / 2, h / 2));

            setGeometry({
                width: w,
                height: h,
                offsetX: x,
                offsetY: y,
                radii: {
                    tl: { rx: r, ry: r },
                    tr: { rx: r, ry: r },
                    br: { rx: r, ry: r },
                    bl: { rx: r, ry: r },
                },
                path: roundedRectPath(w, h, r),
            });

            raf = requestAnimationFrame(() => {
                if (!pathMeasureRef.current) return;
                setPathLength(pathMeasureRef.current.getTotalLength());
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
        pulseStartRef,
        releaseTimeoutRef,

        getClosestPerimeterPoint,
    });

    // OPT 1: move-based boost is now throttled + pointer events unified
    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const triggerBoost = () => {
            interactionBoost.set(Math.max(interactionBoost.get(), interactionBoostAmount));
        };

        let lastMoveBoostTs = 0;
        const MOVE_THROTTLE_MS = 40; // ~25Hz

        const onPointerEnter = () => triggerBoost();
        const onPointerDown = () => triggerBoost();
        const onTouchStart = () => triggerBoost();
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
        el.addEventListener("touchstart", onTouchStart, { passive: true });

        return () => {
            el.removeEventListener("pointerenter", onPointerEnter);
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("touchstart", onTouchStart);
        };
    }, [parentRef, interactionBoost, interactionBoostAmount]);

    useEffect(() => {
        const reset = () => {
            hoverRaw.set(0);
            proximityRaw.set(0);
            targetSpeed.set(0);
            pulse.set(0);
            interactionBoost.set(0);
            if (releaseTimeoutRef.current !== null) {
                window.clearTimeout(releaseTimeoutRef.current);
                releaseTimeoutRef.current = null;
            }
        };

        const onVisibility = () => {
            if (document.hidden) reset();
        };

        window.addEventListener("blur", reset, { passive: true });
        window.addEventListener("pagehide", reset, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            window.removeEventListener("blur", reset);
            window.removeEventListener("pagehide", reset);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [hoverRaw, proximityRaw, targetSpeed, pulse, interactionBoost]);

    useEffect(() => {
        if (active && !lastActiveRef.current && enablePulse) {
            pulseStartRef.current = performance.now();
        }
        lastActiveRef.current = active;
    }, [active, enablePulse]);

    const { dashArray } = useMemo(
        () => buildContinuousDash(pathLength, segmentRatio, trailCount, trailGap),
        [pathLength, segmentRatio, trailCount, trailGap]
    );

    const dashOffset = perimeterOffset;

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

        // OPT 3: strong idle early-exit
        if (
            reducedMotion ||
            (ap < 0.001 && pr < 0.001 && pu < 0.001 && hv < 0.001 && ibCurrent < 0.001)
        ) {
            return;
        }

        const dt = delta / 1000;

        // decay interaction boost
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
            const next = lerp(scannerOffset, targetOffset.get(), followMix);
            perimeterOffset.set(next);
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
        (latest) => {
            const [p, pu, ap, ib] = latest as [number, number, number, number];
            return clamp((resolvedGlowOpacity + p * 0.18 + pu * 0.24 + ib * 0.22) * ap, 0, 1);
        }
    );

    const coreStrokeOpacity = useTransform(
        [proximity, pulse, activeProgress, interactionBoost],
        (latest) => {
            const [p, pu, ap, ib] = latest as [number, number, number, number];
            return clamp((resolvedCoreOpacity + p * 0.1 + pu * 0.16 + ib * 0.12) * ap, 0, 1);
        }
    );

    const highlightStrokeOpacity = useTransform(
        [pulse, proximity, activeProgress, interactionBoost],
        (latest) => {
            const [pu, p, ap, ib] = latest as [number, number, number, number];
            return clamp((resolvedHighlightOpacity + pu * 0.22 + p * 0.06 + ib * 0.18) * ap, 0, 0.95);
        }
    );

    // OPT 2: conditional blur filter enablement
    const glowFilterEnabled = useTransform(
        [activeProgress, proximity, pulse, interactionBoost],
        (latest) => {
            const [ap, p, pu, ib] = latest as [number, number, number, number];
            const energy = Math.max(p, pu, ib);
            return ap > 0.01 && energy > 0.03;
        }
    );

    const staticReducedOpacity = active ? 1 : 0;
    const isReady = pathLength > 0;

    if (!geometry.path) return null;

    return (
        <svg
            className={`pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible rounded-[inherit] ${className}`}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={themeVars.gradStart} />
                    <stop offset="18%" stopColor={resolvedColorA} />
                    <stop offset="54%" stopColor={resolvedColorA} />
                    <stop offset="84%" stopColor={resolvedColorB} />
                    <stop offset="100%" stopColor={themeVars.gradEnd} />
                </linearGradient>

                <filter
                    id={glowFilterId}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                    colorInterpolationFilters="sRGB"
                >
                    <feGaussianBlur stdDeviation={resolvedGlowBlur} result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g transform={`translate(${geometry.offsetX}, ${geometry.offsetY})`}>
                <path ref={pathMeasureRef} d={geometry.path} fill="none" stroke="none" opacity={0} />

                {reducedMotion ? (
                    <>
                        <path
                            d={geometry.path}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth={resolvedGlowWidth * 0.55}
                            opacity={staticReducedOpacity ? resolvedGlowOpacity * 0.55 : 0}
                        />
                        <path
                            d={geometry.path}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth={resolvedStrokeWidth}
                            opacity={staticReducedOpacity ? resolvedCoreOpacity * 0.82 : 0}
                        />
                    </>
                ) : isReady ? (
                    <>
                        <motion.path
                            d={geometry.path}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth={resolvedGlowWidth}
                            strokeLinecap="round"
                            strokeDasharray={dashArray}
                            style={{
                                strokeDashoffset: dashOffset,
                                opacity: glowStrokeOpacity,
                                filter: glowFilterEnabled.get() ? `url(#${glowFilterId})` : "none",
                            }}
                        />
                        <motion.path
                            d={geometry.path}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth={resolvedStrokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={dashArray}
                            style={{
                                strokeDashoffset: dashOffset,
                                opacity: coreStrokeOpacity,
                            }}
                        />
                        <motion.path
                            d={geometry.path}
                            fill="none"
                            stroke={resolvedHighlight}
                            strokeWidth={Math.max(1, resolvedStrokeWidth * 0.34)}
                            strokeLinecap="round"
                            strokeDasharray={dashArray}
                            style={{
                                strokeDashoffset: dashOffset,
                                opacity: highlightStrokeOpacity,
                            }}
                        />
                    </>
                ) : null}
            </g>
        </svg>
    );
}
