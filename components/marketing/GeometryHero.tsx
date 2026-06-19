"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    useMotionValueEvent,
    type MotionStyle,
} from "framer-motion";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from "react";
import {
    AdditiveBlending,
    Color,
    Group,
    InstancedMesh,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Vector3,
    BoxGeometry,
} from "three";

type SectionStage = number;
type NumberRef = RefObject<number>;
type ThemeRef = RefObject<RuntimeTheme>;

type QualityTier = "static" | "low" | "medium" | "high";

type QualityConfig = {
    tier: QualityTier;
    dpr: number | [number, number];
    targetFps: number;
    idleFps: number;
    particleCount: number;
    coreDetail: number;
    glowDetail: number;
    enableSecondHudLayer: boolean;
    enableNetwork: boolean;
    enableParticles: boolean;
    enablePointerParallax: boolean;
    tracePositions: number;
    sidePins: number;
    topBottomPins: number;
};

type Theme = {
    accent: Color;
    accent2: Color;
    bg: Color;
    coreScale: number;
    frameScale: number;
    particleOpacity: number;
    dataSpeed: number;
    pulse: number;
};

type RuntimeTheme = {
    accent: Color;
    accent2: Color;
    bg: Color;
    accentStyle: string;
    accent2Style: string;
    bgStyle: string;
    coreScale: number;
    frameScale: number;
    particleOpacity: number;
    dataSpeed: number;
    pulse: number;
};

type ThemeSeed = {
    accent: string;
    accent2: string;
    bg: string;
};

type GeometryCssTheme = Record<`--${string}`, string>;

const THEME_SEEDS: readonly ThemeSeed[] = [
    { accent: "#00e5ff", accent2: "#8b5cf6", bg: "#020617" },
    { accent: "#00ffc6", accent2: "#b026ff", bg: "#030014" },
    { accent: "#ff2bd6", accent2: "#00e5ff", bg: "#050010" },
    { accent: "#39ff14", accent2: "#00e5ff", bg: "#010409" },
] as const;

const THEME_CACHE = new Map<number, Theme>();
const CSS_THEME_CACHE = new Map<number, GeometryCssTheme>();

function normalizeStage(stage: number) {
    return Math.max(0, Math.floor(Number.isFinite(stage) ? stage : 0));
}

function wrapIndex(index: number, length: number) {
    return ((index % length) + length) % length;
}

function stageWave(stage: number, speed = 1) {
    return (Math.sin(stage * speed) + 1) / 2;
}

function derivedColor(hex: string, stage: number, offset = 0) {
    const seedCycle = Math.floor(stage / THEME_SEEDS.length);
    const hueShift = ((seedCycle * 0.085 + stage * 0.018 + offset) % 1 + 1) % 1;
    const saturationShift = Math.sin(stage * 0.7 + offset * 8) * 0.035;
    const lightnessShift = Math.sin(stage * 0.43 + offset * 5) * 0.025;

    return new Color(hex).offsetHSL(hueShift, saturationShift, lightnessShift);
}

function getTheme(stage: number): Theme {
    const normalized = normalizeStage(stage);
    const cached = THEME_CACHE.get(normalized);

    if (cached) return cached;

    const seed = THEME_SEEDS[wrapIndex(normalized, THEME_SEEDS.length)];
    const cycle = Math.floor(normalized / THEME_SEEDS.length);
    const intensity = Math.min(cycle, 12);

    const theme: Theme = {
        accent: derivedColor(seed.accent, normalized, 0),
        accent2: derivedColor(seed.accent2, normalized, 0.19),
        bg: derivedColor(seed.bg, normalized, 0.07),
        coreScale: 1 + Math.min(normalized * 0.035, 0.42),
        frameScale: 1 + Math.min(normalized * 0.035, 0.42),
        particleOpacity: Math.min(0.5 + normalized * 0.045, 0.9),
        dataSpeed: Math.min(0.2 + normalized * 0.0355, 0.378),
        pulse: Math.min(0.8 + normalized * 0.11, 1.75),
    };

    theme.bg.multiplyScalar(Math.max(0.72, 1 - intensity * 0.025));

    THEME_CACHE.set(normalized, theme);
    return theme;
}

function rgbaString(color: Color, alpha: number) {
    return `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(
        color.b * 255,
    )},${alpha})`;
}

function getCssTheme(stage: number): GeometryCssTheme {
    const normalized = normalizeStage(stage);
    const cached = CSS_THEME_CACHE.get(normalized);

    if (cached) return cached;

    const theme = getTheme(normalized);
    const nextTheme = getTheme(normalized + 1);

    const bgFrom = theme.bg.clone();
    const bgVia = theme.bg.clone().lerp(theme.accent, 0.16 + stageWave(normalized, 0.4) * 0.08);
    const bgTo = theme.bg.clone().lerp(nextTheme.bg, 0.32);

    const cssTheme: GeometryCssTheme = {
        "--bg-from": hexString(bgFrom),
        "--bg-via": hexString(bgVia),
        "--bg-to": hexString(bgTo),
        "--glow-a": rgbaString(theme.accent, 0.16 + stageWave(normalized, 0.6) * 0.06),
        "--glow-b": rgbaString(theme.accent2, 0.13 + stageWave(normalized, 0.5) * 0.05),
        "--glow-c": rgbaString(nextTheme.accent, 0.08 + stageWave(normalized, 0.8) * 0.04),
        "--glow-d": rgbaString(nextTheme.accent2, 0.06 + stageWave(normalized, 0.7) * 0.035),
        "--grid-a": rgbaString(theme.accent, 0.11 + stageWave(normalized, 0.45) * 0.05),
        "--grid-b": rgbaString(theme.accent2, 0.1 + stageWave(normalized, 0.5) * 0.045),
    };

    CSS_THEME_CACHE.set(normalized, cssTheme);
    return cssTheme;
}



