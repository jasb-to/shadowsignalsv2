import Link from "next/link"

const TrendingUpIcon = () => (
  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-black border-t border-cyan-500/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <TrendingUpIcon />
              </div>
              <span className="text-xl font-bold text-white">ShadowSignals</span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered confluence analysis for informed market decisions. Educational insights, not financial advice.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Risk Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <p className="text-sm text-gray-400 mb-1">Contact Us</p>
                <a
                  href="mailto:info@shadowsignals.live"
                  className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2"
                >
                  <MailIcon />
                  info@shadowsignals.live
                </a>
              </li>
              <li>
                <div className="flex gap-3 pt-2">
                  <a
                    href="https://x.com/shadowsignalslv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                    aria-label="Follow us on X (Twitter)"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/shadowsignals.live?igsh=MWRsenJwdW9tcHMyMQ%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@shadowsignals.live?_r=1&_t=ZN-919d4bSVIoA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                    aria-label="Follow us on TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cyan-500/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} ShadowSignals. All rights reserved.</p>
            <p className="text-xs text-gray-500">Not financial advice. For educational purposes only.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
