import { useState, useContext } from "react";
import { SkillsContext } from "../context/SkillsContext.jsx";

export default function ListSkillModal({ modal }) {
  const { addSkill } = useContext(SkillsContext);
  const [title, setTitle] = useState("");
  const [wants, setWants] = useState("");
  const [cat, setCat] = useState("tech");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!modal.isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const trimmedTitle = title.trim();
    const trimmedWants = wants.trim();
    if (!trimmedTitle) {
      setError("Please enter what you can teach");
      return;
    }
    if (!trimmedWants) {
      setError("Please enter what you want to learn");
      return;
    }
    try {
      setSubmitting(true);
      await addSkill({ title: trimmedTitle, wants: trimmedWants, cat });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to post ticket");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    modal.close();
    setSubmitted(false);
    setSubmitting(false);
    setTitle("");
    setWants("");
    setError("");
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 modal-backdrop flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-paper w-full max-w-md rounded-2xl border-2 border-ink p-6 sm:p-8 relative shadow-[8px_8px_0_#E8A33D]">
        <button onClick={handleClose} className="absolute top-4 right-4 text-xl leading-none" aria-label="Close">
          &times;
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">New trade ticket</p>
        <h3 className="font-display text-2xl font-semibold mt-1 mb-6">List a skill to swap</h3>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">I can teach</label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Watercolor painting"
                className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">I want to learn</label>
              <input
                type="text"
                required
                maxLength={100}
                value={wants}
                onChange={(e) => setWants(e.target.value)}
                placeholder="e.g. Basic guitar chords"
                className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">Category</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="tech">Tech</option>
                <option value="craft">Craft</option>
                <option value="language">Language</option>
                <option value="wellness">Wellness</option>
              </select>
            </div>
            
            {error && <p className="text-xs text-red-600 font-mono">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full mt-2 py-3 rounded-full font-semibold text-sm bg-teal text-paper transition-opacity ${
                submitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {submitting ? "Posting..." : "Post trade ticket"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-center font-mono text-teal-dark">
            ✓ Ticket posted — we'll match you soon.
          </p>
        )}
      </div>
    </div>
  );
}
