const steps = [
  { n: "01", title: "List what you know", body: "Cooking, coding, carpentry, calligraphy — post the skill and how long a session runs." },
  { n: "02", title: "Find your match", body: "Browse people who want what you offer, and offer what you want. We suggest fair swaps automatically." },
  { n: "03", title: "Trade the hour", body: "Meet online or nearby. Log the swap, rate the exchange, and your trade credit balances out." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <h2 className="font-display text-3xl font-semibold mb-10">Three steps, no wallet required</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n}>
              <p className="font-mono text-xs text-teal">{s.n}</p>
              <h3 className="font-display text-xl font-semibold mt-2">{s.title}</h3>
              <p className="mt-2 text-ink/70 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
