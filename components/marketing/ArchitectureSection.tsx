import { ArrowRight, Box, Cloud, Database, Globe2, Shield } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"

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

                <Card className="mt-14 p-6">
                    <div className="grid gap-4 lg:grid-cols-5">
                        {architecture.map((item, index) => {
                            const Icon = item.icon

                            return (
                                <div key={item.title} className="relative">
                                    <div className="h-full rounded-3xl border border-border/60 bg-background-surface/80 p-5 backdrop-blur-sm transition-colors">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_0_24px_rgba(99,102,241,0.25)]">
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <h3 className="mt-4 font-bold text-text-primary">
                                            {item.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                                            {item.description}
                                        </p>
                                    </div>

                                    {index < architecture.length - 1 && (
                                        <ArrowRight className="absolute -right-5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand/60 lg:block" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </Container>
        </section>
    )
}
