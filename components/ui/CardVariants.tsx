"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Card, type CardProps } from "./Card";
import { CARD_STYLE, getEdgeLightPreset, NO_EDGE_DEFAULT_TONE } from "./card.tokens";
import type { AutoEdgeLightContinuousProps } from "./AutoEdgeLightContinuous";

const AutoEdgeLightContinuous = dynamic(
    () => import("./AutoEdgeLightContinuous").then((m) => m.AutoEdgeLightContinuous),
    { ssr: false }
);

/**
 * EdgeLight options accepted by <Card edgeLightProps={...} />
 */
export type EdgeLightOptions = NonNullable<CardProps["edgeLightProps"]>;

export interface LargeCardProps extends Omit<CardProps, "children" | "edgeLightProps"> {
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
    edgeLightProps?: EdgeLightOptions;
}

export interface TinyCardProps
    extends Omit<CardProps, "children" | "edgeLightProps" | "title"> {
    className?: string;
    contentClassName?: string;
    leading?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    trailing?: React.ReactNode;
    children?: React.ReactNode;
    edgeLightProps?: EdgeLightOptions;
}

export type TinyNoEdgeTone = "glassGlowNeon" | "glassGlowPremium";

export interface TinyCardNoEdgeProps
    extends Omit<CardProps, "children" | "glow" | "edgeLightProps" | "title"> {
    className?: string;
    contentClassName?: string;
    leading?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    trailing?: React.ReactNode;
    children?: React.ReactNode;
    tone?: TinyNoEdgeTone;
}

function useThemeMode() {
    const { resolvedTheme } = useTheme();
    return resolvedTheme === "dark" ? "dark" : "light";
}

function useResolvedEdgeLightPreset(
    size: "large" | "tiny",
    edgeLightProps?: EdgeLightOptions
): EdgeLightOptions {
    const mode = useThemeMode();
    return React.useMemo(
        () => edgeLightProps ?? getEdgeLightPreset(size, mode),
        [edgeLightProps, mode, size]
    );
}

export function LargeCard({
                              className,
                              contentClassName,
                              children,
                              glow = true,
                              edgeLightProps,
                              ...props
                          }: LargeCardProps) {
    const resolvedEdgeLightProps = useResolvedEdgeLightPreset("large", edgeLightProps);

    return (
        <Card
            {...props}
            className={cn(CARD_STYLE.large, className)}
            glow={glow}
            edgeLightProps={resolvedEdgeLightProps}
        >
            <div className={cn(CARD_STYLE.largeInner, contentClassName)}>{children}</div>
        </Card>
    );
}

export function TinyCard({
                             className,
                             contentClassName,
                             leading,
                             title,
                             subtitle,
                             trailing,
                             children,
                             glow = true,
                             edgeLightProps,
                             ...props
                         }: TinyCardProps) {
    const resolvedEdgeLightProps = useResolvedEdgeLightPreset("tiny", edgeLightProps);

    return (
        <Card
            {...props}
            className={cn(CARD_STYLE.tiny, className)}
            glow={glow}
            edgeLightProps={resolvedEdgeLightProps}
        >
            <div className={cn(CARD_STYLE.tinyInner, contentClassName)}>
                {leading ? <div className="shrink-0">{leading}</div> : null}

                <div className="min-w-0 flex-1">
                    {title ? <div className="truncate text-sm font-medium">{title}</div> : null}
                    {subtitle ? <div className="mt-0.5 truncate text-xs opacity-75">{subtitle}</div> : null}
                    {children}
                </div>

                {trailing ? <div className="shrink-0">{trailing}</div> : null}
            </div>
        </Card>
    );
}

export function TinyCardNoEdge({
                                   className,
                                   contentClassName,
                                   leading,
                                   title,
                                   subtitle,
                                   trailing,
                                   children,
                                   tone = NO_EDGE_DEFAULT_TONE,
                                   ...props
                               }: TinyCardNoEdgeProps) {
    const toneClass =
        tone === "glassGlowPremium" ? "glass-glow glass-glow-premium" : "glass-glow glass-glow-neon";

    return (
        <Card {...props} className={cn("rounded-[1.25rem]", toneClass, className)} glow={false}>
            <div
                className={cn(
                    "relative z-10 flex items-center gap-3 rounded-[1.25rem] bg-transparent p-3.5 md:p-4",
                    contentClassName
                )}
            >
                {leading ? <div className="shrink-0">{leading}</div> : null}

                <div className="min-w-0 flex-1">
                    {title ? <div className="truncate text-sm font-medium">{title}</div> : null}
                    {subtitle ? <div className="mt-0.5 truncate text-xs opacity-75">{subtitle}</div> : null}
                    {children}
                </div>

                {trailing ? <div className="shrink-0">{trailing}</div> : null}
            </div>
        </Card>
    );
}

// ✅ Derived directly from AutoEdgeLightContinuous
type PromoEdgeProps = Partial<
    Omit<AutoEdgeLightContinuousProps, "parentRef" | "className" | "reducedMotion">
>;

export interface PromoCardProps extends Omit<CardProps, "glow" | "interactive" | "edgeLightProps"> {
    edge?: PromoEdgeProps;
    contentClassName?: string;
    className?: string;
}

export function PromoCard({
                              className,
                              contentClassName,
                              children,
                              edge,
                              ...props
                          }: PromoCardProps) {
    const reducedMotion = useReducedMotion();
    const ringHostRef = React.useRef<HTMLDivElement>(null);

    return (
        <Card
            {...props}
            glow={false}
            interactive={false}
            className={cn("relative overflow-visible", CARD_STYLE.large, className)}
        >
            <div ref={ringHostRef} className={cn("relative z-10 rounded-[inherit]", contentClassName)}>
                <AutoEdgeLightContinuous
                    parentRef={ringHostRef}
                    reducedMotion={!!reducedMotion}
                    className="rounded-[inherit]"
                    durationSec={edge?.durationSec ?? 8}
                    colorSpeed={edge?.colorSpeed ?? 120}
                    segmentRatio={edge?.segmentRatio ?? 0.22}
                    radius={edge?.radius}
                    inset={edge?.inset ?? 0}
                    strokeWidth={edge?.strokeWidth ?? 2.2}
                    glowWidth={edge?.glowWidth ?? 10}
                    glowBlur={edge?.glowBlur ?? 12}
                    coreOpacity={edge?.coreOpacity ?? 0.95}
                    glowOpacity={edge?.glowOpacity ?? 0.75}
                    highlightOpacity={edge?.highlightOpacity ?? 0.38}
                    colorA={edge?.colorA ?? "var(--promo-glow-primary)"}
                    colorB={edge?.colorB ?? "var(--promo-glow-secondary)"}
                    highlightColor={edge?.highlightColor ?? "var(--promo-edge-highlight)"}
                />
                {children}
            </div>
        </Card>
    );
}

export function TinyPromoCard({ className, edge, ...props }: PromoCardProps) {
    return (
        <PromoCard
            {...props}
            className={cn("relative overflow-visible", CARD_STYLE.tiny, className)}
            edge={{
                durationSec: 0.25,
                radius: 16,
                inset: 0,
                strokeWidth: 22,
                glowWidth: 10,
                glowBlur: 12,
                coreOpacity: 0.95,
                glowOpacity: 0.78,
                highlightOpacity: 0.42,
                colorA: "var(--promo-glow-primary)",
                colorB: "var(--promo-glow-secondary)",
                highlightColor: "var(--promo-edge-highlight)",
                colorSpeed: 120,
                segmentRatio: 0.22,
                ...edge,
            }}
        />
    );
}

export default PromoCard;
