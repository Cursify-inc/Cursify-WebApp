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
            count = route.color === "primary" ? 10 : 10;
        } else {
            const r = Math.random() * 1000;

            if (r < 0.18) {
                count = 0;
            } else if (r < 0.7) {
                count = 10
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

type BoardModel = {
    chip: ChipPackageModel;
    pins: ProceduralPin[];
    modules: BoardModule[];
    anchors: BoardModuleAnchor[];
    nets: BoardNet[];
    routes: Route[];
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
    sidePins: 18,
    topBottomPins: 14,
    boardHalfW: 3.05,
    boardHalfH: 2.05,
    routeZ: 0.06,
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
    pinZ: 0.13105,
    routeZ: DEFAULT_BOARD_CONFIG.routeZ,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function scrollBoardScale(progress: number) {
    const t = clamp(progress, 0, 1);

    // Top of page = compact board, bottom = larger board.
    return lerp(0.5, 2, easeOutCubic(t));
}

export function quantizeBoardScale(scale: number) {
    // Prevents rebuilding board geometry on every tiny scroll delta.
    return Math.round(scale * 40) / 40;
}

function createScaledBoardConfig(
    baseConfig: ProceduralBoardConfig,
    boardScale: number,
): ProceduralBoardConfig {
    const safeScale = clamp(boardScale, 0.72, 3);

    return {
        ...baseConfig,
        boardHalfW: DEFAULT_BOARD_CONFIG.boardHalfW * safeScale,
        boardHalfH: DEFAULT_BOARD_CONFIG.boardHalfH * safeScale,

        // Keep Z stable so traces, packets, and chip surfaces do not float.
        routeZ: baseConfig.routeZ,
    };
}

function createScaledChipPackage(
    quality: QualityConfig | undefined,
    config: ProceduralBoardConfig,
    boardScale: number,
): ChipPackageModel {
    const safeScale = clamp(boardScale, 0.72, 1.45);

    // Chip reacts to scroll too, but slightly less than the whole board.
    const chipScale = lerp(0.9, 1.12, clamp((safeScale - 0.82) / 0.44, 0, 1));

    return {
        ...CHIP_PACKAGE,

        bodyHalfW: CHIP_PACKAGE.bodyHalfW * chipScale,
        bodyHalfH: CHIP_PACKAGE.bodyHalfH * chipScale,
        dieHalfW: CHIP_PACKAGE.dieHalfW * chipScale,
        dieHalfH: CHIP_PACKAGE.dieHalfH * chipScale,

        // These are still quality-dependent.
        sidePins: qualitySidePins(quality),
        topBottomPins: qualityTopBottomPins(quality),

        // Pin/route depths stay aligned with the board.
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

function modelCacheKey(quality?: QualityConfig, config = DEFAULT_BOARD_CONFIG): string {
    return [
        quality?.tier ?? "default",
        qualitySidePins(quality),
        qualityTopBottomPins(quality),
        config.boardHalfW,
        config.boardHalfH,
        config.seed,
        config.maxRoutes,
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

function createModule(
    id: string,
    kind: BoardModuleKind,
    signal: SignalClass,
    position: Vector3,
    scale: [number, number, number],
    anchorSide: ChipSide,
    anchorCount: number,
    color: RouteColor,
    rotation = 0,
): BoardModule {
    const anchors = Array.from({ length: anchorCount }, (_, index) =>
        createAnchor(id, anchorSide, index, anchorCount, position, scale, signal),
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

function createSemanticBoardModules(
    config: ProceduralBoardConfig = DEFAULT_BOARD_CONFIG,
    _chip: ChipPackageModel = CHIP_PACKAGE,
): BoardModule[] {
    const boardScaleX = config.boardHalfW / DEFAULT_BOARD_CONFIG.boardHalfW;
    const boardScaleY = config.boardHalfH / DEFAULT_BOARD_CONFIG.boardHalfH;
    const moduleScale = (boardScaleX + boardScaleY) * 0.5;

    // Keep module Z stable enough that routing/packets remain visually aligned.
    const moduleZ = config.routeZ * 0.435;
    const passiveZ = config.routeZ * 0.38;

    const position = (xRatio: number, yRatio: number, z = moduleZ) =>
        new Vector3(config.boardHalfW * xRatio, config.boardHalfH * yRatio, z);

    const size = (
        width: number,
        height: number,
        depth: number,
    ): [number, number, number] => [
        width * boardScaleX,
        height * boardScaleY,
        depth * moduleScale,
    ];

    return [
        createModule(
            "mem-a",
            "memory",
            "memory",
            position(-0.24, 0.65),
            size(0.78, 0.22, 0.08),
            "bottom",
            5,
            "primary",
        ),
        createModule(
            "mem-b",
            "memory",
            "memory",
            position(0.24, 0.65),
            size(0.78, 0.22, 0.08),
            "bottom",
            5,
            "primary",
        ),
        createModule(
            "vrm-a",
            "vrm",
            "power",
            position(-0.58, 0.17),
            size(0.28, 0.66, 0.09),
            "right",
            5,
            "secondary",
        ),
        createModule(
            "vrm-b",
            "vrm",
            "power",
            position(-0.58, -0.25),
            size(0.28, 0.5, 0.09),
            "right",
            4,
            "secondary",
        ),
        createModule(
            "io-main",
            "connector",
            "io",
            position(0.61, 0.04),
            size(0.32, 1.24, 0.08),
            "left",
            8,
            "primary",
        ),
        createModule(
            "debug",
            "debug",
            "debug",
            position(-0.14, -0.65),
            size(0.86, 0.22, 0.07),
            "top",
            5,
            "secondary",
        ),
        createModule(
            "aux",
            "chiplet",
            "aux",
            position(0.27, -0.59),
            size(0.58, 0.3, 0.08),
            "top",
            4,
            "secondary",
        ),
        createModule(
            "caps-left",
            "passive",
            "control",
            position(-0.38, -0.5, passiveZ),
            size(0.48, 0.16, 0.05),
            "right",
            3,
            "secondary",
            0.08 * moduleScale,
        ),
    ];
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

function routeNet(net: BoardNet, laneIndex: number): Route {
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

function createRoutesFromNets(nets: BoardNet[], maxRoutes: number): Route[] {
    const laneCounters = new Map<string, number>();

    return nets.slice(0, maxRoutes).map((net) => {
        const key = `${net.pin.side}:${net.signal}`;
        const next = laneCounters.get(key) ?? 0;
        laneCounters.set(key, next + 1);

        const laneIndex = next - Math.floor((next + 1) / 2);
        return routeNet(net, laneIndex);
    });
}

export function createBoardModel(
    quality?: QualityConfig,
    config: ProceduralBoardConfig = DEFAULT_BOARD_CONFIG,
    boardScale = 1,
): BoardModel {
    const scaledBoardScale = quantizeBoardScale(boardScale);
    const scaledConfig = createScaledBoardConfig(config, scaledBoardScale);

    const key = modelCacheKey(quality, {
        ...scaledConfig,
        seed: scaledConfig.seed + Math.round(scaledBoardScale * 1000),
    });

    const cached = BOARD_MODEL_CACHE.get(key);
    if (cached) return cached;

    const chip = createScaledChipPackage(quality, scaledConfig, scaledBoardScale);

    const pins = createCanonicalChipPins(chip);

    // Important:
    // If your module generator currently uses hardcoded positions, upgrade it to accept scaledConfig.
    const modules = createSemanticBoardModules(scaledConfig, chip);

    const anchors = modules.flatMap((module) => module.anchors);
    const nets = createDeterministicNets(pins, modules);

    const routeBudget =
        quality?.tier === "static" ? 14 :
            quality?.tier === "low" ? 24 :
                quality?.tier === "high" ? scaledConfig.maxRoutes :
                    36;

    const routes = createRoutesFromNets(
        nets,
        Math.min(scaledConfig.maxRoutes, routeBudget),
    );

    const model = {
        chip,
        pins,
        modules,
        anchors,
        nets,
        routes,
    };

    BOARD_MODEL_CACHE.set(key, model);
    return model;
}


/**
 * Internal chip trace geometry now comes from the same pin model.
 * Returns packed line positions: [x1, y1, z1, x2, y2, z2, ...]
 */
export function createProceduralChipTracePositions(
    quality?: QualityConfig,
    boardScale = 1,
): Float32Array {
    const model = createBoardModel(quality, DEFAULT_BOARD_CONFIG, boardScale);
    const chip = model.chip;
    const z = chip.pinZ + 0.018;

    const maxPins =
        quality?.tier === "static" ? 14 :
            quality?.tier === "low" ? 22 :
                quality?.tier === "high" ? model.pins.length :
                    Math.min(model.pins.length, 30);

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

function DataBusHud({
                        themeRef,
                        themeProgressRef,
                        quality,
                        boardScale,
                    }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
    boardScale: number;
}) {
    const boardModel = useMemo(
        () => createBoardModel(quality, DEFAULT_BOARD_CONFIG, boardScale),
        [quality, boardScale],
    );

    const gl = useThree((state) => state.gl);

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

    const initialPacketInstances = useMemo(
        () => createInteractivePacketInstances(routes),
        [routes],
    );

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
            primaryMat.opacity = 0.72 + progress * 0.05;
        }

        if (secondaryMat) {
            secondaryMat.color.copy(theme.accent2);
            secondaryMat.opacity = 0.5 + progress * 0.04;
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

        const collectRadius = lerp(
            PACKET_INTERACTION.collectRadius,
            PACKET_INTERACTION.minCollectRadius,
            difficulty,
        );

        const avoidRadius = lerp(
            PACKET_INTERACTION.baseAvoidRadius,
            PACKET_INTERACTION.maxAvoidRadius,
            difficulty,
        );

        const escapeSpeed = lerp(
            PACKET_INTERACTION.escapeSpeed,
            PACKET_INTERACTION.maxEscapeSpeed,
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
                      }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
    boardScale: number;
}) {
    const bodyRef = useRef<InstancedMesh>(null);
    const glowRef = useRef<InstancedMesh>(null);
    const anchorRef = useRef<InstancedMesh>(null);

    const boardModel = useMemo(
        () => createBoardModel(quality, DEFAULT_BOARD_CONFIG, boardScale),
        [quality, boardScale],
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
            glowRef.current?.material as MeshBasicMaterial | undefined,
            theme.accent2,
            0.045 + Math.sin(time * 1.4) * 0.012,
        );

        updateBasicMaterial(
            anchorRef.current?.material as MeshBasicMaterial | undefined,
            theme.accent2,
            0.38 + Math.sin(time * 2.1) * 0.05,
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
                  }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
    quality: QualityConfig;
    boardScale: number;
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
        () => createBoardModel(quality, DEFAULT_BOARD_CONFIG, boardScale),
        [quality, boardScale],
    );

    const chip = boardModel.chip;
    const pins = boardModel.pins;

    const tracePositions = useMemo(
        () => createProceduralChipTracePositions(quality, boardScale),
        [quality, boardScale],
    );

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
            packageGlowMat.opacity = 0.09 + progress * 0.04;
        }

        if (dieMat) {
            dieMat.color.copy(theme.accent);
            dieMat.opacity = 0.22 + progress * 0.03;
        }

        if (dieGlowMat) {
            dieGlowMat.color.copy(theme.accent2);
            dieGlowMat.opacity = 0.16 + Math.sin(time * 1.8) * 0.028;
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
                Math.sin(time * 1.2) * chip.dieHalfW * 0.75,
                frameDelta * 3.2,
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
    const [boardScale, setBoardScale] = useState(1);

    useFrame(() => {
        const scrollProgress = progressRef.current ?? 0;
        const nextBoardScale = quantizeBoardScale(scrollBoardScale(scrollProgress));

        if (Math.abs(nextBoardScale - boardScaleRef.current) >= 0.025) {
            boardScaleRef.current = nextBoardScale;
            setBoardScale(nextBoardScale);
        }
    });

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
        const nextBoardScale = quantizeBoardScale(scrollBoardScale(scrollProgress));

        if (Math.abs(nextBoardScale - boardScaleRef.current) >= 0.025) {
            boardScaleRef.current = nextBoardScale;
            setBoardScale(nextBoardScale);
        }

        group.rotation.x = lerp(group.rotation.x, -1.06, frameDelta * 2.4);
        group.rotation.y = lerp(group.rotation.y, 0.08, frameDelta * 2.4);
        group.rotation.z = lerp(
            group.rotation.z,
            (time * 8) * 0.045,
            frameDelta * 2,
        );

        // Keep global theme scaling, but do not double-scale the board here.
        // The board model itself is already generated larger/smaller.
        group.scale.setScalar(theme.coreScale);
    }, -0.11);


    return (
        <group ref={sceneGroupRef} position={[0, 0.08, 0]}>
            <BoardModules
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
                boardScale={boardScale}
            />

            <DataBusHud
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
                boardScale={boardScale}
            />

            <ChipCore
                themeRef={themeRef}
                themeProgressRef={themeProgressRef}
                quality={quality}
                boardScale={boardScale}
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