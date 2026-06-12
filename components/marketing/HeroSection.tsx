"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Container } from "@/components/ui/Container"
import { GeometryHero } from "./GeometryHero"

export function HeroSection() {
    const reducedMotion = useReducedMotion()

    return (
        <section className="relative pt-28 sm:pt-36">
            <Container>
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Badge>
                            <Sparkles className="mr-2 h-3.5 w-3.5" />
                            AI-powered IDE platform for serious developers
                        </Badge>

                        <h1 className="mt-7 max-w-4xl text-5xl font-bold tracking-tight text-text-primary sm:text-7xl lg:text-8xl">
                            Your synced AI IDE, secured from web to desktop.
                        </h1>

                        <p className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
                            Cursify combines a professional web account platform, secure
                            subscription controls, account-bound desktop downloads, device
                            pairing, AI agents, tools, extensions, and developer integrations.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Button href="/signup" size="lg" edgeLight>
                                Start building
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button href="#platform" variant="secondary" size="lg" edgeLight={false}>
                                Explore platform
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Signed downloads
              </span>
                            <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Server-side license validation
              </span>
                            <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Device revocation support
              </span>
                        </div>
                    </motion.div>

                    <GeometryHero />
                </div>
            </Container>
        </section>
    )
}
