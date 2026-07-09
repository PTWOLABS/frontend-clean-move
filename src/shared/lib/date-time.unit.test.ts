/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  dateInputValueToEndOfDayPayload,
  dateInputValueToStartOfDayPayload,
  formatDateBR,
  formatIsoDateToBr,
  parseBrDateToIso,
} from "./date-time";

describe("date-time", () => {
  it("formats UTC ISO instants in Sao Paulo civil time", () => {
    expect(formatDateBR("2026-07-09T00:06:34.252Z")).toBe("08/07/2026");
  });

  it("preserves date-only strings as civil dates", () => {
    expect(formatIsoDateToBr("1990-01-15")).toBe("15/01/1990");
  });

  it("parses BR and date-input values to yyyy-MM-dd", () => {
    expect(parseBrDateToIso("08/07/2026")).toBe("2026-07-08");
    expect(parseBrDateToIso("2026-07-08")).toBe("2026-07-08");
  });

  it("converts date input start and end of day in Sao Paulo to UTC ISO payloads", () => {
    expect(dateInputValueToStartOfDayPayload("2026-07-08")).toBe("2026-07-08T03:00:00.000Z");
    expect(dateInputValueToEndOfDayPayload("2026-07-08")).toBe("2026-07-09T02:59:59.999Z");
  });

  it("rejects invalid civil dates", () => {
    expect(parseBrDateToIso("31/02/2026")).toBeNull();
    expect(dateInputValueToEndOfDayPayload("2026-02-31")).toBeNull();
  });
});
