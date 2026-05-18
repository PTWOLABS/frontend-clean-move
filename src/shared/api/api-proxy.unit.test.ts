import { describe, expect, it } from "vitest";

import {
  buildForwardRequestHeaders,
  buildProxyResponseHeaders,
  buildUpstreamUrl,
} from "./api-proxy";

describe("api-proxy", () => {
  it("buildUpstreamUrl joins target, path and query", () => {
    expect(buildUpstreamUrl("https://api.example.com", ["auth", "login"], "")).toBe(
      "https://api.example.com/auth/login",
    );
    expect(
      buildUpstreamUrl("https://api.example.com", ["user", "me"], "?foo=1"),
    ).toBe("https://api.example.com/user/me?foo=1");
  });

  it("buildUpstreamUrl handles empty path", () => {
    expect(buildUpstreamUrl("https://api.example.com", undefined, "")).toBe(
      "https://api.example.com/",
    );
  });

  it("buildForwardRequestHeaders forwards auth cookies and x-forwarded-*", () => {
    const incoming = new Headers({
      cookie: "refresh_token=abc",
      authorization: "Bearer token",
      host: "app.example.com",
    });

    const out = buildForwardRequestHeaders(incoming, "10.0.0.1");

    expect(out.get("cookie")).toBe("refresh_token=abc");
    expect(out.get("authorization")).toBe("Bearer token");
    expect(out.get("x-forwarded-host")).toBe("app.example.com");
    expect(out.get("x-forwarded-for")).toBe("10.0.0.1");
    expect(out.get("host")).toBeNull();
  });

  it("buildProxyResponseHeaders repasses set-cookie", () => {
    const upstream = new Headers();
    upstream.append("set-cookie", "refresh_token=a; HttpOnly; Path=/");
    upstream.append("content-type", "application/json");

    const out = buildProxyResponseHeaders(upstream);

    expect(out.get("content-type")).toBe("application/json");
    expect(out.getSetCookie?.() ?? [out.get("set-cookie")!]).toEqual([
      "refresh_token=a; HttpOnly; Path=/",
    ]);
  });
});
