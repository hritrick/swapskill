import { useState, useEffect } from "react";

/**
 * Custom hook: useDebouncedValue
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of no changes — used so the skill search doesn't re-filter on every
 * keystroke. Built from useState + useEffect, then reused wherever a
 * search box needs this behaviour.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // reset the timer on every keystroke
  }, [value, delay]);

  return debounced;
}
