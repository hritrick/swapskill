import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { SkillsContext } from "../context/SkillsContext.jsx";

export default function SkillCard({ skill }) {
  const { openProposal, user } = useContext(AppContext);
  const { deleteSkill } = useContext(SkillsContext);

  return (
    <div className="skill-card bg-paper border border-line rounded-xl p-5">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-line text-teal-dark">
          {skill.cat}
        </span>
        <span className="text-ink/40 text-xs">by {skill.by}</span>
      </div>
      <h4 className="font-display text-lg font-semibold mt-3">{skill.title}</h4>
      <p className="text-xs text-ink/60 mt-2">
        Wants in return: <span className="font-medium text-ink/80">{skill.wants}</span>
      </p>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => openProposal(skill)}
          className="text-xs font-semibold underline-grow text-teal"
        >
          Propose a swap →
        </button>
        
        {user && (user._id === skill.ownerId || user.role === 'admin') && (
          <button
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this skill?')) {
                deleteSkill(skill._id || skill.id);
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 font-semibold"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
