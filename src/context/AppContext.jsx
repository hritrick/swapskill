import { createContext, useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

// Shares auth state, credit balance, notifications, and the "propose a
// swap" flow across the whole app via useContext.
export const AppContext = createContext(null);

const STARTING_NOTIFICATIONS = [
  { id: "n1", from: "Meera", skill: "React & Tailwind basics", hours: 1.5 },
  { id: "n2", from: "Kenji", skill: "Conversational Japanese", hours: 1 },
];

export function AppProvider({ children }) {
  // Persisted across reloads via the useLocalStorage custom hook.
  const [user, setUser] = useLocalStorage("swapskill.user", null);
  const [credits, setCredits] = useState(user?.credits || 3.5);
  
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [notifications, setNotifications] = useState(STARTING_NOTIFICATIONS);
  const [proposalTarget, setProposalTarget] = useState(null);

  useEffect(() => {
    if (user && user.credits !== undefined) {
      setCredits(user.credits);
    }
  }, [user]);

  async function login(email, password) {
    setLoadingAuth(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      setUser(data.data);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function register(name, email, password) {
    setLoadingAuth(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      setUser(data.data);
    } finally {
      setLoadingAuth(false);
    }
  }

  function logout() {
    setUser(null);
  }

  function acceptNotification(id) {
    const note = notifications.find((n) => n.id === id);
    if (!note) return;
    setCredits((c) => Math.round((c + note.hours) * 10) / 10);
    setNotifications((list) => list.filter((n) => n.id !== id));
  }

  function declineNotification(id) {
    setNotifications((list) => list.filter((n) => n.id !== id));
  }

  function openProposal(skill) {
    setProposalTarget(skill);
  }

  function closeProposal() {
    setProposalTarget(null);
  }

  const value = {
    user,
    loadingAuth,
    login,
    register,
    logout,
    credits,
    notifications,
    acceptNotification,
    declineNotification,
    proposalTarget,
    openProposal,
    closeProposal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
