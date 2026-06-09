import { Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For exploring Cursify and basic account sync.",
        features: ["Web account", "Basic desktop access", "Community tools", "Limited sync"]
    },
    {
        name: "Pro",
        price: "$19",
        description: "For professional developers using Cursify daily.",
        highlighted: true,
        features: [
            "Full desktop IDE access",
            "Custom AI agents",
            "Tool and extension sync",
            "Signed downloads",
            "Device management",
            "Linked developer accounts"
        ]
    },
    {
        name: "Team",
        price: "$49",
        description: "For teams managing shared workflows and future organizations.",
        features: [
            "Everything in Pro",
            "Organization members",
            "Shared tool policy",
            "Admin visibility",
            "Priority support"
        ]
    }
]

export function PricingPreview() {
    return (
        <section id="pricing" className="py-24">
            <Container>
                <SectionHeading
                    eyebrow="Pricing"
                    title="Simple plans for individuals and teams."
                    description="Start free, upgrade when you need full desktop sync, AI agents, device controls, and professional workflow integrations."
                />

                <div className="mt-14 grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={
                                plan.highlighted
                                    ? "relative border-brand bg-brand p-7 text-white shadow-card"
                                    : "p-7"
                            }
                        >
                            {plan.highlighted && (
                                <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">
                  Popular
                </span>
                            )}

                            <h3
                                className={
                                    plan.highlighted
                                        ? "text-xl font-bold text-white"
                                        : "text-xl font-bold text-text-primary"
                                }
                            >
                                {plan.name}
                            </h3>

                            <div className="mt-5 flex items-end gap-1">
                <span
                    className={
                        plan.highlighted
                            ? "text-5xl font-bold text-white"
                            : "text-5xl font-bold text-text-primary"
                    }
                >
                  {plan.price}
                </span>
                                <span
                                    className={
                                        plan.highlighted ? "pb-1 text-white/60" : "pb-1 text-text-tertiary"
                                    }
                                >
                  /mo
                </span>
                            </div>

                            <p
                                className={
                                    plan.highlighted
                                        ? "mt-4 text-sm leading-7 text-white/70"
                                        : "mt-4 text-sm leading-7 text-text-secondary"
                                }
                            >
                                {plan.description}
                            </p>

                            <div className="mt-7 space-y-3">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <Check
                                            className={
                                                plan.highlighted
                                                    ? "h-4 w-4 text-white"
                                                    : "h-4 w-4 text-success"
                                            }
                                        />
                                        <span
                                            className={
                                                plan.highlighted ? "text-sm text-white/80" : "text-sm text-text-secondary"
                                            }
                                        >
                      {feature}
                    </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                href="/signup"
                                variant={plan.highlighted ? "secondary" : "primary"}
                                className="mt-8 w-full"
                            >
                                Get started
                            </Button>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    )
}
