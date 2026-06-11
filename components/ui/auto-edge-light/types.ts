import { RefObject } from "react";

export type CornerRadius = { rx: number; ry: number };
export type CornerRadii = {
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
    speedSpring?: { stiffness?: number; damping?: number; mass?: number };
    proximitySpring?: { stiffness?: number; damping?: number; mass?: number };
    activationSpring?: { stiffness?: number; damping?: number; mass?: number };
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
};
