"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import {
    Bot,
    CloudCog,
    Download,
    GitBranch,
    MonitorCog,
    Puzzle,
    ShieldCheck,
    WalletCards,
} from "lucide-react";

import { LargeCard } from "@/components/ui/CardVariants";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
    {
        icon: MonitorCog,
        title: "Synced desktop IDE",
        description:
            "A professional VS Code-based desktop IDE with settings, agents, tools, extensions, and account state synced from Cursify.",
    },
    {
        icon: Download,
        title: "Secure downloads",
        description:
            "Account-bound desktop downloads with short-lived URLs, checksum visibility, signed binaries, and audit logging.",
    },
    {
        icon: Bot,
        title: "Custom AI agents",
        description:
            "Create and manage developer agents for code review, planning, refactoring, debugging, documentation, and workflows.",
    },
    {
        icon: Puzzle,
        title: "Tool ecosystem",
        description:
            "Browse, install, and sync trusted AI tools and extensions across your desktop environment.",
    },
    {
        icon: GitBranch,
        title: "Linked developer accounts",
        description:
            "Connect GitHub, GitLab, Slack, ClickUp, and future workflow providers with clear permission visibility.",
    },
    {
        icon: WalletCards,
        title: "Subscription management",
        description:
            "Stripe-powered billing, entitlement resolution, invoices, upgrade paths, and billing portal access.",
    },
    {
        icon: ShieldCheck,
        title: "Device trust controls",
        description:
            "Pair, inspect, and revoke desktop devices from the web dashboard with server-side license validation.",
    },
    {
        icon: CloudCog,
        title: "Scalable backend model",
        description:
            "Built around Go API services, Rust security helpers, PostgreSQL, Redis, object storage, and observability.",
    },
];

export function ProductOverview() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { margin: "-15%", once: true });

    return (
        <Container
            as="section"
            ref={ref}
            id="platform"
            variant="section"
            width="wide"
            className="relative overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0 bg-[var(--product-overview-bg)]" />

            <div className="relative z-10">
                <SectionHeading
                    eyebrow="Platform"
                    title="More than a website. A complete AI developer ecosystem."
                    description="Cursify gives developers a secure account platform for managing their AI-powered desktop IDE, subscription, devices, integrations, agents, tools, and sync state."
                />

                <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <LargeCard
                                key={feature.title}
                                interactive
                                glow
                                glowActiveOverride={inView}
                                animateIn
                                delay={Math.min(index, 5)}
                                className="h-full"
                                contentClassName="flex h-full flex-col"
                                edgeLightProps={{
                                    quality: "balanced",
                                    dashCount: 3,
                                    syncColorToDash: true,
                                }}
                            >
                                <div
                                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--product-feature-icon-border)] bg-[var(--product-feature-icon-bg)] shadow-[var(--product-feature-icon-shadow)]"
                                    style={{
                                        transform: "translateZ(24px)",
                                        backfaceVisibility: "hidden",
                                    }}
                                >
                                    <div className="absolute inset-px rounded-[15px] bg-linear-to-br from-[var(--product-feature-icon-highlight)] to-transparent opacity-75" />
                                    <Icon className="theme-color-fade relative z-10 h-5 w-5 text-[var(--product-feature-icon-color)]" />
                                </div>

                                <h3 className="theme-color-fade mt-5 text-lg font-bold text-[var(--product-feature-title)]">
                                    {feature.title}
                                </h3>

                                <p className="theme-color-fade mt-3 text-sm leading-7 text-[var(--product-feature-description)]">
                                    {feature.description}
                                </p>
                            </LargeCard>
                        );
                    })}
                </div>
            </div>
        </Container>
    );
}
