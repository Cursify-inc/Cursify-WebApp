import { Container } from "@/components/ui/Container"

const items = [
    "Next.js Web Platform",
    "Go API Services",
    "Rust Security Boundary",
    "PostgreSQL",
    "Redis",
    "S3-compatible Storage"
]

export function TrustedStrip() {
    return (
        <section className="py-14">
            <Container>
                <div className="rounded-4xl border border-white/70 bg-white/55 px-6 py-5 shadow-soft backdrop-blur-xl">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                        Designed around a secure, scalable architecture
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-4 text-center text-sm font-semibold text-text-secondary sm:grid-cols-3 lg:grid-cols-6">
                        {items.map((item) => (
                            <div key={item} className="rounded-2xl bg-white/70 px-3 py-3">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
