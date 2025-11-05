export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
            <p className="mb-6">
              Have questions about ShadowSignals? We'd love to hear from you. Reach out to us using the information
              below.
            </p>
          </section>

          <section className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Email</h3>
            <a
              href="mailto:info@shadowsignals.live"
              className="text-cyan-400 hover:text-cyan-300 text-lg transition-colors"
            >
              info@shadowsignals.live
            </a>
          </section>

          <section className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex gap-6">
              <a
                href="https://x.com/shadowsignalslv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/shadowsignals.live"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@shadowsignals.live"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Business Enquiries</h2>
            <p>
              For partnership opportunities, media enquiries, or business-related questions, please email us at{" "}
              <a href="mailto:info@shadowsignals.live" className="text-cyan-400 hover:underline">
                info@shadowsignals.live
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Support</h2>
            <p>
              Need help with the platform? Check out our{" "}
              <a href="/#how-it-works" className="text-cyan-400 hover:underline">
                How It Works
              </a>{" "}
              section or email us with your questions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
