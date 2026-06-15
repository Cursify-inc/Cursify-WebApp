"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Card, type CardProps } from "./Card";
import {
    CARD_VARIANT_CLASSES,
    getEdgeLightPreset,
    NO_EDGE_DEFAULT_TONE,
    PROMO_EDGE_DEFAULTS,
    TINY_PROMO_EDGE_DEFAULTS,
    type CardSize,
    type EdgeLightOptions,
    type TinyNoEdgeTone,
} from "./card.tokens";
import type { AutoEdgeLightContinuousProps } from "./AutoEdgeLightContinuous";

const AutoEdgeLightContinuous = dynamic(
    () => import("./AutoEdgeLightContinuous").then((m) => m.AutoEdgeLightContinuous),
    { ssr: false }
);

type PromoEdgeProps = Partial<
    Omit<AutoEdgeLightContinuousProps, "parentRef" | "className" | "reducedMotion">
>;

const revealDelayClasses = [
    "card-reveal-delay-0",
    "card-reveal-delay-1",
    "card-reveal-delay-2",
    "card-reveal-delay-3",
    "card-reveal-delay-4",
    "card-reveal-delay-5",
    "card-reveal-delay-6",
] as const;

function getRevealClass(animateIn?: boolean, delay?: number) {
    if (!animateIn) return undefined;

    const delayClass =
        typeof delay === "number"
            ? revealDelayClasses[Math.max(0, Math.min(delay, revealDelayClasses.length - 1))]
            : undefined;

    return cn("card-reveal", delayClass);
}

function useThemeMode() {
    const { resolvedTheme } = useTheme();
    return resolvedTheme === "dark" ? "dark" : "light";
}

function useResolvedEdgeLightPreset(
    size: CardSize,
    edgeLightProps?: Partial<EdgeLightOptions>
): EdgeLightOptions {
    const mode = useThemeMode();

    return React.useMemo(() => {
        const preset = getEdgeLightPreset(size, mode);

        return {
            ...preset,
            ...edgeLightProps,
        };
    }, [edgeLightProps, mode, size]);
}

/* -------------------------------------------------------------------------- */
/* Shared base variant                                                        */
/* -------------------------------------------------------------------------- */

type BaseCardVariant = "large" | "tiny" | "compact";

const CARD_VARIANT_DEFS = {
    large: {
        size: "large",
        classes: CARD_VARIANT_CLASSES.large,
        defaultGlow: false,
    },
    tiny: {
        size: "tiny",
        classes: CARD_VARIANT_CLASSES.tiny,
        defaultGlow: false,
    },
    compact: {
        size: "tiny",
        classes: CARD_VARIANT_CLASSES.compact,
        defaultGlow: false,
    },


} satisfies Record<
    BaseCardVariant,
    {
        size: CardSize;
        classes: {
            root: string;
            inner: string;
        };
        defaultGlow: boolean;
    }
>;

type VariantCardProps = Omit<CardProps, "children" | "edgeLightProps"> & {
    variant: BaseCardVariant;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    edgeLightProps?: Partial<EdgeLightOptions>;
};

function VariantCard({
                         variant,
                         className,
                         contentClassName,
                         children,
                         interactive,
                         glow,
                         glowActiveOverride,
                         animateIn,
                         delay,
                         edgeLightProps,
                         ...props
                     }: VariantCardProps) {
    const def = CARD_VARIANT_DEFS[variant];

    const resolvedGlow = glow ?? def.defaultGlow;
    const resolvedEdgeLightProps = useResolvedEdgeLightPreset(def.size, edgeLightProps);

    return (
        <Card
            {...props}
            className={cn(
                def.classes.root,
                getRevealClass(animateIn, delay),
                className
            )}
            interactive={interactive}
            glow={resolvedGlow}
            glowActiveOverride={glowActiveOverride}
            edgeLightProps={resolvedGlow ? resolvedEdgeLightProps : undefined}
        >
            <div className={cn(def.classes.inner, contentClassName)}>{children}</div>
        </Card>
    );
}

/* -------------------------------------------------------------------------- */
/* Public large card                                                          */
/* -------------------------------------------------------------------------- */

export interface LargeCardProps
    extends Omit<CardProps, "children" | "edgeLightProps"> {
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
    edgeLightProps?: Partial<EdgeLightOptions>;
}

export function LargeCard(props: LargeCardProps) {
    return <VariantCard {...props} variant="large" />;
}

/* -------------------------------------------------------------------------- */
/* Public tiny card                                                           */
/* -------------------------------------------------------------------------- */

export interface TinyCardProps
    extends Omit<CardProps, "children" | "edgeLightProps" | "title"> {
    className?: string;
    contentClassName?: string;
    leading?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    description?: React.ReactNode;
    trailing?: React.ReactNode;
    children?: React.ReactNode;
    edgeLightProps?: Partial<EdgeLightOptions>;
}

