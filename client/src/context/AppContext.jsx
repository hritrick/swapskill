import { createContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

/**
 * AppContext — owns authentication state and the user's credit balance only.
 *
 * Swap-request notifications and the proposal modal live in SwapsContext
 * so this context stays focused and composable.
 *
 * JWT is stored in localStorage via useLocalStorage (a documented trade-off:
 * tokens are readable by JavaScript running on the same origin). For a course
 * project this is acceptable; a production upgrade would move to httpOnly
 * cookies to prevent XSS exfiltration.
 */
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Persisted across reloads via the useLocalStorage custom hook (Experiment 2)
  const [user, setUser] = useLocalStorage('swapskill.user', null);
  const [credits, setCredits] = useState(user?.credits ?? 3.5);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Keep credits in sync when the user object changes (e.g. after re-login)
  useEffect(() => {
    if (user?.credits !== undefined) setCredits(user.credits);
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoadingAuth(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      setUser(data.data);
    } finally {
      setLoadingAuth(false);
    }
  }, [setUser]);

  const register = useCallback(async (name, email, password) => {
    setLoadingAuth(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      setUser(data.data);
    } finally {
      setLoadingAuth(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    // Best-effort server-side logout (route exists for symmetry / future blacklisting)
    try {
      if (user?.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
    } catch { /* ignore network errors on logout */ }
    setUser(null);
  }, [user?.token, setUser]);

  const value = {
    user,
    loadingAuth,
    login,
    register,
    logout,
    credits,
    setCredits, // exposed so SwapsContext can update credits on swap acceptance
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
