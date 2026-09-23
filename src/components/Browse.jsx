import { useContext, useMemo } from "react";
import { SkillsContext } from "../context/SkillsContext.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import SkillCard from "./SkillCard.jsx";

const categories = ["all", "craft", "tech", "language", "wellness"];

export default function Browse() {
  // useContext: pull skills/loading/search/category straight from
  // SkillsProvider, no props passed down from App.
  const { skills, loading, search, setSearch, category, setCategory } = useContext(SkillsContext);

  // Custom hook: don't re-filter on every keystroke, only once typing pauses.
  const debouncedSearch = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return skills.filter((s) => {
      const matchesCat = category === "all" || s.cat === category;
      const matchesQuery = !q || s.title.toLowerCase().includes(q) || s.wants.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [skills, category, debouncedSearch]);

  return (
    <section id="browse" className="border-t border-line bg-paper-2">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-3xl font-semibold">Open swaps nearby</h2>
            <p className="text-ink/70 mt-2 text-sm">Filter by category or search for a skill.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills…"
              className="w-full border-2 border-ink rounded-full px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        <div className="flex gap-6 border-b border-line mb-6 overflow-x-auto font-mono text-xs uppercase tracking-widest">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`tab-btn pb-3 relative whitespace-nowrap ${category === c ? "active" : ""}`}
            >
              {c}
              <span className="tab-underline absolute left-0 -bottom-[1px] h-[2px] w-full block bg-teal"></span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-16 text-ink/50 font-mono text-sm">Loading open swaps…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-ink/50 font-mono text-sm">No swaps match that search — try another skill.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