type RouteDirection = "toCpu" | "fromCpu" | "bidirectional";

type Route = {
    points: Vector3[];
    color: "primary" | "secondary";
    speed: number;
    offset: number;
    kind?: "main" | "pin";
    direction: RouteDirection;
};

type PreparedRoute = Route & {
    segmentLengths: Float32Array;
    totalLength: number;
};

export interface PacketInstance {
    routeIndex: number;
    offset: number;
    scale: number;
    burstPhase: number;
}

function repeat01(t: number) {
    return ((t % 1) + 1) % 1;
}

function easeInCubic(t: number) {
    return t * t * t;
}

function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

function remapTrafficProgress(progress: number, direction: RouteDirection) {
    switch (direction) {
        case "toCpu":
            return easeInCubic(progress);
        case "fromCpu":
            return easeOutCubic(progress);
        case "bidirectional":
        default:
            return progress;
    }
}

function randomDirection(): RouteDirection {
    const r = Math.random();
    if (r < 0.6) return "toCpu";
    if (r < 0.85) return "fromCpu";
    return "bidirectional";
}

function createLineSegmentsFromRoutes(routes: Route[]) {
    const data: number[] = [];

    routes.forEach((route) => {
        for (let i = 0; i < route.points.length - 1; i++) {
            const a = route.points[i];
            const b = route.points[i + 1];

            data.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
    });

    return new Float32Array(data);
}

function prepareRoute(route: Route): PreparedRoute {
    const segmentLengths = new Float32Array(Math.max(route.points.length - 1, 0));
    let totalLength = 0;

    for (let i = 0; i < route.points.length - 1; i++) {
        const length = route.points[i].distanceTo(route.points[i + 1]);
        segmentLengths[i] = length;
        totalLength += length;
    }

    return {
        ...route,
        direction: route.direction ?? randomDirection(),
        segmentLengths,
        totalLength,
    };
}

function prepareRoutes(routes: Route[]) {
    return routes.map(prepareRoute);
}

function samplePreparedRoute(route: PreparedRoute, t: number, target: Vector3) {
    const points = route.points;

    if (points.length === 0) {
        target.set(0, 0, 0);
        return target;
    }

    if (points.length === 1 || route.totalLength <= 0) {
        target.copy(points[0]);
        return target;
    }

    let directionForThisSample: RouteDirection = route.direction;
    let progress = repeat01(t);

    if (route.direction === "fromCpu") {
        progress = 1 - progress;
    } else if (route.direction === "bidirectional") {
        const forward = Math.sin(t * Math.PI * 2) <= 0;
        directionForThisSample = forward ? "toCpu" : "fromCpu";

        if (!forward) {
            progress = 1 - progress;
        }
    }

    progress = remapTrafficProgress(progress, directionForThisSample);

    let distance = progress * route.totalLength;

    for (let i = 0; i < route.segmentLengths.length; i++) {
        const length = route.segmentLengths[i];

        if (distance <= length) {
            const localT = length === 0 ? 0 : distance / length;
            target.copy(points[i]).lerp(points[i + 1], localT);
            return target;
        }

        distance -= length;
    }

    target.copy(points[points.length - 1]);
    return target;
}

function createPacketInstances(routes: PreparedRoute[]): PacketInstance[] {
    const packets: PacketInstance[] = [];

    routes.forEach((route, routeIndex) => {
        let count: number;

        if (route.kind === "main") {
            count = route.color === "primary" ? 10 : 10;
        } else {
            const r = Math.random() * 1000;

            if (r < 0.18) {
                count = 0;
            } else if (r < 0.7) {
                count = 20;
            } else {
                count = 10;
            }
        }

        for (let i = 0; i < count; i++) {
            packets.push({
                routeIndex,
                offset: route.offset + i * (0.28 + Math.random() * 8),
                scale: route.kind === "main" ? 0.25 : 0.25,
                burstPhase: Math.random() * 100000,
            });
        }
    });

    return packets;
}

function createChipPinFanRoutes(): Route[] {
    const z = 0.15;
    const routes: Route[] = [];

    const sidePinCount = 9;
    const topBottomPinCount = 7;

    const makeRoute = (
        pin: Vector3,
        points: Vector3[],
        index: number,
        colorOffset = 0,
    ): Route => ({
        kind: "pin",
        color: (index + colorOffset) % 2 === 0 ? "primary" : "secondary",
        speed: 0.06 + index * 0.004,
        offset: index * 0.11 + colorOffset * 0.17,
        direction: randomDirection(),
        points: [...points, pin],
    });

    /**
     * Side pin routes
     *
     * The important trick:
     * - every pin gets a stable "laneY"
     * - lane order is preserved from outside to chip
     * - no wobble, no crossing
     */
    for (let i = 0; i < sidePinCount; i++) {
        const pinY = 0.36 - i * 0.09;

        // Spread outer traces a bit more than the pin spacing,
        // but preserve the same top-to-bottom order.
        const laneY = 0.68 - i * 0.17;

        // LEFT SIDE
        routes.push(
            makeRoute(
                new Vector3(-0.72, pinY, z),
                [
                    new Vector3(-10.45, laneY, z),
                    new Vector3(-3, laneY, z),
                    new Vector3(-2.2, laneY, z),
                    new Vector3(-2, pinY, z),
                    new Vector3(-1.28, pinY, z),

                ],
                i,
                0,
            ),
        );

        // RIGHT SIDE
        routes.push(
            makeRoute(
                new Vector3(0.72, pinY, z),
                [
                    new Vector3(10.45, laneY, z),
                    new Vector3(3, laneY, z),
                    new Vector3(2.2, laneY, z),
                    new Vector3(2, pinY, z),
                    new Vector3(1.28, pinY, z),
                ],
                i,
                1,
            ),
        );
    }

    /**
     * Top / bottom pin routes
     *
     * Same idea:
     * - every pin gets a stable laneX
     * - route ordering is preserved
     * - no side-to-side wobble
     */
    for (let i = 0; i < topBottomPinCount; i++) {
        const pinX = -0.48 + i * 0.16;

        // Slightly wider pitch outside the chip.
        const laneX = -0.72 + i * 0.24;

        // TOP SIDE
        routes.push(
            makeRoute(
                new Vector3(pinX, 0.46, z),
                [
                    new Vector3(laneX, 2.65, z),
                    new Vector3(laneX, 1.65, z),
                    new Vector3(pinX, 1.35, z),
                    new Vector3(pinX, 1.12, z),
                    new Vector3(pinX, 0.82, z),
                ],
                i,
                2,
            ),
        );

        // BOTTOM SIDE
        routes.push(
            makeRoute(
                new Vector3(pinX, -0.46, z),
                [
                    new Vector3(laneX,- 2.65, z),
                    new Vector3(laneX,- 1.65, z),
                    new Vector3(pinX, -1.35, z),
                    new Vector3(pinX, -1.12, z),
                    new Vector3(pinX, -0.82, z),
                ],
                i,
                3,
            ),
        );
    }

    return routes;
}


function createDataBusRoutes(): Route[] {
    const z = 0.15;

    const mainRoutes: Route[] = [
        {
            kind: "main",
            color: "primary",
            speed: 0.18,
            offset: 0,
            direction: "toCpu",
            points: [
                new Vector3(-4.55, 1.48, z),
                new Vector3(-3.55, 1.48, z),
                new Vector3(-3.55, 0.92, z),
                new Vector3(-2.35, 0.92, z),
                new Vector3(-2.35, 0.52, z),
                new Vector3(-1.28, 0.52, z),
                new Vector3(-1.28, 0.32, z),
                new Vector3(-0.72, 0.32, z),
            ],
        },
        {
            kind: "main",
            color: "secondary",
            speed: 0.21,
            offset: 0.25,
            direction: "fromCpu",
            points: [
                new Vector3(4.55, 1.18, z),
                new Vector3(3.55, 1.18, z),
                new Vector3(3.55, 0.72, z),
                new Vector3(2.35, 0.72, z),
                new Vector3(2.35, 0.34, z),
                new Vector3(1.28, 0.34, z),
                new Vector3(1.28, 0.12, z),
                new Vector3(0.72, 0.12, z),
            ],
        },
        {
            kind: "main",
            color: "primary",
            speed: 0.16,
            offset: 0.5,
            direction: "toCpu",
            points: [
                new Vector3(-4.45, -1.38, z),
                new Vector3(-3.45, -1.38, z),
                new Vector3(-3.45, -0.94, z),
                new Vector3(-2.22, -0.94, z),
                new Vector3(-2.22, -0.54, z),
                new Vector3(-1.18, -0.54, z),
                new Vector3(-1.18, -0.22, z),
                new Vector3(-0.72, -0.22, z),
            ],
        },
        {
            kind: "main",
            color: "secondary",
            speed: 0.2,
            offset: 0.75,
            direction: "fromCpu",
            points: [
                new Vector3(4.45, -1.52, z),
                new Vector3(3.45, -1.52, z),
                new Vector3(3.45, -1.02, z),
                new Vector3(2.18, -1.02, z),
                new Vector3(2.18, -0.66, z),
                new Vector3(1.18, -0.66, z),
                new Vector3(1.18, -0.36, z),
                new Vector3(0.72, -0.36, z),
            ],
        },
    ];

    return [...mainRoutes, ...createChipPinFanRoutes()];
}


function createChipTracePositions() {
    const data: number[] = [];
    const z = 0;

    const line = (a: [number, number], b: [number, number]) => {
        data.push(a[0], a[1], z, b[0], b[1], z);
    };

    // left-to-center traces
    line([-0.34, 0.18], [-0.16, 0.18]);
    line([-0.16, 0.18], [-0.06, 0.08]);
    line([-0.34, 0.06], [-0.08, 0.06]);
    line([-0.34, -0.06], [-0.08, -0.06]);
    line([-0.34, -0.18], [-0.16, -0.18]);
    line([-0.16, -0.18], [-0.06, -0.08]);

    // center bus
    line([-0.06, 0.08], [0.08, 0.08]);
    line([-0.08, 0.00], [0.10, 0.00]);
    line([-0.06, -0.08], [0.08, -0.08]);

    // right-side traces
    line([0.08, 0.08], [0.18, 0.18]);
    line([0.18, 0.18], [0.34, 0.18]);
    line([0.10, 0.00], [0.34, 0.00]);
    line([0.08, -0.08], [0.18, -0.18]);
    line([0.18, -0.18], [0.34, -0.18]);

    // vertical connectors
    line([-0.22, 0.26], [-0.22, 0.18]);
    line([0.00, 0.24], [0.00, 0.08]);
    line([0.22, 0.26], [0.22, 0.18]);
    line([-0.22, -0.26], [-0.22, -0.18]);
    line([0.00, -0.24], [0.00, -0.08]);
    line([0.22, -0.26], [0.22, -0.18]);

    return new Float32Array(data);
}


const INSTANCE_DUMMY = new Object3D();
const MAX_FRAME_DELTA = 1 / 144;

function safeDelta(delta: number) {
    return Math.min(delta, MAX_FRAME_DELTA);
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function dampFactor(speed: number, delta: number) {
    return 1 - Math.exp(-speed * delta);
}

function hexString(color: Color) {
    return `#${color.getHexString()}`;
}

function createRuntimeTheme(theme: Theme): RuntimeTheme {
    return {
        accent: theme.accent.clone(),
        accent2: theme.accent2.clone(),
        bg: theme.bg.clone(),
        accentStyle: hexString(theme.accent),
        accent2Style: hexString(theme.accent2),
        bgStyle: hexString(theme.bg),
        coreScale: theme.coreScale,
        frameScale: theme.frameScale,
        particleOpacity: theme.particleOpacity,
        dataSpeed: theme.dataSpeed,
        pulse: theme.pulse,
    };
}

function applyBlendedTheme(target: RuntimeTheme, progress: number) {
    const clamped = Math.max(0, Number.isFinite(progress) ? progress : 0);
    const base = Math.floor(clamped);
    const t = clamped - base;

    const from = getTheme(base);
    const to = getTheme(base + 1);

    target.accent.copy(from.accent).lerp(to.accent, t);
    target.accent2.copy(from.accent2).lerp(to.accent2, t);
    target.bg.copy(from.bg).lerp(to.bg, t);

    target.accentStyle = hexString(target.accent);
    target.accent2Style = hexString(target.accent2);
    target.bgStyle = hexString(target.bg);

    target.coreScale = lerp(from.coreScale, to.coreScale, t);
    target.frameScale = lerp(from.frameScale, to.frameScale, t);
    target.particleOpacity = lerp(from.particleOpacity, to.particleOpacity, t);
    target.dataSpeed = lerp(from.dataSpeed, to.dataSpeed, t);
    target.pulse = lerp(from.pulse, to.pulse, t);
}


function toSectionStage(index: number): SectionStage {
    return normalizeStage(index);
}

function createStructuredHudPositions() {
    const data: number[] = [];
    const z = 0.05;

    const line = (
        a: [number, number, number],
        b: [number, number, number],
    ) => {
        data.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    };

    const bracket = (
        x: number,
        y: number,
        w: number,
        h: number,
        size: number,
    ) => {
        const l = x - w / 2;
        const r = x + w / 2;
        const t = y + h / 2;
        const b = y - h / 2;

        line([l, t, z], [l + size, t, z]);
        line([l, t, z], [l, t - size, z]);

        line([r, t, z], [r - size, t, z]);
        line([r, t, z], [r, t - size, z]);

        line([l, b, z], [l + size, b, z]);
        line([l, b, z], [l, b + size, z]);

        line([r, b, z], [r - size, b, z]);
        line([r, b, z], [r, b + size, z]);
    };

    const rect = (x: number, y: number, w: number, h: number) => {
        const l = x - w / 2;
        const r = x + w / 2;
        const t = y + h / 2;
        const b = y - h / 2;

        line([l, t, z], [r, t, z]);
        line([r, t, z], [r, b, z]);
        line([r, b, z], [l, b, z]);
        line([l, b, z], [l, t, z]);
    };

    // Outer tactical HUD
    bracket(0, 0, 5.9, 3.75, 0.62);
    bracket(0, 0, 4.45, 2.72, 0.42);

    // Side panels
    bracket(-3.65, 1.15, 1.18, 0.72, 0.22);
    bracket(3.65, 1.02, 1.18, 0.72, 0.22);
    bracket(-3.55, -1.15, 1.28, 0.72, 0.22);
    bracket(3.55, -1.2, 1.28, 0.72, 0.22);

    // Center processor frame
    rect(0, 0, 1.72, 1.08);
    bracket(0, 0, 2.28, 1.52, 0.28);

    // Small status ticks
    for (let i = -3; i <= 3; i++) {
        line([i * 0.42, 1.96, z], [i * 0.42 + 0.16, 1.96, z]);
        line([i * 0.42, -1.96, z], [i * 0.42 + 0.16, -1.96, z]);
    }

    // Crosshair
    line([-0.34, 0, z], [-0.12, 0, z]);
    line([0.12, 0, z], [0.34, 0, z]);
    line([0, -0.34, z], [0, -0.12, z]);
    line([0, 0.12, z], [0, 0.34, z]);

    return new Float32Array(data);
}

function useActiveGeometrySection() {
    const [activeSection, setActiveSection] = useState<SectionStage>(0);

    useEffect(() => {
        const sections = Array.from(
            document.querySelectorAll<HTMLElement>("[data-geometry-section]"),
        );

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (!visible) return;

                const index = sections.indexOf(visible.target as HTMLElement);
                if (index === -1) return;

                const next = toSectionStage(index);
                setActiveSection((current) => (current === next ? current : next));
            },
            {
                threshold: [0.25, 0.5, 0.75],
                rootMargin: "-10% 0px -10% 0px",
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return activeSection;
}

function useDocumentVisible() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const update = () => {
            setVisible(!document.hidden);
        };

        update();
        document.addEventListener("visibilitychange", update);

        return () => {
            document.removeEventListener("visibilitychange", update);
        };
    }, []);

    return visible;
}

function useUserActivity(idleDelay = 4500) {
    const [active, setActive] = useState(true);

    useEffect(() => {
        let timeout: number | undefined;

        const markActive = () => {
            setActive(true);

            if (timeout) {
                window.clearTimeout(timeout);
            }

            timeout = window.setTimeout(() => {
                setActive(false);
            }, idleDelay);
        };

        markActive();

        window.addEventListener("pointermove", markActive, { passive: true });
        window.addEventListener("pointerdown", markActive, { passive: true });
        window.addEventListener("scroll", markActive, { passive: true });
        window.addEventListener("keydown", markActive);

        return () => {
            if (timeout) {
                window.clearTimeout(timeout);
            }

            window.removeEventListener("pointermove", markActive);
            window.removeEventListener("pointerdown", markActive);
            window.removeEventListener("scroll", markActive);
            window.removeEventListener("keydown", markActive);
        };
    }, [idleDelay]);

    return active;
}

function useQualityTier(prefersReducedMotion: boolean | null): QualityConfig {
    return useMemo(() => {
        // Default base config
        const base = {
            tier: "medium",
            dpr: 1,
            targetFps: 60,
            idleFps: 8,
            particleCount: 0,
            coreDetail: 1,
            glowDetail: 1,
            enableSecondHudLayer: true,
            enableNetwork: true,
            enableParticles: false,
            enablePointerParallax: true,
        } as QualityConfig;

        if (prefersReducedMotion) {
            return {
                tier: "static",
                dpr: 1,
                targetFps: 0,
                idleFps: 0,
                particleCount: 0,
                coreDetail: 0,
                glowDetail: 0,
                enableSecondHudLayer: false,
                enableNetwork: false,
                enableParticles: false,
                enablePointerParallax: false,
            } as QualityConfig;
        }

        // SSR Safety
        if (typeof window === "undefined") return base;

        const nav = navigator as Navigator & {
            deviceMemory?: number;
            connection?: { saveData?: boolean };
        };

        const saveData = Boolean(nav.connection?.saveData);
        const memory = nav.deviceMemory ?? 4;
        const cores = navigator.hardwareConcurrency ?? 4;
        const width = window.innerWidth;
        const dpr = window.devicePixelRatio || 1;
        const mobile = width < 768;
        const lowEnd = saveData || memory <= 2 || cores <= 4 || mobile;

        // Low-End Logic
        if (lowEnd) {
            return {
                tier: "low",
                dpr: 1,
                targetFps: 60,
                idleFps: 4,
                particleCount:0,
                coreDetail: 0,
                glowDetail: 0,
                enableSecondHudLayer: false,
                enableNetwork: !mobile,
                enableParticles: false,
                enablePointerParallax: !mobile,
            } as QualityConfig;
        }

        // High-End Logic
        if (width >= 1280 && cores >= 8 && memory >= 8 && dpr <= 2) {
            return {
                tier: "high",
                dpr: [1, 1.2],
                targetFps: 60,
                idleFps: 10,
                particleCount: 0,
                coreDetail: 1,
                glowDetail: 0,
                enableSecondHudLayer: true,
                enableNetwork: true,
                enableParticles: false,
                enablePointerParallax: true,
            } as QualityConfig;
        }

        return base;
    }, [prefersReducedMotion]);
}


function useThemeProgress(stage: SectionStage) {
    const progressRef = useRef<number>(stage);

    useFrame((_, delta) => {
        const frameDelta = safeDelta(delta);
        const smoothing = dampFactor(10.2, frameDelta);

        progressRef.current = lerp(progressRef.current, stage, smoothing);
    }, -101);

    return progressRef;
}

function RenderTicker({
                          running,
                          fps,
                      }: {
    running: boolean;
    fps: number;
}) {
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        if (!running || fps <= 0) return;

        const interval = window.setInterval(() => {
            invalidate();
        }, 1000 / fps);

        invalidate();

        return () => {
            window.clearInterval(interval);
        };
    }, [fps, invalidate, running]);

    return null;
}

