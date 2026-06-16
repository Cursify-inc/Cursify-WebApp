"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { LargeCard } from "@/components/ui/CardVariants";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For exploring Cursify and basic account sync.",
        features: ["Web account", "Basic desktop access", "Community tools", "Limited sync"],
    },
    {
        name: "Pro",
        price: "$19",
        description: "For professional developers using Cursify daily.",
        highlighted: true,
        features: [
            "Full desktop IDE access",
            "Custom AI agents",
            "Tool and extension sync",
            "Signed downloads",
            "Device management",
            "Linked developer accounts",
        ],
    },
    {
        name: "Team",
        price: "$49",
        description: "For teams managing shared workflows and future organizations.",
        features: [
            "Everything in Pro",
            "Organization members",
            "Shared tool policy",
            "Admin visibility",
            "Priority support",
        ],
    },
];

const featuredCardVars = {
    "--card-bg": "var(--pricing-card-featured-bg)",
    "--card-bg-hover": "var(--pricing-card-featured-bg-hover)",
    "--card-border": "var(--pricing-card-featured-border)",
    "--card-border-hover": "var(--pricing-card-featured-border-hover)",
    "--card-glow": "var(--pricing-card-featured-glow)",
    "--card-highlight": "var(--pricing-card-featured-highlight)",
    "--card-shadow": "var(--pricing-card-featured-shadow)",
    "--card-shadow-hover": "var(--pricing-card-featured-shadow-hover)",
} as CSSProperties;

export function PricingPreview() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { margin: "-15%", once: true });

    return (
        <Container
            as="section"
            ref={ref}
            id="pricing"
            variant="section"
            width="wide"
            className="relative overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0 bg-[var(--pricing-section-bg)]" />

            <div className="relative z-10">
                <SectionHeading
                    eyebrow="Pricing"
                    title="Simple plans for individuals and teams."
                    description="Start free, upgrade when you need full desktop sync, AI agents, device controls, and professional workflow integrations."
                />

                <div className="mt-14 grid auto-rows-fr items-stretch gap-5 lg:grid-cols-3">
                    {plans.map((plan, index) => {
                        const isHighlighted = plan.highlighted === true;

                        return (
                            <LargeCard
                                key={plan.name}
                                interactive
                                glow
                                glowActiveOverride={inView}
                                animateIn
                                delay={index}
                                style={isHighlighted ? featuredCardVars : undefined}
                                className="h-full"
                                contentClassName="relative flex h-full min-h-[32rem] flex-col"
                                edgeLightProps={{
                                    quality: isHighlighted ? "ultra" : "balanced",
                                    dashCount: isHighlighted ? 4 : 3,
                                    syncColorToDash: true,
                                    coreOpacity: isHighlighted ? 0.86 : 0.68,
                                    glowOpacity: isHighlighted ? 0.32 : 0.2,
                                }}
                            >
                                {isHighlighted ? (
                                    <span className="theme-color-fade absolute right-6 top-6 rounded-full border border-[var(--pricing-badge-border)] bg-[var(--pricing-badge-bg)] px-3 py-1 text-xs font-bold text-[var(--pricing-badge-text)] shadow-[var(--pricing-badge-shadow)]">
                                        Popular
                                    </span>
                                ) : null}

                                <h3
                                    className={
                                        isHighlighted
                                            ? "theme-color-fade text-xl font-bold text-[var(--pricing-featured-title)]"
                                            : "theme-color-fade text-xl font-bold text-[var(--pricing-plan-title)]"
                                    }
                                >
                                    {plan.name}
                                </h3>

                                <div className="mt-5 flex items-end gap-1">
                                    <span
                                        className={
                                            isHighlighted
                                                ? "theme-color-fade text-5xl font-bold tracking-tight text-[var(--pricing-featured-price)]"
                                                : "theme-color-fade text-5xl font-bold tracking-tight text-[var(--pricing-plan-price)]"
                                        }
                                    >
                                        {plan.price}
                                    </span>

                                    <span
                                        className={
                                            isHighlighted
                                                ? "theme-color-fade pb-1 text-[var(--pricing-featured-period)]"
                                                : "theme-color-fade pb-1 text-[var(--pricing-plan-period)]"
                                        }
                                    >
                                        /mo
                                    </span>
                                </div>

                                <p
                                    className={
                                        isHighlighted
                                            ? "theme-color-fade mt-4 text-sm leading-7 text-[var(--pricing-featured-description)]"
                                            : "theme-color-fade mt-4 text-sm leading-7 text-[var(--pricing-plan-description)]"
                                    }
                                >
                                    {plan.description}
                                </p>

                                <div className="mt-7 space-y-3">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <span
                                                className={
                                                    isHighlighted
                                                        ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--pricing-featured-check-bg)]"
                                                        : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--pricing-check-bg)]"
                                                }
                                            >
                                                <Check
                                                    className={
                                                        isHighlighted
                                                            ? "theme-color-fade h-3.5 w-3.5 text-[var(--pricing-featured-check)]"
                                                            : "theme-color-fade h-3.5 w-3.5 text-[var(--pricing-check)]"
                                                    }
                                                />
                                            </span>

                                            <span
                                                className={
                                                    isHighlighted
                                                        ? "theme-color-fade text-sm text-[var(--pricing-featured-feature)]"
                                                        : "theme-color-fade text-sm text-[var(--pricing-plan-feature)]"
                                                }
                                            >
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-8">
                                    <Button
                                        href="/signup"
                                        variant={isHighlighted ? "secondary" : "primary"}
                                        className="w-full"
                                    >
                                        Get started
                                    </Button>
                                </div>
                            </LargeCard>
                        );
                    })}
                </div>
            </div>
        </Container>
    );
}
