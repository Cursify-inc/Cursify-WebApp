// card.tokens.ts
import type { CardProps } from "./Card";
import type { EdgeLightOptions, TinyNoEdgeTone } from "./CardVariants";

export type CardSize = "tiny" | "large";
export type CardThemeMode = "light" | "dark";

export const CARD_MOTION = {
    tiltMaxDeg: 6,
    spring: { stiffness: 180, damping: 24, mass: 0.7 },
    hover: { y: -2, scale: 1.008, duration: 0.16 },
    reveal: {
        durationMs: 900,
        delayMs: 0,
        margin: "0px 0px -120px 0px" as NonNullable<CardProps["revealViewportMargin"]>,
    },
} as const;

const CARD_STYLE_BASE = {
    largeInner: "relative z-10 rounded-[1.4rem] p-5 md:p-6",
    tinyInner: "relative z-10 flex items-center gap-3 rounded-[1.25rem] p-3.5 md:p-4",
} as const;

const CARD_STYLE_DARK = {
    large:
        "rounded-[1.4rem] border border-white/12 bg-white/[0.05] shadow-[0_8px_20px_rgba(0,0,0,0.22)] backdrop-blur-md",
    tiny:
        "rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-md",
} as const;

const CARD_STYLE_LIGHT = {
    large:
        "rounded-[1.4rem] border border-slate-900/10 bg-white/80 shadow-[0_8px_22px_rgba(15,23,42,0.10)] backdrop-blur-md",
    tiny:
        "rounded-[1.25rem] border border-slate-900/10 bg-white/75 shadow-[0_6px_14px_rgba(15,23,42,0.09)] backdrop-blur-md",
} as const;

// Backward-compatible constant (dark default)
export const CARD_STYLE = {
    ...CARD_STYLE_DARK,
    ...CARD_STYLE_BASE,
} as const;

export function getCardStyle(mode: CardThemeMode) {
    const skin = mode === "dark" ? CARD_STYLE_DARK : CARD_STYLE_LIGHT;
    return { ...skin, ...CARD_STYLE_BASE } as const;
}

// ---------------- Edge light presets ----------------

const EDGE_BASE: Pick<
    EdgeLightOptions,
    | "inset"
    | "trailCount"
    | "trailGap"
    | "idleSpeed"
    | "hoverSpeedBoost"
    | "attractStrength"
    | "proximityRadius"
    | "pulseDurationMs"
    | "pulseIntensity"
    | "enableIdleScan"
    | "enableCursorProximity"
    | "enablePulse"
    | "interactionBoostDecay"
    | "interactionBoostAmount"
> = {
    inset: -2,
    trailCount: 4,
    trailGap: 1.05,
    idleSpeed: 0.22,
    hoverSpeedBoost: 0.2,
    attractStrength: 6,
    proximityRadius: 120,
    pulseDurationMs: 620,
    pulseIntensity: 0.7,
    enableIdleScan: true,
    enableCursorProximity: true,
    enablePulse: true,
    /** NEW: short interaction burst strength (0..1 recommended) */
    interactionBoostDecay: 1,
    interactionBoostAmount: 20,

    /** NEW: burst decay per second */

};

const EDGE_DARK: Record<CardSize, EdgeLightOptions> = {
    tiny: {
        ...EDGE_BASE,
        strokeWidth: 1.6,
        glowWidth: 5.5,
        glowBlur: 7,
        segmentRatio: 0.24,
        coreOpacity: 0.62,
        glowOpacity: 0.28,
        highlightOpacity: 0.14,
        colorA: "rgb(56 189 248)",
        colorB: "rgb(129 140 248)",
        highlightColor: "rgb(255 255 255)",
    },
    large: {
        ...EDGE_BASE,
        strokeWidth: 1.6,
        glowWidth: 6.8,
        glowBlur: 8.5,
        segmentRatio: 0.16,
        coreOpacity: 0.58,
        glowOpacity: 0.24,
        highlightOpacity: 0.12,
        colorA: "rgb(34 211 238)",
        colorB: "rgb(99 102 241)",
        highlightColor: "rgb(255 255 255)",
    },
};

const EDGE_LIGHT: Record<CardSize, EdgeLightOptions> = {
    tiny: {
        ...EDGE_BASE,
        strokeWidth: 1.4,
        glowWidth: 4.2,
        glowBlur: 5.5,
        segmentRatio: 0.22,
        coreOpacity: 0.42,
        glowOpacity: 0.14,
        highlightOpacity: 0.08,
        colorA: "rgb(14 116 144)",
        colorB: "rgb(79 70 229)",
        highlightColor: "rgb(255 255 255 / 0.9)",
    },
    large: {
        ...EDGE_BASE,
        strokeWidth: 1.8,
        glowWidth: 5.2,
        glowBlur: 6.2,
        segmentRatio: 0.15,
        coreOpacity: 0.4,
        glowOpacity: 0.12,
        highlightOpacity: 0.07,
        colorA: "rgb(8 145 178)",
        colorB: "rgb(67 56 202)",
        highlightColor: "rgb(255 255 255 / 0.88)",
    },
};

export function getEdgeLightPreset(size: CardSize, mode: CardThemeMode): EdgeLightOptions {
    return mode === "dark" ? EDGE_DARK[size] : EDGE_LIGHT[size];
}

export const NO_EDGE_DEFAULT_TONE: TinyNoEdgeTone = "glassGlowNeon";
