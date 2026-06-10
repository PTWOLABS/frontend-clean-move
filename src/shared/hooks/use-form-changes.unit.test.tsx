/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFormChanges } from "./use-form-changes";

describe("useFormChanges", () => {
  it("returns full payload when initial is null", () => {
    const { result } = renderHook(() => useFormChanges<{ name: string }>(null));

    expect(result.current.getChangedPayload({ name: "João" })).toEqual({ name: "João" });
    expect(result.current.hasChanges({ name: "João" })).toBe(true);
  });

  it("detects no changes against the initial snapshot", () => {
    const initial = { name: "João", age: 30 };
    const { result } = renderHook(() => useFormChanges(initial));

    expect(result.current.getChangedPayload({ name: "João", age: 30 })).toEqual({});
    expect(result.current.hasChanges({ name: "João", age: 30 })).toBe(false);
  });

  it("returns only changed fields", () => {
    const initial = { name: "João", age: 30 };
    const { result } = renderHook(() => useFormChanges(initial));

    expect(result.current.getChangedPayload({ name: "Maria", age: 30 })).toEqual({
      name: "Maria",
    });
    expect(result.current.hasChanges({ name: "Maria", age: 30 })).toBe(true);
  });

  it("updates comparison when initial changes", () => {
    const { result, rerender } = renderHook(({ initial }) => useFormChanges(initial), {
      initialProps: { initial: { name: "João" } as { name: string } | null },
    });

    expect(result.current.hasChanges({ name: "João" })).toBe(false);

    rerender({ initial: { name: "Maria" } });

    expect(result.current.hasChanges({ name: "João" })).toBe(true);
    expect(result.current.getChangedPayload({ name: "João" })).toEqual({ name: "João" });
  });

  it("respects custom comparators", () => {
    const dateA = new Date("2026-01-01T10:00:00.000Z");
    const dateB = new Date("2026-01-01T10:00:00.000Z");
    const initial = { startsAt: dateA };

    const { result } = renderHook(() =>
      useFormChanges(initial, {
        comparators: {
          startsAt: (left, right) => left.getTime() === right.getTime(),
        },
      }),
    );

    expect(result.current.hasChanges({ startsAt: dateB })).toBe(false);
    expect(result.current.getChangedPayload({ startsAt: dateB })).toEqual({});
  });
});
