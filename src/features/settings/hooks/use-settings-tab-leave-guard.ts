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

  const closeDialog = useCallback(() => {
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
    closeDialog();
  }, [closeDialog]);

  const handleDiscard = useCallback(() => {
    const handlers = getHandlers(activeTab);
    handlers?.discard();

    if (pendingTab) {
      navigateToTab(pendingTab);
    }

    closeDialog();
  }, [activeTab, closeDialog, getHandlers, navigateToTab, pendingTab]);

  const handleSave = useCallback(async () => {
    const handlers = getHandlers(activeTab);

    if (!handlers) {
      closeDialog();
      return;
    }

    setIsSavingFromDialog(true);

    try {
      const saved = await handlers.save();

      if (saved && pendingTab) {
        navigateToTab(pendingTab);
        closeDialog();
        return;
      }

      // Keep dialog open on validation/API failure so the user can retry.
      // Security intentionally returns false after opening its own flow — close here.
      if (!saved && activeTab === "security") {
        closeDialog();
      } else if (saved) {
        closeDialog();
      }
    } finally {
      setIsSavingFromDialog(false);
    }
  }, [activeTab, closeDialog, getHandlers, navigateToTab, pendingTab]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (isSavingFromDialog) {
        return;
      }

      if (!open) {
        closeDialog();
      }
    },
    [closeDialog, isSavingFromDialog],
  );

  const activeHandlers = getHandlers(activeTab);
  const dialogIsSaving = isSavingFromDialog || Boolean(activeHandlers?.isSaving);

  return {
    dialogOpen,
    dialogIsSaving,
    handleTabChange,
    handleSave,
    handleDiscard,
    handleCancel,
    handleDialogOpenChange,
  };
}
