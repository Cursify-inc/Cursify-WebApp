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
    Plane,
    Vector2,
} from "three";

import {
    Theme,
    THEME_SEEDS,
    GeometryCssTheme,
    RuntimeTheme,
    useQualityTier,
    type QualityConfig,
    type RouteDirection,
    type Route,
    type PreparedRoute,
    PacketInstance,
    type InteractivePacketInstance,
    PACKET_INTERACTION,
} from "./helper";

type SectionStage = number;
type NumberRef = RefObject<number>;
type ThemeRef = RefObject<RuntimeTheme>;


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

const DATA_BUS_POINTER_PLANE = new Plane(new Vector3(0, 0, 1), -0.15);


function createInteractivePacketInstances(
    routes: PreparedRoute[],
): InteractivePacketInstance[] {
    return createPacketInstances(routes).map((packet) => ({
        ...packet,
        collectedUntil: 0,
        escapeOffset: 0,
        escapeSign: Math.random() > 0.5 ? 1 : -1,
        panic: 10,
    }));
}

function packetDifficulty(collectedCount: number) {
    return 1 - Math.exp(-collectedCount / 22);
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
            count = route.color === "primary" ? 1 : 1;
        } else {
            const r = Math.random() * 1000;

            if (r < 0.18) {
                count = 0;
            } else if (r < 0.7) {
                count = 1
            } else {
                count = 1;
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



type ChipSide = "left" | "right" | "top" | "bottom";
type SignalClass = "memory" | "power" | "io" | "debug" | "control" | "aux";
type RouteColor = "primary" | "secondary";

export type ProceduralPin = {
    id: string;
    side: ChipSide;
    index: number;
    sideIndex: number;
    position: Vector3;
    exit: Vector3;
    signal: SignalClass;
};

export type BoardModuleKind =
    | "memory"
    | "vrm"
    | "connector"
    | "debug"
    | "chiplet"
    | "passive";

export type BoardModuleAnchor = {
    id: string;
    moduleId: string;
    side: ChipSide;
    index: number;
    position: Vector3;
    signal: SignalClass;
};

export type BoardModule = {
    id: string;
    kind: BoardModuleKind;
    signal: SignalClass;
    position: Vector3;
    scale: [number, number, number];
    rotation: number;
    color: RouteColor;
    anchors: BoardModuleAnchor[];
};

type BoardNet = {
    id: string;
    pin: ProceduralPin;
    anchor: BoardModuleAnchor;
    signal: SignalClass;
    color: RouteColor;
    speed: number;
    offset: number;
    direction: RouteDirection;
    priority: number;
};

type ChipPackageModel = {
    bodyHalfW: number;
    bodyHalfH: number;
    bodyDepth: number;
    dieHalfW: number;
    dieHalfH: number;
    sidePins: number;
    topBottomPins: number;
    pinInset: number;
    pinLength: number;
    pinZ: number;
    routeZ: number;
};

export type BoardModel = {
    chip: ChipPackageModel;
    pins: ProceduralPin[];
    modules: BoardModule[];
    anchors: BoardModuleAnchor[];
    nets: BoardNet[];
    routes: Route[];
    complexity: number;
};

export type ProceduralBoardConfig = {
    sidePins: number;
    topBottomPins: number;
    boardHalfW: number;
    boardHalfH: number;
    routeZ: number;
    seed: number;
    maxRoutes: number;
};

export const DEFAULT_BOARD_CONFIG: ProceduralBoardConfig = {
    sidePins: 5,
    topBottomPins: 14,
    boardHalfW: 3.05,
    boardHalfH: 2.05,
    routeZ: 0.0625,
    seed: 1000000000,
    maxRoutes: 440,
};

export const CHIP_PACKAGE: ChipPackageModel = {
    bodyHalfW: 0.76,
    bodyHalfH: 0.46,
    bodyDepth: 0.12,
    dieHalfW: 0.34,
    dieHalfH: 0.2,
    sidePins: DEFAULT_BOARD_CONFIG.sidePins,
    topBottomPins: DEFAULT_BOARD_CONFIG.topBottomPins,
    pinInset: 0.085,
    pinLength: 0.28,
    pinZ: 0.06,
    routeZ: DEFAULT_BOARD_CONFIG.routeZ,
};

export function scrollBoardDensity(progress: number) {
    const t = clamp(progress, 0, 1);
    return Math.pow(t, 1.65);
}

export function quantizeBoardDensity(density: number) {
    // Prevents rebuilding on every micro-scroll.
    return Math.round(clamp(density, 0, 1) * 20) / 20;
}


function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function scrollBoardScale(progress: number) {
    const t = clamp(progress, 0, 1);

    // Top of page = compact board, bottom = larger board.
    return lerp(0.5, 20, easeOutCubic(t));
}

export function quantizeBoardScale(scale: number) {
    // Prevents rebuilding board geometry on every tiny scroll delta.
    return Math.round(scale * 40) / 40;
}

function boardComplexityFromScale(boardScale: number) {
    return clamp((boardScale - 0.5) / 1.5, 0, 1);
}

function boardComplexityFromDensity(boardDensity: number) {
    const d = clamp(boardDensity, 0, 1);

    // Nonlinear: final 25% of progression adds a lot of electronic density.
    return clamp(d * 0.75 + d * d * 0.55, 0, 1);
}

function scaledPinCount(
    baseCount: number,
    complexity: number,
    minCount: number,
    maxCount: number,
) {
    const t = easeOutCubic(clamp(complexity, 0, 1));
    const multiplier = lerp(0.65, 2.15, t);
    return Math.round(clamp(baseCount * multiplier, minCount, maxCount));
}


function scaledRouteBudget(
    quality: QualityConfig | undefined,
    config: ProceduralBoardConfig,
    complexity: number,
) {
    const t = easeOutCubic(clamp(complexity, 0, 1));

    if (quality?.tier === "static") {
        return Math.round(lerp(10, 28, t));
    }

    if (quality?.tier === "low") {
        return Math.round(lerp(18, 96, t));
    }

    if (quality?.tier === "high") {
        return Math.round(lerp(120, config.maxRoutes, t));
    }

    // medium/default
    return Math.round(lerp(36, Math.min(config.maxRoutes, 220), t));
}

function createScaledBoardConfig(
    baseConfig: ProceduralBoardConfig,
    boardScale: number,
    boardDensity = 0,
): ProceduralBoardConfig {
    // Let scrollBoardScale's actual range participate.
    const safeScale = clamp(boardScale, 0.5, 2.0);

    const scaleComplexity = boardComplexityFromScale(safeScale);
    const densityComplexity = boardComplexityFromDensity(boardDensity);

    // Density should dominate visual electronics.
    const complexity = clamp(
        scaleComplexity * 0.35 + densityComplexity * 0.9,
        0,
        1,
    );

    return {
        ...baseConfig,

        boardHalfW: DEFAULT_BOARD_CONFIG.boardHalfW * safeScale,
        boardHalfH: DEFAULT_BOARD_CONFIG.boardHalfH * safeScale,

        sidePins: scaledPinCount(
            baseConfig.sidePins,
            complexity,
            8,
            42,
        ),

        topBottomPins: scaledPinCount(
            baseConfig.topBottomPins,
            complexity,
            20,
            120,
        ),

        maxRoutes: Math.round(
            lerp(
                Math.min(baseConfig.maxRoutes, 80),
                baseConfig.maxRoutes,
                easeOutCubic(complexity),
            ),
        ),

        routeZ: baseConfig.routeZ,
    };
}



function createScaledChipPackage(
    quality: QualityConfig | undefined,
    config: ProceduralBoardConfig,
    boardScale: number,
    boardDensity = 0,
): ChipPackageModel {
    const safeScale = clamp(boardScale, 0.5, 2.0);

    const scaleComplexity = boardComplexityFromScale(safeScale);
    const densityComplexity = boardComplexityFromDensity(boardDensity);

    const complexity = clamp(
        scaleComplexity * 0.3 + densityComplexity * 0.9,
        0,
        1,
    );

    // Chip grows mildly. Density mainly increases pins, not chip size.
    const chipScale = lerp(0.86, 1.16, scaleComplexity);

    const qualitySide = qualitySidePins(quality);
    const qualityTopBottom = qualityTopBottomPins(quality);

    return {
        ...CHIP_PACKAGE,

        bodyHalfW: CHIP_PACKAGE.bodyHalfW * chipScale,
        bodyHalfH: CHIP_PACKAGE.bodyHalfH * chipScale,
        dieHalfW: CHIP_PACKAGE.dieHalfW * chipScale,
        dieHalfH: CHIP_PACKAGE.dieHalfH * chipScale,

        sidePins: scaledPinCount(
            Math.max(qualitySide, config.sidePins),
            complexity,
            Math.min(qualitySide, 8),
            Math.max(config.sidePins, qualitySide, 42),
        ),

        topBottomPins: scaledPinCount(
            Math.max(qualityTopBottom, config.topBottomPins),
            complexity,
            Math.min(qualityTopBottom, 20),
            Math.max(config.topBottomPins, qualityTopBottom, 120),
        ),

        pinInset: CHIP_PACKAGE.pinInset,
        pinLength: CHIP_PACKAGE.pinLength,
        pinZ: CHIP_PACKAGE.pinZ,
        routeZ: config.routeZ,
    };
}




const BOARD_MODEL_CACHE = new Map<string, BoardModel>();

function qualitySidePins(quality?: QualityConfig): number {
    return Math.max(5, quality?.sidePins ?? DEFAULT_BOARD_CONFIG.sidePins);
}

function qualityTopBottomPins(quality?: QualityConfig): number {
    return Math.max(5, quality?.topBottomPins ?? DEFAULT_BOARD_CONFIG.topBottomPins);
}

function modelCacheKey(
    quality?: QualityConfig,
    config: ProceduralBoardConfig & {
        moduleComplexity?: number;
        boardScale?: number;
        boardDensity?: number;
    } = DEFAULT_BOARD_CONFIG,
): string {
    return [
        quality?.tier ?? "default",
        qualitySidePins(quality),
        qualityTopBottomPins(quality),
        config.boardHalfW,
        config.boardHalfH,
        config.sidePins,
        config.topBottomPins,
        config.routeZ,
        config.seed,
        config.maxRoutes,
        config.moduleComplexity ?? 0,
        config.boardScale ?? 1,
        config.boardDensity ?? 0,
    ].join(":");
}


function sideAxis(side: ChipSide): "x" | "y" {
    return side === "left" || side === "right" ? "y" : "x";
}

function sideSign(side: ChipSide): -1 | 1 {
    return side === "left" || side === "bottom" ? -1 : 1;
}

function signalForPin(side: ChipSide, index: number, count: number): SignalClass {
    if (side === "top") return "memory";
    if (side === "left") return index < Math.ceil(count * 0.7) ? "power" : "control";
    if (side === "right") return "io";
    return index < Math.ceil(count * 0.65) ? "debug" : "aux";
}

function routeColorForSignal(signal: SignalClass): RouteColor {
    return signal === "memory" || signal === "io" ? "primary" : "secondary";
}

function routeDirectionForSignal(signal: SignalClass): RouteDirection {
    if (signal === "power") return "toCpu";
    if (signal === "debug" || signal === "control") return "bidirectional";
    return "fromCpu";
}

function routeSpeedForSignal(signal: SignalClass): number {
    if (signal === "memory") return 0.46;
    if (signal === "io") return 0.38;
    if (signal === "power") return 0.18;
    if (signal === "debug") return 0.25;
    return 0.3;
}

function createCanonicalChipPins(chip: ChipPackageModel): ProceduralPin[] {
    const pins: ProceduralPin[] = [];
    const z = chip.routeZ;

    const addSidePins = (side: ChipSide, count: number) => {
        const horizontal = side === "top" || side === "bottom";
        const sign = sideSign(side);

        for (let index = 0; index < count; index += 1) {
            const t = count <= 1 ? 0.5 : index / (count - 1);
            const centered = t - 0.5;
            const x = horizontal
                ? centered * chip.bodyHalfW * 1.62
                : sign * (chip.bodyHalfW + chip.pinInset);
            const y = horizontal
                ? sign * (chip.bodyHalfH + chip.pinInset)
                : centered * chip.bodyHalfH * 1.62;

            const exit = horizontal
                ? new Vector3(x, sign * (chip.bodyHalfH + chip.pinLength), z)
                : new Vector3(sign * (chip.bodyHalfW + chip.pinLength), y, z);

            pins.push({
                id: `cpu-${side}-${index}`,
                side,
                index: pins.length,
                sideIndex: index,
                position: new Vector3(x, y, z),
                exit,
                signal: signalForPin(side, index, count),
            });
        }
    };

    addSidePins("left", chip.sidePins);
    addSidePins("right", chip.sidePins);
    addSidePins("top", chip.topBottomPins);
    addSidePins("bottom", chip.topBottomPins);

    return pins;
}

function createAnchor(
    moduleId: string,
    side: ChipSide,
    index: number,
    count: number,
    center: Vector3,
    scale: [number, number, number],
    signal: SignalClass,
): BoardModuleAnchor {
    const [w, h] = scale;
    const t = count <= 1 ? 0.5 : index / (count - 1);
    const centered = t - 0.5;

    const x =
        side === "left" ? center.x - w * 0.5 :
            side === "right" ? center.x + w * 0.5 :
                center.x + centered * w * 0.72;

    const y =
        side === "bottom" ? center.y - h * 0.5 :
            side === "top" ? center.y + h * 0.5 :
                center.y + centered * h * 0.72;

    return {
        id: `${moduleId}-a-${index}`,
        moduleId,
        side,
        index,
        position: new Vector3(x, y, DEFAULT_BOARD_CONFIG.routeZ),
        signal,
    };
}

// -----------------------------------------------------------------------------
// Procedural Board Module Synthesis Pipeline
// -----------------------------------------------------------------------------
//
// Architecture:
// 1. Semantic templates describe reusable electrical/visual behavior.
// 2. Module specs describe normalized board-relative placement.
// 3. Expansion layer supports mirroring, deterministic variation, and profiles.
// 4. Physical resolver converts normalized specs into BoardModule instances.
// 5. Validation catches bad anchors, invalid dimensions, and basic overlaps.
//
// This keeps the final BoardModule[] compatible with your current renderer/router.
// -----------------------------------------------------------------------------

type ModuleVec3Tuple = [number, number, number];

type BoardLayoutProfile =
    | "minimal"
    | "balanced"
    | "dense"
    | "server"
    | "extreme";

type AnchorLayoutKind =
    | "uniform"
    | "clustered"
    | "staggered"
    | "dual-row";

type ModuleZLayer =
    | "module"
    | "passive"
    | "low"
    | "raised"
    | number;

type ModuleTemplate = {
    kind: BoardModuleKind;
    signal: SignalClass;
    color: RouteColor;
    anchorSide: ChipSide;
    anchorCount: number;
    anchorLayout?: AnchorLayoutKind;
    depth: number;
};


type SemanticModuleSpec = {
    id: string;
    template: ModuleTemplateKey;

    /**
     * Normalized board position.
     * -1..1 approximately maps to the board area.
     */
    x: number;
    y: number;

    width: number;
    height: number;

    kind?: BoardModuleKind;
    signal?: SignalClass;
    color?: RouteColor;
    anchorSide?: ChipSide;
    anchorCount?: number;
    anchorLayout?: AnchorLayoutKind;
    depth?: number;
    rotation?: number;
    z?: ModuleZLayer;

    variation?: {
        positionJitter?: number;
        rotationJitter?: number;
        scaleJitter?: number;
        anchorCountJitter?: number;
    };

    tags?: string[];
};

type ExpandedModuleSpec = {
    id: string;
    template: ModuleTemplateKey;

    x: number;
    y: number;

    width: number;
    height: number;
    depth: number;

    kind: BoardModuleKind;
    signal: SignalClass;
    color: RouteColor;

    anchorSide: ChipSide;
    anchorCount: number;
    anchorLayout: AnchorLayoutKind;

    rotation: number;
    z: ModuleZLayer;

    tags: string[];
};

type SemanticBoardModuleOptions = {
    boardScale?: number;
    boardDensity?: number;
    complexity?: number;
    seed?: number;
    profile?: BoardLayoutProfile;
    validate?: boolean;
};


type ModuleTemplateKey =
    | "memory"
    | "vrm"
    | "connector"
    | "debug"
    | "chiplet"
    | "passive"
    | "sensor"
    | "clock"
    | "storage"
    | "rf"
    | "power-filter"
    | "micro-connector";

type ModuleFactoryOptions = {
    id: string;
    kind: BoardModuleKind;
    signal: SignalClass;
    position: Vector3;
    scale: ModuleVec3Tuple;
    anchorSide: ChipSide;
    anchorCount: number;
    color: RouteColor;
    rotation?: number;
    anchorLayout?: AnchorLayoutKind;
};

type BoardSynthesisContext = {
    config: ProceduralBoardConfig;
    chip: ChipPackageModel;

    boardScale: number;
    boardDensity: number;
    complexity: number;
    profile: BoardLayoutProfile;
    seed: number;

    boardScaleX: number;
    boardScaleY: number;
    moduleScale: number;

    moduleZ: number;
    passiveZ: number;
    lowZ: number;
    raisedZ: number;

    rng: DeterministicRandom;

    position: (xRatio: number, yRatio: number, z?: number) => Vector3;

    size: (
        width: number,
        height: number,
        depth: number,
    ) => ModuleVec3Tuple;

    resolveZ: (layer?: ModuleZLayer) => number;
};

// -----------------------------------------------------------------------------
// Deterministic Random Utility
// -----------------------------------------------------------------------------
class DeterministicRandom {
    private state: number;

    constructor(seed = 1337) {
        this.state = seed >>> 0;
    }

    next(): number {
        this.state += 0x6d2b79f5;

        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    range(min: number, max: number): number {
        return min + (max - min) * this.next();
    }

    int(min: number, max: number): number {
        return Math.floor(this.range(min, max + 1));
    }

    signed(amount: number): number {
        return this.range(-amount, amount);
    }
}

// -----------------------------------------------------------------------------
// Templates
// -----------------------------------------------------------------------------

const MODULE_TEMPLATES: Record<ModuleTemplateKey, ModuleTemplate> = {
    memory: {
        kind: "memory",
        signal: "memory",
        color: "primary",
        anchorSide: "bottom",
        anchorCount: 5,
        anchorLayout: "uniform",
        depth: 0.08,
    },

    vrm: {
        kind: "vrm",
        signal: "power",
        color: "secondary",
        anchorSide: "right",
        anchorCount: 5,
        anchorLayout: "clustered",
        depth: 0.09,
    },

    connector: {
        kind: "connector",
        signal: "io",
        color: "primary",
        anchorSide: "left",
        anchorCount: 8,
        anchorLayout: "uniform",
        depth: 0.08,
    },

    debug: {
        kind: "debug",
        signal: "debug",
        color: "secondary",
        anchorSide: "top",
        anchorCount: 5,
        anchorLayout: "uniform",
        depth: 0.07,
    },

    chiplet: {
        kind: "chiplet",
        signal: "aux",
        color: "secondary",
        anchorSide: "top",
        anchorCount: 4,
        anchorLayout: "uniform",
        depth: 0.08,
    },

    passive: {
        kind: "passive",
        signal: "control",
        color: "secondary",
        anchorSide: "right",
        anchorCount: 3,
        anchorLayout: "clustered",
        depth: 0.05,
    },

    sensor: {
        kind: "chiplet",
        signal: "aux",
        color: "secondary",
        anchorSide: "bottom",
        anchorCount: 3,
        anchorLayout: "uniform",
        depth: 0.055,
    },

    clock: {
        kind: "passive",
        signal: "control",
        color: "primary",
        anchorSide: "left",
        anchorCount: 2,
        anchorLayout: "uniform",
        depth: 0.045,
    },

    storage: {
        kind: "memory",
        signal: "memory",
        color: "secondary",
        anchorSide: "bottom",
        anchorCount: 4,
        anchorLayout: "uniform",
        depth: 0.075,
    },

    rf: {
        kind: "chiplet",
        signal: "io",
        color: "primary",
        anchorSide: "left",
        anchorCount: 4,
        anchorLayout: "clustered",
        depth: 0.06,
    },

    "power-filter": {
        kind: "passive",
        signal: "power",
        color: "secondary",
        anchorSide: "right",
        anchorCount: 3,
        anchorLayout: "clustered",
        depth: 0.045,
    },

    "micro-connector": {
        kind: "connector",
        signal: "io",
        color: "secondary",
        anchorSide: "top",
        anchorCount: 4,
        anchorLayout: "uniform",
        depth: 0.055,
    },
};


// -----------------------------------------------------------------------------
// Context / Scaling
// -----------------------------------------------------------------------------

function createBoardSynthesisContext(
    config: ProceduralBoardConfig,
    chip: ChipPackageModel,
    options: Required<SemanticBoardModuleOptions>,
): BoardSynthesisContext {
    const boardScaleX =
        config.boardHalfW / DEFAULT_BOARD_CONFIG.boardHalfW;

    const boardScaleY =
        config.boardHalfH / DEFAULT_BOARD_CONFIG.boardHalfH;

    const moduleScale = (boardScaleX + boardScaleY) * 0.5;

    const moduleZ = config.routeZ * 0.435;
    const passiveZ = config.routeZ * 0.38;
    const lowZ = config.routeZ * 0.32;
    const raisedZ = config.routeZ * 0.49;

    const position = (xRatio: number, yRatio: number, z = moduleZ) =>
        new Vector3(
            config.boardHalfW * xRatio,
            config.boardHalfH * yRatio,
            z,
        );

    const size = (
        width: number,
        height: number,
        depth: number,
    ): ModuleVec3Tuple => [
        width * boardScaleX,
        height * boardScaleY,
        depth * moduleScale,
    ];

    const resolveZ = (layer: ModuleZLayer = "module") => {
        if (typeof layer === "number") return layer;

        switch (layer) {
            case "module":
                return moduleZ;
            case "passive":
                return passiveZ;
            case "low":
                return lowZ;
            case "raised":
                return raisedZ;
            default:
                return moduleZ;
        }
    };

    return {
        config,
        chip,

        boardScale: options.boardScale,
        boardDensity: options.boardDensity,
        complexity: options.complexity,
        profile: options.profile,
        seed: options.seed,

        boardScaleX,
        boardScaleY,
        moduleScale,

        moduleZ,
        passiveZ,
        lowZ,
        raisedZ,

        rng: new DeterministicRandom(options.seed),

        position,
        size,
        resolveZ,
    };
}

function profileFromBoardScale(
    boardScale: number,
    complexity: number,
    boardDensity = complexity,
): BoardLayoutProfile {
    const s = boardComplexityFromScale(boardScale);
    const d = clamp(boardDensity, 0, 1);

    const score = clamp(s * 0.35 + d * 0.85, 0, 1);

    if (score < 0.18) return "minimal";
    if (score < 0.42) return "balanced";
    if (score < 0.66) return "dense";
    if (score < 0.86) return "server";
    return "extreme";
}



// -----------------------------------------------------------------------------
// Declarative Board Profiles
// -----------------------------------------------------------------------------

function createMinimalSpecs(): SemanticModuleSpec[] {
    return [
        {
            id: "mem-a",
            template: "memory",
            x: -0.24,
            y: 0.65,
            width: 0.78,
            height: 0.22,
            anchorCount: 4,
        },
        {
            id: "vrm-a",
            template: "vrm",
            x: -0.58,
            y: 0.02,
            width: 0.28,
            height: 0.74,
            anchorCount: 4,
        },
        {
            id: "io-main",
            template: "connector",
            x: 0.61,
            y: 0.04,
            width: 0.32,
            height: 1.08,
            anchorCount: 6,
        },
        {
            id: "debug",
            template: "debug",
            x: -0.14,
            y: -0.65,
            width: 0.72,
            height: 0.2,
            anchorCount: 4,
        },
        {
            id: "caps-left",
            template: "passive",
            x: -0.38,
            y: -0.5,
            width: 0.42,
            height: 0.14,
            z: "passive",
            rotation: 0.08,
            anchorCount: 3,
        },
    ];
}

function createBalancedSpecs(): SemanticModuleSpec[] {
    return [
        {
            id: "mem-a",
            template: "memory",
            x: -0.24,
            y: 0.65,
            width: 0.78,
            height: 0.22,
            anchorCount: 5,
        },
        {
            id: "mem-b",
            template: "memory",
            x: 0.24,
            y: 0.65,
            width: 0.78,
            height: 0.22,
            anchorCount: 5,
        },
        {
            id: "vrm-a",
            template: "vrm",
            x: -0.58,
            y: 0.17,
            width: 0.28,
            height: 0.66,
            anchorCount: 5,
        },
        {
            id: "vrm-b",
            template: "vrm",
            x: -0.58,
            y: -0.25,
            width: 0.28,
            height: 0.5,
            anchorCount: 4,
        },
        {
            id: "io-main",
            template: "connector",
            x: 0.61,
            y: 0.04,
            width: 0.32,
            height: 1.24,
            anchorCount: 8,
        },
        {
            id: "debug",
            template: "debug",
            x: -0.14,
            y: -0.65,
            width: 0.86,
            height: 0.22,
            anchorCount: 5,
        },
        {
            id: "aux",
            template: "chiplet",
            x: 0.27,
            y: -0.59,
            width: 0.58,
            height: 0.3,
            anchorCount: 4,
        },
        {
            id: "caps-left",
            template: "passive",
            x: -0.38,
            y: -0.5,
            width: 0.48,
            height: 0.16,
            z: "passive",
            rotation: 0.08,
            anchorCount: 3,
        },
    ];
}

function createComplexityExpansionSpecs(
    ctx: BoardSynthesisContext,
): SemanticModuleSpec[] {
    const specs: SemanticModuleSpec[] = [];

    const tier = Math.floor(clamp(ctx.complexity, 0, 1) * 6);

    if (tier >= 2) {
        specs.push(
            {
                id: "clock-a",
                template: "clock",
                x: -0.06,
                y: 0.36,
                width: 0.22,
                height: 0.14,
                z: "passive",
                variation: {
                    rotationJitter: 0.025,
                },
            },
            {
                id: "sensor-a",
                template: "sensor",
                x: 0.5,
                y: -0.38,
                width: 0.26,
                height: 0.16,
                z: "passive",
                anchorSide: "left",
                variation: {
                    rotationJitter: 0.035,
                },
            },
        );
    }

    if (tier >= 3) {
        specs.push(
            {
                id: "storage-a",
                template: "storage",
                x: 0.52,
                y: 0.47,
                width: 0.42,
                height: 0.2,
                anchorCount: 4,
            },
            {
                id: "rf-a",
                template: "rf",
                x: 0.46,
                y: -0.14,
                width: 0.3,
                height: 0.22,
                anchorSide: "left",
                anchorCount: 4,
                z: "module",
            },
            {
                id: "caps-right",
                template: "power-filter",
                x: 0.12,
                y: -0.42,
                width: 0.34,
                height: 0.12,
                z: "passive",
                rotation: -0.06,
            },
        );
    }

    if (tier >= 4) {
        specs.push(
            {
                id: "mem-c",
                template: "memory",
                x: -0.52,
                y: 0.42,
                width: 0.5,
                height: 0.18,
                anchorSide: "bottom",
                anchorCount: 4,
            },
            {
                id: "mem-d",
                template: "memory",
                x: 0.52,
                y: 0.42,
                width: 0.5,
                height: 0.18,
                anchorSide: "bottom",
                anchorCount: 4,
            },
            {
                id: "vrm-c",
                template: "vrm",
                x: -0.72,
                y: 0.02,
                width: 0.2,
                height: 0.46,
                anchorSide: "right",
                anchorCount: 4,
            },
            {
                id: "micro-io-a",
                template: "micro-connector",
                x: 0.13,
                y: -0.78,
                width: 0.36,
                height: 0.14,
                anchorSide: "top",
                anchorCount: 4,
                z: "raised",
            },
        );
    }

    if (tier >= 5) {
        specs.push(
            {
                id: "aux-b",
                template: "chiplet",
                x: 0.05,
                y: -0.18,
                width: 0.28,
                height: 0.22,
                anchorSide: "bottom",
                anchorCount: 4,
                z: "module",
                variation: {
                    rotationJitter: 0.03,
                },
            },
            {
                id: "sensor-b",
                template: "sensor",
                x: -0.42,
                y: 0.38,
                width: 0.24,
                height: 0.14,
                z: "passive",
                anchorSide: "right",
            },
            {
                id: "filter-bank-a",
                template: "power-filter",
                x: -0.24,
                y: -0.33,
                width: 0.32,
                height: 0.12,
                z: "passive",
                rotation: 0.04,
            },
            {
                id: "filter-bank-b",
                template: "power-filter",
                x: 0.32,
                y: 0.25,
                width: 0.32,
                height: 0.12,
                z: "passive",
                rotation: -0.04,
                anchorSide: "left",
            },
        );
    }

    return specs;
}

function createDensityDetailSpecs(
    ctx: BoardSynthesisContext,
): SemanticModuleSpec[] {
    const specs: SemanticModuleSpec[] = [];

    const d = clamp(ctx.boardDensity, 0, 1);

    if (d < 0.18) {
        return specs;
    }

    const count =
        d < 0.35 ? 4 :
            d < 0.55 ? 8 :
                d < 0.75 ? 14 :
                    d < 0.9 ? 22 :
                        32;

    const templates: ModuleTemplateKey[] = [
        "passive",
        "power-filter",
        "clock",
        "sensor",
        "micro-connector",
    ];

    for (let i = 0; i < count; i += 1) {
        const template = templates[i % templates.length];

        // Avoid central chip area roughly.
        let x = ctx.rng.range(-0.86, 0.86);
        let y = ctx.rng.range(-0.82, 0.82);

        const nearChip =
            Math.abs(x) < 0.32 &&
            Math.abs(y) < 0.28;

        if (nearChip) {
            x += x >= 0 ? 0.34 : -0.34;
            y += y >= 0 ? 0.22 : -0.22;
        }

        const tiny = template === "clock" || template === "sensor";

        specs.push({
            id: `density-detail-${i}`,
            template,
            x,
            y,
            width: tiny
                ? ctx.rng.range(0.12, 0.24)
                : ctx.rng.range(0.18, 0.38),
            height: tiny
                ? ctx.rng.range(0.08, 0.16)
                : ctx.rng.range(0.08, 0.18),
            z: template === "micro-connector" ? "raised" : "passive",
            rotation: ctx.rng.range(-0.12, 0.12),
            anchorCount: ctx.rng.int(1, d > 0.7 ? 4 : 3),
            anchorSide: (["left", "right", "top", "bottom"] as ChipSide[])[
                ctx.rng.int(0, 3)
                ],
            variation: {
                positionJitter: 0.018,
                rotationJitter: 0.04,
                scaleJitter: 0.12,
            },
            tags: ["density-detail"],
        });
    }

    return specs;
}


function createSemanticSpecsForProfile(
    profile: BoardLayoutProfile,
): SemanticModuleSpec[] {
    switch (profile) {
        case "minimal":
            return createMinimalSpecs();

        case "balanced":
            return createBalancedSpecs();

        case "dense":
            return [
                ...createBalancedSpecs(),
                {
                    id: "dense-aux-a",
                    template: "chiplet",
                    x: 0.16,
                    y: -0.28,
                    width: 0.32,
                    height: 0.22,
                    anchorCount: 4,
                },
            ];

        case "server":
            return [
                ...createBalancedSpecs(),
                {
                    id: "server-vrm-right",
                    template: "vrm",
                    x: 0.72,
                    y: 0.25,
                    width: 0.22,
                    height: 0.48,
                    anchorSide: "left",
                    anchorCount: 5,
                },
                {
                    id: "server-io-bottom",
                    template: "connector",
                    x: 0.38,
                    y: -0.76,
                    width: 0.62,
                    height: 0.16,
                    anchorSide: "top",
                    anchorCount: 7,
                },
            ];

        case "extreme":
            return [
                ...createBalancedSpecs(),
                {
                    id: "extreme-vrm-right-a",
                    template: "vrm",
                    x: 0.72,
                    y: 0.26,
                    width: 0.22,
                    height: 0.46,
                    anchorSide: "left",
                    anchorCount: 5,
                },
                {
                    id: "extreme-vrm-right-b",
                    template: "vrm",
                    x: 0.72,
                    y: -0.24,
                    width: 0.22,
                    height: 0.42,
                    anchorSide: "left",
                    anchorCount: 4,
                },
                {
                    id: "extreme-io-bottom",
                    template: "connector",
                    x: 0.36,
                    y: -0.78,
                    width: 0.68,
                    height: 0.16,
                    anchorSide: "top",
                    anchorCount: 8,
                    z: "raised",
                },
            ];

        default:
            return createBalancedSpecs();
    }
}


// -----------------------------------------------------------------------------
// Spec Expansion
// -----------------------------------------------------------------------------

function expandModuleSpec(
    spec: SemanticModuleSpec,
    ctx: BoardSynthesisContext,
): ExpandedModuleSpec {
    const template = MODULE_TEMPLATES[spec.template];

    let x = spec.x;
    let y = spec.y;
    let width = spec.width;
    let height = spec.height;
    let rotation = spec.rotation ?? 0;
    let anchorCount = spec.anchorCount ?? template.anchorCount;

    const variation = spec.variation;

    if (variation?.positionJitter) {
        x += ctx.rng.signed(variation.positionJitter);
        y += ctx.rng.signed(variation.positionJitter);
    }

    if (variation?.rotationJitter) {
        rotation += ctx.rng.signed(variation.rotationJitter);
    }

    if (variation?.scaleJitter) {
        const scaleNoise = 1 + ctx.rng.signed(variation.scaleJitter);
        width *= scaleNoise;
        height *= scaleNoise;
    }

    if (variation?.anchorCountJitter) {
        anchorCount += ctx.rng.int(
            -variation.anchorCountJitter,
            variation.anchorCountJitter,
        );
    }
    const densityAnchorBoost =
        1 + clamp(ctx.boardDensity, 0, 1) * 0.9;

    anchorCount *= densityAnchorBoost;
    anchorCount = Math.max(1, Math.round(anchorCount));

    return {
        id: spec.id,
        template: spec.template,

        x,
        y,

        width,
        height,
        depth: spec.depth ?? template.depth,

        kind: spec.kind ?? template.kind,
        signal: spec.signal ?? template.signal,
        color: spec.color ?? template.color,

        anchorSide: spec.anchorSide ?? template.anchorSide,
        anchorCount,
        anchorLayout:
            spec.anchorLayout ??
            template.anchorLayout ??
            "uniform",

        rotation,
        z: spec.z ?? "module",

        tags: spec.tags ?? [],
    };
}

function expandSemanticSpecs(
    specs: SemanticModuleSpec[],
    ctx: BoardSynthesisContext,
): ExpandedModuleSpec[] {
    return specs.map((spec) => expandModuleSpec(spec, ctx));
}

function createModule(options: ModuleFactoryOptions): BoardModule {
    const {
        id,
        kind,
        signal,
        position,
        scale,
        anchorSide,
        anchorCount,
        color,
        rotation = 0,
    } = options;

    const anchors = Array.from({ length: anchorCount }, (_, index) =>
        createAnchor(
            id,
            anchorSide,
            index,
            anchorCount,
            position,
            scale,
            signal,
        ),
    );

    return {
        id,
        kind,
        signal,
        position,
        scale,
        rotation,
        color,
        anchors,
    };
}

function resolvePhysicalModule(
    spec: ExpandedModuleSpec,
    ctx: BoardSynthesisContext,
): BoardModule {
    const z = ctx.resolveZ(spec.z);

    return createModule({
        id: spec.id,
        kind: spec.kind,
        signal: spec.signal,
        position: ctx.position(spec.x, spec.y, z),
        scale: ctx.size(spec.width, spec.height, spec.depth),
        anchorSide: spec.anchorSide,
        anchorCount: spec.anchorCount,
        color: spec.color,
        rotation: spec.rotation,
        anchorLayout: spec.anchorLayout,
    });
}

// -----------------------------------------------------------------------------
// Geometry
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Anchor Layout Hook
// -----------------------------------------------------------------------------
//
// This keeps compatibility with your current createAnchor() API.
// The layout parameter is currently used as metadata/hook point.
// If you want true clustered/staggered anchors, the next step is to update
// createAnchor() or introduce createAnchorWithLayout().
//


// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------
function validateExpandedSpecs(specs: ExpandedModuleSpec[]): void {
    const ids = new Set<string>();

    for (const spec of specs) {
        if (ids.has(spec.id)) {
            throw new Error(`Duplicate module id "${spec.id}".`);
        }

        ids.add(spec.id);

        if (spec.width <= 0 || spec.height <= 0 || spec.depth <= 0) {
            throw new Error(
                `Module "${spec.id}" has invalid dimensions: ` +
                `${spec.width} x ${spec.height} x ${spec.depth}.`,
            );
        }// -----------------------------------------------------------------------------
// Physical Resolver
// -----------------------------------------------------------------------------

        if (spec.anchorCount < 1) {
            throw new Error(
                `Module "${spec.id}" must have at least one anchor.`,
            );
        }

        if (Math.abs(spec.x) > 1.35 || Math.abs(spec.y) > 1.35) {
            throw new Error(
                `Module "${spec.id}" is outside normalized board bounds.`,
            );
        }
    }
}

// -----------------------------------------------------------------------------
// Main Public API
// -----------------------------------------------------------------------------

export function createSemanticBoardModules(
    config: ProceduralBoardConfig = DEFAULT_BOARD_CONFIG,
    chip: ChipPackageModel = CHIP_PACKAGE,
    options: SemanticBoardModuleOptions = {},
): BoardModule[] {
    const boardScale = options.boardScale ?? 1;
    const boardDensity = options.boardDensity ?? boardComplexityFromScale(boardScale);

    const complexity =
        options.complexity ??
        clamp(
            boardComplexityFromScale(boardScale) * 0.35 +
            boardComplexityFromDensity(boardDensity) * 1.15,
            0,
            1,
        );

    const profile =
        options.profile ??
        profileFromBoardScale(boardScale, complexity, boardDensity);

    const seed =
        options.seed ??
        config.seed ??
        1337;

    const validate = options.validate ?? true;

    const normalizedOptions: Required<SemanticBoardModuleOptions> = {
        boardScale,
        boardDensity,
        complexity,
        seed,
        profile,
        validate,
    };


    const ctx = createBoardSynthesisContext(
        config,
        chip,
        normalizedOptions,
    );

    const profileSpecs = createSemanticSpecsForProfile(profile);
    const expansionSpecs = createComplexityExpansionSpecs(ctx);
    const densitySpecs = createDensityDetailSpecs(ctx);

    const semanticSpecs = [
        ...profileSpecs,
        ...expansionSpecs,
        ...densitySpecs,
    ];


    const expandedSpecs = expandSemanticSpecs(semanticSpecs, ctx);

    if (validate) {
        validateExpandedSpecs(expandedSpecs);
    }

    return expandedSpecs.map((spec) =>
        resolvePhysicalModule(spec, ctx),
    );
}

function anchorCompatibility(pin: ProceduralPin, anchor: BoardModuleAnchor): number {
    if (pin.signal === anchor.signal) return 0;
    if (pin.signal === "control" && anchor.signal === "power") return 1;
    if (pin.signal === "aux" && anchor.signal === "debug") return 1;
    return 10;
}

function createDeterministicNets(pins: ProceduralPin[], modules: BoardModule[]): BoardNet[] {
    const anchors = modules.flatMap((module) => module.anchors);
    const usage = new Map<string, number>();

    return pins
        .map((pin, index) => {
            const compatible = anchors
                .map((anchor) => ({
                    anchor,
                    score:
                        anchorCompatibility(pin, anchor) * 1000 +
                        Math.abs(anchor.index - pin.sideIndex) * 4 +
                        pin.exit.distanceTo(anchor.position),
                }))
                .filter((entry) => entry.score < 9000)
                .sort((a, b) => {
                    const usageA = usage.get(a.anchor.id) ?? 0;
                    const usageB = usage.get(b.anchor.id) ?? 0;
                    return usageA - usageB || a.score - b.score;
                });

            const anchor = compatible[0]?.anchor ?? anchors[index % anchors.length];
            usage.set(anchor.id, (usage.get(anchor.id) ?? 0) + 1);

            return {
                id: `net-${pin.id}-${anchor.id}`,
                pin,
                anchor,
                signal: pin.signal,
                color: routeColorForSignal(pin.signal),
                speed: routeSpeedForSignal(pin.signal),
                offset: ((index * 0.137) % 1),
                direction: routeDirectionForSignal(pin.signal),
                priority:
                    pin.signal === "power" ? 0 :
                        pin.signal === "memory" ? 1 :
                            pin.signal === "io" ? 2 :
                                3,
            };
        })
        .sort((a, b) => a.priority - b.priority || a.pin.index - b.pin.index);
}

function pushPoint(points: Vector3[], point: Vector3): void {
    const previous = points[points.length - 1];
    if (!previous || previous.distanceToSquared(point) > 0.000001) {
        points.push(point);
    }
}

function routeNet(net: BoardNet, laneIndex: number, density = 0): Route {
    const { pin, anchor } = net;
    const z = DEFAULT_BOARD_CONFIG.routeZ;
    const points: Vector3[] = [];

    const source = pin.position.clone();
    const exit = pin.exit.clone();
    const target = anchor.position.clone();

    source.z = z;
    exit.z = z;
    target.z = z;

    const side = pin.side;
    const sign = sideSign(side);
    const laneStep = 0.055;
    const baseLane =
        side === "left" ? -1.08 :
            side === "right" ? 1.08 :
                side === "top" ? 0.82 :
                    -0.82;

    const lane = baseLane + sign * laneStep * laneIndex;

    pushPoint(points, source);
    pushPoint(points, exit);

    if (sideAxis(side) === "y") {
        const laneX = lane;
        const midY =
            net.signal === "power"
                ? target.y
                : clamp((exit.y + target.y) * 0.5, -1.45, 1.45);

        pushPoint(points, new Vector3(laneX, exit.y, z));

        if (density > 0.32) {
            const dogleg = 0.035 + density * 0.09;
            const doglegSign = laneIndex % 2 === 0 ? 1 : -1;

            const yA = lerp(exit.y, midY, 0.34);
            const yB = lerp(exit.y, midY, 0.68);

            pushPoint(points, new Vector3(laneX, yA, z));
            pushPoint(points, new Vector3(laneX + dogleg * doglegSign, yA, z));
            pushPoint(points, new Vector3(laneX + dogleg * doglegSign, yB, z));
            pushPoint(points, new Vector3(laneX, yB, z));
        }

        pushPoint(points, new Vector3(laneX, midY, z));
        pushPoint(points, new Vector3(target.x, midY, z));
        pushPoint(points, target);

    } else {
        const laneY = lane;
        const midX =
            net.signal === "memory"
                ? target.x
                : clamp((exit.x + target.x) * 0.5, -2.25, 2.25);

        pushPoint(points, new Vector3(exit.x, laneY, z));

        if (density > 0.32) {
            const dogleg = 0.035 + density * 0.09;
            const doglegSign = laneIndex % 2 === 0 ? 1 : -1;

            const xA = lerp(exit.x, midX, 0.34);
            const xB = lerp(exit.x, midX, 0.68);

            pushPoint(points, new Vector3(xA, laneY, z));
            pushPoint(points, new Vector3(xA, laneY + dogleg * doglegSign, z));
            pushPoint(points, new Vector3(xB, laneY + dogleg * doglegSign, z));
            pushPoint(points, new Vector3(xB, laneY, z));
        }

        pushPoint(points, new Vector3(midX, laneY, z));
        pushPoint(points, new Vector3(midX, target.y, z));
        pushPoint(points, target);

    }

    return {
        points,
        color: net.color,
        speed: net.speed,
        offset: net.offset,
        kind: net.signal === "memory" || net.signal === "io" ? "main" : "pin",
        direction: net.direction,
    };
}

function createRoutesFromNets(
    nets: BoardNet[],
    maxRoutes: number,
    density = 0,
): Route[] {
    const laneCounters = new Map<string, number>();

    return nets.slice(0, maxRoutes).map((net) => {
        const key = `${net.pin.side}:${net.signal}`;
        const next = laneCounters.get(key) ?? 0;
        laneCounters.set(key, next + 1);

        const laneIndex = next - Math.floor((next + 1) / 2);
        return routeNet(net, laneIndex, density);
    });
}


export function createBoardModel(
    scale: number,
    quality: QualityConfig,
    config: ProceduralBoardConfig = DEFAULT_BOARD_CONFIG,
    boardScale = 1,
    boardDensity = 0,
): BoardModel {
    const scaledBoardScale = quantizeBoardScale(boardScale);
    const density = quantizeBoardDensity(boardDensity);

    const scaledConfig = createScaledBoardConfig(
        config,
        scaledBoardScale,
        density,
    );

    const scaleComplexity = boardComplexityFromScale(scaledBoardScale);
    const densityComplexity = boardComplexityFromDensity(density);

    const complexity = clamp(
        scaleComplexity * 0.35 +
        densityComplexity * 1.15 +
        (quality.enableNetwork ? 0.12 : 0) +
        (quality.enableSecondHudLayer ? 0.08 : 0),
        0,
        1,
    );

    const synthesisSeed =
        scaledConfig.seed +
        Math.round(scaledBoardScale * 1000) +
        Math.round(density * 10000) +
        scaledConfig.sidePins * 17 +
        scaledConfig.topBottomPins * 31;

    const key = modelCacheKey(quality, {
        ...scaledConfig,
        seed: synthesisSeed,
        moduleComplexity: complexity,
        boardScale: scaledBoardScale,
        boardDensity: density,
    });

    const cached = BOARD_MODEL_CACHE.get(key);
    if (cached) return cached;

    const chip = createScaledChipPackage(
        quality,
        scaledConfig,
        scaledBoardScale,
        density,
    );

    const pins = createCanonicalChipPins(chip);

    const modules = createSemanticBoardModules(scaledConfig, chip, {
        boardScale: scaledBoardScale,
        boardDensity: density,
        complexity,
        seed: synthesisSeed,
    });

    const anchors = modules.flatMap((module) => module.anchors);

    const nets = createDeterministicNets(pins, modules);

    const routeBudget = scaledRouteBudget(
        quality,
        scaledConfig,
        complexity,
    );

    const routes = createRoutesFromNets(
        nets,
        Math.min(scaledConfig.maxRoutes, routeBudget),
        density,
    );

    const model: BoardModel = {
        chip,
        pins,
        modules,
        anchors,
        nets,
        routes,
        complexity,
    };

    BOARD_MODEL_CACHE.set(key, model);
    return model;
}

/**
 * Internal chip trace geometry now comes from the same pin model.
 * Returns packed line positions: [x1, y1, z1, x2, y2, z2, ...]
 */
export function createProceduralChipTracePositions(
    quality: QualityConfig,
    boardScale = 1,
    boardDensity = 0,
): Float32Array {
    const model = createBoardModel(
        boardScale,
        quality,
        DEFAULT_BOARD_CONFIG,
        boardScale,
        boardDensity,
        )
    ;
    const chip = model.chip;
    const z = chip.pinZ + 0.018;

    const density = clamp(boardDensity, 0, 1);

    const maxPins =
        quality?.tier === "static" ? Math.round(10 + density * 8) :
            quality?.tier === "low" ? Math.round(18 + density * 22) :
                quality?.tier === "high" ? model.pins.length :
                    Math.min(
                        model.pins.length,
                        Math.round(26 + density * 48),
                    );


    const positions: number[] = [];

    model.pins.slice(0, maxPins).forEach((pin, index) => {
        const side = pin.side;
        const sign = sideSign(side);

        const dieTarget =
            side === "left" || side === "right"
                ? new Vector3(
                    sign * chip.dieHalfW,
                    clamp(pin.position.y * 0.58, -chip.dieHalfH, chip.dieHalfH),
                    z,
                )
                : new Vector3(
                    clamp(pin.position.x * 0.58, -chip.dieHalfW, chip.dieHalfW),
                    sign * chip.dieHalfH,
                    z,
                );

        const innerBend =
            side === "left" || side === "right"
                ? new Vector3(
                    sign * (chip.bodyHalfW * 0.46),
                    pin.position.y * 0.62,
                    z,
                )
                : new Vector3(
                    pin.position.x * 0.62,
                    sign * (chip.bodyHalfH * 0.46),
                    z,
                );

        const start = new Vector3(
            clamp(pin.position.x, -chip.bodyHalfW, chip.bodyHalfW),
            clamp(pin.position.y, -chip.bodyHalfH, chip.bodyHalfH),
            z,
        );

        const pulseOffset = ((index % 3) - 1) * 0.012;

        if (side === "top" || side === "bottom") {
            innerBend.x += pulseOffset;
        } else {
            innerBend.y += pulseOffset;
        }

        positions.push(
            start.x, start.y, start.z,
            innerBend.x, innerBend.y, innerBend.z,
            innerBend.x, innerBend.y, innerBend.z,
            dieTarget.x, dieTarget.y, dieTarget.z,
        );
    });

    return new Float32Array(positions);
}

const INSTANCE_DUMMY = new Object3D();
const MAX_FRAME_DELTA = 1 / 60;

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


function useBoardComplexity(boardModel: BoardModel) {
    return useMemo(() => {
        const raw = boardModel.complexity ?? 1;
        return Math.min(1, raw / 5);
    }, [boardModel.complexity]);
}


function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}


function DataBusHud({
                        themeRef,
                        themeProgressRef,
                        quality,
                        boardScale,
                        boardDensity,
                    }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
    boardScale: number;
    boardDensity: number;
}) {
    const boardModel = useMemo(
        () => createBoardModel(
            boardScale,
            quality,
            DEFAULT_BOARD_CONFIG,
            boardScale,
            boardDensity,
        ),
        [quality, boardScale, boardDensity],
    );

    const gl = useThree((state) => state.gl);
    const complexity = useBoardComplexity(boardModel);
    const packetUpdateRef = useRef(0);
    const groupRef = useRef<Group>(null);
    const primaryLinesRef = useRef<LineSegments>(null);
    const secondaryLinesRef = useRef<LineSegments>(null);
    const packetsRef = useRef<InstancedMesh>(null);

    const pointerNdcRef = useRef(new Vector2(999, 999));
    const pointerWorldRef = useRef(new Vector3(999, 999, 999));
    const pointerActiveUntilRef = useRef(0);
    const collectedCountRef = useRef(0);

    const packetPositionRef = useRef(new Vector3());
    const forwardProbeRef = useRef(new Vector3());
    const backwardProbeRef = useRef(new Vector3());
    const routes = useMemo(
        () => prepareRoutes(boardModel.routes),
        [boardModel],
    );

    const initialPacketInstances = useMemo(() => {
        const base = createInteractivePacketInstances(routes);
        const extraCount = Math.floor(base.length * (0.25 + complexity * 1.8));

        const extraPackets = Array.from({ length: extraCount }, (_, i) => {
            const r1 = seededRandom(i + base.length);
            const r2 = seededRandom(i * 7 + 13);

            const p = base[Math.floor(r1 * base.length)];

            return {
                ...p,
                progress: r2,
            };
        });

        return [...base, ...extraPackets];

    }, [routes, complexity]);


    const packetInstancesRef = useRef<InteractivePacketInstance[]>(
        initialPacketInstances,
    );

    useEffect(() => {
        packetInstancesRef.current = initialPacketInstances;
    }, [initialPacketInstances]);

    const primaryPositions = useMemo(
        () => createLineSegmentsFromRoutes(routes.filter((route) => route.color === "primary")),
        [routes],
    );

    const secondaryPositions = useMemo(
        () => createLineSegmentsFromRoutes(routes.filter((route) => route.color === "secondary")),
        [routes],
    );

    useEffect(() => {
        const updatePointer = (event: PointerEvent) => {
            const rect = gl.domElement.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            pointerNdcRef.current.set(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1,
            );

            pointerActiveUntilRef.current =
                performance.now() / 1000 + PACKET_INTERACTION.pointerActiveSeconds;
        };

        window.addEventListener("pointermove", updatePointer, { passive: true });
        window.addEventListener("pointerdown", updatePointer, { passive: true });

        return () => {
            window.removeEventListener("pointermove", updatePointer);
            window.removeEventListener("pointerdown", updatePointer);
        };
    }, [gl]);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;
        const theme = themeRef.current;
        const progress = themeProgressRef.current ?? 0;

        if (!theme || routes.length === 0) return;

        const primaryMat = primaryLinesRef.current?.material as LineBasicMaterial | undefined;
        const secondaryMat = secondaryLinesRef.current?.material as LineBasicMaterial | undefined;

        if (primaryMat) {
            primaryMat.color.copy(theme.accent);
            primaryMat.opacity =
                (0.72 + progress * 0.05) *
                (1.0 + complexity * 0.4);
        }

        if (secondaryMat) {
            secondaryMat.color.copy(theme.accent2);
            secondaryMat.opacity =
                (0.5 + progress * 0.04) *
                (1.0 + complexity * 0.3);
        }

        const packets = packetsRef.current;
        if (!packets) return;

        const packetInstances = packetInstancesRef.current;
        const frameDelta = safeDelta(delta);

        packetUpdateRef.current += frameDelta;

        const updateInterval = 1 / PACKET_INTERACTION.updateFps;
        if (packetUpdateRef.current < updateInterval) return;

        const updateDelta = packetUpdateRef.current;
        packetUpdateRef.current = 0;

        const difficulty = packetDifficulty(collectedCountRef.current);

        // amplify difficulty by board complexity
        const dynamicDifficulty = lerp(difficulty, difficulty * 1.6, complexity);

// integrate into speed + avoidance
        const avoidRadius = lerp(
            PACKET_INTERACTION.baseAvoidRadius,
            PACKET_INTERACTION.maxAvoidRadius * (1.0 + complexity * 0.8),
            dynamicDifficulty,
        );

        const escapeSpeed = lerp(
            PACKET_INTERACTION.escapeSpeed,
            PACKET_INTERACTION.maxEscapeSpeed * (1.1 + complexity * 0.9),
            dynamicDifficulty,
        );


        const collectRadius = lerp(
            PACKET_INTERACTION.collectRadius,
            PACKET_INTERACTION.minCollectRadius,
            difficulty,
        );

        const respawnDelay = lerp(
            PACKET_INTERACTION.respawnDelay,
            PACKET_INTERACTION.maxRespawnDelay,
            difficulty,
        );

        const collectRadiusSq = collectRadius * collectRadius;
        const avoidRadiusSq = avoidRadius * avoidRadius;

        const pointerActive =
            performance.now() / 1000 <= pointerActiveUntilRef.current;

        let hasPointerWorld = false;

        if (pointerActive) {
            state.raycaster.setFromCamera(pointerNdcRef.current, state.camera);
            hasPointerWorld = Boolean(
                state.raycaster.ray.intersectPlane(
                    DATA_BUS_POINTER_PLANE,
                    pointerWorldRef.current,
                ),
            );
        }

        let visibleCount = 0;

        for (let i = 0; i < packetInstances.length; i += 1) {
            const packet = packetInstances[i];

            if (packet.collectedUntil > 0) {
                if (time < packet.collectedUntil) continue;

                packet.collectedUntil = 0;
                packet.routeIndex = Math.floor(Math.random() * routes.length);
                packet.offset = Math.random();
                packet.escapeOffset = 0;
                packet.escapeSign = Math.random() > 0.5 ? 1 : -1;
                packet.panic = Math.random();
            }

            const route = routes[packet.routeIndex % routes.length];

            const burstWave =
                route.kind === "main"
                    ? Math.sin(time * route.speed * 0.55 + packet.burstPhase)
                    : Math.sin(time * route.speed * 0.4 + packet.burstPhase);

            if (burstWave < -0.72) continue;

            const burst = burstWave > 0.6 ? 1.45 : 1;

            let t =
                time * route.speed * theme.dataSpeed * 1.35 +
                packet.offset +
                packet.escapeOffset;

            samplePreparedRoute(route, t, packetPositionRef.current);

            if (hasPointerWorld) {
                const distanceSq =
                    packetPositionRef.current.distanceToSquared(pointerWorldRef.current);

                if (distanceSq <= collectRadiusSq) {
                    packet.collectedUntil =
                        time + respawnDelay + Math.random() * respawnDelay * 0.5;

                    packet.escapeOffset = 0;
                    collectedCountRef.current += 1;
                    continue;
                }

                if (distanceSq <= avoidRadiusSq) {
                    const distance = Math.sqrt(distanceSq);
                    const proximity = 1 - distance / avoidRadius;
                    const panic = 1 + packet.panic * 0.45;
                    const escapeAmount =
                        updateDelta *
                        route.speed *
                        escapeSpeed *
                        proximity *
                        proximity *
                        panic;

                    const probeStep =
                        PACKET_INTERACTION.escapeStep + difficulty * 0.035;

                    samplePreparedRoute(route, t + probeStep, forwardProbeRef.current);
                    samplePreparedRoute(route, t - probeStep, backwardProbeRef.current);

                    const forwardDistanceSq =
                        forwardProbeRef.current.distanceToSquared(pointerWorldRef.current);
                    const backwardDistanceSq =
                        backwardProbeRef.current.distanceToSquared(pointerWorldRef.current);

                    packet.escapeSign =
                        backwardDistanceSq > forwardDistanceSq ? -1 : 1;

                    packet.escapeOffset = repeat01(
                        packet.escapeOffset + packet.escapeSign * escapeAmount,
                    );

                    t =
                        time * route.speed * theme.dataSpeed * 1.35 +
                        packet.offset +
                        packet.escapeOffset;

                    samplePreparedRoute(route, t, packetPositionRef.current);
                }
            }

            INSTANCE_DUMMY.position.copy(packetPositionRef.current);

            const pulse =
                (0.88 +
                    0.22 * Math.abs(Math.sin(time * 1.2 + packet.offset * 6.0))) *
                burst;

            const isPinRoute = route.kind === "pin";

            const baseX = isPinRoute
                ? 0.038
                : route.color === "primary"
                    ? 0.078
                    : 0.064;

            const baseY = isPinRoute ? 0.018 : 0.03;
            const baseZ = isPinRoute ? 0.022 : 0.028;
            const scaleMul = packet.scale * pulse;

            INSTANCE_DUMMY.rotation.set(0, 0, 0);
            INSTANCE_DUMMY.scale.set(
                baseX * scaleMul,
                baseY * (0.95 + pulse * 0.08),
                baseZ,
            );

            INSTANCE_DUMMY.updateMatrix();
            packets.setMatrixAt(visibleCount, INSTANCE_DUMMY.matrix);

            visibleCount += 1;
        }

        packets.count = visibleCount;
        packets.instanceMatrix.needsUpdate = true;

        const mat = packets.material as MeshBasicMaterial;
        mat.color.copy(theme.accent);
        mat.opacity = lerp(0.68, 0.9, difficulty);
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
                args={[undefined, undefined, initialPacketInstances.length]}
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

function CornerPads({ chip }: { chip: ChipPackageModel }) {
    const x = chip.bodyHalfW * 0.7;
    const y = chip.bodyHalfH * 0.66;
    const z = chip.pinZ + 0.012;

    const positions: [number, number, number][] = [
        [-x, y, z],
        [x, y, z],
        [-x, -y, z],
        [x, -y, z],
    ];

    return (
        <>
            {positions.map((position, index) => (
                <mesh key={index} position={position} scale={[0.052, 0.052, 0.016]}>
                    <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.72}
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
    lerpColor?: Color,
    lerpAlpha = 0,
) {
    if (!material) return;
    material.color.copy(color);

    if (lerpColor) {
        material.color.lerp(lerpColor, lerpAlpha);}
    material.opacity = opacity;}


function moduleHeightBoost(kind: BoardModuleKind): number {
    if (kind === "connector") return 1.28;
    if (kind === "vrm") return 1.42;
    if (kind === "memory") return 1.08;
    if (kind === "passive") return 0.78;
    return 1;
}

function BoardModules({
                          themeRef,
                          themeProgressRef,
                          quality,
                          boardScale,
                          boardDensity,
                      }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
    boardScale: number;
    boardDensity: number;
}) {

    const bodyRef = useRef<InstancedMesh>(null);
    const glowRef = useRef<InstancedMesh>(null);
    const anchorRef = useRef<InstancedMesh>(null);

    const boardModel = useMemo(
        () => createBoardModel(
            boardScale,
            quality,
            DEFAULT_BOARD_CONFIG,
            boardScale,
            boardDensity,
        ),
        [quality, boardScale, boardDensity],
    );


    const modules = boardModel.modules;
    const anchors = boardModel.anchors;

    useEffect(() => {
        const bodyMesh = bodyRef.current;
        const glowMesh = glowRef.current;
        const anchorMesh = anchorRef.current;

        if (!bodyMesh || !glowMesh || !anchorMesh) return;

        modules.forEach((module, index) => {
            const heightBoost = moduleHeightBoost(module.kind);

            INSTANCE_DUMMY.position.copy(module.position);
            INSTANCE_DUMMY.rotation.set(0, 0, module.rotation);
            INSTANCE_DUMMY.scale.set(
                module.scale[0],
                module.scale[1],
                module.scale[2] * heightBoost,
            );
            INSTANCE_DUMMY.updateMatrix();
            bodyMesh.setMatrixAt(index, INSTANCE_DUMMY.matrix);

            INSTANCE_DUMMY.scale.set(
                module.scale[0] * 1.18,
                module.scale[1] * 1.24,
                module.scale[2] * 0.7,
            );
            INSTANCE_DUMMY.updateMatrix();
            glowMesh.setMatrixAt(index, INSTANCE_DUMMY.matrix);
        });

        anchors.forEach((anchor, index) => {
            INSTANCE_DUMMY.position.copy(anchor.position);
            INSTANCE_DUMMY.position.z += 0.045;
            INSTANCE_DUMMY.rotation.set(0, 0, 0);
            INSTANCE_DUMMY.scale.set(0.04, 0.04, 0.012);
            INSTANCE_DUMMY.updateMatrix();
            anchorMesh.setMatrixAt(index, INSTANCE_DUMMY.matrix);
        });

        bodyMesh.instanceMatrix.needsUpdate = true;
        glowMesh.instanceMatrix.needsUpdate = true;
        anchorMesh.instanceMatrix.needsUpdate = true;
    }, [modules, anchors]);
    const complexity = useBoardComplexity(boardModel);

    useFrame((state) => {

        const theme = themeRef.current;
        const progress = themeProgressRef.current ?? 0;
        const time = state.clock.elapsedTime;

        if (!theme) return;

        updateBasicMaterial(
            bodyRef.current?.material as MeshBasicMaterial | undefined,
            theme.accent,
            0.22 + progress * 0.03,
            theme.bg,
            0.45,
        );

        updateBasicMaterial(
            glowRef.current?.material as MeshBasicMaterial,
            theme.accent2,
            (0.045 + Math.sin(time * 1.4) * 0.012) * (1 + complexity * 0.8),
        );

        updateBasicMaterial(
            anchorRef.current?.material as MeshBasicMaterial,
            theme.accent2,
            (0.38 + Math.sin(time * 2.1) * 0.05) * (1 + complexity * 0.6),
        );

    });

    return (
        <>
            <instancedMesh ref={glowRef} args={[undefined, undefined, modules.length]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ff2bd6"
                    transparent
                    opacity={0.08}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </instancedMesh>

            <instancedMesh ref={bodyRef} args={[undefined, undefined, modules.length]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.26}
                    depthWrite={false}
                />
            </instancedMesh>

            <instancedMesh ref={anchorRef} args={[undefined, undefined, anchors.length]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.46}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </instancedMesh>
        </>
    );
}
function ChipCore({
                        themeRef,
                        themeProgressRef,
                        quality,
                        boardScale,
                        boardDensity,
                    }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
    boardScale: number;
    boardDensity: number;
}) {
    const groupRef = useRef<Group>(null);
    const packageRef = useRef<Mesh>(null);
    const packageGlowRef = useRef<Mesh>(null);
    const dieRef = useRef<Mesh>(null);
    const dieGlowRef = useRef<Mesh>(null);
    const scanRef = useRef<Mesh>(null);
    const traceRef = useRef<LineSegments>(null);
    const pinMeshRef = useRef<InstancedMesh>(null);

    const boardModel = useMemo(
        () => createBoardModel(
            boardScale,
            quality,
            DEFAULT_BOARD_CONFIG,
            boardScale,
            boardDensity,
        ),
        [quality, boardScale, boardDensity],
    );


    const chip = boardModel.chip;
    const pins = boardModel.pins;

    const tracePositions = useMemo(
        () => createProceduralChipTracePositions(
            quality,
            boardScale,
            boardDensity,
        ),
        [quality, boardScale, boardDensity],
    );

    const complexity = useBoardComplexity(boardModel);

    useEffect(() => {
        const pinMesh = pinMeshRef.current;
        if (!pinMesh) return;

        pins.forEach((pin, index) => {
            const horizontal = pin.side === "left" || pin.side === "right";

            INSTANCE_DUMMY.position.copy(pin.position);
            INSTANCE_DUMMY.position.z = chip.pinZ;
            INSTANCE_DUMMY.rotation.set(0, 0, horizontal ? 0 : Math.PI / 2);
            INSTANCE_DUMMY.scale.set(0.14, 0.034, 0.018);
            INSTANCE_DUMMY.updateMatrix();

            pinMesh.setMatrixAt(index, INSTANCE_DUMMY.matrix);
        });

        pinMesh.instanceMatrix.needsUpdate = true;
    }, [pins, chip.pinZ]);

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
            packageMat.color.copy(theme.accent).lerp(theme.bg, 0.55);
            packageMat.opacity = 0.48 + progress * 0.025;
        }

        if (packageGlowMat) {
            packageGlowMat.color.copy(theme.accent);
            packageGlowMat.opacity =
                (0.09 + progress * 0.04) * (1 + complexity * 0.4);

        }

        if (dieMat) {
            dieMat.color.copy(theme.accent);
            dieMat.opacity = 0.22 + progress * 0.03;
        }

        if (dieGlowMat) {
            dieGlowMat.color.copy(theme.accent2);
            dieGlowMat.opacity =
                (0.16 + Math.sin(time * (1.8 + complexity * 1.2)) * 0.028) *
                (1 + complexity * 0.75);

        }

        if (scanMat) {
            scanMat.color.copy(theme.accent);
            scanMat.opacity = 0.18 + progress * 0.03;
        }

        if (traceMat) {
            traceMat.color.copy(theme.accent);
            traceMat.opacity = 0.46 + progress * 0.055;
        }

        updateBasicMaterial(
            pinMeshRef.current?.material as MeshBasicMaterial | undefined,
            theme.accent2,
            0.62 + Math.sin(time * 1.8) * 0.04,
        );

        if (scanRef.current) {
            scanRef.current.position.x = lerp(
                scanRef.current.position.x,
                Math.sin(time * (1.2 + complexity * 1.3)) * chip.dieHalfW * (0.75 + complexity * 0.3),
                frameDelta * (3.2 + complexity * 2),
            );
        }
    });

    return (
        <group ref={groupRef}>
            <mesh
                ref={packageGlowRef}
                position={[0, 0, -0.012]}
                scale={[chip.bodyHalfW * 2.42, chip.bodyHalfH * 2.46, 0.055]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.1}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            <mesh
                ref={packageRef}
                scale={[chip.bodyHalfW * 2, chip.bodyHalfH * 2, chip.bodyDepth]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#0b1220"
                    transparent
                    opacity={0.49}
                    depthWrite={false}
                />
            </mesh>

            <lineSegments
                position={[0, 0, chip.pinZ + 0.025]}
                scale={[chip.bodyHalfW * 2.1, chip.bodyHalfH * 2.12, 1]}
            >
                <edgesGeometry args={[new BoxGeometry(1, 1, 0.02)]} />
                <lineBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </lineSegments>

            <mesh
                ref={dieRef}
                position={[0, 0, chip.pinZ - 0.018]}
                scale={[chip.dieHalfW * 2, chip.dieHalfH * 2, 0.045]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.24}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            <mesh
                ref={dieGlowRef}
                position={[0, 0, chip.pinZ - 0.006]}
                scale={[chip.dieHalfW * 2.34, chip.dieHalfH * 2.36, 0.018]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ff2bd6"
                    transparent
                    opacity={0.16}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            <mesh
                ref={scanRef}
                position={[0, 0, chip.pinZ + 0.018]}
                scale={[0.028, chip.dieHalfH * 2.1, 0.01]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.2}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            <lineSegments ref={traceRef}>
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

            <instancedMesh ref={pinMeshRef} args={[undefined, undefined, pins.length]}>
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ff2bd6"
                    transparent
                    opacity={0.72}
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </instancedMesh>

            <mesh
                position={[-chip.dieHalfW * 0.72, chip.dieHalfH * 0.58, chip.pinZ + 0.016]}
                scale={[0.16, 0.025, 0.01]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.32}
                    depthWrite={false}
                />
            </mesh>

            <mesh
                position={[-chip.dieHalfW * 0.48, chip.dieHalfH * 0.25, chip.pinZ + 0.016]}
                scale={[0.09, 0.018, 0.01]}
            >
                <primitive object={UNIT_BOX_GEOMETRY} attach="geometry" />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.22}
                    depthWrite={false}
                />
            </mesh>

            <CornerPads chip={chip} />
        </group>
    );
}

function SceneContents({
                           stage,
                           progressRef,
                           quality,
                       }: {
    stage: SectionStage;
    progressRef: NumberRef;
    quality: QualityConfig;
}) {
    const sceneGroupRef = useRef<Group>(null);
    const themeProgressRef = useThemeProgress(stage);
    const themeRef = useRef<RuntimeTheme>(createRuntimeTheme(getTheme(0)));
    const { gl } = useThree();
    const boardScaleRef = useRef(1);
    const boardDensityRef = useRef(0);
    const [boardScale, setBoardScale] = useState(1);
    const [boardDensity, setBoardDensity] = useState(0);

    const boardModel = useMemo(
        () => createBoardModel(
            boardScale,
            quality,
            DEFAULT_BOARD_CONFIG,
            boardScale,
            boardDensity,
        ),
        [quality, boardScale, boardDensity],
    );


    const complexity = useBoardComplexity(boardModel);


    useEffect(() => {
        gl.setClearAlpha(0);
    }, [gl]);

    useFrame((state, delta) => {
        applyBlendedTheme(themeRef.current, themeProgressRef.current);

        const theme = themeRef.current;
        const group = sceneGroupRef.current;
        if (!group) return;

        const time = state.clock.elapsedTime;
        const frameDelta = safeDelta(delta);

        const scrollProgress = progressRef.current ?? 0;

        const nextBoardScale = quantizeBoardScale(
            scrollBoardScale(scrollProgress),
        );

        const nextBoardDensity = quantizeBoardDensity(
            scrollBoardDensity(scrollProgress),
        );

        if (Math.abs(nextBoardScale - boardScaleRef.current) >= 0.025) {
            boardScaleRef.current = nextBoardScale;
            setBoardScale(nextBoardScale);
        }

        if (Math.abs(nextBoardDensity - boardDensityRef.current) >= 0.05) {
            boardDensityRef.current = nextBoardDensity;
            setBoardDensity(nextBoardDensity);
        }
        group.rotation.x = lerp(group.rotation.x, -1.06, frameDelta * 2.4);
        group.rotation.y = lerp(group.rotation.y, 0.08, frameDelta * 2.4);
        group.rotation.z = lerp(
            group.rotation.z,
            (time * (8 + complexity * 5)) * 0.045,
            frameDelta * 2,
        );
        const scaleBoost = 1 + complexity * 0.1;
        group.scale.setScalar(theme.coreScale * scaleBoost);


        // Keep global theme scaling, but do not double-scale the board here.
        // The board model itself is already generated larger/smaller.
    }, -0.0011);


    return (
        <group ref={sceneGroupRef} position={[0, 0.08, 0]}>
            <BoardModules
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
                boardScale={boardScale}
                boardDensity={boardDensity}
            />

            <DataBusHud
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
                boardScale={boardScale}
                boardDensity={boardDensity}
            />

            <ChipCore
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
                boardScale={boardScale}
                boardDensity={boardDensity}
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
    const renderFps = renderRunning ? quality.targetFps : quality.idleFps;

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
            depth: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
        }),
        [quality.tier],
    );


    return (
        <motion.div
            aria-hidden="false"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            style={rootStyle}
        >
            {canRenderWebGL && (
                <Canvas
                    frameloop="demand"
                    dpr={quality.dpr}
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