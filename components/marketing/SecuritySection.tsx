"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { RotateCcw, ShieldCheck, Siren } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { TinyCard } from "@/components/ui/CardVariants";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Surface } from "@/components/ui/Surface";

const securityItems = [
    "HTTP-only session cookies",
    "Argon2id password hashing",
    "Refresh token rotation",
    "Short-lived signed tokens",
    "Encrypted OAuth token storage",
    "Download audit logging",
    "Device revocation support",
    "Server-side license validation",
    "Checksum and binary signatures",
    "Suspicious activity detection",
];

export function SecuritySection() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { margin: "-15%", once: true });

    return (
        <Container
            as="section"
            id="security"
            variant="section"
            width="wide"
            className="relative overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0 bg-[var(--security-section-bg)]" />

            <div className="relative z-10">
                <Surface size="lg" className="mb-16">
                    <SectionHeading
                        eyebrow="Security"
                        title="Designed for account-bound desktop software from day one."
                        description="Cursify avoids unrealistic security claims. The platform uses layered controls, signed short-lived responses, server-side entitlement checks, and clear revocation paths."
                    />
                </Surface>

                <div className="relative w-full overflow-hidden rounded-[28px] border border-[var(--security-shell-border)] bg-[var(--security-shell-bg)] shadow-[var(--security-shell-shadow)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,var(--security-shell-glow),transparent_32%)]" />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[var(--security-shell-highlight)] to-transparent" />

                    <div className="relative grid lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="p-8 lg:border-r lg:border-[var(--security-shell-divider)]">
                            <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--security-icon-chip-border)] bg-[var(--security-icon-chip-bg)] shadow-[var(--security-icon-chip-shadow)]">
                                <div className="absolute inset-px rounded-[15px] bg-linear-to-br from-[var(--security-icon-chip-highlight)] to-transparent opacity-70" />
                                <ShieldCheck className="theme-color-fade relative z-10 h-7 w-7 text-[var(--security-icon-chip-color)]" />
                            </div>

                            <h3 className="theme-color-fade mt-5 text-2xl font-bold text-[var(--security-title)]">
                                Practical security controls
                            </h3>

                            <p className="theme-color-fade mt-4 leading-8 text-[var(--security-description)]">
                                Cursify never assumes the desktop client is impossible to bypass.
                                License validation remains server-controlled, sensitive actions are
                                logged, and access can be revoked.
                            </p>

                            <div className="mt-8 grid gap-3">
                                <TinyCard
                                    glow
                                    interactive
                                    contentClassName="min-h-[4.25rem]"
                                    leading={
                                        <RotateCcw className="theme-color-fade h-5 w-5 text-[var(--security-feature-icon)]" />
                                    }
                                    title={
                                        <span className="theme-color-fade font-semibold text-[var(--security-feature-title)]">
                                            Revocable devices
                                        </span>
                                    }
                                />

                                <TinyCard
                                    glow
                                    interactive
                                    contentClassName="min-h-[4.25rem]"
                                    leading={
                                        <Siren className="theme-color-fade h-5 w-5 text-[var(--security-feature-icon)]" />
                                    }
                                    title={
                                        <span className="theme-color-fade font-semibold text-[var(--security-feature-title)]">
                                            Audit-first workflows
                                        </span>
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 p-6 sm:grid-cols-2">
                            {securityItems.map((item, index) => (
                                <TinyCard
                                    key={item}
                                    interactive
                                    glow
                                    animateIn
                                    delay={Math.min(index, 4)}
                                    className="h-full"
                                    contentClassName="h-full min-h-[4.25rem]"
                                >
                                    <p className="theme-color-fade text-sm font-semibold text-[var(--security-item-text)]">
                                        {item}
                                    </p>
                                </TinyCard>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
