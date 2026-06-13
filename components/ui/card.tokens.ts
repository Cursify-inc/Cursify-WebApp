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

// ------------------------------------------------------------------
// 1. DOM / Wrapper Styles (Now handled entirely by CSS/Tailwind)
// ------------------------------------------------------------------

export const CARD_STYLE = {
    large: "rounded-[1.4rem] card-surface shadow-card border-card-border",
    tiny: "rounded-[1.25rem] card-surface shadow-card-sm border-card-border",
    largeInner: "relative z-10 rounded-[1.4rem] p-5 md:p-6",
    tinyInner: "relative z-10 flex items-center gap-3 rounded-[1.25rem] p-3.5 md:p-4",
} as const;

// Note: getCardStyle has been deprecated as styles are now theme-agnostic via CSS variables

// ------------------------------------------------------------------
// 2. Canvas Edge Light Properties
// ------------------------------------------------------------------

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
    inset: 0,
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
};

// Colors centralized via CSS variables
const EDGE_COLORS = {
    colorA: "var(--edge-light-a)",
    colorB: "var(--edge-light-b)",
    highlightColor: "var(--edge-highlight)",
};

const EDGE_DARK: Record<CardSize, EdgeLightOptions> = {
    tiny: {
        ...EDGE_BASE,
        ...EDGE_COLORS,
        strokeWidth: 16,
        glowWidth: 5.5,
        glowBlur: 7,
        segmentRatio: 0.24,
        coreOpacity: 0.62,
        glowOpacity: 0.28,
        highlightOpacity: 0.14,
    },
    large: {
        ...EDGE_BASE,
        ...EDGE_COLORS,
        strokeWidth: 1.6,
        glowWidth: 6.8,
        glowBlur: 8.5,
        segmentRatio: 0.16,
        coreOpacity: 0.58,
        glowOpacity: 0.24,
        highlightOpacity: 0.12,
    },
};

const EDGE_LIGHT: Record<CardSize, EdgeLightOptions> = {
    tiny: {
        ...EDGE_BASE,
        ...EDGE_COLORS,
        strokeWidth: 1.4,
        glowWidth: 4.2,
        glowBlur: 5.5,
        segmentRatio: 0.22,
        coreOpacity: 0.42,
        glowOpacity: 0.14,
        highlightOpacity: 0.08,
    },
    large: {
        ...EDGE_BASE,
        ...EDGE_COLORS,
        strokeWidth: 1.8,
        glowWidth: 5.2,
        glowBlur: 6.2,
        segmentRatio: 0.15,
        coreOpacity: 0.4,
        glowOpacity: 0.12,
        highlightOpacity: 0.07,
    },
};

export function getEdgeLightPreset(size: CardSize, mode: CardThemeMode): EdgeLightOptions {
    return mode === "dark" ? EDGE_DARK[size] : EDGE_LIGHT[size];
}

export const NO_EDGE_DEFAULT_TONE: TinyNoEdgeTone = "glassGlowNeon";
