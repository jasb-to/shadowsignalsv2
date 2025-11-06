"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

const CheckIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  popular?: boolean
  tier?: "basic" | "pro" | "institutional"
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Perfect for getting started with market analysis",
    features: [
      { text: "5 analyses per day", included: true },
      { text: "Basic market analysis", included: true },
      { text: "Educational content access", included: true },
      { text: "Basic price charts", included: true },
      { text: "Fear & Greed Index", included: true },
      { text: "Watchlist", included: false },
      { text: "Price alerts", included: false },
      { text: "News feed", included: false },
      { text: "Export analysis", included: false },
      { text: "On-chain tracking", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Basic",
    price: "£23",
    period: "per month",
    description: "Enhanced tracking for serious traders",
    tier: "basic",
    features: [
      { text: "Unlimited analyses", included: true },
      { text: "Full price charts (all timeframes)", included: true },
      { text: "Watchlist (up to 20 assets)", included: true },
      { text: "Price alerts (up to 10)", included: true },
      { text: "News feed access", included: true },
      { text: "Export analysis (JSON/CSV)", included: true },
      { text: "Email support", included: true },
      { text: "On-chain whale tracking", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Subscribe Now",
  },
  {
    name: "Pro",
    price: "£79",
    period: "per month",
    description: "Advanced multi-chain analysis for professionals",
    tier: "pro",
    popular: true,
    features: [
      { text: "Everything in Basic", included: true },
      { text: "Advanced multi-chain analysis", included: true },
      { text: "Unlimited watchlist", included: true },
      { text: "Unlimited price alerts", included: true },
      { text: "On-chain whale tracking", included: true },
      { text: "Bull Market Top indicators", included: true },
      { text: "Altseason Top indicators", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced export features", included: true },
      { text: "API access", included: false },
    ],
    cta: "Subscribe Now",
  },
  {
    name: "Institutional",
    price: "£399",
    period: "per month",
    description: "Enterprise-grade solution with API access",
    tier: "institutional",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "API access for integration", included: true },
      { text: "Custom analysis parameters", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "White-label options", included: true },
      { text: "SLA guarantee (99.9% uptime)", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Custom integrations", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Quarterly strategy reviews", included: true },
    ],
    cta: "Contact Sales",
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleSubscribe = async (tier: "basic" | "pro" | "institutional") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign up or log in to subscribe",
        variant: "destructive",
      })
      router.push("/signup")
      return
    }

    setLoading(tier)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      })
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">Pricing Plans</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include our core market analysis features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative p-6 bg-gradient-to-b from-gray-900 to-black border ${
                tier.popular ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-gray-800"
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-400">/{tier.period}</span>
                </div>
                <p className="text-sm text-gray-400">{tier.description}</p>
              </div>

              <Button
                onClick={() => {
                  if (tier.name === "Free") {
                    router.push("/signup")
                  } else if (tier.tier) {
                    handleSubscribe(tier.tier)
                  }
                }}
                disabled={loading === tier.tier}
                className={`w-full mb-6 ${
                  tier.popular
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-semibold"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                {loading === tier.tier ? "Processing..." : tier.cta}
              </Button>

              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.included ? <CheckIcon /> : <XIcon />}
                    <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Can I change plans later?</h3>
            <p className="text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next
              billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">What payment methods do you accept?</h3>
            <p className="text-gray-400">
              We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment
              processor.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Is there a free trial?</h3>
            <p className="text-gray-400">
              Our Free plan gives you access to core features with no credit card required. You can upgrade anytime to
              unlock more features.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Can I cancel my subscription?</h3>
            <p className="text-gray-400">
              Yes, you can cancel your subscription at any time from your account settings. You'll retain access until
              the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Do you offer refunds?</h3>
            <p className="text-gray-400">
              We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a
              full refund.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl text-gray-400 mb-8">
          Join thousands of traders making smarter decisions with ShadowSignals
        </p>
        <Button
          onClick={() => router.push("/signup")}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-semibold text-lg px-8 py-6"
        >
          Start Free Today
        </Button>
      </div>
    </div>
  )
}
