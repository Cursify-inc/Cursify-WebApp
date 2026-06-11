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

export function ArchitectureSection() {
    return (
        <section className="py-24">
            <Container>
                <SectionHeading
                    eyebrow="Architecture"
                    title="Modular now. Scalable later."
                    description="Cursify can start as a focused Go API plus Rust security service, then split into specialized services as traffic and product complexity grow."
                />

                {/* Outer Container: Simple structural wrapper */}
                <div className="mt-14 rounded-3xl border border-border bg-background-surface/30 p-2 sm:p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {architecture.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <div key={item.title} className="relative group">
                                    {/* Using your Card component here */}
                                    <Card className="relative h-full overflow-hidden border-border bg-background-elevated p-5 transition-all duration-300">
                                        {/* The Edge Animation: Only active inside these cards */}
                                        <div className="edge-animate absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Container>
        </section>
    )
}
