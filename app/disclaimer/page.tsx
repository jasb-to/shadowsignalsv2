const AlertTriangleIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
)

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="text-yellow-400">
            <AlertTriangleIcon />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Risk Disclaimer
          </h1>
        </div>
        <div className="space-y-6 text-gray-300">
          <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Important Notice</h2>
            <p className="text-white">
              ShadowSignals is NOT FCA regulated and does NOT provide financial advice. All analysis is for educational
              purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Market Risk</h2>
            <p>
              Trading and investing in financial markets carries significant risk of loss. You should only trade with
              money you can afford to lose. Past performance does not guarantee future results.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">No Financial Advice</h2>
            <p>
              The information provided by ShadowSignals is confluence-based analysis and educational content. It is not
              personalised financial advice and should not be relied upon for investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Responsibility</h2>
            <p>
              You are solely responsible for your trading and investment decisions. Always conduct your own research and
              consult with qualified financial advisors before making any investment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              Questions? Email:{" "}
              <a href="mailto:info@shadowsignals.live" className="text-cyan-400 hover:underline">
                info@shadowsignals.live
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
