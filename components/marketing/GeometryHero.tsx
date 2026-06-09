"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Code2, Database, KeyRound, Lock, Zap } from "lucide-react"

const floatingCards = [
    {
        icon: Code2,
        label: "AI IDE",
        className: "left-[5%] top-[12%]",
        delay: 0,
    },
    {
        icon: Lock,
        label: "Signed leases",
        className: "right-[4%] top-[18%]",
        delay: 0.25,
    },
    {
        icon: Database,
        label: "Account sync",
        className: "left-[7%] bottom-[18%]",
        delay: 0.5,
    },
    {
        icon: KeyRound,
        label: "Device trust",
        className: "right-[8%] bottom-[14%]",
        delay: 0.75,
    },
]

export function GeometryHero() {
    const reducedMotion = useReducedMotion()

    return (
        <div className="perspective-1200 relative mx-auto h-[520px] max-w-3xl">
            <div className="absolute inset-0 rounded-[3rem] bg-hero-grid bg-[length:42px_42px] opacity-60 [mask-image:radial-gradient(circle,black,transparent_72%)]" />

            <motion.div
                aria-hidden="true"
                className="preserve-3d absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-brand shadow-glow"
                animate={
                    reducedMotion
                        ? undefined
                        : {
                            rotateX: [58, 64, 58],
                            rotateY: [-30, -22, -30],
                            y: [0, -12, 0],
                        }
                }
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    transform: "rotateX(60deg) rotateY(-28deg) rotateZ(45deg)",
                }}
            >
                <div className="absolute inset-5 rounded-[2.4rem] border border-white/20 bg-white/5 dark:border-white/10 dark:bg-black/10" />
                <div className="absolute left-10 top-10 h-16 w-16 rounded-2xl bg-white/15 dark:bg-white/10" />
                <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full border border-white/25 bg-white/10 dark:border-white/15 dark:bg-white/5" />
                <div className="absolute bottom-16 left-12 h-3 w-36 rounded-full bg-white/25 dark:bg-white/20" />
                <div className="absolute bottom-24 left-12 h-3 w-24 rounded-full bg-white/15 dark:bg-white/10" />
            </motion.div>

            <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/25"
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
        <span className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-border/50 bg-background-surface/85 text-brand shadow-soft backdrop-blur-md">
          <Zap className="h-5 w-5" />
        </span>
            </motion.div>

            {floatingCards.map((card) => {
                const Icon = card.icon

                return (
                    <motion.div
                        key={card.label}
                        className={`absolute ${card.className} rounded-2xl border border-border/60 bg-background-surface/80 px-4 py-3 shadow-soft backdrop-blur-xl`}
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: card.delay, duration: 0.6 }}
                        animate={
                            reducedMotion
                                ? undefined
                                : {
                                    y: [0, -10, 0],
                                }
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-brand" />
                            <span className="text-sm font-semibold text-text-primary">
                {card.label}
              </span>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
