import {useMemo} from "react";
import {Color, Vector3} from "three";

export type Theme = {
    accent: Color;
    accent2: Color;
    bg: Color;
    coreScale: number;
    frameScale: number;
    particleOpacity: number;
    dataSpeed: number;
    pulse: number;
};

export type RuntimeTheme = {
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

export type GeometryCssTheme = Record<`--${string}`, string>;

export const THEME_SEEDS: readonly ThemeSeed[] = [
    { accent: "#00e5ff", accent2: "#8b5cf6", bg: "#020617" },
    { accent: "#00ffc6", accent2: "#b026ff", bg: "#030014" },
    { accent: "#ff2bd6", accent2: "#00e5ff", bg: "#050010" },
    { accent: "#39ff14", accent2: "#00e5ff", bg: "#010409" },
] as const;


export type QualityTier = "static" | "low" | "medium" | "high";

export type QualityConfig = {
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

export function useQualityTier(prefersReducedMotion: boolean | null): QualityConfig {
    return useMemo(() => {
        // Default base config
        const base = {
            tier: "medium",
            dpr: 1,
            targetFps: 144,
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
                targetFps: 144,
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
                targetFps: 144,
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


export type RouteDirection = "toCpu" | "fromCpu" | "bidirectional";

export type Route = {
    points: Vector3[];
    color: "primary" | "secondary";
    speed: number;
    offset: number;
    kind?: "main" | "pin";
    direction: RouteDirection;
};

export type PreparedRoute = Route & {
    segmentLengths: Float32Array;
    totalLength: number;
};

export interface PacketInstance {
    routeIndex: number;
    offset: number;
    scale: number;
    burstPhase: number;
}

export type InteractivePacketInstance = PacketInstance & {
    collectedUntil: number;
    escapeOffset: number;
    escapeSign: -1 | 1;
    panic: number;
};


export const PACKET_INTERACTION = {
    updateFps: 144,
    collectRadius: 0.115,
    minCollectRadius: 0.075,
    baseAvoidRadius: 0.22,
    maxAvoidRadius: 0.95,
    respawnDelay: 0.65,
    maxRespawnDelay: 1.8,
    escapeStep: 0.026,
    escapeSpeed: 1.65,
    maxEscapeSpeed: 5.25,
    pointerActiveSeconds: 0.28,
} as const;
