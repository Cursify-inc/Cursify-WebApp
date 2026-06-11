"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
    Bot,
    CloudCog,
    Download,
    GitBranch,
    MonitorCog,
    Puzzle,
    ShieldCheck,
    WalletCards
} from "lucide-react"
import { LargeCard } from "@/components/ui/CardVariants"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"

const features = [
    {
        icon: MonitorCog,
        title: "Synced desktop IDE",
        description:
            "A professional VS Code-based desktop IDE with settings, agents, tools, extensions, and account state synced from Cursify."
    },
    {
        icon: Download,
        title: "Secure downloads",
        description:
            "Account-bound desktop downloads with short-lived URLs, checksum visibility, signed binaries, and audit logging."
    },
    {
        icon: Bot,
        title: "Custom AI agents",
        description:
            "Create and manage developer agents for code review, planning, refactoring, debugging, documentation, and workflows."
    },
    {
        icon: Puzzle,
        title: "Tool ecosystem",
        description:
            "Browse, install, and sync trusted AI tools and extensions across your desktop environment."
    },
    {
        icon: GitBranch,
        title: "Linked developer accounts",
        description:
            "Connect GitHub, GitLab, Slack, ClickUp, and future workflow providers with clear permission visibility."
    },
    {
        icon: WalletCards,
        title: "Subscription management",
        description:
            "Stripe-powered billing, entitlement resolution, invoices, upgrade paths, and billing portal access."
    },
    {
        icon: ShieldCheck,
        title: "Device trust controls",
        description:
            "Pair, inspect, and revoke desktop devices from the web dashboard with server-side license validation."
    },
    {
        icon: CloudCog,
        title: "Scalable backend model",
        description:
            "Built around Go API services, Rust security helpers, PostgreSQL, Redis, object storage, and observability."
    }
]

export function ProductOverview() {
    const reducedMotion = useReducedMotion()

    return (
        <section id="platform" className="py-24">
            <Container>
                <SectionHeading
                    eyebrow="Platform"
                    title="More than a website. A complete AI developer ecosystem."
                    description="Cursify gives developers a secure account platform for managing their AI-powered desktop IDE, subscription, devices, integrations, agents, tools, and sync state."
                />

                <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon

                        return (
                            <motion.div
                                key={feature.title}
                                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5, delay: index * 0.04 }}
                            >
                                <LargeCard
                                    className="group h-full rounded-[1.25rem] transition duration-300 hover:-translate-y-1 hover:shadow-card"
                                    contentClassName="p-6 flex h-full flex-col hover:bg-white"
                                    interactive
                                    glow
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-soft transition group-hover:scale-105">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-text-primary">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-text-secondary">
                                        {feature.description}
                                    </p>
                                </LargeCard>
                            </motion.div>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}
