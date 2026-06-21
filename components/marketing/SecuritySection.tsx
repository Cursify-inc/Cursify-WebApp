"use client";

import { RotateCcw, ShieldCheck, Siren } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { TinyCard } from "@/components/ui/CardVariants";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
    return (
        <Container
            as="section"
            id="security"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <SectionHeading
                eyebrow="Security"
                title="Designed for account-bound desktop software from day one."
                description="Cursify avoids unrealistic security claims. The platform uses layered controls, signed short-lived responses, server-side entitlement checks, and clear revocation paths."
            />

            <div className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">

                <div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                    bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary))]
                    text-[var(--text-inverted)] shadow-lg">

                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">
                        Practical security controls
                    </h3>

                    <p className="mt-4 leading-8 text-[var(--text-secondary)]">
                        Cursify never assumes the desktop client is impossible to bypass.
                        License validation remains server-controlled, sensitive actions are
                        logged, and access can be revoked.
                    </p>

                    <div className="mt-8 grid gap-3">
                        <TinyCard
                            glow
                            interactive
                            leading={<RotateCcw className="h-5 w-5 text-[var(--brand-primary)]" />}
                            title={<span className="font-semibold">Revocable devices</span>}
                        />

                        <TinyCard
                            glow
                            interactive
                            leading={<Siren className="h-5 w-5 text-[var(--brand-primary)]" />}
                            title={<span className="font-semibold">Audit-first workflows</span>}
                        />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {securityItems.map((item, index) => (
                        <TinyCard
                            key={item}
                            interactive
                            glow
                            animateIn
                            delay={index * 0.05}
                        >
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {item}
                            </p>
                        </TinyCard>
                    ))}
                </div>

            </div>
        </Container>
    );
}
