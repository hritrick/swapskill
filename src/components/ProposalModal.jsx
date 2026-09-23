import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";

// Skills the signed-in user could offer in exchange. In a real app this
// would come from the user's own listed skills.
const MY_SKILLS = ["Guitar fundamentals", "Excel & spreadsheets", "Photography basics", "Resume writing"];

export default function ProposalModal() {
  const { proposalTarget, closeProposal } = useContext(AppContext);
  const [offer, setOffer] = useState(MY_SKILLS[0]);
  const [sent, setSent] = useState(false);

  if (!proposalTarget) return null;

  function handleClose() {
    closeProposal();
    setSent(false);
    setOffer(MY_SKILLS[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 modal-backdrop flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-paper w-full max-w-md rounded-2xl border-2 border-ink p-6 sm:p-8 relative shadow-[8px_8px_0_#1F6F6B]">
        <button onClick={handleClose} className="absolute top-4 right-4 text-xl leading-none" aria-label="Close">
          &times;
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Propose a swap</p>
        <h3 className="font-display text-2xl font-semibold mt-1 mb-6">
          Trade for "{proposalTarget.title}"
        </h3>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">
                Requesting from {proposalTarget.by}
              </label>
              <div className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white/50 text-ink/70">
                {proposalTarget.title}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">
                Offering in exchange
              </label>
              <select
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
              >
                {MY_SKILLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full mt-2 py-3 rounded-full font-semibold text-sm bg-teal text-paper">
              Send proposal
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-center font-mono text-teal-dark">
            ✓ Proposal sent to {proposalTarget.by} — you'll get a notification when they respond.
          </p>
        )}
      </div>
    </div>
  );
}
