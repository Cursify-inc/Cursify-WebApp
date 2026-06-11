"use client"

import { Container } from "@/components/ui/Container"
import { TinyCard } from "@/components/ui/CardVariants"

const items = [
    "Next.js Web Platform",
    "Go API Services",
    "Rust Security Boundary",
    "PostgreSQL",
    "Redis",
    "S3-compatible Storage",
]

export function TrustedStrip() {
    return (
        <section className="py-14">
            <Container>
                <div className="rounded-4xl border border-white/70 bg-white/55 px-6 py-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/4">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                        Designed around a secure, scalable architecture
                    </p>

                    <div className="mt-5 grid items-stretch grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {items.map((item, index) => (
                            <TinyCard
                                key={item}
                                animateIn
                                delay={Math.min(index, 3)}
                                interactive
                                glow
                                className="h-full rounded-[1.25rem]"
                                contentClassName="flex h-full rounded-[1.25rem] bg-white/72 dark:bg-white/[0.045]"
                            >
                                <div className="flex h-full min-h-19 items-center justify-center px-3 py-3 text-center">
                                  <span className="text-sm font-semibold leading-snug text-text-secondary">
                                    {item}
                                  </span>
                                </div>
                            </TinyCard>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
