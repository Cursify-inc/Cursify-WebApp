import Link from "next/link"
import { Cpu } from "lucide-react"
import { Container } from "@/components/ui/Container"

const links = [
    {
        title: "Product",
        items: [
            { label: "Platform", href: "#platform" },
            { label: "Sync", href: "#sync" },
            { label: "Security", href: "#security" },
            { label: "Pricing", href: "#pricing" }
        ]
    },
    {
        title: "Account",
        items: [
            { label: "Sign in", href: "/login" },
            { label: "Create account", href: "/signup" },
            { label: "Download", href: "/download" }
        ]
    },
    {
        title: "Legal",
        items: [
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" }
        ]
    }
]

export function SiteFooter() {
    return (
        <footer className="border-t border-black/8 py-12 dark:border-white/10">
            <Container>
                <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
                    <div>
                        <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-white">
                <Cpu className="h-4 w-4" />
              </span>
                            <span className="font-bold text-text-primary">Cursify</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-7 text-text-secondary">
                            A professional AI-powered IDE platform with secure account sync,
                            desktop pairing, subscriptions, agents, tools, and integrations.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-3">
                        {links.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-bold text-text-primary">
                                    {group.title}
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {group.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block text-sm text-text-secondary transition hover:text-text-primary"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 border-t border-black/8 pt-6 text-sm text-text-tertiary dark:border-white/10">
                    © {new Date().getFullYear()} Cursify. All rights reserved.
                </div>
            </Container>
        </footer>
    )
}
