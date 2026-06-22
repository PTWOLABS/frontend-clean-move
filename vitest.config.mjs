import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  cacheDir: path.resolve(rootDir, ".vite"),
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, ".kilo/**", "tests/**/*.spec.ts", "tests/**/*.setup.ts"],
    globals: true,
    setupFiles: ["./src/test/setup-tests.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
