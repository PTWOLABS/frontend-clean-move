import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

if (!BASE_URL) {
  console.warn("NEXT_PUBLIC_API_BASE_URL não está definido. Configure o arquivo .env.local.");
}

const api = axios.create({
  baseURL: BASE_URL || undefined,
  withCredentials: true,
});

/** Não tentar refresh em 401 nestes paths (login/google/refresh/cadastro público). */
const AUTH_PATHS_SKIP_REFRESH = new Set([
  "/auth/login",
  "/auth/google",
  "/auth/refresh",
  "/register/establishment",
]);

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  signal?: AbortSignal;
  _retry?: boolean;
};

type ApiErrorProps = {
  cause?: string;
  message?: string;
  action?: string;
  statusCode: number;
};

export class ApiError extends Error {
  action: string;
  statusCode: number;

  constructor({ cause, message, action, statusCode }: ApiErrorProps) {
    super(message || "Serviço indisponível no momento.", {
      cause,
    });
    this.name = "ApiError";
    this.action = action || "Entre em contato com o suporte.";
    this.statusCode = statusCode;
  }
}

/** Corpo de `POST /auth/refresh` (mesmo formato da sessão após login). */
type AuthRefreshResponse = {
  userId: string;
  accessToken: string;
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** Renova o access token via cookie de sessão (`/auth/refresh`). */
async function tryRefreshAccessToken(): Promise<boolean> {
  if (!BASE_URL) return false;
  try {
    const res = await axios.post<AuthRefreshResponse>(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    const token = res.data?.accessToken;
    if (token) {
      accessToken = token;
      return true;
    }
  } catch {
    // sessão inválida ou rede — deixa o 401 original propagar
  }
  return false;
}

function headersInitToRecord(headers?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  const h = new Headers(headers);
  h.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function hasHeaderCaseInsensitive(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower);
}

function normalizeParsedBody(data: unknown): unknown {
  if (data === "" || data === undefined) return null;
  return data;
}

function parseErrorPayload(data: unknown): unknown {
  if (data == null || data === "") return null;
  if (typeof data === "object") return data;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export async function httpClient<TResponse>(
  path: string,
  { method = "GET", headers, body, signal, _retry }: RequestOptions = {},
): Promise<TResponse> {
  const requestHeaders = headersInitToRecord(headers);

  if (!hasHeaderCaseInsensitive(requestHeaders, "Content-Type")) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (accessToken && !hasHeaderCaseInsensitive(requestHeaders, "Authorization")) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const config: AxiosRequestConfig = {
    url: path,
    method,
    headers: requestHeaders,
    data: body !== undefined && body !== null ? body : undefined,
    signal,
  };

  try {
    const response = await api.request<TResponse>(config);
    return normalizeParsedBody(response.data) as TResponse;
  } catch (error) {
    if (
      !_retry &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !AUTH_PATHS_SKIP_REFRESH.has(path)
    ) {
      const refreshed = await tryRefreshAccessToken();
      if (refreshed) {
        return httpClient<TResponse>(path, { method, headers, body, signal, _retry: true });
      }
    }

    if (axios.isAxiosError(error) && error.response) {
      const { status, statusText, data } = error.response;
      const errorBody = parseErrorPayload(data);
      const message =
        (errorBody as { message?: string })?.message ??
        `Erro na requisição: ${status} ${statusText}`;

      throw new ApiError({ message, statusCode: status });
    }
    throw error;
  }
}
