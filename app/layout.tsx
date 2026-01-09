import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shadowsignals.live"),
  title: {
    default: "ShadowSignals - Free AI Crypto & Stock Market Analysis | Real-Time Trading Analytics",
    template: "%s | ShadowSignals",
  },
  description:
    "Free AI-powered cryptocurrency and stock market analysis platform. Real-time confluence scoring, technical indicators, Bitcoin analytics, Ethereum tracking, and on-chain whale monitoring. No registration required.",
  keywords: [
    // Primary crypto keywords
    "crypto analysis",
    "cryptocurrency analytics",
    "bitcoin analysis",
    "ethereum analysis",
    "crypto market analysis",
    "cryptocurrency trading",
    "bitcoin price analysis",
    "crypto signals",
    // Finance keywords
    "stock market analysis",
    "financial analytics",
    "trading analysis",
    "market analysis tool",
    "technical analysis",
    "forex analysis",
    "investment analysis",
    // Analytics keywords
    "AI trading analysis",
    "market analytics platform",
    "real-time analytics",
    "trading dashboard",
    "confluence analysis",
    "technical indicators",
    "market indicators",
    // Feature keywords
    "fear greed index",
    "whale tracking",
    "on-chain analysis",
    "market cycle analysis",
    "crypto fear greed",
    "bitcoin whale alerts",
    "smart money tracking",
    // UK specific
    "UK crypto analysis",
    "UK trading platform",
    "cryptocurrency UK",
  ],
  authors: [{ name: "ShadowSignals" }],
  creator: "ShadowSignals",
  publisher: "ShadowSignals",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.shadowsignals.live",
    siteName: "ShadowSignals",
    title: "ShadowSignals - Free AI Crypto & Stock Market Analysis",
    description:
      "Professional AI-powered market analysis with confluence scoring, technical indicators, and on-chain whale tracking. 100% free, no registration required.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShadowSignals - AI-Powered Market Analysis Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShadowSignals - Free AI Crypto & Stock Market Analysis",
    description: "Professional AI-powered market analysis with confluence scoring and whale tracking. 100% free.",
    images: ["/og-image.jpg"],
    creator: "@shadowsignals",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.shadowsignals.live",
  },
  category: "Finance",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ShadowSignals",
  description:
    "Free AI-powered cryptocurrency and stock market analysis platform with real-time confluence scoring and whale tracking.",
  url: "https://www.shadowsignals.live",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
  },
  featureList: [
    "AI-Powered Market Analysis",
    "Real-Time Confluence Scoring",
    "Technical Indicator Analysis",
    "On-Chain Whale Tracking",
    "Fear & Greed Index",
    "Multi-Asset Coverage",
  ],
  creator: {
    "@type": "Organization",
    name: "ShadowSignals",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9833828370676451"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://api.coinpaprika.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.coinpaprika.com" />
      </head>
      <body className={`font-sans antialiased`}>
        <Navigation />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
