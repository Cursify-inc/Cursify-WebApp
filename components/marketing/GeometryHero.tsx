"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Code2, Database, KeyRound, Lock, Zap } from "lucide-react"
import { TinyCardNoEdge } from "@/components/ui/CardVariants"
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
            <div className="absolute inset-0 bg-[#060816]" />

            {/* Ambient glow */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.12),transparent_22%),radial-gradient(circle_at_75%_75%,rgba(217,70,239,0.08),transparent_20%)]"
            />

            {/* Subtle grid */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_35%,transparent_78%)]"
            />

            {/* Floor */}
            <div
                aria-hidden="true"
                className="absolute left-1/2 top-[70%] h-[220px] w-[460px] -translate-x-1/2 rounded-full border border-cyan-300/10 opacity-80 md:h-[260px] md:w-[560px]"
                style={{
                    transform: "rotateX(78deg)",
                    boxShadow: "0 0 60px rgba(34,211,238,0.06)",
                }}
            />
            <div
                aria-hidden="true"
                className="absolute left-1/2 top-[70%] h-[220px] w-[460px] -translate-x-1/2 rounded-full opacity-30 md:h-[260px] md:w-[560px]"
                style={{
                    transform: "rotateX(78deg)",
                    background:
                        "repeating-radial-gradient(circle at center, rgba(34,211,238,0.12) 0 2px, transparent 2px 22px)",
                    maskImage:
                        "radial-gradient(circle at center, black 28%, transparent 78%)",
                }}
            />

            {/* Main scene */}
            <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
                {/* Single orbit ring */}
                <motion.div
                    aria-hidden="true"
                    className="absolute h-[320px] w-[320px] rounded-full border border-cyan-300/20 md:h-[420px] md:w-[420px]"
                    animate={reducedMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                >
          <span className="absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-cyan-300/20 bg-white/10 text-cyan-300 backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.18)] md:h-12 md:w-12 md:rounded-2xl">
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
          </span>
                </motion.div>

                {/* Rear panel */}
                <div
                    aria-hidden="true"
                    className="absolute h-[190px] w-[190px] rounded-[2rem] border border-white/5 bg-white/[0.03] backdrop-blur-sm md:h-[240px] md:w-[240px] md:rounded-[2.4rem]"
                    style={{
                        transform: "translateZ(-30px) rotateX(60deg) rotateY(-28deg) rotateZ(38deg) scale(1.05)",
                    }}
                />

                {/* Core object */}
                <motion.div
                    aria-hidden="true"
                    className="relative h-[210px] w-[210px] [transform-style:preserve-3d] md:h-[260px] md:w-[260px]"
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
                    <div className="absolute inset-0 rounded-[2.2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] shadow-[0_24px_60px_rgba(0,0,0,0.35),0_0_34px_rgba(34,211,238,0.08)] backdrop-blur-xl md:rounded-[2.8rem]" />

                    <div className="absolute inset-4 rounded-[1.8rem] border border-white/10 bg-black/20 md:inset-5 md:rounded-[2.2rem]" />

                    <div className="absolute inset-x-6 top-6 h-14 rounded-[1.1rem] border border-cyan-300/20 bg-cyan-300/10 md:inset-x-8 md:top-8 md:h-20 md:rounded-[1.4rem]" />

                    <div
                        className="absolute left-8 top-10 h-12 w-12 rounded-xl border border-white/10 bg-white/10 md:left-10 md:top-14 md:h-16 md:w-16 md:rounded-2xl"
                        style={{ transform: "translateZ(18px)" }}
                    />

                    <div
                        className="absolute right-8 top-10 h-12 w-12 rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 shadow-[0_0_20px_rgba(217,70,239,0.18)] md:right-10 md:top-12 md:h-16 md:w-16"
                        style={{ transform: "translateZ(20px)" }}
                    />

                    <div className="absolute bottom-12 left-8 h-2.5 w-28 rounded-full bg-white/20 md:bottom-16 md:left-10 md:h-3 md:w-40" />
                    <div className="absolute bottom-18 left-8 h-2.5 w-20 rounded-full bg-white/10 md:bottom-24 md:left-10 md:h-3 md:w-28" />
                    <div className="absolute bottom-24 left-8 h-2.5 w-14 rounded-full bg-cyan-300/25 md:bottom-32 md:left-10 md:h-3 md:w-20" />

                    <div
                        className="absolute inset-6 rounded-[2rem] bg-cyan-400/8 blur-2xl md:inset-8 md:rounded-[2.4rem]"
                        style={{ transform: "translateZ(-20px)" }}
                    />
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
                        <TinyCardNoEdge
                            tone="glassGlowNeon" // or "glassGlowPremium"
                            animateIn={false}
                            interactive={false}
                            className="pointer-events-none md:px-4 md:py-3"
                            contentClassName="px-3 py-2.5 md:px-4 md:py-3 bg-transparent"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 md:h-9 md:w-9">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold text-white/90">{card.label}</span>
                            </div>
                        </TinyCardNoEdge>
                    </motion.div>
                )
            })}

        </section>
    )
}
