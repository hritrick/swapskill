import { useState } from "react";

export default function Hero({ onListSkill }) {
  const [flipped, setFlipped] = useState(false);

  return (
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
            SwapSkill matches your knowledge with someone else's. No money changes hands — just an hour of your craft for an hour of theirs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#browse" className="px-6 py-3 rounded-full font-semibold text-sm bg-ink text-paper">
              Browse open swaps
            </a>
            <button
              onClick={onListSkill}
              className="px-6 py-3 rounded-full font-semibold text-sm border-2 border-ink text-ink"
            >
              List your skill
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`flip-card relative ticket-notch w-full max-w-sm cursor-pointer select-none ${flipped ? "flipped" : ""}`}
            role="button"
            tabIndex={0}
            aria-label="Tap to see the swap flip"
            onClick={() => setFlipped((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFlipped((v) => !v);
              }
            }}
          >
            <div className="flip-inner relative">
              <div className="flip-face bg-white border-2 border-ink rounded-2xl px-8 py-8 shadow-[6px_6px_0_#E8A33D]">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Trade ticket #0142</span>
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
                <p className="mt-6 text-center font-mono text-[11px] text-ink/40">tap the ticket to flip the trade</p>
              </div>

              <div className="flip-face flip-back absolute inset-0 bg-ink text-paper border-2 border-ink rounded-2xl px-8 py-8 shadow-[6px_6px_0_#1F6F6B]">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">Trade ticket #0142</span>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-mustard text-mustard">Matched</span>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="text-center flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-paper/50">You'll teach</p>
                    <p className="font-display text-2xl font-semibold mt-1">Spanish<br />practice</p>
                  </div>
                  <div className="text-2xl text-mustard">⇄</div>
                  <div className="text-center flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-paper/50">You'll learn</p>
                    <p className="font-display text-2xl font-semibold mt-1">Guitar<br />lessons</p>
                  </div>
                </div>
                <p className="mt-6 text-center font-mono text-[11px] text-paper/40">that's the whole idea — it swaps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
