import Link from "next/link"
import { A3Shell } from "@/components/a3-shell"

const capabilities = [
  ["01", "Market state", "Live price, structure, volatility, liquidity and breadth are brought into one market view."],
  ["02", "Context engine", "Cycle position, historical behaviour and multi-timeframe structure provide the context behind the move."],
  ["03", "Intelligence", "A³ turns observations into a structured, explainable market thesis with confidence, risk and reasons."],
]

const integration = ["API access", "Structured intelligence", "Explainable outputs", "Human oversight"]

export default function A3Page() {
  return (
    <A3Shell>
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-28 pt-24 md:pb-40 md:pt-36">
          <div className="max-w-6xl">
            <p className="text-xs uppercase tracking-[.28em] text-[#e85d04]">A³ Markets · Market Intelligence Engine</p>
            <h1 className="mt-8 text-6xl font-semibold leading-[.84] tracking-[-.07em] md:text-8xl lg:text-[9rem]">The intelligence<br/>layer for markets.</h1>
            <p className="mt-10 max-w-3xl text-xl leading-relaxed text-black/60 md:text-2xl">A³ turns fragmented market data into structured, explainable intelligence — helping platforms understand what is happening, why it matters and what changes the thesis.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="rounded-full bg-[#e85d04] px-7 py-3 font-semibold text-white transition hover:bg-[#c94f03]">Talk to A³</Link>
              <Link href="/dashboard" className="rounded-full border border-black/15 px-7 py-3 transition hover:border-[#e85d04] hover:text-[#e85d04]">See the engine in action</Link>
            </div>
          </div>
        </section>

        <section className="border-y border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
            <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
              <div><p className="text-xs uppercase tracking-[.28em] text-[#e85d04]">Built for platforms</p><h2 className="mt-5 text-4xl font-semibold tracking-[-.05em] md:text-5xl">Not another trading app.</h2></div>
              <p className="max-w-3xl text-lg leading-relaxed text-black/55 md:text-xl">A³ is designed as software infrastructure. Brokers, fintechs, trading platforms, research products and AI systems can integrate market intelligence into the products they already operate — without having to build the intelligence layer themselves.</p>
            </div>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-xs uppercase tracking-[.28em] text-[#e85d04]">The engine</p>
          <h2 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-.05em] md:text-7xl">From market observations to a coherent thesis.</h2>
          <div className="mt-14 grid gap-px bg-black/10 md:grid-cols-3">{capabilities.map(([number, title, body]) => <article key={number} className="bg-[#f5f4ef] p-8 md:p-12"><div className="text-sm text-black/40">{number}</div><h3 className="mt-16 text-3xl font-semibold">{title}</h3><p className="mt-5 leading-relaxed text-black/55">{body}</p></article>)}</div>
        </section>

        <section id="how-it-works" className="border-y border-black/10 bg-[#11110f] text-white">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <p className="text-xs uppercase tracking-[.28em] text-[#ff7a1a]">How A³ works</p><h2 className="mt-5 max-w-5xl text-5xl font-semibold tracking-[-.05em] md:text-7xl">Data → Analysis → Intelligence.</h2>
            <div className="mt-14 grid gap-8 md:grid-cols-4">{["Live market data", "Multi-timeframe analysis", "Cycle, liquidity & risk", "Explainable market thesis"].map((item, i) => <div key={item} className="border-t border-white/20 pt-5"><div className="text-xs text-white/35">0{i + 1}</div><p className="mt-5 font-medium">{item}</p></div>)}</div>
          </div>
        </section>

        <section id="integration" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-end"><div><p className="text-xs uppercase tracking-[.28em] text-[#e85d04]">Integration</p><h2 className="mt-5 text-5xl font-semibold tracking-[-.05em] md:text-7xl">Add intelligence to the system you already have.</h2></div><div className="grid gap-3">{integration.map((item) => <div key={item} className="border-t border-black/10 py-4 text-lg">{item}</div>)}</div></div>
          <div className="mt-14 rounded-3xl bg-[#11110f] p-8 text-white md:p-12"><p className="text-xs uppercase tracking-[.28em] text-[#ff7a1a]">Reference implementation</p><div className="mt-5 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><p className="max-w-2xl text-2xl leading-relaxed text-white/70">Explore the current A³ terminal to see how the intelligence engine can be surfaced to an end user.</p><Link href="/dashboard" className="shrink-0 rounded-full bg-[#e85d04] px-6 py-3 font-semibold text-white">Open the terminal</Link></div></div>
        </section>

        <section className="border-t border-black/10"><div className="mx-auto max-w-7xl px-6 py-24"><div className="max-w-4xl"><p className="text-xs uppercase tracking-[.28em] text-[#e85d04]">A³ Markets</p><h2 className="mt-5 text-5xl font-semibold tracking-[-.05em] md:text-7xl">Understand the market as a system.</h2><p className="mt-7 text-lg leading-relaxed text-black/55 md:text-xl">A³ provides intelligence. Your platform remains the platform. Execution, custody and client relationships stay where they belong.</p><div className="mt-9 flex flex-wrap gap-4"><Link href="/contact" className="rounded-full bg-[#11110f] px-6 py-3 text-white">Talk to A³</Link><Link href="/learn" className="rounded-full border border-black/15 px-6 py-3">Explore the methodology</Link></div></div></div></section>
      </main>
    </A3Shell>
  )
}
