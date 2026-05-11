import "@testing-library/jest-dom/vitest";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
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
