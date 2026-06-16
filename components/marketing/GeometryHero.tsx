"use client";

import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import { Code2, Database, KeyRound, Lock, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TinyCardNoEdge } from "@/components/ui/CardVariants";
import { cn } from "@/lib/utils";

const floatingCards = [
    {
        icon: Code2,
        label: "AI IDE",
        className: "left-[6%] top-[14%] md:left-[8%] md:top-[12%]",
        delay: 0,
    },
    {
        icon: Lock,
        label: "Signed leases",
        className: "right-[6%] top-[18%] md:right-[8%] md:top-[16%]",
        delay: 0.12,
    },
    {
        icon: Database,
        label: "Account sync",
        className: "left-[8%] bottom-[18%] md:left-[10%] md:bottom-[16%]",
        delay: 0.24,
    },
    {
        icon: KeyRound,
        label: "Device trust",
        className: "right-[8%] bottom-[14%] md:right-[10%] md:bottom-[14%]",
        delay: 0.36,
    },
];

type BurstState = {
    id: number;
    x: number;
    y: number;
    sectionIndex: number;
};

export function GeometryHero() {
    const reducedMotion = useReducedMotion() ?? false;
    const { scrollY, scrollYProgress } = useScroll();

    const [scrollDirection, setScrollDirection] = useState<1 | -1>(1);
    const [activeSection, setActiveSection] = useState(0);
    const [burst, setBurst] = useState<BurstState>({
        id: 0,
        x: 50,
        y: 50,
        sectionIndex: 0,
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 90,
        damping: 22,
        mass: 0.35,
    });

    const rotateShell = useTransform(smoothProgress, [0, 1], [0, 220]);
    const driftY = useTransform(smoothProgress, [0, 1], ["-4%", "4%"]);
    const gridShift = useTransform(smoothProgress, [0, 1], [0, 180]);
    const glowScale = useTransform(smoothProgress, [0, 1], [0.95, 1.2]);
    const coreRotate = useTransform(smoothProgress, [0, 1], [-18, 18]);
    const coreFloat = useTransform(smoothProgress, [0, 1], [-20, 20]);
    const vignetteOpacity = useTransform(smoothProgress, [0, 1], [0.18, 0.3]);

    useMotionValueEvent(scrollY, "change", (current) => {
        const previous = scrollY.getPrevious() ?? current;
        setScrollDirection(current >= previous ? 1 : -1);
    });

    useEffect(() => {
        const sections = Array.from(
            document.querySelectorAll<HTMLElement>("[data-geometry-section]"),
        );

        if (sections.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                const winner = visibleEntries[0];
                if (!winner) {
                    return;
                }

                const nextIndex = sections.indexOf(winner.target as HTMLElement);
                if (nextIndex === -1 || nextIndex === activeSection) {
                    return;
                }

                const rect = (winner.target as HTMLElement).getBoundingClientRect();
                const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
                const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

                setActiveSection(nextIndex);
                setBurst({
                    id: Date.now() + nextIndex,
                    x,
                    y,
                    sectionIndex: nextIndex,
                });
            },
            {
                threshold: [0.35, 0.5, 0.7],
                rootMargin: "-12% 0px -12% 0px",
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [activeSection]);

    const burstShards = useMemo(
        () =>
            Array.from({ length: 18 }, (_, index) => {
                const angle = (index / 18) * Math.PI * 2;
                const x = Math.cos(angle) * 180;
                const y = Math.sin(angle) * 180;

                return { index, x, y };
            }),
        [],
    );

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--bg-0)]"
        >
            <motion.div
                className="absolute inset-0"
                style={{
                    opacity: vignetteOpacity,
                    background:
                        "radial-gradient(circle at 50% 50%, transparent 35%, rgba(0,0,0,0.72) 100%)",
                }}
            />

            <motion.div
                className="absolute inset-[-12%] opacity-50"
                style={{
                    y: driftY,
                    scale: glowScale,
                    background:
                        "radial-gradient(circle at 20% 20%, var(--promo-glow-secondary) 0%, transparent 26%), radial-gradient(circle at 78% 18%, var(--promo-glow-primary) 0%, transparent 22%), radial-gradient(circle at 50% 58%, color-mix(in srgb, var(--brand-primary) 22%, transparent) 0%, transparent 28%), radial-gradient(circle at 50% 88%, color-mix(in srgb, var(--promo-glow-primary) 32%, transparent) 0%, transparent 24%)",
                }}
            />

            <motion.div
                className="absolute inset-0 text-[var(--text-tertiary)] opacity-[0.08]"
                style={{
                    backgroundImage:
                        "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                    backgroundSize: "52px 52px",
                    backgroundPositionY: gridShift,
                    maskImage:
                        "radial-gradient(circle at center, black 30%, transparent 92%)",
                }}
            />

            <div className="absolute inset-0 [perspective:1600px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="relative h-[420px] w-[420px] md:h-[560px] md:w-[560px]"
                        style={{ rotate: rotateShell }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full border border-[color:color-mix(in_srgb,var(--brand-primary)_22%,transparent)]"
                            animate={
                                reducedMotion
                                    ? undefined
                                    : { rotate: scrollDirection > 0 ? 360 : -360 }
                            }
                            transition={{
                                duration: 28,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />

                        <motion.div
                            className="absolute inset-[12%] rounded-[2.75rem] border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--bg-1)_28%,transparent)] backdrop-blur-sm"
                            style={{
                                rotateX: 64,
                                rotateY: -28,
                                rotateZ: coreRotate,
                                y: coreFloat,
                                boxShadow: "0 0 90px color-mix(in srgb, var(--brand-primary) 18%, transparent)",
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <div className="absolute inset-4 rounded-[2rem] border border-[var(--card-border)] bg-[var(--bg-2)] md:inset-6" />
                            <div className="absolute inset-x-8 top-8 h-16 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-1)] md:inset-x-10 md:top-10 md:h-20" />
                            <div className="absolute left-10 top-14 h-14 w-14 rounded-2xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,transparent)] md:left-14 md:top-16 md:h-16 md:w-16" />
                            <div className="absolute right-10 top-14 h-14 w-14 rounded-full border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--brand-primary)_16%,transparent)] md:right-14 md:top-16 md:h-16 md:w-16" />
                            <div className="absolute bottom-16 left-10 h-3 w-32 rounded-full bg-[var(--border)] md:bottom-20 md:left-14 md:w-44" />
                            <div className="absolute bottom-24 left-10 h-3 w-24 rounded-full bg-[var(--border)] md:bottom-28 md:left-14 md:w-32" />
                            <div className="absolute bottom-32 left-10 h-3 w-16 rounded-full bg-[color:color-mix(in_srgb,var(--brand-primary)_46%,transparent)] md:bottom-36 md:left-14 md:w-24" />
                        </motion.div>

                        <motion.div
                            className="absolute left-1/2 top-1/2 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--card-border)] opacity-75 md:h-[320px] md:w-[640px]"
                            style={{
                                rotateX: 78,
                                boxShadow: "0 0 80px var(--promo-glow-primary)",
                            }}
                        />

                        <motion.div
                            className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--bg-0)_78%,transparent)] text-[var(--brand-primary)] shadow-card backdrop-blur-md md:h-14 md:w-14"
                            animate={
                                reducedMotion
                                    ? undefined
                                    : {
                                        scale: [1, 1.08, 1],
                                        boxShadow: [
                                            "0 0 0 rgba(0,0,0,0)",
                                            "0 0 36px color-mix(in srgb, var(--brand-primary) 60%, transparent)",
                                            "0 0 0 rgba(0,0,0,0)",
                                        ],
                                    }
                            }
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <Zap className="h-5 w-5 md:h-6 md:w-6" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {floatingCards.map((card) => {
                const Icon = card.icon;

                return (
                    <motion.div
                        key={card.label}
                        className={cn("absolute hidden md:block", card.className)}
                        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                        animate={
                            reducedMotion
                                ? { opacity: 1 }
                                : {
                                    opacity: 1,
                                    y: [0, -10, 0],
                                }
                        }
                        transition={{
                            delay: card.delay,
                            duration: 4.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <TinyCardNoEdge>
                            <div className="flex items-center gap-2.5 whitespace-nowrap">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--card-border)] bg-[var(--bg-1)] text-[var(--brand-primary)]">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {card.label}
                </span>
                            </div>
                        </TinyCardNoEdge>
                    </motion.div>
                );
            })}

            <AnimatePresence mode="wait">
                <motion.div
                    key={burst.id}
                    className="absolute"
                    style={{
                        left: `${burst.x}%`,
                        top: `${burst.y}%`,
                    }}
                    initial={{ opacity: 0, scale: 0.35 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.15 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                >
                    <motion.div
                        className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:color-mix(in_srgb,var(--brand-primary)_55%,transparent)]"
                        initial={{ scale: 0.15, opacity: 0.9 }}
                        animate={{ scale: 4.8, opacity: 0 }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                    />

                    <motion.div
                        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-[color:color-mix(in_srgb,var(--brand-primary)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,transparent)]"
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: 3.2, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                    />

                    {burstShards.map((shard) => (
                        <motion.span
                            key={`${burst.id}-${shard.index}`}
                            className="absolute left-0 top-0 h-1.5 w-10 origin-left rounded-full bg-[color:color-mix(in_srgb,var(--brand-primary)_78%,white_22%)]"
                            initial={{
                                x: 0,
                                y: 0,
                                rotate: (shard.index / burstShards.length) * 360,
                                opacity: 1,
                                scaleX: 0.4,
                            }}
                            animate={{
                                x: shard.x,
                                y: shard.y,
                                opacity: 0,
                                scaleX: 1,
                            }}
                            transition={{
                                duration: reducedMotion ? 0.01 : 0.62,
                                ease: "easeOut",
                                delay: shard.index * 0.008,
                            }}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
