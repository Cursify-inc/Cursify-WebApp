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

function TrustedStrip() {
    return (
        <Container
            as="section"
            variant="shell"
            width="wide"
            className="relative"
            contentClassName="relative overflow-hidden rounded-4xl border border-[var(--trusted-strip-border)] bg-[var(--trusted-strip-bg)] px-5 py-6 shadow-[var(--trusted-strip-shadow)] backdrop-blur-xl sm:px-7 sm:py-7 lg:px-8"
        >
            <div className="pointer-events-none absolute inset-0 rounded-4xl bg-[radial-gradient(circle_at_50%_0%,var(--trusted-strip-glow),transparent_58%)]" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-(--trusted-strip-highlight) to-transparent" />

            <div className="relative">
                <p className="theme-color-fade text-center text-xs font-semibold uppercase tracking-[0.24em] text-(--trusted-strip-eyebrow)">
                    Designed around a secure, scalable architecture
                </p>

                <div className="mt-5 grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {items.map((item, index) => (
                        <TinyCard
                            key={item}
                            animateIn
                            delay={Math.min(index, 3)}
                            interactive
                            glow
                            activateGlowOnReveal
                            className="h-full"
                            contentClassName="h-full min-h-[4.75rem] justify-center"
                        >
                            <span
                                className={cn(
                                    "theme-color-fade block text-center text-sm font-semibold leading-snug",
                                    "text-(--trusted-strip-item-text)"
                                )}
                            >
                                {item}
                            </span>
                        </TinyCard>
                    ))}
                </div>
            </div>
        </Container>
    );
}

export default TrustedStrip
