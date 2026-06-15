import type { UseInViewOptions } from "framer-motion";
import type { AutoEdgeLightProProps } from "@/components/ui/AutoEdgeLight";

export type CardSize = "tiny" | "large";
export type CardThemeMode = "light" | "dark";

export type TinyNoEdgeTone = "glassGlowNeon" | "glassGlowPremium";

export type EdgeLightOptions = Omit<
    AutoEdgeLightProProps,
    "active" | "parentRef"
>;

export const CARD_MOTION = {
    tiltMaxDeg: 60,
    spring: { stiffness: 180, damping: 24, mass: 0.7 },
    hover: { y: -2, scale: 1.008, duration: 0.16 },
    reveal: {
        durationMs: 900,
        delayMs: 0,
        margin: "0px 0px -120px 0px" as NonNullable<UseInViewOptions["margin"]>,
    },
} as const;

export const CARD_VARIANT_CLASSES = {
    large: {
        root: "ui-card ui-card--large",
        inner: "ui-card__inner ui-card__inner--large",
    },
    tiny: {
        root: "ui-card ui-card--tiny",
        inner: "ui-card__inner ui-card__inner--tiny",
    },
    promoLarge: {
        root: "ui-card ui-card--promo-large",
        inner: "ui-card__inner ui-card__inner--large",
    },
    promoTiny: {
        root: "ui-card ui-card--promo-tiny",
        inner: "ui-card__inner ui-card__inner--tiny",
    },
    glassNeon: {
        root: "ui-card ui-card--glass-neon glass-glow glass-glow-neon",
        inner: "ui-card__inner--glass",
    },
    glassPremium: {
        root: "ui-card ui-card--glass-premium glass-glow glass-glow-premium",
        inner: "ui-card__inner--glass",
    },
    compact: {
        root: "ui-card ui-card--compact",
        inner: "ui-card__inner ui-card__inner--compact",
    },
} as const;

const EDGE_BASE = {
    inset: 0,
    quality: "balanced",
    dashCount: 1,
    syncColorToDash: false,
    dashRatio: 1,
    idleSpeed: 0,
    hoverSpeedBoost: 0.4,
    attractStrength: 1,
    proximityRadius: 120,
    pulseDurationMs: 620,
    pulseIntensity: 0.7,
    enableIdleScan: false,
    enableCursorProximity: false,
    enablePulse: false,
    interactionBoostDecay: 10,
    interactionBoostAmount: 75,
} satisfies Partial<EdgeLightOptions>;

const EDGE_THEME_COLORS = {
    colorA: "var(--ael-color-a)",
    colorB: "var(--ael-color-b)",
    highlightColor: "var(--ael-highlight)",
} satisfies Partial<EdgeLightOptions>;

const EDGE_PRESETS = {
    tiny: {
        ...EDGE_BASE,
        ...EDGE_THEME_COLORS,
        strokeWidth: 1.5,
        glowWidth: 7.5,
        glowBlur: 5.5,
        dashRatio: 0.9,
        segmentRatio: 0.22,
        coreOpacity: 0.8,
        glowOpacity: 0.3,
        highlightOpacity: 0.15,
    },
    large: {
        ...EDGE_BASE,
        ...EDGE_THEME_COLORS,
        strokeWidth: 2,
        glowWidth: 9,
        glowBlur: 8,
        dashRatio: 1,
        segmentRatio: 0.16,
        coreOpacity: 0.86,
        glowOpacity: 0.34,
        highlightOpacity: 0.16,
    },
} satisfies Record<CardSize, EdgeLightOptions>;

export function getEdgeLightPreset(
    size: CardSize,
    _mode?: CardThemeMode
): EdgeLightOptions {
    return EDGE_PRESETS[size];
}

export const NO_EDGE_DEFAULT_TONE: TinyNoEdgeTone = "glassGlowNeon";

export const PROMO_EDGE_DEFAULTS = {
    durationSec: 8,
    colorSpeed: 1,
    segmentRatio: 0.22,
    inset: 0,
    strokeWidth: 2.2,
    glowWidth: 10,
    glowBlur: 10,
    coreOpacity: 0.95,
    glowOpacity: 0.42,
    highlightOpacity: 0.38,
    colorA: "var(--promo-glow-primary)",
    colorB: "var(--promo-glow-secondary)",
    highlightColor: "var(--promo-edge-highlight)",
    quality: "balanced",
    dashCount: 1,
    syncColorToDash: false,
} as const;

export const TINY_PROMO_EDGE_DEFAULTS = {
    durationSec: 5.5,
    inset: 0,
    strokeWidth: 2,
    glowWidth: 8,
    glowBlur: 8,
    coreOpacity: 0.95,
    glowOpacity: 0.45,
    highlightOpacity: 0.38,
    colorA: "var(--promo-glow-primary)",
    colorB: "var(--promo-glow-secondary)",
    highlightColor: "var(--promo-edge-highlight)",
    colorSpeed: 1,
    segmentRatio: 0.22,
    quality: "balanced",
    dashCount: 1,
    syncColorToDash: false,
} as const;
