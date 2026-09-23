import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Footer from "./Footer.jsx";

const features = [
  {
    icon: "🎓",
    title: "Trade skills, not cash",
    body: "List what you can teach — cooking, coding, carpentry, calligraphy — and trade it for an hour of someone else's craft.",
  },
  {
    icon: "🤝",
    title: "Fair, hour-for-hour swaps",
    body: "Every swap is measured in trade-hour credits, so an hour you give is always worth an hour you get back.",
  },
  {
    icon: "🔔",
    title: "Instant match notifications",
    body: "Get notified the moment someone wants to swap for what you're offering, and respond right from your dashboard.",
  },
  {
    icon: "🌍",
    title: "A real community",
    body: "Thousands of skills listed and swaps completed by people learning from their neighbors — not a marketplace, a community.",
  },
];

export default function Landing() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section id="top" className="relative overflow-hidden paper-texture">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4 text-teal-dark">
              Community skill exchange
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] font-semibold">
              Teach a little.<br />
              Learn a little.<br />
              <span className="italic text-teal">Pay nothing.</span>
            </h1>
            <p className="mt-6 text-ink/75 max-w-md leading-relaxed">
              SwapSkill is a platform where people exchange knowledge instead of money —
              match your skill with someone else's, and swap an hour of your craft for an
              hour of theirs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="px-6 py-3 rounded-full font-semibold text-sm bg-teal text-paper"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-full font-semibold text-sm border-2 border-ink text-ink"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="ticket-notch relative w-full max-w-sm">
              <div className="bg-white border-2 border-ink rounded-2xl px-8 py-8 shadow-[6px_6px_0_#E8A33D]">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    Trade ticket #0142
                  </span>
                  <span className="stamp font-mono text-[10px] uppercase px-2 py-0.5 rounded">Open</span>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex-1 perforate self-stretch"></div>
                  <div className="text-center flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Offering</p>
                    <p className="font-display text-2xl font-semibold mt-1">Guitar<br />lessons</p>
                  </div>
                  <div className="text-2xl text-mustard">⇄</div>
                  <div className="text-center flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Wants</p>
                    <p className="font-display text-2xl font-semibold mt-1">Spanish<br />practice</p>
                  </div>
                </div>
                <p className="mt-6 text-center font-mono text-[11px] text-ink/40">
                  no cash ever changes hands
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Features / benefits */}
      <section id="features" className="border-t border-line bg-paper-2">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
          <h2 className="font-display text-3xl font-semibold mb-10">Why people swap on SwapSkill</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="skill-card bg-paper border border-line rounded-xl p-5"
              >
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-display text-lg font-semibold mt-3">{f.title}</h3>
                <p className="text-sm text-ink/70 mt-2 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold">Ready to make your first swap?</h2>
          <p className="mt-3 text-ink/70 max-w-xl mx-auto">
            Sign in, list what you know, and start trading skills with your community — no
            wallet required.
          </p>
          <Link
            to="/login"
            className="inline-block mt-8 px-8 py-3 rounded-full font-semibold text-sm bg-teal text-paper"
          >
            Get Started — it's free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
