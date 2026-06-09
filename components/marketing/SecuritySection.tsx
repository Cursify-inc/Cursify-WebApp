import {
    Fingerprint,
    KeyRound,
    LockKeyhole,
    RotateCcw,
    ShieldCheck,
    Siren
} from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Container } from "@/components/ui/Container"
import { SectionHeading } from "@/components/ui/SectionHeading"

const securityItems = [
    "HTTP-only session cookies",
    "Argon2id password hashing",
    "Refresh token rotation",
    "Short-lived signed tokens",
    "Encrypted OAuth token storage",
    "Download audit logging",
    "Device revocation support",
    "Server-side license validation",
    "Checksum and binary signatures",
    "Suspicious activity detection"
]

const pillars = [
    {
        icon: LockKeyhole,
        title: "Secure auth foundation",
        description:
            "Session-based auth with secure cookies, password reset flows, email verification, audit logs, and future MFA."
    },
    {
        icon: KeyRound,
        title: "Rust security boundary",
        description:
            "Sensitive signing, verification, license lease signing, checksum helpers, and encryption helpers live behind a high-trust Rust service."
    },
    {
        icon: Fingerprint,
        title: "Device-aware licensing",
        description:
            "Desktop devices are registered, checked, paired, revoked, and validated by the backend."
    }
]

export function SecuritySection() {
    return (
        <section id="security" className="py-24">
            <Container>
                <SectionHeading
                    eyebrow="Security"
                    title="Designed for account-bound desktop software from day one."
                    description="Cursify avoids unrealistic security claims. The platform uses layered controls, signed short-lived responses, server-side entitlement checks, and clear revocation paths."
                />

                <div className="mt-14 grid gap-5 lg:grid-cols-3">
                    {pillars.map((pillar) => {
                        const Icon = pillar.icon

                        return (
                            <Card key={pillar.title} className="p-7">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-text-primary">
                                    {pillar.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">
                                    {pillar.description}
                                </p>
                            </Card>
                        )
                    })}
                </div>

                <Card className="mt-6 overflow-hidden">
                    <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="bg-brand p-8 text-white">
                            <ShieldCheck className="h-8 w-8" />
                            <h3 className="mt-5 text-2xl font-bold">
                                Practical security controls
                            </h3>
                            <p className="mt-4 leading-8 text-white/75">
                                Cursify never assumes the desktop client is impossible to
                                bypass. License validation remains server-controlled, sensitive
                                actions are logged, and access can be revoked.
                            </p>

                            <div className="mt-8 grid gap-3">
                                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                                    <RotateCcw className="h-5 w-5" />
                                    <span className="font-semibold">Revocable devices</span>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                                    <Siren className="h-5 w-5" />
                                    <span className="font-semibold">Audit-first workflows</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 p-6 sm:grid-cols-2">
                            {securityItems.map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-border/70 bg-background-light px-4 py-4 text-sm font-semibold text-text-secondary"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </Container>
        </section>
    )
}
