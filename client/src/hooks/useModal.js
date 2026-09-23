import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook: useModal
 * Encapsulates open/close state plus the "close on Escape" keyboard
 * listener, so any modal in the app can reuse this instead of
 * duplicating the same useEffect + event listener each time.
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return { isOpen, open, close };
}
