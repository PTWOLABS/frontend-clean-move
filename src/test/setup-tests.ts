import "@testing-library/jest-dom/vitest";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
}

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

if (typeof window !== "undefined") {
  if (!window.localStorage) {
    Object.defineProperty(window, "localStorage", {
      value: createStorageMock(),
      configurable: true,
    });
  }

  if (!window.sessionStorage) {
    Object.defineProperty(window, "sessionStorage", {
      value: createStorageMock(),
      configurable: true,
    });
  }
}

// `@react-input/core` agenda timers via `window.setTimeout` para acompanhar a seleção
// do input mascarado. Quando o ambiente jsdom é desmontado entre testes, esses
// timers podem disparar tentando acessar `window` já indefinido. Como não impactam
// o resultado dos testes, filtramos especificamente essa exceção.
process.on("uncaughtException", (error: unknown) => {
  if (
    error instanceof ReferenceError &&
    /window is not defined/i.test(error.message) &&
    /react-input/i.test(error.stack ?? "")
  ) {
    return;
  }
  throw error;
});
