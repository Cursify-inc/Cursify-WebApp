"use client";

import type { CSSProperties } from "react";
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
    return (
        <Container
            as="section"
            id="pricing"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <SectionHeading
                eyebrow="Pricing"
                title="Simple plans for individuals and teams."
                description="Start free, upgrade when you need full desktop sync, AI agents, device controls, and professional workflow integrations."
            />

            <div className="mt-16 grid auto-rows-fr gap-6 lg:grid-cols-3">

                {plans.map((plan, index) => {
                    const isHighlighted = plan.highlighted === true;

                    return (
                        <LargeCard
                            key={plan.name}
                            interactive
                            glow
                            animateIn
                            delay={index * 0.1}
                            style={isHighlighted ? featuredCardVars : undefined}
                            className="h-full transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.015]"
                            contentClassName="relative flex h-full min-h-[32rem] flex-col"
                        >

                            {isHighlighted && (
                                <span className="absolute right-6 top-6 rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-semibold text-[var(--text-inverted)] shadow-md">
                                    Popular
                                </span>
                            )}

                            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                                {plan.name}
                            </h3>

                            <div className="mt-6 flex items-end gap-1">
                                <span className="text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                                    {plan.price}
                                </span>

                                <span className="pb-1 text-[var(--text-secondary)]">
                                    /mo
                                </span>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                                {plan.description}
                            </p>

                            <div className="mt-7 space-y-3">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">

                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-primary)]/15">
                                            <Check className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                                        </span>

                                        <span className="text-sm text-[var(--text-secondary)]">
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
        </Container>
    );
}
