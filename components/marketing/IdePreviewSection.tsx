"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Bot, CircleCheck, Terminal } from "lucide-react";

import { TinyCard } from "@/components/ui/CardVariants";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const codeLines = [
    "agent.plan('refactor auth flow')",
    "sync.devices.validate(currentDevice)",
    "license.lease({ ttl: '15m' })",
    "tools.install('secure-code-review')",
    "integrations.github.connect()",
];

const explorerItems = ["agents", "tools", "extensions", "sync", "security"];

const agentChecks = ["Subscription active", "Device paired", "License lease valid"];

export function IdePreviewSection() {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { margin: "-15%", once: true });
    const reducedMotion = useReducedMotion() ?? false;

    return (
        <section ref={ref} className="py-24">
            <Container
                as="section"
                id="IDE"
                variant="fit"
                width="wide"
                className="relative overflow-hidden"
            >
                <SectionHeading
                    eyebrow="Desktop IDE"
                    title="A professional desktop workspace, powered by your web account."
                    description="The Cursify desktop IDE pairs with your account, validates subscription state server-side, and syncs your agent configuration, tools, extensions, settings, and linked account availability."
                />

                <div className="mx-auto mt-14 max-w-6xl rounded-[2rem] bg-[var(--bg-2)] p-3 shadow-card">
                    <div className="overflow-hidden rounded-[1.55rem] border border-[var(--card-border)] bg-[var(--bg-0)]">
                        <div className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--bg-1)] px-5 py-4">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[var(--error)]" />
                                <span className="h-3 w-3 rounded-full bg-[var(--warning)]" />
                                <span className="h-3 w-3 rounded-full bg-[var(--success)]" />
                            </div>

                            <div className="text-xs font-medium text-[var(--text-tertiary)]">
                                cursify.workspace
                            </div>
                        </div>

                        <div className="relative isolate grid min-h-[420px] lg:grid-cols-[230px_1fr_310px]">
                            <aside className="relative z-20 border-b border-[var(--card-border)] bg-[var(--bg-1)] p-5 lg:border-b-0 lg:border-r">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                                    Explorer
                                </p>

                                <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
                                    {explorerItems.map((item, index) => (
                                        <TinyCard
                                            key={item}
                                            glow
                                            glowActiveOverride={inView}
                                            animateIn={!reducedMotion}
                                            delay={index}
                                            className="w-full"
                                            contentClassName="min-h-[2.5rem] justify-center"
                                            title={
                                                <span className="font-mono text-sm text-[var(--text-secondary)]">
                                                    /{item}
                                                </span>
                                            }
                                        />
                                    ))}
                                </div>
                            </aside>

                            <div className="relative z-10 p-6">
                                <div className="mb-5 flex items-center gap-2 text-[var(--text-primary)]">
                                    <Terminal className="h-4 w-4 text-[var(--brand-primary)]" />
                                    <span className="text-sm font-semibold">
                                        secure-workflow.ts
                                    </span>
                                </div>

                                <div className="space-y-4 font-mono text-sm">
                                    {codeLines.map((line, index) => (
                                        <motion.div
                                            key={line}
                                            initial={reducedMotion ? false : { opacity: 0, x: -16 }}
                                            animate={
                                                reducedMotion
                                                    ? undefined
                                                    : inView
                                                        ? { opacity: 1, x: 0 }
                                                        : { opacity: 0, x: -16 }
                                            }
                                            transition={{
                                                delay: index * 0.12,
                                                duration: 0.45,
                                                ease: "easeOut",
                                            }}
                                            className="pointer-events-none flex gap-4"
                                        >
                                            <span className="w-6 text-right text-[var(--text-tertiary)]">
                                                {index + 1}
                                            </span>

                                            <span className="text-[var(--text-secondary)]">
                                                {line}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <aside className="relative z-20 border-t border-[var(--card-border)] bg-[var(--bg-1)] p-5 lg:border-l lg:border-t-0">
                                <div className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-[var(--brand-primary)]" />
                                    <p className="font-semibold text-[var(--text-primary)]">
                                        Cursify Agent
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <TinyCard
                                        glow
                                        glowActiveOverride={inView}
                                        animateIn={!reducedMotion}
                                        delay={1}
                                        className="w-full"
                                        contentClassName="min-h-[6rem] items-start"
                                    >
                                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                            I found 3 auth flow improvements, 1 risky token refresh
                                            edge case, and 2 missing audit log events.
                                        </p>
                                    </TinyCard>

                                    {agentChecks.map((item, index) => (
                                        <TinyCard
                                            key={item}
                                            glow
                                            glowActiveOverride={inView}
                                            animateIn={!reducedMotion}
                                            delay={index + 2}
                                            className="w-full"
                                            contentClassName="min-h-[2.5rem]"
                                            leading={
                                                <CircleCheck className="h-4 w-4 text-[var(--success)]" />
                                            }
                                            title={
                                                <span className="text-sm text-[var(--text-secondary)]">
                                                    {item}
                                                </span>
                                            }
                                        />
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
