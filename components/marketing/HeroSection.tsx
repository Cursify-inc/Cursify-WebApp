"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

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
        <section ref={ref} data-geometry-section className="relative">
            <Container
                as="div"
                id="HeroSection"
                variant="transparent"
                width="wide"
                className="relative overflow-hidden pt-28 sm:pt-36"
            >
                <div className="mx-auto max-w-4xl text-center">
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
                        <div className="flex justify-center">
                            <Badge>
                                <Sparkles className="mr-2 h-3.5 w-3.5" />
                                AI-powered IDE platform for serious developers
                            </Badge>
                        </div>

                        <h1 className="mt-7 text-5xl font-bold tracking-tight text-[var(--text-primary)] sm:text-7xl lg:text-8xl">
                            Your synced AI IDE, secured from web to desktop.
                        </h1>

                        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                            Cursify combines a professional web account platform, secure
                            subscription controls, account-bound desktop downloads, device
                            pairing, AI agents, tools, extensions, and developer integrations.
                        </p>

                        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Button href="/signup" size="lg">
                                Start building
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button href="#platform" variant="secondary" size="lg">
                                Explore platform
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-[var(--text-secondary)]">
                            {trustItems.map((item) => (
                                <span key={item} className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
                                    {item}
                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
