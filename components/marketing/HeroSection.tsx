"use client";

import { useRef } from "react";
import {
    motion,
    useInView,
    useReducedMotion,
    useMotionValue,
    useTransform,
} from "framer-motion";

import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Surface } from "@/components/ui/Surface";

const trustItems = [
    "Signed downloads",
    "Server-side license validation",
    "Device revocation support",
];

export function HeroSection() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { once: true });
    const reducedMotion = useReducedMotion() ?? false;

    // Mouse parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useTransform(mouseY, [-300, 300], [6, -6]);
    const rotateY = useTransform(mouseX, [-300, 300], [-6, 6]);

    function handleMouseMove(e: React.MouseEvent) {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    }

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative overflow-hidden"
        >
            {/* GRID BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 -z-20 opacity-40">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* GLOW ORBS */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <motion.div
                    className="absolute left-[15%] top-[20%] h-[380px] w-[380px] rounded-full bg-indigo-500/20 blur-3xl"
                    animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
                    transition={{ duration: 18, repeat: Infinity }}
                />

                <motion.div
                    className="absolute right-[10%] top-[40%] h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-3xl"
                    animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
            </div>

            <Container
                variant="transparent"
                width="wide"
                className="relative pt-28 sm:pt-36"
            >
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <Badge>
                        AI‑powered IDE platform for serious developers
                    </Badge>

                    {/* TITLE */}
                    <motion.h1
                        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7 }}
                        className="mt-8 text-4xl font-stretch-condensed tracking-tight sm:text-7xl"
                    >
                        Your synced AI IDE,
                        <span className="relative ml-3 inline-block">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-[length:200%] bg-clip-text text-transparent animate-[gradient_6s_linear_infinite]">
                secured
              </span>
            </span>
                        <br />
                        from web to desktop.
                    </motion.h1>

                    {/* DESCRIPTION */}
                    <motion.p
                        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]"
                    >
                        Cursify combines a professional web account platform, secure
                        subscription controls, account‑bound desktop downloads, device
                        pairing, AI agents, tools, extensions, and developer integrations.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.9 }}
                        className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                    >
                        <Button
                            href="/signup"
                            size="lg"
                            className="transition-transform duration-200 hover:scale-105"
                        >
                            Start building
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <Button
                            href="#platform"
                            variant="secondary"
                            size="lg"
                            className="transition-transform duration-200 hover:scale-105"
                        >
                            Explore platform
                        </Button>
                    </motion.div>

                    {/* TRUST ITEMS */}
                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.4 }}
                        className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-[var(--text-secondary)]"
                    >
                        {trustItems.map((item) => (
                            <span key={item} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
                                {item}
              </span>
                        ))}
                    </motion.div>

                    {/* IDE PREVIEW CARD */}
                    <motion.div
                        style={{ rotateX, rotateY }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="mx-auto mt-16 max-w-4xl"
                    >
                        <Surface
                            variant="card"
                            size="lg"
                            className="overflow-hidden border border-white/10 backdrop-blur-xl"
                        >
                            <div className="bg-black/80 p-6 font-mono text-left text-sm text-green-400">
                                <p>$ cursify dev</p>
                                <p>Starting AI agent...</p>
                                <p>Loading extensions...</p>
                                <p>Secure session established.</p>
                                <p className="text-indigo-400">Ready.</p>
                            </div>
                        </Surface>
                    </motion.div>
                </div>
            </Container>

            {/* Gradient animation */}
            <style jsx>{`
                @keyframes gradient {
                    0% {
                        background-position: 0;
                    }
                    100% {
                        background-position: 200%;
                    }
                }
            `}</style>
        </section>
    );
}
