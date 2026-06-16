import { describe, expect, it } from "vitest";

import { getChangedFields } from "./get-changed-fields";

describe("getChangedFields", () => {
  it("returns the full current object when initial is null", () => {
    const current = { name: "João", age: 30 };

    expect(getChangedFields(current, null)).toEqual(current);
  });

  it("returns an empty object when nothing changed", () => {
    const initial = { name: "João", age: 30 };
    const current = { name: "João", age: 30 };

    expect(getChangedFields(current, initial)).toEqual({});
  });

  it("returns only changed primitive fields", () => {
    const initial = { name: "João", age: 30, active: true };
    const current = { name: "Maria", age: 30, active: true };

    expect(getChangedFields(current, initial)).toEqual({ name: "Maria" });
  });

  it("treats equal arrays as unchanged by default", () => {
    const initial = { serviceIds: ["a", "b"] };
    const current = { serviceIds: ["a", "b"] };

    expect(getChangedFields(current, initial)).toEqual({});
  });

  it("detects array changes by default", () => {
    const initial = { serviceIds: ["a", "b"] };
    const current = { serviceIds: ["a", "c"] };

    expect(getChangedFields(current, initial)).toEqual({ serviceIds: ["a", "c"] });
  });

  it("detects array length changes by default", () => {
    const initial = { serviceIds: ["a", "b"] };
    const current = { serviceIds: ["a"] };

    expect(getChangedFields(current, initial)).toEqual({ serviceIds: ["a"] });
  });

  it("uses custom comparators when provided", () => {
    const dateA = new Date("2026-01-01T10:00:00.000Z");
    const dateB = new Date("2026-01-01T10:00:00.000Z");
    const initial = { startsAt: dateA };
    const current = { startsAt: dateB };

    expect(getChangedFields(current, initial)).toEqual({ startsAt: dateB });

    expect(
      getChangedFields(current, initial, {
        comparators: {
          startsAt: (left, right) => left.getTime() === right.getTime(),
        },
      }),
    ).toEqual({});
  });

  it("ignores keys present only in current", () => {
    const initial = { name: "João" };
    const current = { name: "João", extra: "ignored" };

    expect(getChangedFields(current, initial)).toEqual({});
  });

  it("does not include keys missing from current when they existed in initial", () => {
    const initial = { name: "João", age: 30 };
    const current = { name: "Maria" } as { name: string; age?: number };

    expect(getChangedFields(current, initial)).toEqual({ name: "Maria", age: undefined });
  });

  it("treats shallow-equal nested objects as unchanged", () => {
    const initial = {
      name: "João",
      address: { city: "São Paulo", state: "SP" },
    };
    const current = {
      name: "João",
      address: { city: "São Paulo", state: "SP" },
    };

    expect(getChangedFields(current, initial)).toEqual({});
  });

  it("includes the parent key when a nested object field changes", () => {
    const initial = {
      name: "João",
      address: { city: "São Paulo", state: "SP" },
    };
    const current = {
      name: "João",
      address: { city: "Campinas", state: "SP" },
    };

    expect(getChangedFields(current, initial)).toEqual({
      address: { city: "Campinas", state: "SP" },
    });
  });
});
