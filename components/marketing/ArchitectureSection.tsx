import { ArrowRight, Box, Cloud, Database, Globe2, Shield } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"
import clsx from "clsx"

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
]

const compactEdgeLight = {
    inset: 1,
    strokeWidth: 5,
    glowWidth: 6,
    glowBlur: 6,
    segmentRatio: 0.2,
    trailCount: 3,
    trailGap: 1,
    idleSpeed: 0.4,
    hoverSpeedBoost: 0.14, // correct prop name
    attractStrength: 6,
    proximityRadius: 90,
    pulseDurationMs: 560,
    pulseIntensity: 0.7,
    coreOpacity: 0.82,
    glowOpacity: 0.26,
    highlightOpacity: 0.1,
    colorA: "rgb(34 211 238)",
    colorB: "rgb(99 102 241)",
    highlightColor: "rgb(255 255 255)",
    enableIdleScan: true,
    enableCursorProximity: true,
    enablePulse: false,
} as const

export function ArchitectureSection() {
    return (
        <section className="py-24">
            <Container>
                <SectionHeading
                    eyebrow="Architecture"
                    title="Modular now. Scalable later."
                    description="Cursify can start as a focused Go API plus Rust security service, then split into specialized services as traffic and product complexity grow."
                />

                <div className="mt-14 rounded-3xl border border-border bg-background-surface/30 p-2 sm:p-4">
                    <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-5">

                        {architecture.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Card
                                    key={item.title}
                                    animateIn
                                    delay={index}
                                    interactive
                                    glow
                                    edgeLightProps={compactEdgeLight}
                                    className="h-full rounded-[1.25rem]"
                                    contentClassName="flex h-full flex-col rounded-[1.25rem] bg-background-elevated p-5"
                                >
                                    <div className="relative z-10">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-background-inverse">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-4 font-bold text-text-primary">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                                            {item.description}
                                        </p>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </Container>
        </section>
    )
}
