import { useEffect, useState } from "react";

/** Valor `value` só actualiza no estado local após `delayMs` sem novas mudanças. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

/** Alias de {@link useDebouncedValue} — útil para debounce do query param `name` na API. */
export function useDebounce<T>(value: T, delayMs: number): T {
  return useDebouncedValue(value, delayMs);
}
