import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cursify — AI-powered IDE platform",
  description:
      "Cursify is a professional AI-powered IDE platform with secure desktop pairing, account sync, agents, tools, extensions, and developer integrations.",
  metadataBase: new URL("https://cursify.dev"),
  openGraph: {
    title: "Cursify — AI-powered IDE platform",
    description:
        "Secure web account, synced desktop IDE, AI agent ecosystem, developer integrations, and account-bound downloads.",
    type: "website",
    url: "https://cursify.dev"
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursify — AI-powered IDE platform",
    description:
        "Professional AI IDE platform for serious developers."
  }
}

export default function RootLayout({
                                     children
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en">
      <body>
      {children}
      <div className="noise-overlay" />
      </body>
      </html>
  )
}
