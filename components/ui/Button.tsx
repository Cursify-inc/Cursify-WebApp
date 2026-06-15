"use client";

import * as React from "react";
import Link from "next/link";

import AutoEdgeLight from "@/components/ui/AutoEdgeLight";
import type { EdgeLightOptions } from "@/components/ui/card.tokens";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
    children: React.ReactNode;
    href?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    edgeLight?: boolean;
    edgeLightProps?: Partial<EdgeLightOptions>;
};

const EDGE_BASE: Partial<EdgeLightOptions> = {
    durationSec: 2.8,
    strokeWidth: 1.65,
    glowWidth: 6.5,
    glowBlur: 5,
    coreOpacity: 0.74,
    glowOpacity: 0.24,
    highlightOpacity: 0.12,
    colorA: "var(--ael-color-a)",
    colorB: "var(--ael-color-b)",
    highlightColor: "var(--ael-highlight)",
    colorSpeed: 1,
    segmentRatio: 0.2,
    quality: "balanced",
    dashCount: 1,
    syncColorToDash: false,
};

const EDGE_PRESETS: Record<ButtonVariant, Partial<EdgeLightOptions>> = {
    primary: {
        ...EDGE_BASE,
        durationSec: 2.55,
        coreOpacity: 0.8,
        glowOpacity: 0.28,
        highlightOpacity: 0.15,
    },
    secondary: {
        ...EDGE_BASE,
        durationSec: 2.85,
        coreOpacity: 0.62,
        glowOpacity: 0.18,
        highlightOpacity: 0.1,
    },
    ghost: {
        ...EDGE_BASE,
        durationSec: 3.1,
        coreOpacity: 0.42,
        glowOpacity: 0.1,
        highlightOpacity: 0.06,
    },
};

export function Button({
                           children,
                           href,
                           variant = "primary",
                           size = "md",
                           className,
                           edgeLight,
                           edgeLightProps,
                       }: ButtonProps) {
    const surfaceRef = React.useRef<HTMLElement | null>(null);

    const setSurfaceRef = React.useCallback(
        (node: HTMLAnchorElement | HTMLButtonElement | null) => {
            surfaceRef.current = node;
        },
        []
    );

    const variantDefaultEdgeLight = variant !== "ghost";
    const showEdgeLight = edgeLight ?? variantDefaultEdgeLight;

    const classes = cn(
        "focus-ring theme-color-fade relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-semibold",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-transform duration-200",
        variant === "primary" &&
        "bg-linear-to-b from-[var(--button-primary-bg-from)] to-[var(--button-primary-bg-to)] text-[var(--button-primary-text)] shadow-[var(--button-primary-shadow)] hover:-translate-y-0.5 hover:from-[var(--button-primary-bg-hover-from)] hover:to-[var(--button-primary-bg-hover-to)] hover:shadow-[var(--button-primary-shadow-hover)]"
,
        variant === "secondary" &&
        "border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:-translate-y-0.5 hover:border-[var(--button-secondary-border-hover)] hover:bg-[var(--button-secondary-bg-hover)] hover:shadow-[var(--button-secondary-shadow-hover)]"
,
        variant === "ghost" &&
        "bg-transparent text-[var(--button-ghost-text)] hover:bg-[var(--button-ghost-bg-hover)] hover:text-[var(--button-ghost-text-hover)]",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-13 px-7 py-4 text-base",
        className
    );

    const edge = showEdgeLight ? (
        <AutoEdgeLight
            active
            parentRef={surfaceRef}
            inset={0}
            className="edge-light-root pointer-events-none absolute inset-0 z-10"
            {...EDGE_PRESETS[variant]}
            {...edgeLightProps}
        />
    ) : null;

    const content = (
        <>
            {edge}
            <span className="relative z-20 inline-flex items-center">
                {children}
            </span>
        </>
    );

    if (href) {
        return (
            <Link href={href} ref={setSurfaceRef} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <button ref={setSurfaceRef} type="button" className={classes}>
            {content}
        </button>
    );
}
