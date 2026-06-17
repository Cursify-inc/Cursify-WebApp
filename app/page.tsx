import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ArchitectureSection } from "@/components/marketing/ArchitectureSection";
import { EcosystemSection } from "@/components/marketing/EcosystemSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCta } from "@/components/marketing/FinalCta";
import { GeometryHero } from "@/components/marketing/GeometryHero";
import { HeroSection } from "@/components/marketing/HeroSection";
import { IdePreviewSection } from "@/components/marketing/IdePreviewSection";
import { PricingPreview } from "@/components/marketing/PricingPreview";
import { ProductOverview } from "@/components/marketing/ProductOverview";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { SyncFlowSection } from "@/components/marketing/SyncFlowSection";
import TrustedStrip from "@/components/marketing/TrustedStrip";

export default function HomePage() {
    return (
        <>
            <GeometryHero/>

            <main className="relative z-10 min-h-dvh overflow-hidden text-text-primary">
                <SiteHeader />

                <HeroSection />

                <section data-geometry-section>
                    <TrustedStrip />
                </section>

                <section data-geometry-section>
                    <ProductOverview />
                </section>

                <section data-geometry-section>
                    <IdePreviewSection />
                </section>

                <section data-geometry-section>
                    <SyncFlowSection />
                </section>

                <section data-geometry-section>
                    <EcosystemSection />
                </section>

                <section data-geometry-section>
                    <SecuritySection />
                </section>

                <section data-geometry-section>
                    <ArchitectureSection />
                </section>

                <section data-geometry-section>
                    <PricingPreview />
                </section>

                <section data-geometry-section>
                    <FaqSection />
                </section>

                <section data-geometry-section>
                    <FinalCta />
                </section>

                <SiteFooter />
            </main>
        </>
    );
}
