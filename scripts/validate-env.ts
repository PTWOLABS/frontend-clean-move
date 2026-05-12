/**
 * Valida variáveis de ambiente antes de `next dev` / `next start`.
 * Carrega .env* na mesma ordem de precedência do Next (cada ficheiro sobrescreve
 * o anterior; variáveis já definidas no processo não são substituídas pelos
 * ficheiros — alinhado ao comportamento do dotenv).
 *
 * Uso: tsx scripts/validate-env.ts development|production
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type EnvMode = "development" | "production";

const argvMode = process.argv[2] ?? "development";
const mode: EnvMode = argvMode === "production" ? "production" : "development";
const isProduction = mode === "production";

const ENV_FILES: readonly string[] = isProduction
  ? [".env", ".env.production", ".env.local", ".env.production.local"]
  : [".env", ".env.development", ".env.local", ".env.development.local"];

function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadMergedFromFiles(): Record<string, string> {
  const merged: Record<string, string> = {};
  const root = process.cwd();
  for (const name of ENV_FILES) {
    const filePath = resolve(root, name);
    if (!existsSync(filePath)) continue;
    const parsed = parseEnvFile(readFileSync(filePath, "utf8"));
    Object.assign(merged, parsed);
  }
  return merged;
}

/** Shell / processo tem precedência sobre ficheiros (como dotenv). */
function effective(key: string, fromFiles: Record<string, string>): string {
  if (Object.hasOwn(process.env, key)) return process.env[key] ?? "";
  return fromFiles[key] ?? "";
}

function isHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function fail(message: string): never {
  console.error(`\x1b[31m[validate-env]\x1b[0m ${message}`);
  process.exit(1);
}

function warn(message: string): void {
  console.warn(`\x1b[33m[validate-env]\x1b[0m ${message}`);
}

const fromFiles = loadMergedFromFiles();

const apiBase = effective("NEXT_PUBLIC_API_BASE_URL", fromFiles);
if (!apiBase.trim()) {
  fail(
    "NEXT_PUBLIC_API_BASE_URL é obrigatória (URL da API, ex.: http://localhost:3333). Defina no .env.local ou no ambiente.",
  );
}
if (!isHttpUrl(apiBase)) {
  fail(
    `NEXT_PUBLIC_API_BASE_URL deve ser uma URL http(s) válida. Valor atual: ${JSON.stringify(apiBase)}`,
  );
}

const googleId = effective("NEXT_PUBLIC_GOOGLE_CLIENT_ID", fromFiles);
if (googleId.trim() && googleId.trim().length < 10) {
  warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID parece inválido (muito curto). Login com Google pode falhar.");
}

console.log(
  `\x1b[32m[validate-env]\x1b[0m OK (${isProduction ? "production" : "development"}): NEXT_PUBLIC_API_BASE_URL está definida; Google ${googleId.trim() ? "configurado" : "opcional (omitido)"}.`,
);
