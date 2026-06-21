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
    { accent: "#00e5ff", accent2: "#8b5cf6", bg: "#ffffff" },
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
            targetFps: 60,
            idleFps: 8,
            particleCount: 0,
            coreDetail: 1,
            glowDetail: 1,
            enableSecondHudLayer: true,
            enableNetwork: true,
            enableParticles: false,
            enablePointerParallax: true,
            tracePositions: 96,
            sidePins: 3,
            topBottomPins: 20,
        } as QualityConfig;

        if (prefersReducedMotion) {
            return {
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
                tracePositions: 96,
                sidePins: 3,
                topBottomPins: 20,
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
                tracePositions: 96,
                sidePins: 3,
                topBottomPins: 20,
            } as QualityConfig;
        }

        // High-End Logic
        if (width >= 1280 && cores >= 8 && memory >= 8 && dpr <= 2) {
            return {
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
                tracePositions: 96,
                sidePins: 32,
                topBottomPins: 20,
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
    updateFps: 60,
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
