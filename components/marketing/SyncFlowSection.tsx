"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
    BadgeCheck,
    Computer,
    Download,
    KeyRound,
    RefreshCcw,
    UserPlus,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { LargeCard } from "@/components/ui/CardVariants";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Surface } from "@/components/ui/Surface";

const steps = [
    {
        icon: UserPlus,
        title: "Initialize workspace",
        description:
            "Create a verified identity and establish a secure foundation for your AI environment.",
    },
    {
        icon: Download,
        title: "Provision runtime",
        description:
            "Generate a signed, account-bound desktop runtime request with controlled delivery.",
    },
    {
        icon: KeyRound,
        title: "Authorize device",
        description:
            "Approve enrollment with a short-lived cryptographic token designed for one-time pairing.",
    },
    {
        icon: Computer,
        title: "Bind infrastructure",
        description:
            "Register the desktop instance, attach trusted credentials, and activate device identity.",
    },
    {
        icon: BadgeCheck,
        title: "Validate policy",
        description:
            "Check license state, entitlements, subscription access, and device trust in real time.",
    },
    {
        icon: RefreshCcw,
        title: "Hydrate workspace",
        description:
            "Sync models, agents, tools, settings, and integrations into a ready-to-run AI environment.",
    },
];

export function SyncFlowSection() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { margin: "-15%", once: true });
    const prefersReducedMotion = useReducedMotion() ?? false;

    return (
        <Container
            as="section"
            id="sync"
            variant="section"
            width="wide"
            className="relative overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[var(--sync-flow-bg)]" />

                <div
                    className="absolute inset-0 bg-size-[48px_48px] opacity-[var(--sync-flow-grid-opacity)]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--sync-flow-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--sync-flow-grid-line) 1px, transparent 1px)",
                    }}
                />

                <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-linear-to-b from-transparent via-[var(--sync-flow-divider)] to-transparent lg:block" />

                {!prefersReducedMotion && inView ? (
                    <motion.div
                        className="absolute inset-x-[-10%] top-16 h-px bg-linear-to-r from-transparent via-[var(--sync-flow-scanline)] to-transparent"
                        animate={{ opacity: [0.35, 0.7, 0.35] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                ) : null}
            </div>

            <div className="relative z-10">
                <Surface size="lg">
                    <SectionHeading
                        eyebrow="Desktop pairing"
                        title="A secure AI-native install flow from browser to desktop."
                        description="Built to feel seamless for users and trustworthy to stakeholders."
                    />
                </Surface>

                <div className="relative mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <LargeCard
                                key={step.title}
                                interactive
                                glow
                                glowActiveOverride={inView}
                                className="h-full"
                                edgeLightProps={{
                                    quality: "balanced",
                                    dashCount: 3,
                                    syncColorToDash: true,
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--sync-flow-icon-border)] bg-[var(--sync-flow-icon-bg)] shadow-[var(--sync-flow-icon-shadow)]"
                                        style={{
                                            transform: "translateZ(28px)",
                                            backfaceVisibility: "hidden",
                                        }}
                                    >
                                        <div className="absolute inset-px rounded-[15px] bg-linear-to-br from-[var(--sync-flow-icon-highlight)] to-transparent opacity-70" />
                                        <Icon className="theme-color-fade relative z-10 h-5 w-5 text-[var(--sync-flow-icon-color)]" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="theme-color-fade mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sync-flow-step-label)]">
                                            Step {index + 1}
                                        </div>

                                        <h3 className="theme-color-fade text-lg font-semibold tracking-tight text-[var(--sync-flow-step-title)] sm:text-xl">
                                            {step.title}
                                        </h3>

                                        <p className="theme-color-fade mt-3 max-w-[44ch] text-sm leading-6 text-[var(--sync-flow-step-description)]">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </LargeCard>
                        );
                    })}
                </div>
            </div>
        </Container>
    );
}
