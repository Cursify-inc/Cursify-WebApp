"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Bot, CircleCheck, Terminal } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"

const codeLines = [
    "agent.plan('refactor auth flow')",
    "sync.devices.validate(currentDevice)",
    "license.lease({ ttl: '15m' })",
    "tools.install('secure-code-review')",
    "integrations.github.connect()"
]

export function IdePreviewSection() {
    const reducedMotion = useReducedMotion()

    return (
        <section className="py-24">
            <Container>
                <SectionHeading
                    eyebrow="Desktop IDE"
                    title="A professional desktop workspace, powered by your web account."
                    description="The Cursify desktop IDE pairs with your account, validates subscription state server-side, and syncs your agent configuration, tools, extensions, settings, and linked account availability."
                />

                <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 32 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="perspective-1200 mt-14"
                >
                    <div className="preserve-3d mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-brand-dark p-3 shadow-card lg:rotate-x-[4deg]">
                        <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#0f1522]">
                            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-error" />
                                    <span className="h-3 w-3 rounded-full bg-warning" />
                                    <span className="h-3 w-3 rounded-full bg-success" />
                                </div>
                                <div className="text-xs font-medium text-white/50">
                                    cursify.workspace
                                </div>
                            </div>

                            <div className="grid min-h-[420px] lg:grid-cols-[230px_1fr_310px]">
                                <aside className="border-r border-white/10 bg-white/[0.02] p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                                        Explorer
                                    </p>
                                    <div className="mt-5 space-y-3 text-sm text-white/65">
                                        {["agents", "tools", "extensions", "sync", "security"].map(
                                            (item) => (
                                                <div
                                                    key={item}
                                                    className="rounded-xl bg-white/[0.04] px-3 py-2"
                                                >
                                                    /{item}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </aside>

                                <div className="p-6">
                                    <div className="mb-5 flex items-center gap-2 text-white">
                                        <Terminal className="h-4 w-4 text-brand-light" />
                                        <span className="text-sm font-semibold">
                      secure-workflow.ts
                    </span>
                                    </div>

                                    <div className="space-y-4 font-mono text-sm">
                                        {codeLines.map((line, index) => (
                                            <motion.div
                                                key={line}
                                                initial={reducedMotion ? false : { opacity: 0, x: -16 }}
                                                whileInView={
                                                    reducedMotion ? undefined : { opacity: 1, x: 0 }
                                                }
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.12 }}
                                                className="flex gap-4"
                                            >
                        <span className="w-6 text-right text-white/20">
                          {index + 1}
                        </span>
                                                <span className="text-[#d6e4ff]">{line}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <aside className="border-l border-white/10 bg-white/[0.03] p-5">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-brand-light" />
                                        <p className="font-semibold text-white">Cursify Agent</p>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/70">
                                        I found 3 auth flow improvements, 1 risky token refresh
                                        edge case, and 2 missing audit log events.
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {[
                                            "Subscription active",
                                            "Device paired",
                                            "License lease valid"
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-white/70"
                                            >
                                                <CircleCheck className="h-4 w-4 text-success" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </section>
    )
}
