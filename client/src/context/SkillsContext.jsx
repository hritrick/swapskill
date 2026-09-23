import { createContext, useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext.jsx";

export const SkillsContext = createContext(null);

export function SkillsProvider({ children }) {
  const { user } = useContext(AppContext);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (response.ok) {
        setSkills(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch skills", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = async (newSkill) => {
    if (!user) throw new Error('You must be logged in to post a trade ticket');
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newSkill)
      });
      const data = await response.json();
      if (response.ok) {
        setSkills(prev => [...prev, data.data]);
        return data;
      } else {
        const errorMsg = data.errors && data.errors.length > 0
          ? data.errors.map(e => e.message).join('. ')
          : (data.message || 'Failed to add skill');
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to add skill", error);
      throw error;
    }
  };

  const deleteSkill = async (id) => {
    if (!user) throw new Error('You must be logged in to delete a skill');
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        setSkills(prev => prev.filter(s => s._id !== id));
      } else {
        const data = await response.json();
        const errorMsg = data.errors && data.errors.length > 0
          ? data.errors.map(e => e.message).join('. ')
          : (data.message || 'Failed to delete skill');
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to delete skill", error);
      throw error;
    }
  };

  useEffect(() => {
    document.title = loading
      ? "SwapSkill — loading swaps…"
      : `SwapSkill — ${skills.length} open swaps`;
  }, [skills, loading]);

  const value = {
    skills,
    loading,
    search,
    setSearch,
    category,
    setCategory,
    addSkill,
    deleteSkill
  };

  return <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>;
}
