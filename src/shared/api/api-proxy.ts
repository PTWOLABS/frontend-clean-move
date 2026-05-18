const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

const FORWARD_REQUEST_HEADERS = [
  "cookie",
  "authorization",
  "content-type",
  "accept",
  "accept-language",
] as const;

export function getApiProxyTarget(): string | null {
  const target = process.env.API_PROXY_TARGET?.trim().replace(/\/$/, "");
  return target || null;
}

export function buildUpstreamUrl(
  proxyTarget: string,
  pathSegments: string[] | undefined,
  search: string,
): string {
  const path = pathSegments?.length ? pathSegments.join("/") : "";
  const base = `${proxyTarget}/${path}`.replace(/([^:]\/)\/+/g, "$1");
  return search ? `${base}${search}` : base;
}

export function buildForwardRequestHeaders(incoming: Headers, forwardedFor: string): Headers {
  const headers = new Headers();

  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = incoming.get(name);
    if (value) headers.set(name, value);
  }

  const forwardedHost = incoming.get("x-forwarded-host") ?? incoming.get("host");
  const forwardedProto =
    incoming.get("x-forwarded-proto") ??
    (incoming.get("x-forwarded-ssl") === "on" ? "https" : "http");

  if (forwardedHost) headers.set("x-forwarded-host", forwardedHost);
  headers.set("x-forwarded-proto", forwardedProto);
  headers.set("x-forwarded-for", incoming.get("x-forwarded-for") ?? forwardedFor);

  return headers;
}

export function buildProxyResponseHeaders(upstream: Headers): Headers {
  const headers = new Headers();

  upstream.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "set-cookie") return;
    headers.append(key, value);
  });

  const setCookies = typeof upstream.getSetCookie === "function" ? upstream.getSetCookie() : [];

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      headers.append("set-cookie", cookie);
    }
  } else {
    const single = upstream.get("set-cookie");
    if (single) headers.append("set-cookie", single);
  }

  return headers;
}

export async function proxyToApi(
  request: Request,
  pathSegments: string[] | undefined,
): Promise<Response> {
  const proxyTarget = getApiProxyTarget();
  if (!proxyTarget) {
    return Response.json(
      { message: "API proxy is not configured (API_PROXY_TARGET)." },
      { status: 503 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = buildUpstreamUrl(proxyTarget, pathSegments, incomingUrl.search);
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(upstreamUrl, {
    method,
    headers: buildForwardRequestHeaders(request.headers, "127.0.0.1"),
    body: body && body.byteLength > 0 ? body : undefined,
    redirect: "manual",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: buildProxyResponseHeaders(upstream.headers),
  });
}
