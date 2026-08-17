import { useEffect, useState } from "react";

/** Standard debounce hook — e.g. for search inputs (Patient Search, MPI lookup) that shouldn't fire a request on every keystroke. */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
