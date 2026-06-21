import { Box, Cloud, Database, Globe2, Shield } from "lucide-react";

import { LargeCard } from "@/components/ui/CardVariants";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const architecture = [
    {
        icon: Globe2,
        title: "Next.js Web App",
        description:
            "Marketing site, auth UI, dashboard, billing, downloads, devices, and ecosystem management.",
    },
    {
        icon: Cloud,
        title: "Go API Services",
        description:
            "Auth, accounts, billing, downloads, enrollment, license validation, sync, integrations, and admin APIs.",
    },
    {
        icon: Shield,
        title: "Rust Security Service",
        description:
            "Token signing, token verification, checksum helpers, binary signatures, and license lease signing.",
    },
    {
        icon: Database,
        title: "PostgreSQL + Redis",
        description:
            "Durable product data, sessions, rate limits, queues, token denylist, and short-lived enrollment state.",
    },
    {
        icon: Box,
        title: "Object Storage",
        description:
            "Desktop binaries, release assets, checksums, signatures, and mirror-ready distribution.",
    },
];

export function ArchitectureSection() {
    return (
        <Container
            as="section"
            id="ArchitectureSection"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <SectionHeading
                eyebrow="Architecture"
                title="Modular now. Scalable later."
                description="Cursify can start as a focused Go API plus Rust security service, then split into specialized services as traffic and product complexity grow."
            />

            <div className="mt-16 relative rounded-3xl border border-[var(--border)]/60 bg-[var(--bg-1)]/40 backdrop-blur-xl p-3 sm:p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
                <div className="grid auto-rows-[1fr] gap-5 md:grid-cols-2 lg:grid-cols-5">
                    {architecture.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <LargeCard
                                key={item.title}
                                animateIn
                                delay={index * 0.08}
                                className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015]"
                                contentClassName="flex h-full min-h-[17rem] flex-col"
                                edgeLightProps={{
                                    quality: "balanced",
                                    dashCount: 3,
                                    syncColorToDash: true,
                                }}
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl
                                bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary))]
                                text-[var(--text-inverted)]
                                shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_35%,transparent)]">

                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
                                    {item.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                    {item.description}
                                </p>
                            </LargeCard>
                        );
                    })}
                </div>
            </div>
        </Container>
    );
}
