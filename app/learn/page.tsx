export default function LearnPage() {
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
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Wait for 3+ indicators to signal the same direction</li>
                  <li>Combine trend indicators (MA) with momentum (RSI) and volume</li>
                  <li>Look for support/resistance confluence with Fibonacci levels</li>
                  <li>Higher confluence = higher probability trades</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Patient traders seeking high-probability setups with lower risk
                </p>
              </div>
            </div>

            {/* Trend Following */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">2. Trend Following</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                "The trend is your friend" - this strategy involves identifying the dominant market direction and
                trading in alignment with it. Trend followers aim to capture large moves by staying in positions during
                sustained directional movements.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Identify trend using moving averages (50 MA above 200 MA = uptrend)</li>
                  <li>Enter on pullbacks to support in uptrends, resistance in downtrends</li>
                  <li>Use trailing stops to protect profits while staying in the trend</li>
                  <li>Exit when trend reversal signals appear (MA crossover, momentum divergence)</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Traders who can hold positions through volatility and avoid overtrading
                </p>
              </div>
            </div>

            {/* Mean Reversion */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">3. Mean Reversion</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Mean reversion assumes that prices tend to return to their average over time. This strategy involves
                buying oversold conditions and selling overbought conditions, expecting price to revert to the mean.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Buy when RSI drops below 30 (oversold) in ranging markets</li>
                  <li>Sell when RSI rises above 70 (overbought)</li>
                  <li>Use Bollinger Bands - buy at lower band, sell at upper band</li>
                  <li>Works best in sideways/ranging markets, avoid in strong trends</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Range-bound markets and shorter timeframes with defined support/resistance
                </p>
              </div>
            </div>

            {/* Breakout Trading */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">4. Breakout Trading</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Breakout trading involves entering positions when price breaks through established support or resistance
                levels with strong momentum. These breakouts often lead to significant directional moves.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Identify consolidation patterns (triangles, rectangles, flags)</li>
                  <li>Wait for price to break key levels with increased volume</li>
                  <li>Enter on breakout or on retest of broken level (now support/resistance flip)</li>
                  <li>Use tight stops below breakout level to manage risk</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Volatile markets and traders comfortable with fast-moving positions
                </p>
              </div>
            </div>

            {/* Swing Trading */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">5. Swing Trading</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Swing trading aims to capture short to medium-term price movements over days to weeks. This approach
                focuses on identifying "swings" in market sentiment and momentum.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Use daily and 4-hour charts for analysis</li>
                  <li>Combine trend direction with momentum indicators (MACD, RSI)</li>
                  <li>Enter at swing lows in uptrends, swing highs in downtrends</li>
                  <li>Hold positions for 3-10 days typically, targeting 5-15% moves</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Part-time traders who can't monitor markets constantly
                </p>
              </div>
            </div>

            {/* Position Trading */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">6. Position Trading</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Position trading is a long-term approach focusing on major market cycles and fundamental trends. Traders
                hold positions for weeks to months, ignoring short-term volatility.
              </p>
              <div className="bg-black/50 p-4 rounded border border-cyan-500/10 mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Focus on weekly and monthly charts for trend identification</li>
                  <li>Combine technical analysis with fundamental market cycles</li>
                  <li>Enter at major support levels in bull markets</li>
                  <li>Use wide stops to avoid being shaken out by volatility</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Patient investors seeking to capture major market cycles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Indicators Section */}
        <section id="indicators" className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-cyan-400">Top 10 Technical Indicators</h2>

          <div className="space-y-8">
            {/* RSI */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">1. RSI (Relative Strength Index)</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Momentum</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                RSI measures the speed and magnitude of price movements on a scale of 0-100. It identifies overbought
                and oversold conditions, helping traders spot potential reversals.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Above 70 = Overbought (potential sell signal)</li>
                    <li>Below 30 = Oversold (potential buy signal)</li>
                    <li>Divergences signal trend weakness</li>
                    <li>Centerline (50) shows momentum direction</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Buy when RSI crosses above 30 from below</li>
                    <li>Sell when RSI crosses below 70 from above</li>
                    <li>Look for bullish divergence (price lower, RSI higher)</li>
                    <li>Combine with trend analysis for confirmation</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best Timeframe:</strong> Works on all timeframes, most effective on daily charts
                </p>
              </div>
            </div>

            {/* MACD */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">2. MACD (Moving Average Convergence Divergence)</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Trend + Momentum</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                MACD shows the relationship between two moving averages, revealing both trend direction and momentum
                strength. It consists of the MACD line, signal line, and histogram.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>MACD above signal line = Bullish momentum</li>
                    <li>MACD below signal line = Bearish momentum</li>
                    <li>Histogram shows momentum strength</li>
                    <li>Crossovers signal potential trend changes</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Buy when MACD crosses above signal line</li>
                    <li>Sell when MACD crosses below signal line</li>
                    <li>Look for divergences with price action</li>
                    <li>Histogram expansion shows strengthening trend</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best Timeframe:</strong> Daily and 4-hour charts for swing trading
                </p>
              </div>
            </div>

            {/* Moving Averages */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">3. Moving Averages (SMA/EMA)</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Trend</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Moving averages smooth out price data to identify trend direction. Simple Moving Average (SMA) gives
                equal weight to all prices, while Exponential Moving Average (EMA) emphasizes recent prices.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Price above MA = Uptrend</li>
                    <li>Price below MA = Downtrend</li>
                    <li>MA slope shows trend strength</li>
                    <li>Acts as dynamic support/resistance</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Golden Cross (50 MA &gt; 200 MA) = Buy signal</li>
                    <li>Death Cross (50 MA &lt; 200 MA) = Sell signal</li>
                    <li>Buy pullbacks to MA in uptrends</li>
                    <li>Use multiple MAs (20, 50, 200) for confluence</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Popular Periods:</strong> 20 (short-term), 50 (medium-term), 200 (long-term)
                </p>
              </div>
            </div>

            {/* Bollinger Bands */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">4. Bollinger Bands</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Volatility</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Bollinger Bands consist of a middle band (20 SMA) and two outer bands set at 2 standard deviations. They
                expand and contract based on market volatility, showing overbought/oversold conditions.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Price at upper band = Overbought</li>
                    <li>Price at lower band = Oversold</li>
                    <li>Band squeeze = Low volatility, breakout coming</li>
                    <li>Band expansion = High volatility period</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Buy at lower band in ranging markets</li>
                    <li>Sell at upper band in ranging markets</li>
                    <li>Breakouts beyond bands signal strong moves</li>
                    <li>Squeeze followed by expansion = trade setup</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Mean reversion strategies in ranging markets
                </p>
              </div>
            </div>

            {/* Stochastic Oscillator */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">5. Stochastic Oscillator</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Momentum</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Stochastic Oscillator compares a closing price to its price range over a period, showing momentum
                and potential reversal points. It consists of %K (fast) and %D (slow) lines.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Above 80 = Overbought conditions</li>
                    <li>Below 20 = Oversold conditions</li>
                    <li>%K crossing %D = Momentum shift</li>
                    <li>Divergences signal potential reversals</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Buy when %K crosses above %D below 20</li>
                    <li>Sell when %K crosses below %D above 80</li>
                    <li>Look for bullish divergence at oversold levels</li>
                    <li>Combine with trend for higher probability</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best Timeframe:</strong> Shorter timeframes (1H, 4H) for swing trading
                </p>
              </div>
            </div>

            {/* Volume */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">6. Volume</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Confirmation</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Volume measures the number of shares or contracts traded during a period. It confirms the strength of
                price movements and validates breakouts, making it essential for all trading strategies.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>High volume = Strong conviction in move</li>
                    <li>Low volume = Weak, unreliable move</li>
                    <li>Volume spikes = Significant market events</li>
                    <li>Declining volume in trend = Potential reversal</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Confirm breakouts with volume increase</li>
                    <li>Rising price + falling volume = Weakness</li>
                    <li>Volume precedes price (accumulation/distribution)</li>
                    <li>Compare current volume to average volume</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Key Principle:</strong> Volume should confirm price action - divergences signal caution
                </p>
              </div>
            </div>

            {/* Support & Resistance */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">7. Support & Resistance</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Price Levels</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Support and resistance are price levels where buying or selling pressure historically causes price to
                reverse. These levels represent psychological barriers and areas of supply/demand imbalance.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Support = Floor where buying emerges</li>
                    <li>Resistance = Ceiling where selling emerges</li>
                    <li>Multiple touches = Stronger level</li>
                    <li>Broken support becomes resistance (vice versa)</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Buy near support in uptrends</li>
                    <li>Sell near resistance in downtrends</li>
                    <li>Trade breakouts beyond key levels</li>
                    <li>Use as stop-loss placement zones</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Pro Tip:</strong> Horizontal levels work best, but also watch trendlines and moving averages
                </p>
              </div>
            </div>

            {/* Fibonacci Retracements */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">8. Fibonacci Retracements</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Retracement Levels</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Fibonacci retracements use mathematical ratios (23.6%, 38.2%, 50%, 61.8%, 78.6%) to identify potential
                support and resistance levels during pullbacks in trending markets.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>38.2% and 61.8% are key retracement levels</li>
                    <li>50% is psychological midpoint</li>
                    <li>Deeper retracements = Weaker trend</li>
                    <li>Confluence with other levels = Stronger support</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Draw from swing low to swing high (uptrend)</li>
                    <li>Buy at 38.2% or 61.8% retracement in uptrends</li>
                    <li>Combine with other indicators for confirmation</li>
                    <li>Use as profit targets (extensions: 127%, 161.8%)</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Best For:</strong> Identifying entry points during pullbacks in strong trends
                </p>
              </div>
            </div>

            {/* ATR */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">9. ATR (Average True Range)</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Volatility</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                ATR measures market volatility by calculating the average range between high and low prices over a
                period. It doesn't indicate direction, but shows how much an asset typically moves.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>High ATR = High volatility, larger moves</li>
                    <li>Low ATR = Low volatility, smaller moves</li>
                    <li>Rising ATR = Increasing volatility</li>
                    <li>Falling ATR = Decreasing volatility</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Set stop-losses based on ATR (2x ATR typical)</li>
                    <li>Adjust position size for volatility</li>
                    <li>Low ATR = Potential breakout coming</li>
                    <li>Use for profit target calculation</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Key Use:</strong> Risk management - helps size positions and set appropriate stops
                </p>
              </div>
            </div>

            {/* OBV */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-cyan-300">10. On-Balance Volume (OBV)</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">Volume Momentum</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                OBV is a cumulative indicator that adds volume on up days and subtracts volume on down days. It shows
                whether volume is flowing into or out of an asset, often leading price movements.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">What It Shows:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Rising OBV = Accumulation (buying pressure)</li>
                    <li>Falling OBV = Distribution (selling pressure)</li>
                    <li>OBV confirms price trends</li>
                    <li>Divergences predict reversals</li>
                  </ul>
                </div>
                <div className="bg-black/50 p-4 rounded border border-cyan-500/10">
                  <h4 className="font-semibold text-cyan-400 mb-2">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Buy when OBV breaks to new highs</li>
                    <li>Sell when OBV breaks to new lows</li>
                    <li>Bullish divergence: Price down, OBV up</li>
                    <li>Bearish divergence: Price up, OBV down</li>
                  </ul>
                </div>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>Key Insight:</strong> Smart money shows up in volume before price - OBV reveals this early
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Management Section */}
        <section className="mb-20">
          <div className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg">
            <h2 className="text-3xl font-bold mb-4 text-red-400">Essential Risk Management</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              No strategy or indicator guarantees success. Proper risk management is the difference between long-term
              success and account destruction. Always follow these principles:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300 mb-1">Never Risk More Than 1-2% Per Trade</h4>
                    <p className="text-sm text-gray-400">
                      If you have £10,000, risk only £100-200 per trade. This ensures you can survive losing streaks.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300 mb-1">Always Use Stop-Losses</h4>
                    <p className="text-sm text-gray-400">
                      Define your exit before entering. Place stops below support (longs) or above resistance (shorts).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300 mb-1">Maintain Positive Risk/Reward Ratio</h4>
                    <p className="text-sm text-gray-400">
                      Target at least 2:1 reward-to-risk. If risking £100, aim for £200+ profit.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300 mb-1">Diversify Your Positions</h4>
                    <p className="text-sm text-gray-400">
                      Don't put all capital in one asset or strategy. Spread risk across multiple uncorrelated trades.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300 mb-1">Keep a Trading Journal</h4>
                    <p className="text-sm text-gray-400">
                      Document every trade: entry, exit, reasoning, emotions. Review regularly to improve.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold">6</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300 mb-1">Control Your Emotions</h4>
                    <p className="text-sm text-gray-400">
                      Fear and greed destroy accounts. Stick to your plan, accept losses, and avoid revenge trading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-center p-6 bg-gray-900/50 border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-sm">
            <strong className="text-gray-300">Educational Content Only:</strong> This information is for educational
            purposes and does not constitute financial advice. Trading involves substantial risk of loss. Always conduct
            your own research and consider consulting with a qualified financial adviser before making investment
            decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
