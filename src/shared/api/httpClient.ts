import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.warn("NEXT_PUBLIC_API_BASE_URL não está definido. Configure o arquivo .env.local.");
}

const api = axios.create({
  baseURL: BASE_URL ?? "",
  withCredentials: true,
});

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  signal?: AbortSignal;
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

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
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
  { method = "GET", headers, body, signal }: RequestOptions = {},
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
