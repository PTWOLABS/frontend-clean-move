export type SettingsPasswordChangeStep = "credentials" | "confirmation";

export function hasSecurityUnsavedChanges(input: {
  isDirty: boolean;
  step: SettingsPasswordChangeStep;
  confirmDialogOpen: boolean;
}): boolean {
  return input.isDirty || input.step === "confirmation" || input.confirmDialogOpen;
}

export function resolveSecurityTabSaveAction(
  step: SettingsPasswordChangeStep,
): "open_code_flow" | "block_on_confirmation" {
  if (step === "confirmation") {
    return "block_on_confirmation";
  }

  return "open_code_flow";
}

export const SECURITY_CONFIRMATION_TAB_LEAVE_TOAST =
  "Conclua ou descarte a confirmação da senha antes de trocar de aba.";
