"use client"

import { Container } from "@/components/ui/Container"
import { Card } from "@/components/ui/Card"

const items = [
    "Next.js Web Platform",
    "Go API Services",
    "Rust Security Boundary",
    "PostgreSQL",
    "Redis",
    "S3-compatible Storage",
]

const compactEdgeLight = {
    strokeWidth: 2,
    glowWidth: 6,
    glowBlur: 6,
    segmentRatio: 0.2,
    trailCount: 3,
    trailGap: 2,
    idleSpeed: 0.4,
    activeSpeedBoost: 0.14,
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

export function TrustedStrip() {
    return (
        <section className="py-14">
            <Container>
                <div className="rounded-4xl border border-white/70 bg-white/55 px-6 py-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                        Designed around a secure, scalable architecture
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {items.map((item, index) => (
                            <Card
                                key={item}
                                animateIn
                                delay={index}
                                interactive
                                glow
                                edgeLightProps={compactEdgeLight}
                                className="h-full rounded-[1.35rem]"
                                contentClassName={`
                  rounded-[1.25rem]
                  border-white/60
                  bg-white/72
                  dark:border-white/10
                  dark:bg-white/[0.045]
                `}
                            >
                                <div className="flex min-h-19 items-center justify-center px-3 py-3 text-center">
                  <span className="text-sm font-semibold leading-snug text-text-secondary">
                    {item}
                  </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
