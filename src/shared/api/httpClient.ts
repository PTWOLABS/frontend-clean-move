const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.warn(
    'NEXT_PUBLIC_API_BASE_URL não está definido. Configure o arquivo .env.local.',
  );
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
    super(message || 'Serviço indisponível no momento.', {
      cause,
    });
    this.name = 'ApiError';
    this.action = action || 'Entre em contato com o suporte.';
    this.statusCode = statusCode;
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function httpClient<TResponse>(
  path: string,
  { method = 'GET', headers, body, signal }: RequestOptions = {},
): Promise<TResponse> {
  const url = `${BASE_URL ?? ''}${path}`;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (accessToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    const errorBody = await safeParseJson(response);
    const message =
      (errorBody as { message?: string })?.message ??
      `Erro na requisição: ${response.status} ${response.statusText}`;

    throw new ApiError({ message, statusCode: response.status });
  }

  return (await safeParseJson(response)) as TResponse;
}

async function safeParseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
