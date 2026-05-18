/** Base URL usada pelo browser (`httpClient`). Em produção: `/api`; em dev: URL direta da API. */
export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
}
