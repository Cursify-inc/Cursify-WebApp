"use client"

import {
    motion,
    useInView,
    useReducedMotion,
} from "framer-motion"
import { useRef } from "react"
import {
    BadgeCheck,
    Computer,
    Download,
    KeyRound,
    RefreshCcw,
    UserPlus,
} from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"

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
]

function StepCard({
                      step,
                      index,
                  }: {
    step: (typeof steps)[number]
    index: number
}) {
    return (
        <Card
            animateIn
            delay={index * 0.06}
            contentClassName="p-6"
            edgeLightProps={{ enableIdleScan: true }}
        >
        <div className="flex items-start gap-4">
            <div
                className="
                        relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                        border border-white/10
                        bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(168,85,247,0.08))]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                    "
                style={{
                    transform: "translateZ(28px)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                }}
            >
                <div
                    className="absolute inset-px rounded-[15px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_45%)]"/>
                <step.icon className="relative z-10 h-5 w-5 text-cyan-100"/>
            </div>

            <div className="min-w-0">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
                    Step {index + 1}
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {step.title}
                </h3>

                <p className="mt-3 max-w-[44ch] text-sm leading-6 text-white/64">
                    {step.description}
                </p>
            </div>
        </div>
        </Card>
    )
}

export function SyncFlowSection() {
    const ref = useRef<HTMLElement | null>(null)
    const inView = useInView(ref, { margin: "-15%" })
    const prefersReducedMotion = useReducedMotion() ?? false

    return (
        <section ref={ref} id="sync" className="relative overflow-hidden py-24 sm:py-28">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.08),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.06),transparent_26%)]" />

                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-size-[48px_48px]" />

                <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-linear-to-b from-transparent via-white/8 to-transparent lg:block" />

                {!prefersReducedMotion && inView && (
                    <motion.div
                        className="absolute inset-x-[-10%] top-16 h-px bg-linear-to-r from-transparent via-cyan-300/25 to-transparent"
                        animate={{ opacity: [0.35, 0.7, 0.35] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                )}
            </div>

            <Container className="relative z-10">
                <SectionHeading
                    eyebrow="Desktop pairing"
                    title="A secure AI-native install flow from browser to desktop."
                    description="Built to feel seamless for users and trustworthy to stakeholders."
                    className="text-white"
                />

                <div className="relative mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
                    {steps.map((step, index) => (
                        <StepCard
                            key={step.title}
                            step={step}
                            index={index}
                        />
                    ))}
                </div>
            </Container>
        </section>
    )
}
