import { Bot, Puzzle, Store, Wrench } from "lucide-react"
import { FaGithub, FaGitlab, FaSlack } from "react-icons/fa"
import { Card } from "@/components/ui/Card"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"
import * as Icons from "lucide-react"
console.log(Icons)

const ecosystem = [
    {
        icon: Bot,
        title: "Agents",
        description:
            "Build custom coding agents for debugging, review, planning, documentation, migration, and refactoring."
    },
    {
        icon: Wrench,
        title: "Tools",
        description:
            "Install trusted workflow tools and sync their configuration into the desktop IDE."
    },
    {
        icon: Puzzle,
        title: "Extensions",
        description:
            "Manage compatible extensions with visibility into trust, version, and signature state."
    },
    {
        icon: Store,
        title: "Mirrors",
        description:
            "Configure regional mirrors and binary availability for faster desktop updates."
    }
]

const providers = [
    { icon: FaGithub, name: "GitHub" },
    { icon: FaGitlab, name: "GitLab" },
    { icon: FaSlack, name: "Slack" },
    { icon: Store, name: "ClickUp" },
]

export function EcosystemSection() {
    return (
        <section className="py-24">
            <Container>
                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <SectionHeading
                        align="left"
                        eyebrow="Ecosystem"
                        title="Agents, tools, extensions, mirrors, and integrations."
                        description="Cursify gives developers a connected web control plane for customizing the IDE experience and integrating real development workflows."
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        {ecosystem.map((item) => {
                            const Icon = item.icon

                            return (
                                <Card key={item.title} className="p-6">
                                    <Icon className="h-6 w-6 text-brand" />
                                    <h3 className="mt-4 text-lg font-bold text-text-primary">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-text-secondary">
                                        {item.description}
                                    </p>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-10 rounded-4xl border border-white/70 bg-white/55 p-6 shadow-soft backdrop-blur-xl">
                    <p className="text-sm font-semibold text-text-primary">
                        Linked developer accounts
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {providers.map((provider) => {
                            const Icon = provider.icon

                            return (
                                <div
                                    key={provider.name}
                                    className="flex items-center justify-between rounded-2xl bg-white/75 px-4 py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 text-brand" />
                                        <span className="font-semibold text-text-primary">
                      {provider.name}
                    </span>
                                    </div>
                                    <span className="rounded-full bg-success-light px-2.5 py-1 text-xs font-bold text-success">
                    OAuth
                  </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Container>
        </section>
    )
}
