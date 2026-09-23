import { useState } from "react";

const stories = [
  {
    q: `"I traded photography lessons for pottery classes"`,
    a: "Rhea taught a neighbor three weekends of studio photography and picked up hand-building on the wheel in return — no fees, just two skills changing hands.",
  },
  {
    q: `"My French got better than four years of app streaks"`,
    a: "Karan swapped weekly French conversation for helping a retired teacher set up her laptop and email — both sides walked away ahead.",
  },
  {
    q: `"We fixed each other's resumes and websites"`,
    a: "A copywriter and a developer matched on SwapSkill and traded a resume rewrite for a portfolio site build in one long weekend.",
  },
];

export default function Stories() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="stories" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl font-semibold mb-6">From the community</h2>
          <div className="space-y-3">
            {stories.map((s, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border border-line rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full text-left px-5 py-4 flex justify-between items-center font-medium"
                  >
                    {s.q}
                    <span className="transition-transform" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-ink/70 leading-relaxed">{s.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-ink text-paper rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-paper/50">Community pulse</p>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <Stat value="1,240" label="skills listed" />
              <Stat value="860" label="swaps completed" />
              <Stat value="₹0" label="ever charged" />
              <Stat value="4.8/5" label="avg. swap rating" />
            </div>
          </div>
          <p className="mt-8 text-sm text-paper/60 italic">Every number above is a trade — not a transaction.</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="text-xs text-paper/60 mt-1">{label}</p>
    </div>
  );
}
