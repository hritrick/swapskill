import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { SwapsContext } from '../context/SwapsContext.jsx';
import { SkillsContext } from '../context/SkillsContext.jsx';

export default function ProposalModal() {
  const { user } = useContext(AppContext);
  const { proposalTarget, closeProposal } = useContext(SwapsContext);
  const { skills } = useContext(SkillsContext);

  // Build the list of skills the signed-in user can offer from their own listings
  const mySkills = skills.filter((s) => s.ownerId === user?._id);

  const [offer, setOffer] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!proposalTarget) return null;

  function handleClose() {
    closeProposal();
    setSent(false);
    setOffer('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.token) return;

    const offeredSkill = offer.trim();
    if (!offeredSkill) {
      setError('Please choose or enter a skill to offer.');
      return;
    }

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          toUser: proposalTarget.ownerId,
          skill: proposalTarget._id,
          offeredSkill,
          hours: 1, // Default 1 credit — can be made a form field later
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send proposal');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 modal-backdrop flex items-center justify-center z-50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-paper w-full max-w-md rounded-2xl border-2 border-ink p-6 sm:p-8 relative shadow-[8px_8px_0_#1F6F6B]">
        <button onClick={handleClose} className="absolute top-4 right-4 text-xl leading-none" aria-label="Close">
          &times;
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Propose a swap</p>
        <h3 className="font-display text-2xl font-semibold mt-1 mb-6">
          Trade for &ldquo;{proposalTarget.title}&rdquo;
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
              {mySkills.length > 0 ? (
                <select
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                >
                  <option value="">— choose one of your skills —</option>
                  {mySkills.map((s) => (
                    <option key={s._id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="e.g. Guitar lessons, Watercolour basics…"
                  className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                />
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full mt-2 py-3 rounded-full font-semibold text-sm bg-teal text-paper disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send proposal'}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-center font-mono text-teal-dark">
            ✓ Proposal sent to {proposalTarget.by} — you&apos;ll get a notification when they
            respond.
          </p>
        )}
      </div>
    </div>
  );
}
