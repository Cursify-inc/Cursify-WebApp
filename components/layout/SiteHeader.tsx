import Link from "next/link";
import { Cpu, Download } from "lucide-react";

import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const navItems = [
    { label: "Platform", href: "#platform" },
    { label: "Sync", href: "#sync" },
    { label: "Security", href: "#security" },
    { label: "Pricing", href: "#pricing" },
    { label: "Faq", href: "#faq" },
    { label: "EcosystemSection", href: "#EcosystemSection" },
    { label: "HeroSection", href: "#HeroSection" },


];

export function SiteHeader() {
    return (
        <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-[var(--card-border)] bg-[var(--bg-0)]/70 backdrop-blur-2xl">
            <Container
                variant="bleed"
                width="default"
                gutter="md"
                className="h-full"
                contentClassName="h-full"
            >
                <nav className="flex h-full items-center justify-between">
                    <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-[var(--text-inverted)] shadow-soft">
                            <Cpu className="h-4 w-4" />
                        </span>

                        <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                            Cursify
                        </span>
                    </Link>

                    <div className="hidden items-center gap-7 md:flex">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="focus-ring rounded-full text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        <Button
                            href="/login"
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex"
                        >
                            Sign in
                        </Button>

                        <Button href="/download" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </nav>
            </Container>
        </header>
    );
}
