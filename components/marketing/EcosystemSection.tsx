import { Bot, Puzzle, Store, Wrench } from "lucide-react";
import { FaGithub, FaGitlab, FaSlack } from "react-icons/fa";

import { LargeCard, TinyCard } from "@/components/ui/CardVariants";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ecosystem = [
    {
        icon: Bot,
        title: "Agents",
        description:
            "Build custom coding agents for debugging, review, planning, documentation, migration, and refactoring.",
    },
    {
        icon: Wrench,
        title: "Tools",
        description:
            "Install trusted workflow tools and sync their configuration into the desktop IDE.",
    },
    {
        icon: Puzzle,
        title: "Extensions",
        description:
            "Manage compatible extensions with visibility into trust, version, and signature state.",
    },
    {
        icon: Store,
        title: "Mirrors",
        description:
            "Configure regional mirrors and binary availability for faster desktop updates.",
    },
];

const providers = [
    { icon: FaGithub, name: "GitHub" },
    { icon: FaGitlab, name: "GitLab" },
    { icon: FaSlack, name: "Slack" },
    { icon: Store, name: "ClickUp" },
];

export function EcosystemSection() {
    return (
        <Container
            as="section"
            id="EcosystemSection"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

                <SectionHeading
                    align="left"
                    eyebrow="Ecosystem"
                    title="Agents, tools, extensions, mirrors, and integrations."
                    description="Cursify gives developers a connected web control plane for customizing the IDE experience and integrating real development workflows."
                />

                <div className="grid auto-rows-[1fr] gap-5 sm:grid-cols-2">
                    {ecosystem.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <LargeCard
                                key={item.title}
                                animateIn
                                delay={index * 0.08}
                                className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015]"
                                contentClassName="flex h-full min-h-[16rem] flex-col"
                                edgeLightProps={{
                                    quality: "balanced",
                                    dashCount: 3,
                                    syncColorToDash: true,
                                }}
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl
                                bg-[color:color-mix(in_srgb,var(--brand-primary)_15%,transparent)]
                                text-[var(--brand-primary)]
                                ring-1 ring-[color:color-mix(in_srgb,var(--brand-primary)_30%,transparent)]
                                shadow-md">

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

            <LargeCard
                className="mt-14 backdrop-blur-xl"
                contentClassName="p-6"
            >
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Linked developer accounts
                </p>

                <div className="mt-6 grid auto-rows-[1fr] gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {providers.map((provider, index) => {
                        const Icon = provider.icon;

                        return (
                            <TinyCard
                                key={provider.name}
                                animateIn
                                delay={index * 0.06}
                                className="h-full w-full transition-transform duration-200 hover:scale-[1.02]"
                                contentClassName="h-full min-h-[4rem]"
                            >
                                <div className="flex w-full items-center justify-between gap-3">

                                    <div className="flex min-w-0 items-center gap-3">
                                        <Icon className="h-5 w-5 shrink-0 text-[var(--brand-primary)]" />

                                        <span className="truncate font-semibold text-[var(--text-primary)]">
                                            {provider.name}
                                        </span>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-[var(--success)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                                        OAuth
                                    </span>

                                </div>
                            </TinyCard>
                        );
                    })}
                </div>
            </LargeCard>
        </Container>
    );
}
