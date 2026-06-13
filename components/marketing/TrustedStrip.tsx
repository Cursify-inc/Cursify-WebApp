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
                {/*
                    Replaced hardcoded white/55 and dark:white/4 with your semantic card variables.
                    This assumes you have `.card-surface` and `.border-card-border` defined in globals.css
                    from our previous step, or you can use standard bg-[rgb(...)] syntax.
                */}
                <div className="card-surface border border-card-border rounded-4xl px-6 py-5 shadow-soft backdrop-blur-xl">
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
                                // Simplified to use standard surface variables, relying on the unified theme
                                contentClassName="card-surface flex h-full rounded-[1.25rem]"
                            >
                                <div className="flex h-full min-h-[4.75rem] items-center justify-center px-3 py-3 text-center">
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