function TinyCardContent({
                             leading,
                             title,
                             subtitle,
                             description,
                             trailing,
                             children,
                         }: Pick<
    TinyCardProps,
    "leading" | "title" | "subtitle" | "description" | "trailing" | "children"
>) {
    const resolvedDescription = description ?? subtitle;

    return (
        <>
            {leading ? <div className="ui-card__slot">{leading}</div> : null}

            <div className="ui-card__content">
                {title ? (
                    <div className="ui-card__title theme-color-fade">{title}</div>
                ) : null}

                {resolvedDescription ? (
                    <div className="ui-card__description theme-color-fade">
                        {resolvedDescription}
                    </div>
                ) : null}

                {children}
            </div>

            {trailing ? <div className="ui-card__slot">{trailing}</div> : null}
        </>
    );
}

export function TinyCard({
                             leading,
                             title,
                             subtitle,
                             description,
                             trailing,
                             children,
                             ...props
                         }: TinyCardProps) {
    return (
        <VariantCard {...props} variant="tiny">
            <TinyCardContent
                leading={leading}
                title={title}
                subtitle={subtitle}
                description={description}
                trailing={trailing}
            >
                {children}
            </TinyCardContent>
        </VariantCard>
    );
}

/* -------------------------------------------------------------------------- */
/* Tiny no-edge card                                                          */
/* -------------------------------------------------------------------------- */

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

export function TinyCardNoEdge({
                                   className,
                                   contentClassName,
                                   leading,
                                   title,
                                   subtitle,
                                   trailing,
                                   children,
                                   tone = NO_EDGE_DEFAULT_TONE,
                                   animateIn,
                                   delay,
                                   ...props
                               }: TinyCardNoEdgeProps) {
    const classes =
        tone === "glassGlowPremium"
            ? CARD_VARIANT_CLASSES.glassPremium
            : CARD_VARIANT_CLASSES.glassNeon;

    return (
        <Card
            {...props}
            className={cn(classes.root, getRevealClass(animateIn, delay), className)}
            glow={false}
        >
            <div className={cn(classes.inner, contentClassName)}>
                <TinyCardContent
                    leading={leading}
                    title={title}
                    subtitle={subtitle}
                    trailing={trailing}
                >
                    {children}
                </TinyCardContent>
            </div>
        </Card>
    );
}

/* -------------------------------------------------------------------------- */
/* Promo cards                                                                */
/* -------------------------------------------------------------------------- */

export interface PromoCardProps
    extends Omit<CardProps, "glow" | "interactive" | "edgeLightProps"> {
    edge?: PromoEdgeProps;
    contentClassName?: string;
    className?: string;
}

type PromoVariant = "large" | "tiny";

const PROMO_VARIANT_DEFS = {
    large: {
        classes: CARD_VARIANT_CLASSES.promoLarge,
        defaultEdge: PROMO_EDGE_DEFAULTS,
    },
    tiny: {
        classes: CARD_VARIANT_CLASSES.promoTiny,
        defaultEdge: TINY_PROMO_EDGE_DEFAULTS,
    },
} as const;

interface PromoCardBaseProps extends PromoCardProps {
    variant: PromoVariant;
}

function PromoCardBase({
                           variant,
                           className,
                           contentClassName,
                           children,
                           edge,
                           animateIn,
                           delay,
                           ...props
                       }: PromoCardBaseProps) {
    const reducedMotion = useReducedMotion();
    const ringHostRef = React.useRef<HTMLDivElement>(null);

    const def = PROMO_VARIANT_DEFS[variant];

    const resolvedEdge = React.useMemo(
        () => ({
            ...def.defaultEdge,
            ...edge,
        }),
        [def.defaultEdge, edge]
    );

    return (
        <Card
            {...props}
            glow={false}
            interactive={false}
            className={cn(
                "relative overflow-visible",
                def.classes.root,
                getRevealClass(animateIn, delay),
                className
            )}
        >
            <div ref={ringHostRef} className={cn(def.classes.inner, contentClassName)}>
                <AutoEdgeLightContinuous
                    parentRef={ringHostRef}
                    reducedMotion={!!reducedMotion}
                    className="rounded-[inherit]"
                    durationSec={resolvedEdge.durationSec}
                    colorSpeed={resolvedEdge.colorSpeed}
                    segmentRatio={resolvedEdge.segmentRatio}
                    inset={resolvedEdge.inset}
                    strokeWidth={resolvedEdge.strokeWidth}
                    glowWidth={resolvedEdge.glowWidth}
                    glowBlur={resolvedEdge.glowBlur}
                    coreOpacity={resolvedEdge.coreOpacity}
                    glowOpacity={resolvedEdge.glowOpacity}
                    highlightOpacity={resolvedEdge.highlightOpacity}
                    colorA={resolvedEdge.colorA}
                    colorB={resolvedEdge.colorB}
                    highlightColor={resolvedEdge.highlightColor}
                    quality={resolvedEdge.quality}
                    dashCount={resolvedEdge.dashCount}
                    syncColorToDash={resolvedEdge.syncColorToDash}
                />

                {children}
            </div>
        </Card>
    );
}

export function PromoCard(props: PromoCardProps) {
    return <PromoCardBase {...props} variant="large" />;
}

export function TinyPromoCard(props: PromoCardProps) {
    return <PromoCardBase {...props} variant="tiny" />;
}

export default PromoCard;

export function CompactCard(props: LargeCardProps) {
    return <VariantCard {...props} variant="compact" />;
}
