import {
    Fingerprint,
    KeyRound,
    LockKeyhole,
    RotateCcw,
    ShieldCheck,
    Siren
} from "lucide-react"
import { TinyCard } from "@/components/ui/CardVariants"
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

                {/* Outer simple box: NOT Card, but width-contained */}
                <div className="mt-6 w-full max-w-full overflow-hidden rounded-[28px] border border-border/60 bg-background-light shadow-sm">
                    <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                        {/* Left panel */}
                        <div className="bg-brand p-8 text-white">
                            <ShieldCheck className="h-8 w-8" />
                            <h3 className="mt-5 text-2xl font-bold">Practical security controls</h3>
                            <p className="mt-4 leading-8 text-white/75">
                                Cursify never assumes the desktop client is impossible to bypass.
                                License validation remains server-controlled, sensitive actions are
                                logged, and access can be revoked.
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

                        {/* Right grid */}
                        <div className="grid gap-3 p-6 sm:grid-cols-2">
                            {securityItems.map((item) => (
                                <TinyCard
                                    key={item}
                                    className="h-full rounded-2xl"
                                    contentClassName="px-4 py-4"
                                    interactive
                                    glow
                                >
                                    <p className="text-sm font-semibold text-text-secondary">{item}</p>
                                </TinyCard>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
