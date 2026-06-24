import { describe, expect, it } from "vitest";

import { areSameDateRanges } from "./date-ranges";

describe("date-ranges", () => {
  describe("areSameDateRanges", () => {
    it("returns true when both ranges have the same calendar days", () => {
      expect(
        areSameDateRanges(
          {
            from: new Date("2026-05-01T08:00:00.000Z"),
            to: new Date("2026-05-29T12:00:00.000Z"),
          },
          {
            from: new Date("2026-05-01T10:00:00.000Z"),
            to: new Date("2026-05-29T23:00:00.000Z"),
          },
        ),
      ).toBe(true);
    });

    it("returns false when one range has a different day", () => {
      expect(
        areSameDateRanges(
          {
            from: new Date("2026-05-01T00:00:00.000Z"),
            to: new Date("2026-05-29T00:00:00.000Z"),
          },
          {
            from: new Date("2026-05-02T00:00:00.000Z"),
            to: new Date("2026-05-29T00:00:00.000Z"),
          },
        ),
      ).toBe(false);
    });

    it("supports empty ranges", () => {
      expect(areSameDateRanges(undefined, undefined)).toBe(true);
      expect(areSameDateRanges({ from: new Date("2026-05-01T00:00:00.000Z") }, undefined)).toBe(
        false,
      );
    });
  });
});
