import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Shield, Zap, BarChart3, Lock, TrendingUp, Clock, Database, Quote } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 text-sm text-cyan-400">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Market Intelligence</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Master Markets with
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Confluence Analysis
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              ShadowSignals combines advanced AI models with multi-indicator confluence analysis, multi-chain support,
              and real-time on-chain whale tracking to deliver institutional-grade market insights. Make informed
              decisions backed by data, not emotions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-semibold text-lg px-8"
                >
                  Access Platform
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-cyan-400">78%</div>
                <div className="text-sm text-gray-400">Signal Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">24/7</div>
                <div className="text-sm text-gray-400">Market Coverage</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">50+</div>
                <div className="text-sm text-gray-400">Indicators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-transparent to-cyan-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Professional-Grade Analysis Tools</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Leverage the same confluence analysis techniques used by institutional traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/50 border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-400">
                Advanced FinMA-7B and Mistral models analyse market conditions with institutional-grade precision
              </p>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Asset Coverage</h3>
              <p className="text-gray-400">
                Track cryptocurrencies, stocks, forex, and commodities all in one unified dashboard
              </p>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-gray-400">
                Confluence scores help you identify high-probability setups and manage risk effectively
              </p>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Confluence Scoring</h3>
              <p className="text-gray-400">
                Live confluence analysis combining 50+ technical indicators to identify market alignment
              </p>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">24/7 Market Monitoring</h3>
              <p className="text-gray-400">
                Continuous analysis across global markets with automatic updates every 5 minutes
              </p>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Source Data</h3>
              <p className="text-gray-400">
                Aggregated data from premium sources including Twelve Data, CoinGecko, and CoinPaprika
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How ShadowSignals Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI analyses multiple data sources to provide confluence-based insights
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "01",
                title: "Data Aggregation",
                description:
                  "We collect real-time data from multiple premium sources including Twelve Data, CoinGecko, and more",
              },
              {
                step: "02",
                title: "AI Analysis",
                description:
                  "Our FinMA-7B and Mistral AI models process market conditions, technical indicators, and sentiment data",
              },
              {
                step: "03",
                title: "Confluence Scoring",
                description:
                  "Multiple indicators are combined into a single confluence score showing alignment strength",
              },
              {
                step: "04",
                title: "Actionable Insights",
                description:
                  "Receive clear, educational analysis to inform your trading decisions - not financial advice",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start group">
                <div className="text-5xl font-bold text-cyan-500/20 group-hover:text-cyan-500/40 transition-colors">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-cyan-500/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Traders Worldwide</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See what our users say about ShadowSignals confluence analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-black/50 border-cyan-500/20 p-8 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    "The confluence scoring has completely changed how I approach market analysis. Instead of relying on
                    single indicators, I now have a clear view of when multiple signals align. Game changer for my
                    trading strategy."
                  </p>
                  <div>
                    <div className="font-semibold text-white">Marcus Chen</div>
                    <div className="text-sm text-gray-400">Crypto Trader, London</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-8 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    "As a researcher, I appreciate the multi-timeframe analysis and detailed indicator breakdowns. The
                    AI insights help me identify patterns I might have missed. Excellent tool for market research."
                  </p>
                  <div>
                    <div className="font-semibold text-white">Sarah Williams</div>
                    <div className="text-sm text-gray-400">Market Analyst, Manchester</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-8 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    "The support and resistance levels combined with the signal strength visualization make it so much
                    easier to spot high-probability setups. I use it daily for both crypto and forex analysis."
                  </p>
                  <div>
                    <div className="font-semibold text-white">James Patterson</div>
                    <div className="text-sm text-gray-400">Day Trader, Birmingham</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-black/50 border-cyan-500/20 p-8 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    "Finally, a platform that shows when indicators actually agree rather than just displaying them
                    separately. The timeframe alignment feature is brilliant for confirming trends across different
                    periods."
                  </p>
                  <div>
                    <div className="font-semibold text-white">Emma Thompson</div>
                    <div className="text-sm text-gray-400">Swing Trader, Edinburgh</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-500/10 to-transparent">
        <div className="container mx-auto px-4">
          <Card className="bg-black/50 border-cyan-500/30 p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Elevate Your Analysis?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join traders using ShadowSignals for professional confluence-based market insights
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-semibold text-lg px-8"
              >
                Access Platform Now
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-yellow-500/5 border-y border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">Important Disclaimer</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              ShadowSignals provides confluence-based market analysis for educational purposes only. We are not FCA
              regulated and do not provide financial advice. All analysis represents data-driven observations and should
              not be considered as recommendations to buy or sell any financial instruments. Trading and investing carry
              significant risk of loss. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
