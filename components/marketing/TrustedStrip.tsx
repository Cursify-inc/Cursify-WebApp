"use client";

import { Container } from "@/components/ui/Container";
import { TinyCard } from "@/components/ui/CardVariants";
import { cn } from "@/lib/utils";

const items = [
    "Next.js Web Platform",
    "Go API Services",
    "Rust Security Boundary",
    "PostgreSQL",
    "Redis",
    "S3-compatible Storage",
];

export default function TrustedStrip() {
    return (
        <Container
            as="section"
            variant="shell"
            width="wide"
            ambient
            className="relative"
            contentClassName="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-1)]/40 px-6 py-7 backdrop-blur-xl"
        >
            <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Designed around a secure, scalable architecture
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {items.map((item, index) => (
                    <TinyCard
                        key={item}
                        animateIn
                        delay={index * 0.05}
                        interactive
                        glow
                        className="h-full"
                        contentClassName="h-full min-h-[4.5rem] justify-center"
                    >
                        <span
                            className={cn(
                                "block text-center text-sm font-semibold text-[var(--text-primary)]"
                            )}
                        >
                            {item}
                        </span>
                    </TinyCard>
                ))}
            </div>
        </Container>
    );
}
