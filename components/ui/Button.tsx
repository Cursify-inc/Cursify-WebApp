"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AutoEdgeLight } from "./AutoEdgeLight"; // adjust path if needed

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
    children: React.ReactNode;
    href?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;

    /**
     * Optional override:
     * - true  => always show edge light
     * - false => never show edge light
     * - undefined => variant default (primary on, secondary subtle on, ghost off)
     */
    edgeLight?: boolean;
};

type EdgePreset = {
    strokeWidth: number;
    glowWidth: number;
    glowBlur: number;
    segmentRatio: number;
    trailCount: number;
    trailGap: number;
    idleSpeed: number;
    hoverSpeedBoost: number;
    attractStrength: number;
    proximityRadius: number;
    pulseDurationMs: number;
    pulseIntensity: number;
    interactionBoostAmount: number;
    interactionBoostDecay: number;
    coreOpacity: number;
    glowOpacity: number;
    highlightOpacity: number;
    colorA: string;
    colorB: string;
    highlightColor: string;
};

const EDGE_PRESETS: Record<ButtonVariant, EdgePreset> = {
    primary: {
        strokeWidth: 1.8,
        glowWidth: 7.5,
        glowBlur: 8,
        segmentRatio: 0.26,
        trailCount: 4,
        trailGap: 1.0,
        idleSpeed: 0.26,
        hoverSpeedBoost: 0.28,
        attractStrength: 6.5,
        proximityRadius: 130,
        pulseDurationMs: 700,
        pulseIntensity: 1.0,
        interactionBoostAmount: 30,
        interactionBoostDecay: 1.12,
        coreOpacity: 0.75,
        glowOpacity: 0.38,
        highlightOpacity: 0.2,
        colorA: "rgb(56 189 248)",   // cyan-400
        colorB: "rgb(129 140 248)",  // indigo-400
        highlightColor: "rgb(255 255 255)",
    },
    secondary: {
        strokeWidth: 1.3,
        glowWidth: 4.8,
        glowBlur: 6,
        segmentRatio: 0.2,
        trailCount: 3,
        trailGap: 1.15,
        idleSpeed: 0.17,
        hoverSpeedBoost: 0.18,
        attractStrength: 4.8,
        proximityRadius: 110,
        pulseDurationMs: 560,
        pulseIntensity: 0.65,
        interactionBoostAmount: 16,
        interactionBoostDecay: 1.28,
        coreOpacity: 0.45,
        glowOpacity: 0.22,
        highlightOpacity: 0.12,
        colorA: "rgb(148 163 184)",  // slate-400
        colorB: "rgb(99 102 241)",   // indigo-500
        highlightColor: "rgb(255 255 255)",
    },
    ghost: {
        // Not used by default (ghost edge light is off), but kept for override edgeLight={true}
        strokeWidth: 1.1,
        glowWidth: 3.8,
        glowBlur: 5,
        segmentRatio: 0.18,
        trailCount: 2,
        trailGap: 1.2,
        idleSpeed: 0.14,
        hoverSpeedBoost: 0.14,
        attractStrength: 4.2,
        proximityRadius: 100,
        pulseDurationMs: 520,
        pulseIntensity: 0.5,
        interactionBoostAmount: 12,
        interactionBoostDecay: 1.32,
        coreOpacity: 0.35,
        glowOpacity: 0.16,
        highlightOpacity: 0.1,
        colorA: "rgb(148 163 184)",
        colorB: "rgb(125 211 252)",
        highlightColor: "rgb(255 255 255)",
    },
};

export function Button({
                           children,
                           href,
                           variant = "primary",
                           size = "md",
                           className,
                           edgeLight,
                       }: ButtonProps) {
    const surfaceRef = React.useRef<HTMLSpanElement | null>(null);
    const [burstKey, setBurstKey] = React.useState(0);

    // Variant defaults
    const variantDefaultEdgeLight = variant !== "ghost";
    const showEdgeLight = edgeLight ?? variantDefaultEdgeLight;

    const preset = EDGE_PRESETS[variant];

    const triggerBurst = () => {
        if (!showEdgeLight) return;
        setBurstKey((k) => k + 1);
    };

    const classes = cn(
        "relative overflow-hidden focus-ring inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
        "bg-brand text-text-inverse shadow-soft hover:-translate-y-0.5 hover:bg-brand-hover",
        variant === "secondary" &&
        "border border-border bg-background-surface text-text-primary hover:-translate-y-0.5 hover:border-brand-light hover:shadow-soft",
        variant === "ghost" &&
        "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/10",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-13 px-7 py-4 text-base",
        className
    );

    const edge = showEdgeLight ? (
        <>
      <span
          ref={surfaceRef}
          className="pointer-events-none absolute inset-0 rounded-full"
      />

            <AutoEdgeLight
                active={false} key={burstKey}
                parentRef={surfaceRef}
                inset={-1}
                className="pointer-events-none absolute inset-0 z-10"
                enableIdleScan
                enableCursorProximity
                enablePulse
                {...preset}            />
        </>
    ) : null;

    if (href) {
        return (
            <Link href={href} className={classes} onPointerDown={triggerBurst}>
                {edge}
                <span className="relative z-20 inline-flex items-center">{children}</span>
            </Link>
        );
    }

    return (
        <button type="button" className={classes} onPointerDown={triggerBurst}>
            {edge}
            <span className="relative z-20 inline-flex items-center">{children}</span>
        </button>
    );
}
