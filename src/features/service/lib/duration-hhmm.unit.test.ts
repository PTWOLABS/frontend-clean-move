import { describe, expect, it } from "vitest";

import { hhMmToMinutes, isValidDurationHhMm, minutesToHhMm } from "./duration-hhmm";

describe("duration-hhmm", () => {
  it("converts minutes to hh:mm", () => {
    expect(minutesToHhMm(30)).toBe("00:30");
    expect(minutesToHhMm(60)).toBe("01:00");
    expect(minutesToHhMm(90)).toBe("01:30");
  });

  it("converts hh:mm to minutes", () => {
    expect(hhMmToMinutes("00:30")).toBe(30);
    expect(hhMmToMinutes("01:00")).toBe(60);
    expect(hhMmToMinutes("01:30")).toBe(90);
  });

  it("rejects invalid or zero durations", () => {
    expect(isValidDurationHhMm("00:00")).toBe(false);
    expect(isValidDurationHhMm("24:00")).toBe(false);
    expect(isValidDurationHhMm("1:30")).toBe(false);
    expect(isValidDurationHhMm("")).toBe(false);
    expect(isValidDurationHhMm("00:30")).toBe(true);
  });
});
