/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("should combine classes and resolve tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
