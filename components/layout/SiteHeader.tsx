import Link from "next/link"
import { Cpu, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Container } from "@/components/ui/Container"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const navItems = [
    { label: "Platform", href: "#platform" },
    { label: "Sync", href: "#sync" },
    { label: "Security", href: "#security" },
    { label: "Pricing", href: "#pricing" }
]

export function SiteHeader() {
    return (
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-black/5 bg-background/70 backdrop-blur-2xl dark:border-white/10">
            <Container>
                <nav className="flex h-16 items-center justify-between">
                    <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-white shadow-soft">
              <Cpu className="h-4 w-4" />
            </span>
                        <span className="text-sm font-bold tracking-tight text-text-primary">
              Cursify
            </span>
                    </Link>

                    <div className="hidden items-center gap-7 md:flex">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="focus-ring rounded-full text-sm font-medium text-text-secondary transition hover:text-text-primary"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
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
    )
}
