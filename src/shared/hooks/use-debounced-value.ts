import { useEffect, useState } from "react";

/** Valor devolvido só atualiza após `delayMs` milissegundos sem novas mudanças em `value`. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

/** Alias de {@link useDebouncedValue}. */
export function useDebounce<T>(value: T, delayMs: number): T {
  return useDebouncedValue(value, delayMs);
}
