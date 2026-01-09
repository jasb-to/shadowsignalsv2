"use client"

export function LearnClient() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
            Trading Education Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Master technical analysis with our comprehensive guides on trading strategies and indicators. Educational
            content for informed decision-making.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <a
            href="#strategies"
            className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg hover:border-cyan-500/40 transition-all group"
          >
            <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">Trading Strategies</h3>
            <p className="text-gray-400">Learn proven approaches to market analysis and timing</p>
          </a>
          <a
            href="#indicators"
            className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg hover:border-cyan-500/40 transition-all group"
          >
            <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
              Technical Indicators
            </h3>
            <p className="text-gray-400">Understand the 10 most powerful indicators and how to use them</p>
          </a>
        </div>

        {/* Trading Strategies Section */}
        <section id="strategies" className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-cyan-400">Trading Strategies</h2>

          <div className="space-y-8">
            {/* Confluence Trading */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">1. Confluence Trading</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Confluence trading involves waiting for multiple technical indicators to align before entering a
                position. This approach significantly increases probability of success by requiring confirmation from
                various independent sources.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Wait for at least 3 indicators to align in the same direction</li>
                  <li>Look for support/resistance levels that coincide with trend signals</li>
                  <li>Confirm with volume analysis before entering</li>
                  <li>Use the confluence score on ShadowSignals to gauge alignment strength</li>
                </ul>
              </div>
            </div>

            {/* Trend Following */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">2. Trend Following</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Trend following is a strategy that aims to capture gains through the analysis of an asset&apos;s
                momentum in a particular direction. The premise is simple: identify the trend and trade in its
                direction.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">Key Principles:</h4>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Use moving averages to identify trend direction</li>
                  <li>Higher highs and higher lows indicate uptrends</li>
                  <li>Lower highs and lower lows indicate downtrends</li>
                  <li>Never trade against the prevailing trend</li>
                </ul>
              </div>
            </div>

            {/* Mean Reversion */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">3. Mean Reversion</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Mean reversion is based on the theory that prices and returns eventually move back towards their
                historical average. When an asset deviates significantly from its mean, it tends to revert back.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Apply:</h4>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Use Bollinger Bands to identify overextended prices</li>
                  <li>Look for RSI readings above 70 (overbought) or below 30 (oversold)</li>
                  <li>Wait for confirmation before entering counter-trend trades</li>
                  <li>Set tight stop losses as mean reversion can fail spectacularly</li>
                </ul>
              </div>
            </div>

            {/* Breakout Trading */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">4. Breakout Trading</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Breakout trading involves entering a position when the price moves outside a defined support or
                resistance level with increased volume. The key is identifying genuine breakouts versus false ones.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">Breakout Confirmation:</h4>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Volume should increase significantly on the breakout</li>
                  <li>Wait for a candle close beyond the level</li>
                  <li>Look for retest of the broken level as new support/resistance</li>
                  <li>Use ATR to set appropriate stop loss distances</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Indicators Section */}
        <section id="indicators" className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-cyan-400">Technical Indicators</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* RSI */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">RSI (Relative Strength Index)</h3>
              <p className="text-gray-400 mb-3">
                Measures the speed and magnitude of recent price changes. Values above 70 suggest overbought conditions,
                while below 30 indicates oversold.
              </p>
              <div className="text-sm text-cyan-400">Best for: Identifying momentum extremes</div>
            </div>

            {/* MACD */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">MACD</h3>
              <p className="text-gray-400 mb-3">
                Shows the relationship between two moving averages. Crossovers signal potential trend changes, while
                divergences warn of weakening momentum.
              </p>
              <div className="text-sm text-cyan-400">Best for: Trend confirmation and divergences</div>
            </div>

            {/* Bollinger Bands */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Bollinger Bands</h3>
              <p className="text-gray-400 mb-3">
                Creates dynamic support and resistance using standard deviations from a moving average. Band width
                indicates volatility levels.
              </p>
              <div className="text-sm text-cyan-400">Best for: Volatility and mean reversion</div>
            </div>

            {/* Moving Averages */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Moving Averages (SMA/EMA)</h3>
              <p className="text-gray-400 mb-3">
                Smooth price data to identify trends. EMAs react faster to recent prices, while SMAs give equal weight
                to all periods.
              </p>
              <div className="text-sm text-cyan-400">Best for: Trend identification</div>
            </div>

            {/* Volume */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Volume Analysis</h3>
              <p className="text-gray-400 mb-3">
                Confirms price movements with participation. High volume validates trends, while low volume suggests
                weak conviction.
              </p>
              <div className="text-sm text-cyan-400">Best for: Confirming breakouts and trends</div>
            </div>

            {/* Fibonacci */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Fibonacci Retracements</h3>
              <p className="text-gray-400 mb-3">
                Identifies potential reversal levels based on key ratios (23.6%, 38.2%, 50%, 61.8%). Often used to find
                entry points in trending markets.
              </p>
              <div className="text-sm text-cyan-400">Best for: Finding support/resistance levels</div>
            </div>

            {/* ATR */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">ATR (Average True Range)</h3>
              <p className="text-gray-400 mb-3">
                Measures market volatility by decomposing the entire range of an asset price. Essential for setting
                appropriate stop losses.
              </p>
              <div className="text-sm text-cyan-400">Best for: Position sizing and stops</div>
            </div>

            {/* Stochastic */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">Stochastic Oscillator</h3>
              <p className="text-gray-400 mb-3">
                Compares closing price to price range over time. Like RSI, identifies overbought/oversold conditions but
                with different calculation.
              </p>
              <div className="text-sm text-cyan-400">Best for: Timing entries in ranging markets</div>
            </div>
          </div>
        </section>

        {/* Risk Warning */}
        <section className="p-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Important Risk Warning</h2>
          <p className="text-gray-300 leading-relaxed">
            Trading and investing in financial markets carries significant risk of loss. The educational content
            provided here is for informational purposes only and should not be considered financial advice. Past
            performance does not guarantee future results. Always conduct your own research and consider consulting a
            qualified financial adviser before making investment decisions. Never risk more than you can afford to lose.
          </p>
        </section>
      </div>
    </div>
  )
}
