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
    if (!user) return;
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
        throw new Error(data.message || 'Failed to add skill');
      }
    } catch (error) {
      console.error("Failed to add skill", error);
      throw error;
    }
  };

  const deleteSkill = async (id) => {
    if (!user) return;
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
        throw new Error(data.message || 'Failed to delete skill');
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