const UNIT_BOX_GEOMETRY = new BoxGeometry(1, 1, 1);

function DataBusHud({
                        themeRef,
                        themeProgressRef,
                    }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
}) {
    const packetUpdateRef = useRef(0);
    const groupRef = useRef<Group>(null);
    const primaryLinesRef = useRef<LineSegments>(null);
    const secondaryLinesRef = useRef<LineSegments>(null);
    const packetsRef = useRef<InstancedMesh>(null);

    const routes = useMemo(() => prepareRoutes(createDataBusRoutes()), []);
    const packetInstances = useMemo(() => createPacketInstances(routes), [routes]);

    const packetPositionRef = useRef(new Vector3());

    const primaryPositions = useMemo(
        () => createLineSegmentsFromRoutes(routes.filter((r) => r.color === "primary")),
        [routes],
    );

    const secondaryPositions = useMemo(
        () => createLineSegmentsFromRoutes(routes.filter((r) => r.color === "secondary")),
        [routes],
    );

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;
        const theme = themeRef.current;
        const progress = themeProgressRef.current ?? 0;

        if (!theme) return;

        const primaryMat = primaryLinesRef.current?.material as LineBasicMaterial | undefined;
        const secondaryMat = secondaryLinesRef.current?.material as LineBasicMaterial | undefined;

        if (primaryMat) {
            primaryMat.color.copy(theme.accent);
            primaryMat.opacity = 0.8 + progress * 0.04;
        }

        if (secondaryMat) {
            secondaryMat.color.copy(theme.accent2);
            secondaryMat.opacity = 0.7 + progress * 0.035;
        }

        const packets = packetsRef.current;
        if (!packets) return;

        packetUpdateRef.current += safeDelta(delta);

        if (packetUpdateRef.current >= 1 / 144) {
            packetUpdateRef.current = 0;

            let visibleCount = 0;

            for (let i = 0; i < packetInstances.length; i++) {
                const packet = packetInstances[i];
                const route = routes[packet.routeIndex];

                let burstWave;

                if (route.kind === "main") {
                    burstWave = Math.sin(time * route.speed * 0.55 + packet.burstPhase);
                } else {
                    burstWave = Math.sin(time * route.speed * 0.4 + packet.burstPhase);
                }

                const burst = burstWave > 0.6 ? 1.6 : 1;

                // more packets visible
                if (burstWave < -0.7) continue;

                // faster movement
                const t = time * route.speed * theme.dataSpeed * 1.4 + packet.offset;

                samplePreparedRoute(route, t, packetPositionRef.current);

                INSTANCE_DUMMY.position.copy(packetPositionRef.current);

                const pulse =
                    (0.88 + 0.24 * Math.abs(Math.sin(time * 1.2 + packet.offset * 6.0))) *
                    (burst > 1 ? 1.25 : 1);
                const isPinRoute = route.kind === "pin";

                const baseX =
                    isPinRoute
                        ? 0.04
                        : route.color === "primary"
                            ? 0.085
                            : 0.072;

                const baseY = isPinRoute ? 0.02 : 0.032;
                const baseZ = isPinRoute ? 0.025 : 0.03;

                const scaleMul = packet.scale * pulse;

                INSTANCE_DUMMY.scale.set(
                    baseX * scaleMul,
                    baseY * (0.95 + pulse * 0.08),
                    baseZ,
                );

                INSTANCE_DUMMY.rotation.set(0, 0, 0);
                INSTANCE_DUMMY.updateMatrix();

                packets.setMatrixAt(visibleCount, INSTANCE_DUMMY.matrix);
                visibleCount++;
            }


            packets.count = visibleCount;
            packets.instanceMatrix.needsUpdate = true;
        }

        const mat = packets.material as MeshBasicMaterial;
        mat.color.copy(theme.accent);
        mat.opacity = 0.78;
    });

    return (
        <group ref={groupRef}>
            <lineSegments ref={primaryLinesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[primaryPositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.36}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    linewidth={2}
                />
            </lineSegments>

            <lineSegments ref={secondaryLinesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[secondaryPositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#ff2bd6"
                    transparent
                    opacity={0.28}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    linewidth={2}
                />
            </lineSegments>

            <instancedMesh
                ref={packetsRef}
                args={[undefined, undefined, packetInstances.length]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.78}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </instancedMesh>
        </group>
    );
}


function HudFrames({
                       themeRef,
                       themeProgressRef,
                       quality,
                   }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
}) {
    const groupRef = useRef<Group>(null);
    const linesARef = useRef<LineSegments>(null);
    const linesBRef = useRef<LineSegments>(null);
    const positions = useMemo(() => createStructuredHudPositions(), []);

    useFrame((state, delta) => {
        const frameDelta = safeDelta(delta);
        const theme = themeRef.current;
        const progress = themeProgressRef.current ?? 0;
        const time = state.clock.elapsedTime;

        const matA = linesARef.current?.material as
            | LineBasicMaterial
            | undefined;
        const matB = linesBRef.current?.material as
            | LineBasicMaterial
            | undefined;

        if (matA) {
            matA.color.copy(theme.accent);
            matA.opacity = 0.26 + progress * 0.03;
        }

        if (matB) {
            matB.color.copy(theme.accent2);
            matB.opacity = 0.1 + Math.sin(time * 1.8) * 0.025;
        }

        if (linesBRef.current) {
            linesBRef.current.rotation.z -= frameDelta * (0.05 + theme.dataSpeed * 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            <lineSegments ref={linesARef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.28}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </lineSegments>

            {quality.enableSecondHudLayer && (
                <lineSegments ref={linesBRef} rotation-z={Math.PI / 4} scale={0.72}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[positions, 3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial
                        color="#8b5cf6"
                        transparent
                        opacity={0.12}
                        depthWrite={false}
                        blending={AdditiveBlending}
                    />
                </lineSegments>
            )}
        </group>
    );
}

function CornerPads() {
    const positions: [number, number, number][] = [
        [-0.52, 0.3, 0.1],
        [0.52, 0.3, 0.1],
        [-0.52, -0.3, 0.1],
        [0.52, -0.3, 0.1],
    ];

    return (
        <>
            {positions.map((p, i) => (
                <mesh key={i} position={p} scale={[0.06, 0.06, 0.02]}>
                    <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.8}
                        depthWrite={false}
                        blending={AdditiveBlending}
                    />
                </mesh>
            ))}
        </>
    );
}


function updateBasicMaterial(
    material: MeshBasicMaterial | undefined,
    color: Color,
    opacity: number,
) {
    if (!material) return;

    material.color.copy(color);
    material.opacity = opacity;
}


function ChipCore({
                      themeRef,
                      themeProgressRef,
                      quality,
                  }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
}) {
    const groupRef = useRef<Group>(null);
    const packageRef = useRef<Mesh>(null);
    const packageGlowRef = useRef<Mesh>(null);
    const dieRef = useRef<Mesh>(null);
    const dieGlowRef = useRef<Mesh>(null);
    const scanRef = useRef<Mesh>(null);
    const traceRef = useRef<LineSegments>(null);
    const pinMeshRef = useRef<InstancedMesh>(null);

    const tracePositions = useMemo(() => createChipTracePositions(), []);
    const sidePins = quality.tier === "low" ? 6 : 9;
    const topBottomPins = quality.tier === "low" ? 5 : 7;
    const totalPins = sidePins * 2 + topBottomPins * 2;

    const pinLayout = useMemo(() => {
        const items: { x: number; y: number; z: number; rotation: number }[] = [];

        for (let i = 0; i < sidePins; i++) {
            const y = -0.36 + i * (0.72 / (sidePins - 1));
            items.push({ x: -0.82, y, z: 0.095, rotation: 0 });
            items.push({ x: 0.82, y, z: 0.095, rotation: 0 });
        }

        for (let i = 0; i < topBottomPins; i++) {
            const x = -0.48 + i * (0.96 / (topBottomPins - 1));
            items.push({ x, y: 0.56, z: 0.095, rotation: Math.PI / 2 });
            items.push({ x, y: -0.56, z: 0.095, rotation: Math.PI / 2 });
        }

        return items;
    }, [sidePins, topBottomPins]);

    useEffect(() => {
        const pinMesh = pinMeshRef.current;
        if (!pinMesh) return;

        pinLayout.forEach((pin, index) => {
            INSTANCE_DUMMY.position.set(pin.x, pin.y, pin.z);
            INSTANCE_DUMMY.rotation.set(0, 0, pin.rotation);
            INSTANCE_DUMMY.scale.set(0.14, 0.035, 0.018);
            INSTANCE_DUMMY.updateMatrix();

            pinMesh.setMatrixAt(index, INSTANCE_DUMMY.matrix);
        });

        pinMesh.instanceMatrix.needsUpdate = true;
    }, [pinLayout]);

    useFrame((state, delta) => {
        const frameDelta = safeDelta(delta);
        const time = state.clock.elapsedTime;
        const theme = themeRef.current;
        const progress = themeProgressRef.current ?? 0;

        if (!theme) return;

        const packageMat = packageRef.current?.material as MeshBasicMaterial | undefined;
        const packageGlowMat = packageGlowRef.current?.material as MeshBasicMaterial | undefined;
        const dieMat = dieRef.current?.material as MeshBasicMaterial | undefined;
        const dieGlowMat = dieGlowRef.current?.material as MeshBasicMaterial | undefined;
        const scanMat = scanRef.current?.material as MeshBasicMaterial | undefined;
        const traceMat = traceRef.current?.material as LineBasicMaterial | undefined;

        if (packageMat) {
            packageMat.color.copy(theme.accent);
        }

        if (packageGlowMat) {
            packageGlowMat.color.copy(theme.accent);
            packageGlowMat.opacity = 0.1 + progress * 0.04;
        }

        if (dieMat) {
            dieMat.color.copy(theme.accent);
            dieMat.opacity = 0.22 + progress * 0.03;
        }

        if (dieGlowMat) {
            dieGlowMat.color.copy(theme.accent2);
            dieGlowMat.opacity = 0.18 + Math.sin(time * 1.8) * 0.03;
        }

        if (scanMat) {
            scanMat.color.copy(theme.accent);
            scanMat.opacity = 0.22;
        }

        if (traceMat) {
            traceMat.color.copy(theme.accent);
            traceMat.opacity = 0.5 + progress * 0.05;
        }

        updateBasicMaterial(
            pinMeshRef.current?.material as MeshBasicMaterial | undefined,
            theme.accent2,
            0.68 + Math.sin(time * 1.8) * 0.04,
        );


        if (scanRef.current) {
            scanRef.current.position.x = lerp(
                scanRef.current.position.x,
                Math.sin(time * 1.2) * 0.34,
                frameDelta * 3.2,
            );
        }
    });

    return (
        <group ref={groupRef}>
            {/* soft outer glow */}
            <mesh ref={packageGlowRef} position={[0, 0, -0.01]} scale={[1.9, 1.2, 0.06]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.1}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            {/* chip package */}
            <mesh ref={packageRef} scale={[1.48, 0.92, 0.12]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#0b1220"
                    transparent
                    opacity={0.49}
                    depthWrite={false}
                />
            </mesh>

            {/* subtle package frame */}
            <lineSegments position={[0, 0, 0.135]} scale={[1.56, 1, 1]}>
                <edgesGeometry args={[new BoxGeometry(1, 1, 0.02)]} />
                <lineBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </lineSegments>

            {/* silicon die */}
            <mesh ref={dieRef} position={[0, 0, 0.08]} scale={[0.78, 0.48, 0.05]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.24}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            {/* die glow */}
            <mesh ref={dieGlowRef} position={[0, 0, 0.09]} scale={[0.92, 0.58, 0.02]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ff2bd6"
                    transparent
                    opacity={0.16}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            {/* top traces */}
            <lineSegments ref={traceRef} position={[0, 0, 0.112]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[tracePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.52}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    linewidth={3}
                />
            </lineSegments>

            {/* side pins */}
            <instancedMesh ref={pinMeshRef} args={[undefined, undefined, totalPins]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ff2bd6"
                    transparent
                    opacity={0.72}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </instancedMesh>
            <mesh position={[-0.26, 0.18, 0.101]} scale={[0.18, 0.03, 0.01]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.35}
                    depthWrite={false}
                />
            </mesh>
            <mesh position={[-0.18, 0.12, 0.101]} scale={[0.1, 0.02, 0.01]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.25}
                    depthWrite={false}

                />
            </mesh>

            <CornerPads />
        </group>
    );
}

function SceneContents({
                           stage,
                           quality,
                       }: {
    stage: SectionStage;
    progressRef: NumberRef;
    quality: QualityConfig;
}) {
    const sceneGroupRef = useRef<Group>(null);
    const themeProgressRef = useThemeProgress(stage);
    const themeRef = useRef<RuntimeTheme>(createRuntimeTheme(getTheme(0)));

    useFrame((state) => {
        applyBlendedTheme(themeRef.current, themeProgressRef.current);

        const theme = themeRef.current;
        const group = sceneGroupRef.current;
        if (!group) return;

        const time = state.clock.elapsedTime;

        group.rotation.z = Math.sin(time * 0.35) * 0.035;
        group.rotation.x = Math.sin(time * 0.22) * 0.025;
        group.position.y = Math.sin(time * 0.7) * 0.08;
        group.scale.setScalar(theme.coreScale + Math.sin(time) * 0.025);
    }, -10);
    const { gl } = useThree();

    useEffect(() => {
        gl.setClearAlpha(0);
    }, [gl]);

    return (
        <group ref={sceneGroupRef} position={[0, 0.08, 0]}>
            <DataBusHud themeRef={themeRef} themeProgressRef={themeProgressRef} />
            <ChipCore
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
            />
            <HudFrames
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
            />
        </group>
    );
}

const HERO_CAMERA = { position: [0, 0, 6.4] as [number, number, number], fov: 42 };

export function GeometryHero() {
    const activeSection = useActiveGeometrySection();
    const prefersReducedMotion = useReducedMotion();
    const documentVisible = useDocumentVisible();
    const userActive = useUserActivity();
    const quality = useQualityTier(prefersReducedMotion);

    const { scrollYProgress } = useScroll();

    const smooth = useSpring(scrollYProgress, {
        stiffness: 70,
        damping: 22,
        mass: 0.4,
    });

    const progressRef = useRef<number>(0);

    useMotionValueEvent(smooth, "change", (value) => {
        progressRef.current = value;
    });

    const cssTheme = useMemo(() => getCssTheme(activeSection), [activeSection]);

    const canRenderWebGL =
        quality.tier !== "static" && !prefersReducedMotion && documentVisible;

    const renderRunning = canRenderWebGL && userActive;
    const renderFps = userActive ? quality.targetFps : quality.idleFps;

    const rootStyle = useMemo(
        () =>
            ({
                ...cssTheme,
                contain: "strict",
                isolation: "isolate",
            }) satisfies MotionStyle,
        [cssTheme],
    );

    const glConfig = useMemo(
        () => ({
            antialias: false,
            alpha: true, // ✅ allow transparency
            powerPreference:
                quality.tier === "low"
                    ? ("low-power" as const)
                    : ("high-performance" as const),
            stencil: false,
            depth: false,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
        }),
        [quality.tier],
    );


    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            style={rootStyle}
        >
            {canRenderWebGL && (
                <Canvas
                    frameloop="demand"
                    dpr={1}
                    camera={HERO_CAMERA}
                    gl={glConfig}
                >
                    <RenderTicker running={renderRunning} fps={renderFps} />
                    <SceneContents
                        stage={activeSection}
                        progressRef={progressRef}
                        quality={quality}
                    />
                </Canvas>
            )}
        </motion.div>
    );
}

