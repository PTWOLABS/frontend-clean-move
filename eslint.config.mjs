import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Next / build outputs
    ".next/**",
    ".next-build/**",
    "out/**",
    "build/**",
    "dist/**",

    // Dependencies / generated files
    "node_modules/**",
    "next-env.d.ts",

    // Project-specific ignored folders
    ".agents/**",
    ".codex/**",
    "docs/superpowers/**",
  ]),

  eslintConfigPrettier,
]);

export default eslintConfig;
