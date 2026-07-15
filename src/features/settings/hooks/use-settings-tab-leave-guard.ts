"use client";

import { useCallback, useState } from "react";

import type { SettingsUnsavedChangesHandlers } from "../context/settings-unsaved-changes-context";
import { resolveSettingsTabId, type SettingsTabId } from "../lib/settings-tabs-config";

type UseSettingsTabLeaveGuardParams = {
  activeTab: SettingsTabId;
  showBusinessTab: boolean;
  getHandlers: (tabId: SettingsTabId) => SettingsUnsavedChangesHandlers | null;
  navigateToTab: (tab: SettingsTabId) => void;
};

export function useSettingsTabLeaveGuard({
  activeTab,
  showBusinessTab,
  getHandlers,
  navigateToTab,
}: UseSettingsTabLeaveGuardParams) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<SettingsTabId | null>(null);
  const [isSavingFromDialog, setIsSavingFromDialog] = useState(false);

  const dismissDialog = useCallback(() => {
    setDialogOpen(false);
    setIsSavingFromDialog(false);
  }, []);

  const resetGuard = useCallback(() => {
    setDialogOpen(false);
    setPendingTab(null);
    setIsSavingFromDialog(false);
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = resolveSettingsTabId(value, { showBusinessTab });

      if (tab === activeTab) {
        return;
      }

      const handlers = getHandlers(activeTab);

      if (handlers?.hasUnsavedChanges) {
        setPendingTab(tab);
        setDialogOpen(true);
        return;
      }

      navigateToTab(tab);
    },
    [activeTab, getHandlers, navigateToTab, showBusinessTab],
  );

  const handleCancel = useCallback(() => {
    resetGuard();
  }, [resetGuard]);

  const handleDiscard = useCallback(() => {
    const handlers = getHandlers(activeTab);
    handlers?.discard();

    if (pendingTab) {
      navigateToTab(pendingTab);
    }

    resetGuard();
  }, [activeTab, getHandlers, navigateToTab, pendingTab, resetGuard]);

  const handleSave = useCallback(async () => {
    const handlers = getHandlers(activeTab);

    if (!handlers) {
      resetGuard();
      return;
    }

    setIsSavingFromDialog(true);

    try {
      const saved = await handlers.save();

      if (saved === true) {
        if (pendingTab) {
          navigateToTab(pendingTab);
        }
        resetGuard();
        return;
      }

      if (saved === "deferred") {
        dismissDialog();
        return;
      }

      // Keep dialog open on validation/API failure so the user can retry.
    } finally {
      setIsSavingFromDialog(false);
    }
  }, [activeTab, dismissDialog, getHandlers, navigateToTab, pendingTab, resetGuard]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (isSavingFromDialog) {
        return;
      }

      if (!open) {
        resetGuard();
      }
    },
    [isSavingFromDialog, resetGuard],
  );

  const activeHandlers = getHandlers(activeTab);
  const dialogIsSaving = isSavingFromDialog || Boolean(activeHandlers?.isSaving);

  return {
    dialogOpen,
    dialogIsSaving,
    pendingTab,
    handleTabChange,
    handleSave,
    handleDiscard,
    handleCancel,
    handleDialogOpenChange,
  };
}
