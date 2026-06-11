"use client";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, type CardProps } from "./Card";
import { CARD_STYLE, getEdgeLightPreset, NO_EDGE_DEFAULT_TONE } from "./card.tokens";

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

export interface TinyCardProps extends Omit<CardProps, "children" | "edgeLightProps"> {
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
    extends Omit<CardProps, "children" | "glow" | "edgeLightProps"> {
    className?: string;
    contentClassName?: string;
    leading?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    trailing?: React.ReactNode;
    children?: React.ReactNode;
    tone?: TinyNoEdgeTone;
}

export function LargeCard({
                              className,
                              contentClassName,
                              children,
                              glow = true,
                              edgeLightProps,
                              ...props
                          }: LargeCardProps) {
    const { resolvedTheme } = useTheme();
    const mode = resolvedTheme === "dark" ? "dark" : "light";

    const resolvedEdgeLightProps = edgeLightProps ?? getEdgeLightPreset("large", mode);

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
    const { resolvedTheme } = useTheme();
    const mode = resolvedTheme === "dark" ? "dark" : "light";

    const resolvedEdgeLightProps = edgeLightProps ?? getEdgeLightPreset("tiny", mode);

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
