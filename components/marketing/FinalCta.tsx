import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Container } from "@/components/ui/Container"

export function FinalCta() {
    return (
        <section className="py-24">
            <Container>
                <div className="relative overflow-hidden rounded-[3rem] border border-brand-primary/20 bg-brand-primary px-6 py-16 text-center shadow-card sm:px-10">
                    <div className="absolute left-10 top-10 h-24 w-24 rotate-45 rounded-3xl bg-text-inverted/10" />
                    <div className="absolute bottom-10 right-12 h-32 w-32 rounded-full border border-text-inverted/15" />
                    <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-inverted/10 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-15"
                        style={{ background: "radial-gradient(circle at top, currentColor, transparent 42%)", color: "var(--text-inverted, white)" }}
                    />

                    <div className="relative mx-auto max-w-3xl">
                        <h2 className="text-4xl font-bold tracking-tight text-text-inverted sm:text-6xl">
                            Build your AI-powered developer workspace.
                        </h2>

                        <p className="mt-6 text-lg leading-8 text-text-inverted/80">
                            Start with the web platform, pair your desktop IDE, connect your
                            developer accounts, customize agents, and sync your workflow.
                        </p>

                        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button href="/signup" variant="secondary" size="lg">
                                Create account
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button
                                href="/download"
                                variant="ghost"
                                size="lg"
                                className="border border-text-inverted/15 text-text-inverted hover:bg-text-inverted/10 hover:text-text-inverted"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Download desktop
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
