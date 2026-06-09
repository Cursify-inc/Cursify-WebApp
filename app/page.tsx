import { SiteFooter } from "@/components/layout/SiteFooter"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { ArchitectureSection } from "@/components/marketing/ArchitectureSection"
import { EcosystemSection } from "@/components/marketing/EcosystemSection"
import { FaqSection } from "@/components/marketing/FaqSection"
import { FinalCta } from "@/components/marketing/FinalCta"
import { HeroSection } from "@/components/marketing/HeroSection"
import { IdePreviewSection } from "@/components/marketing/IdePreviewSection"
import { PricingPreview } from "@/components/marketing/PricingPreview"
import { ProductOverview } from "@/components/marketing/ProductOverview"
import { SecuritySection } from "@/components/marketing/SecuritySection"
import { SyncFlowSection } from "@/components/marketing/SyncFlowSection"
import { TrustedStrip } from "@/components/marketing/TrustedStrip"

export default function HomePage() {
  return (
      <main className="min-h-screen overflow-hidden">
        <SiteHeader />
        <HeroSection />
        <TrustedStrip />
        <ProductOverview />
        <IdePreviewSection />
        <SyncFlowSection />
        <EcosystemSection />
        <SecuritySection />
        <ArchitectureSection />
        <PricingPreview />
        <FaqSection />
        <FinalCta />
        <SiteFooter />
      </main>
  )
}
