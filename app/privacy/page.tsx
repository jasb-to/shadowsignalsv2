export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-gray-300">
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              ShadowSignals ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our platform in accordance with
              the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            <p className="mt-4">
              <strong>Data Controller:</strong> ShadowSignals
              <br />
              <strong>Contact:</strong> info@shadowsignals.live
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, time spent on platform, search queries
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, device identifiers
              </li>
              <li>
                <strong>Location Data:</strong> IP address and approximate geographic location
              </li>
              <li>
                <strong>Cookies and Tracking:</strong> Analytics cookies, preference cookies, advertising cookies
              </li>
              <li>
                <strong>Account Information:</strong> Email address, username (if you create an account)
              </li>
              <li>
                <strong>Communication Data:</strong> Messages sent through contact forms or support channels
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Legal Basis for Processing</h2>
            <p>We process your personal data under the following legal bases:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>
                <strong>Legitimate Interests:</strong> To operate and improve our platform, analyse usage patterns, and
                provide relevant content
              </li>
              <li>
                <strong>Consent:</strong> For marketing communications and non-essential cookies (where required)
              </li>
              <li>
                <strong>Contract:</strong> To provide services you have requested or subscribed to
              </li>
              <li>
                <strong>Legal Obligation:</strong> To comply with applicable laws and regulations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Provide and maintain our market analysis services</li>
              <li>Improve user experience and platform functionality</li>
              <li>Analyse usage patterns and generate analytics</li>
              <li>Communicate with you about updates, features, and support</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal obligations and enforce our terms</li>
              <li>Serve relevant advertisements through Google AdSense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Automated Decision-Making and AI Analysis</h2>
            <p>
              Our platform uses artificial intelligence (AI) models to generate market analysis and trading signals.
              This involves automated processing of market data to provide recommendations. You have the right to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Request human review of AI-generated analysis</li>
              <li>Contest automated decisions that significantly affect you</li>
              <li>Express your views regarding automated processing</li>
            </ul>
            <p className="mt-4">
              <strong>Important:</strong> Our AI analysis is for educational purposes only and should not be solely
              relied upon for investment decisions. Always conduct your own research and consult qualified financial
              advisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Sharing and Third Parties</h2>
            <p>We may share your data with the following third parties:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>
                <strong>Analytics Providers:</strong> Vercel Analytics for usage statistics
              </li>
              <li>
                <strong>Advertising Networks:</strong> Google AdSense for serving advertisements
              </li>
              <li>
                <strong>API Providers:</strong> CoinGecko, Twelve Data, Etherscan, HuggingFace (for market data and AI
                processing)
              </li>
              <li>
                <strong>Hosting Services:</strong> Vercel (data stored in EU/UK regions)
              </li>
              <li>
                <strong>Payment Processors:</strong> Stripe (if you make purchases)
              </li>
            </ul>
            <p className="mt-4">
              We ensure all third-party processors comply with UK GDPR through appropriate data processing agreements
              and safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. International Data Transfers</h2>
            <p>
              Some of our service providers are located outside the UK. Where data is transferred internationally, we
              ensure adequate safeguards are in place, including:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>EU-UK adequacy decisions</li>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Binding Corporate Rules</li>
              <li>Appropriate technical and organisational security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
            <p>We retain your personal data as follows:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>
                <strong>Usage and Analytics Data:</strong> 24 months
              </li>
              <li>
                <strong>Account Information:</strong> Until account deletion or 12 months of inactivity
              </li>
              <li>
                <strong>Communication Records:</strong> 6 years (for legal compliance)
              </li>
              <li>
                <strong>Cookie Data:</strong> As specified in our cookie policy (typically 12 months)
              </li>
            </ul>
            <p className="mt-4">
              After retention periods expire, we securely delete or anonymise your data unless longer retention is
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Your Rights Under UK GDPR</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>
                <strong>Right of Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
              </li>
              <li>
                <strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")
              </li>
              <li>
                <strong>Right to Restriction:</strong> Limit how we process your data
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format
              </li>
              <li>
                <strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on
                consent)
              </li>
              <li>
                <strong>Rights Related to Automated Decision-Making:</strong> Contest automated decisions and request
                human review
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:info@shadowsignals.live" className="text-cyan-400 hover:underline">
                info@shadowsignals.live
              </a>
              . We will respond within one month.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Data Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your data, including:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure hosting infrastructure with access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Staff training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="mt-4">
              In the event of a data breach that poses a risk to your rights and freedoms, we will notify you and the
              ICO within 72 hours as required by UK GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Cookies and Tracking Technologies</h2>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>
                <strong>Essential Cookies:</strong> Required for platform functionality (no consent required)
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Vercel Analytics to understand usage patterns
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Google AdSense for personalised advertisements
              </li>
            </ul>
            <p className="mt-4">
              You can manage cookie preferences through your browser settings. Note that disabling certain cookies may
              affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Children's Privacy</h2>
            <p>
              Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal
              data from children. If you believe we have collected data from a child, please contact us immediately for
              deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
              We will notify you of material changes by posting the updated policy with a new "Last updated" date.
              Continued use of the platform after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Complaints and Regulatory Authority</h2>
            <p>
              If you believe we have not handled your personal data properly, you have the right to lodge a complaint
              with the UK supervisory authority:
            </p>
            <p className="mt-4">
              <strong>Information Commissioner's Office (ICO)</strong>
              <br />
              Wycliffe House, Water Lane
              <br />
              Wilmslow, Cheshire SK9 5AF
              <br />
              Tel: 0303 123 1113
              <br />
              Website:{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                ico.org.uk
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Us</h2>
            <p>
              For questions, concerns, or to exercise your data protection rights, please contact us at:
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
        </div>
      </div>
    </div>
  )
}
