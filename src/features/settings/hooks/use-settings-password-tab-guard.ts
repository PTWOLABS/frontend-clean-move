"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { UseFormHandleSubmit } from "react-hook-form";

import { useRegisterSettingsUnsavedChanges } from "../context/settings-unsaved-changes-context";
import {
  hasSecurityUnsavedChanges,
  resolveSecurityTabSaveAction,
  SECURITY_CONFIRMATION_TAB_LEAVE_TOAST,
  type SettingsPasswordChangeStep,
} from "../lib/settings-security-tab-guard";
import type { PasswordSettingsFormValues } from "../schemas/password-settings-schema";
import type { SettingsSaveResult } from "../types/settings-save-result";

type UseSettingsPasswordTabGuardParams = {
  isDirty: boolean;
  step: SettingsPasswordChangeStep;
  confirmDialogOpen: boolean;
  isSaving: boolean;
  handleSubmit: UseFormHandleSubmit<PasswordSettingsFormValues>;
  onOpenConfirmDialog: () => void;
  onDiscard: () => void;
};

export function useSettingsPasswordTabGuard({
  isDirty,
  step,
  confirmDialogOpen,
  isSaving,
  handleSubmit,
  onOpenConfirmDialog,
  onDiscard,
}: UseSettingsPasswordTabGuardParams) {
  const savePasswordFromTabGuard = useCallback(async (): Promise<SettingsSaveResult> => {
    if (resolveSecurityTabSaveAction(step) === "block_on_confirmation") {
      toast.info(SECURITY_CONFIRMATION_TAB_LEAVE_TOAST);
      return false;
    }

    return new Promise<SettingsSaveResult>((resolve) => {
      void handleSubmit(
        () => {
          onOpenConfirmDialog();
          resolve("deferred");
        },
        () => resolve(false),
      )();
    });
  }, [handleSubmit, onOpenConfirmDialog, step]);

  useRegisterSettingsUnsavedChanges("security", {
    hasUnsavedChanges: hasSecurityUnsavedChanges({
      isDirty,
      step,
      confirmDialogOpen,
    }),
    isSaving,
    save: savePasswordFromTabGuard,
    discard: onDiscard,
  });

  return {
    savePasswordFromTabGuard,
  };
}
