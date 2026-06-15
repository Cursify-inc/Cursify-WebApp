"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GeometryHero } from "./GeometryHero";

const trustItems = [
    "Signed downloads",
    "Server-side license validation",
    "Device revocation support",
];

export function HeroSection() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { once: true });
    const reducedMotion = useReducedMotion() ?? false;

    return (
        <section ref={ref} className="relative pt-28 sm:pt-36">
            <Container
                as="section"
                id="HeroSection"
                variant="fit"
                width="wide"
                className="relative overflow-hidden"
            >
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                        animate={
                            reducedMotion
                                ? undefined
                                : inView
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 24 }
                        }
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <Badge>
                            <Sparkles className="mr-2 h-3.5 w-3.5" />
                            AI-powered IDE platform for serious developers
                        </Badge>

                        <h1 className="mt-7 max-w-4xl text-5xl font-bold tracking-tight text-[var(--text-primary)] sm:text-7xl lg:text-8xl">
                            Your synced AI IDE, secured from web to desktop.
                        </h1>

                        <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                            Cursify combines a professional web account platform, secure
                            subscription controls, account-bound desktop downloads, device
                            pairing, AI agents, tools, extensions, and developer integrations.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Button href="/signup" size="lg" edgeLight>
                                Start building
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button
                                href="#platform"
                                variant="secondary"
                                size="lg"
                                edgeLight={false}
                            >
                                Explore platform
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                            {trustItems.map((item) => (
                                <span key={item} className="inline-flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <GeometryHero />
                </div>
            </Container>
        </section>
    );
}
