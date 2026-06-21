"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
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
    return (
        <Container
            as="section"
            id="sync"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <SectionHeading
                eyebrow="Desktop pairing"
                title="A secure AI-native install flow from browser to desktop."
                description="Built to feel seamless for users and trustworthy to stakeholders."
            />

            <div className="relative mt-16 grid gap-8 lg:grid-cols-2">

                {steps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                        <LargeCard
                            key={step.title}
                            interactive
                            glow
                            animateIn
                            delay={index * 0.08}
                            className="transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015]"
                        >
                            <div className="flex items-start gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                                bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary))]
                                text-[var(--text-inverted)] shadow-lg">

                                    <Icon className="h-5 w-5" />
                                </div>

                                <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                                        Step {index + 1}
                                    </div>

                                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                                        {step.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                        {step.description}
                                    </p>
                                </div>

                            </div>
                        </LargeCard>
                    );
                })}

            </div>
        </Container>
    );
}
