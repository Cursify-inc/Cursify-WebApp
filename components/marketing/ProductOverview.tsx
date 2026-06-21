"use client";

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
    return (
        <Container
            as="section"
            id="platform"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <SectionHeading
                eyebrow="Platform"
                title="More than a website. A complete AI developer ecosystem."
                description="Cursify gives developers a secure account platform for managing their AI-powered desktop IDE, subscription, devices, integrations, agents, tools, and sync state."
            />

            <div className="mt-16 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                        <LargeCard
                            key={feature.title}
                            interactive
                            glow
                            animateIn
                            delay={index * 0.08}
                            className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015]"
                            contentClassName="flex h-full flex-col"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl
                            bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary))]
                            text-[var(--text-inverted)]
                            shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_35%,transparent)]">

                                <Icon className="h-5 w-5" />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                                {feature.title}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                                {feature.description}
                            </p>
                        </LargeCard>
                    );
                })}
            </div>
        </Container>
    );
}
