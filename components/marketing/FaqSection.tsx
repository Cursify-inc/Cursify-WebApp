import { LargeCard } from "@/components/ui/CardVariants";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const faqs = [
    {
        question: "Is Cursify only a website?",
        answer:
            "No. The website is the account and control platform. The full product includes a synced desktop IDE, secure subscription, device pairing, AI agents, tools, extensions, mirrors, and integrations.",
    },
    {
        question: "How does desktop pairing work?",
        answer:
            "The web app creates a short-lived one-time enrollment token. The desktop app submits that token to the backend, which verifies it, registers the device, and issues device credentials.",
    },
    {
        question: "Do you store auth tokens in localStorage?",
        answer:
            "No. Cursify is designed around secure HTTP-only cookies for web sessions. Sensitive provider tokens are stored encrypted on the backend.",
    },
    {
        question: "Is the desktop app impossible to bypass?",
        answer:
            "No responsible platform should claim that. Cursify uses server-side license validation, signed short-lived leases, device revocation, audit logging, and layered controls.",
    },
    {
        question: "What backend is Cursify designed for?",
        answer:
            "The recommended backend uses Go for APIs and product services, Rust for security-sensitive signing and verification, PostgreSQL for durable data, Redis for sessions/rate limits/queues, and S3-compatible storage for binaries.",
    },
];

export function FaqSection() {
    return (
        <Container
            as="section"
            id="faq"
            variant="section"
            width="wide"
            ambient
            grid
            className="relative overflow-hidden"
        >
            <SectionHeading
                eyebrow="FAQ"
                title="Built for a serious developer platform."
                description="Clear answers about the product model, security posture, desktop pairing, and platform architecture."
            />

            <div className="mx-auto mt-16 max-w-4xl space-y-5">
                {faqs.map((faq, index) => (
                    <LargeCard
                        key={faq.question}
                        animateIn
                        delay={index * 0.08}
                        interactive
                        className="transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-primary)]/30"
                        contentClassName="py-6"
                    >
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {faq.question}
                        </h3>

                        <p className="mt-3 text-[15px] leading-7 text-[var(--text-secondary)]">
                            {faq.answer}
                        </p>
                    </LargeCard>
                ))}
            </div>
        </Container>
    );
}
