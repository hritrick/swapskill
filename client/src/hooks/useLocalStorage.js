import { useState, useEffect } from "react";

/**
 * Custom hook: useLocalStorage
 * Behaves like useState, but reads its initial value from localStorage
 * and writes back to it (via useEffect) whenever the value changes.
 * Used to persist login state and credit balance across page reloads.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage may be unavailable (private browsing, etc.) — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}
