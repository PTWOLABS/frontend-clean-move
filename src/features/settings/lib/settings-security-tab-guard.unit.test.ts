import { describe, expect, it } from "vitest";

import {
  hasSecurityUnsavedChanges,
  resolveSecurityTabSaveAction,
} from "./settings-security-tab-guard";

describe("hasSecurityUnsavedChanges", () => {
  it("is false when credentials are pristine and no dialog is open", () => {
    expect(
      hasSecurityUnsavedChanges({
        isDirty: false,
        step: "credentials",
        confirmDialogOpen: false,
      }),
    ).toBe(false);
  });

  it("is true when the credentials form is dirty", () => {
    expect(
      hasSecurityUnsavedChanges({
        isDirty: true,
        step: "credentials",
        confirmDialogOpen: false,
      }),
    ).toBe(true);
  });

  it("is true on confirmation step even if credentials look clean", () => {
    expect(
      hasSecurityUnsavedChanges({
        isDirty: false,
        step: "confirmation",
        confirmDialogOpen: false,
      }),
    ).toBe(true);
  });

  it("is true while the send-code dialog is open", () => {
    expect(
      hasSecurityUnsavedChanges({
        isDirty: false,
        step: "credentials",
        confirmDialogOpen: true,
      }),
    ).toBe(true);
  });
});

describe("resolveSecurityTabSaveAction", () => {
  it("opens the password code flow from credentials", () => {
    expect(resolveSecurityTabSaveAction("credentials")).toBe("open_code_flow");
  });

  it("blocks navigation while confirmation is in progress", () => {
    expect(resolveSecurityTabSaveAction("confirmation")).toBe("block_on_confirmation");
  });
});
