"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Code2, Database, KeyRound, Lock, Zap } from "lucide-react"
import { TinyPromoCard } from "@/components/ui/CardVariants"
import { cn } from "@/lib/utils"

const floatingCards = [
    {
        icon: Code2,
        label: "AI IDE",
        className: "left-[4%] top-[12%] md:left-[6%] md:top-[10%]",
        delay: 0,
    },
    {
        icon: Lock,
        label: "Signed leases",
        className: "right-[4%] top-[16%] md:right-[6%] md:top-[14%]",
        delay: 0.12,
    },
    {
        icon: Database,
        label: "Account sync",
        className: "left-[6%] bottom-[14%] md:left-[8%] md:bottom-[14%]",
        delay: 0.24,
    },
    {
        icon: KeyRound,
        label: "Device trust",
        className: "right-[6%] bottom-[10%] md:right-[8%] md:bottom-[12%]",
        delay: 0.36,
    },
]

export function GeometryHero() {
    const reducedMotion = useReducedMotion()

    return (
        <section
            aria-label="Futuristic platform visualization"
            className="relative mx-auto h-[480px] w-full max-w-4xl overflow-hidden rounded-[2.5rem] md:h-[560px] [perspective:1200px]"
        >
            {/* Base */}
            <div className="absolute inset-0 bg-bg-0" />

            {/* Ambient glow - mapped to CSS variables to be agnostic */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40"
                style={{
                    background: "radial-gradient(circle at 50% 45%, var(--promo-glow-primary) 0%, transparent 24%), radial-gradient(circle at 25% 20%, var(--promo-glow-secondary) 0%, transparent 22%)"
                }}
            />

            {/* Subtle grid */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-10 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_35%,transparent_78%)] text-text-tertiary"
            />

            {/* Floor */}
            <div
                aria-hidden="true"
                className="absolute left-1/2 top-[70%] h-[220px] w-[460px] -translate-x-1/2 rounded-full border border-card-border opacity-80 md:h-[260px] md:w-[560px]"
                style={{
                    transform: "rotateX(78deg)",
                    boxShadow: "0 0 60px var(--promo-glow-primary)",
                }}
            />

            {/* Main scene */}
            <div className="absolute inset-0 flex items-center justify-center transform-3d">
                {/* Single orbit ring */}
                <motion.div
                    aria-hidden="true"
                    className="absolute h-80 w-[320px] rounded-full border border-brand-primary/20 md:h-105 md:w-105"
                    animate={reducedMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                >
                    <span className="absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-card-border bg-bg-0/80 text-brand-primary backdrop-blur-md shadow-card md:h-12 md:w-12">
                        <Zap className="h-4 w-4 md:h-5 md:w-5" />
                    </span>
                </motion.div>

                {/* Rear panel */}
                <div
                    aria-hidden="true"
                    className="absolute h-[190px] w-[190px] rounded-[2rem] border border-card-border bg-bg-1/50 backdrop-blur-sm md:h-[240px] md:w-[240px] md:rounded-[2.4rem]"
                    style={{
                        transform: "translateZ(-30px) rotateX(60deg) rotateY(-28deg) rotateZ(38deg) scale(1.05)",
                    }}
                />

                {/* Core object */}
                <motion.div
                    aria-hidden="true"
                    className="relative h-[210px] w-[210px] [transform-style:preserve-3d] md:h-[260px] md:w-[260px] overflow-visible"
                    animate={
                        reducedMotion
                            ? undefined
                            : {
                                rotateX: [58, 62, 58],
                                rotateY: [-28, -22, -28],
                                y: [0, -8, 0],
                            }
                    }
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{
                        transform: "rotateX(60deg) rotateY(-28deg) rotateZ(38deg)",
                    }}
                >
                    <div className="absolute inset-0 rounded-[2.2rem] border border-card-border bg-bg-2 shadow-card backdrop-blur-xl md:rounded-[2.8rem]" />

                    <div className="absolute inset-4 rounded-[1.8rem] border border-card-border bg-bg-0 md:inset-5 md:rounded-[2.2rem]" />

                    <div className="absolute inset-x-6 top-6 h-14 rounded-[1.1rem] border border-card-border bg-bg-1 md:inset-x-8 md:top-8 md:h-20 md:rounded-[1.4rem]" />

                    <div
                        className="absolute left-8 top-10 h-12 w-12 rounded-lg border border-card-border bg-brand-primary/10 md:left-10 md:top-14 md:h-16 md:w-16 md:rounded-2xl"
                        style={{ transform: "translateZ(18px)" }}
                    />

                    <div
                        className="absolute right-8 top-10 h-12 w-12 rounded-full border border-card-border bg-brand-primary/10 md:right-10 md:top-12 md:h-16 md:w-16"
                        style={{ transform: "translateZ(20px)" }}
                    />

                    <div className="absolute bottom-12 left-8 h-2.5 w-28 rounded-full bg-border md:bottom-16 md:left-10 md:h-3 md:w-40" />
                    <div className="absolute bottom-18 left-8 h-2.5 w-20 rounded-full bg-border md:bottom-24 md:left-10 md:h-3 md:w-28" />
                    <div className="absolute bottom-24 left-8 h-2.5 w-14 rounded-full bg-brand-primary/40 md:bottom-32 md:left-10 md:h-3 md:w-20" />
                </motion.div>
            </div>

            {/* Floating cards */}
            {floatingCards.map((card) => {
                const Icon = card.icon

                return (
                    <motion.div
                        key={card.label}
                        className={cn("absolute", card.className)}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ delay: card.delay, duration: 0.45 }}
                        animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
                    >
                        <TinyPromoCard
                            animateIn={false}
                            className="pointer-events-none"
                            contentClassName="px-3 py-2.5 md:px-4 md:py-3"
                            edge={{
                                inset: 0,
                                radius: 16,
                                durationSec: 0.05,
                                strokeWidth: 22,
                                glowWidth: 10,
                                glowBlur: 12,
                                coreOpacity: 0.95,
                                glowOpacity: 0.75,
                                highlightOpacity: 0.45,
                                colorA: "var(--promo-glow-primary)",
                                colorB: "var(--promo-glow-secondary)",
                                highlightColor: "var(--promo-edge-highlight)",
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center border border-card-border bg-bg-1 text-brand-primary rounded-md md:h-9 md:w-9">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold text-text-primary">{card.label}</span>
                            </div>
                        </TinyPromoCard>
                    </motion.div>
                )
            })}
        </section>
    )
}
