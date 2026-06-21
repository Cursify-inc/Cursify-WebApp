"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Download, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Surface } from "@/components/ui/Surface";

export function FinalCta() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { once: true });
    const reducedMotion = useReducedMotion() ?? false;

    return (
        <section ref={ref} className="relative py-28">
            <Container
                as="div"
                id="FinalCta"
                variant="transparent"
                width="wide"
                ambient
                className="relative overflow-hidden"
            >
                <div className="mx-auto max-w-4xl text-center">

                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={
                            reducedMotion
                                ? undefined
                                : inView
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 20 }
                        }
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >

                        <div className="flex justify-center">
                            <Badge>
                                <Sparkles className="mr-2 h-3.5 w-3.5" />
                                Ready to launch your developer workspace
                            </Badge>
                        </div>

                        <Surface
                            variant="card"
                            size="lg"
                            className="mx-auto mt-8 max-w-4xl text-center"
                        >
                            <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                                Build your AI-powered developer workspace
                            </h2>
                        </Surface>

                        <Surface
                            variant="card"
                            size="md"
                            className="mx-auto mt-6 max-w-2xl text-center"
                        >
                            <p className="text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                                Start with the web platform, pair your desktop IDE, connect developer accounts, customize agents, and sync your workflow.
                            </p>
                        </Surface>

                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

                            <Button href="/signup" size="lg">
                                Create account
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button href="/download" variant="secondary" size="lg">
                                <Download className="mr-2 h-5 w-5" />
                                Download desktop
                            </Button>

                        </div>

                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
