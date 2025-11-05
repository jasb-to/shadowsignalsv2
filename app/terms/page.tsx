export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <div className="space-y-6 text-gray-300">
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using ShadowSignals ("the Platform", "we", "our", or "us"), you accept and agree to be
              bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not
              use our Platform.
            </p>
            <p className="mt-4">
              These Terms constitute a legally binding agreement between you and ShadowSignals. By clicking "Accept",
              creating an account, or using our services, you confirm that you have read, understood, and agree to be
              bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
            <p>
              ShadowSignals provides AI-powered market intelligence, technical analysis, and on-chain data tracking for
              cryptocurrency and financial markets. Our services include:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Multi-indicator confluence analysis</li>
              <li>AI-generated market insights and recommendations</li>
              <li>Real-time market data and whale tracking</li>
              <li>Technical analysis tools and signals</li>
              <li>Educational content and market research</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Important Disclaimers</h2>
            <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-4 mt-4">
              <p className="font-semibold text-red-400 mb-2">NOT FINANCIAL ADVICE</p>
              <p>
                ShadowSignals is NOT regulated by the Financial Conduct Authority (FCA) or any other financial
                regulatory body. We do NOT provide financial, investment, tax, or legal advice. All content, analysis,
                and signals are for EDUCATIONAL and INFORMATIONAL purposes only.
              </p>
            </div>
            <div className="bg-yellow-950/30 border border-yellow-500/50 rounded-lg p-4 mt-4">
              <p className="font-semibold text-yellow-400 mb-2">RISK WARNING</p>
              <p>
                Trading and investing in cryptocurrencies and financial markets carries substantial risk of loss. You
                may lose some or all of your invested capital. Past performance is not indicative of future results.
                Never invest more than you can afford to lose.
              </p>
            </div>
            <p className="mt-4">
              You acknowledge that all investment decisions are made at your own risk and that you are solely
              responsible for conducting your own research, due diligence, and consulting with qualified financial
              advisers before making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. User Eligibility</h2>
            <p>To use ShadowSignals, you must:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using our services under applicable laws</li>
              <li>Comply with all local laws and regulations regarding financial services and data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. User Responsibilities and Acceptable Use</h2>
            <p>You agree to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Use the Platform for lawful purposes only</li>
              <li>Not attempt to gain unauthorised access to our systems or other users' accounts</li>
              <li>Not interfere with the Platform's operation or security</li>
              <li>Make your own independent investment decisions based on your own research</li>
              <li>Not copy, reproduce, or redistribute our content without permission</li>
              <li>Not use automated systems (bots, scrapers) to access the Platform without authorisation</li>
              <li>Not engage in market manipulation, fraud, or illegal activities</li>
              <li>Maintain the confidentiality of your account credentials (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property Rights</h2>
            <p>
              All content, features, functionality, software, code, designs, graphics, logos, and trademarks on
              ShadowSignals are owned by or licensed to us and are protected by UK and international copyright,
              trademark, and intellectual property laws.
            </p>
            <p className="mt-4">You may not:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Copy, modify, distribute, or create derivative works from our content</li>
              <li>Reverse engineer, decompile, or disassemble our software</li>
              <li>Remove or alter any copyright, trademark, or proprietary notices</li>
              <li>Use our brand, logos, or trademarks without written permission</li>
            </ul>
            <p className="mt-4">
              Limited licence: We grant you a non-exclusive, non-transferable, revocable licence to access and use the
              Platform for personal, non-commercial purposes in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. No Guarantee of Accuracy</h2>
            <p>
              While we strive to provide accurate and up-to-date information, we make no representations or warranties
              regarding:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>The accuracy, completeness, or reliability of market data, analysis, or signals</li>
              <li>The performance or profitability of any trading strategies or recommendations</li>
              <li>The availability, uptime, or uninterrupted operation of the Platform</li>
              <li>The absence of errors, bugs, or security vulnerabilities</li>
            </ul>
            <p className="mt-4">
              Market data is sourced from third-party providers and may be delayed, inaccurate, or incomplete.
              AI-generated analysis may contain errors or biases. Always verify information independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SHADOWSIGNALS AND ITS DIRECTORS, EMPLOYEES, PARTNERS, AND
              AFFILIATES SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Any financial losses, trading losses, or investment losses</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Indirect, incidental, consequential, or punitive damages</li>
              <li>Damages arising from reliance on our analysis, signals, or recommendations</li>
              <li>Damages caused by third-party services, data providers, or API failures</li>
              <li>Unauthorised access, data breaches, or security incidents beyond our control</li>
            </ul>
            <p className="mt-4">
              Our total liability to you for any claims arising from your use of the Platform shall not exceed £100 (one
              hundred pounds sterling) or the amount you have paid us in the past 12 months, whichever is greater.
            </p>
            <p className="mt-4">
              Nothing in these Terms excludes or limits our liability for death or personal injury caused by negligence,
              fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded by UK law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless ShadowSignals and its directors, employees, partners,
              and affiliates from any claims, damages, losses, liabilities, costs, and expenses (including legal fees)
              arising from:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Your use or misuse of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or regulations</li>
              <li>Your infringement of any third-party rights</li>
              <li>Your investment decisions and trading activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Account Termination and Suspension</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Platform at any time, without notice, for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of fees (if applicable)</li>
              <li>Prolonged inactivity</li>
              <li>Any reason at our sole discretion</li>
            </ul>
            <p className="mt-4">
              You may terminate your account at any time by contacting us at info@shadowsignals.live. Upon termination,
              your right to use the Platform ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Third-Party Services and Links</h2>
            <p>
              Our Platform may contain links to third-party websites, services, or APIs (including CoinGecko, Twelve
              Data, Etherscan, HuggingFace, Google AdSense). We are not responsible for the content, privacy practices,
              or availability of third-party services. Your use of third-party services is at your own risk and subject
              to their terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be notified by posting the
              updated Terms with a new "Last updated" date. Your continued use of the Platform after changes constitutes
              acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes
              arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the
              courts of England and Wales.
            </p>
            <p className="mt-4">
              If you are a consumer resident in Scotland or Northern Ireland, you may also bring proceedings in the
              courts of your home jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Dispute Resolution</h2>
            <p>
              Before initiating legal proceedings, we encourage you to contact us at info@shadowsignals.live to resolve
              disputes informally. We will make reasonable efforts to resolve complaints within 30 days.
            </p>
            <p className="mt-4">
              If informal resolution fails, you may pursue alternative dispute resolution (ADR) or mediation before
              resorting to litigation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent
              jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision
              shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and Risk Disclaimer, constitute the entire agreement between
              you and ShadowSignals regarding your use of the Platform and supersede all prior agreements,
              understandings, and communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">17. Contact Information</h2>
            <p>
              For questions, concerns, or notices regarding these Terms, please contact us at:
              <br />
              <br />
              <strong>Email:</strong>{" "}
              <a href="mailto:info@shadowsignals.live" className="text-cyan-400 hover:underline">
                info@shadowsignals.live
              </a>
              <br />
              <strong>Response Time:</strong> We aim to respond within 48 hours
            </p>
          </section>

          <div className="bg-cyan-950/30 border border-cyan-500/50 rounded-lg p-6 mt-8">
            <p className="font-semibold text-cyan-400 mb-2">Acknowledgement</p>
            <p>
              BY USING SHADOWSIGNALS, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE
              TERMS OF SERVICE. YOU FURTHER ACKNOWLEDGE THAT TRADING AND INVESTING CARRIES SUBSTANTIAL RISK AND THAT YOU
              ARE SOLELY RESPONSIBLE FOR YOUR INVESTMENT DECISIONS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
