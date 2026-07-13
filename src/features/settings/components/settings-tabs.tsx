"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/features/user/types";

import {
  SettingsUnsavedChangesProvider,
  useSettingsUnsavedChangesLookup,
} from "../context/settings-unsaved-changes-context";
import {
  getVisibleSettingsTabIds,
  resolveSettingsTabId,
  SETTINGS_TAB_LABELS,
  type SettingsTabId,
} from "../lib/settings-tabs-config";
import { SettingsAppearanceTab } from "./settings-appearance-tab";
import { SettingsBusinessTab } from "./settings-business-tab";
import { SettingsProfileTab } from "./settings-profile-tab";
import { SettingsSecurityTab } from "./settings-security-tab";
import { SettingsUnsavedChangesDialog } from "./settings-unsaved-changes-dialog";

type SettingsTabsProps = {
  user: User;
};

function SettingsTabsInner({ user }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getHandlers } = useSettingsUnsavedChangesLookup();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<SettingsTabId | null>(null);
  const [isSavingFromDialog, setIsSavingFromDialog] = useState(false);

  const showBusinessTab = user.role === "ESTABLISHMENT" && !!user.establishmentId;
  const visibleTabIds = useMemo(() => getVisibleSettingsTabIds(showBusinessTab), [showBusinessTab]);

  const activeTab = resolveSettingsTabId(searchParams.get("tab"), { showBusinessTab });

  const navigateToTab = useCallback(
    (tab: SettingsTabId) => {
      router.replace(`/settings?tab=${tab}`, { scroll: false });
    },
    [router],
  );

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

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="max-w-full overflow-x-auto">
          <TabsList className="inline-flex h-auto w-fit justify-start gap-1 p-1">
            {visibleTabIds.map((tabId) => (
              <TabsTrigger key={tabId} value={tabId} className="px-4">
                {SETTINGS_TAB_LABELS[tabId]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={"profile" satisfies SettingsTabId} className="mt-0">
          <SettingsProfileTab user={user} />
        </TabsContent>

        <TabsContent value={"security" satisfies SettingsTabId} className="mt-0">
          <SettingsSecurityTab user={user} />
        </TabsContent>

        {showBusinessTab ? (
          <TabsContent value={"company" satisfies SettingsTabId} className="mt-0">
            <SettingsBusinessTab user={user} />
          </TabsContent>
        ) : null}

        <TabsContent value={"appearance" satisfies SettingsTabId} className="mt-0">
          <SettingsAppearanceTab user={user} showBannerUpload={showBusinessTab} />
        </TabsContent>
      </Tabs>

      <SettingsUnsavedChangesDialog
        open={dialogOpen}
        isSaving={dialogIsSaving}
        onOpenChange={handleDialogOpenChange}
        onSave={() => {
          void handleSave();
        }}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
    </>
  );
}

export function SettingsTabs({ user }: SettingsTabsProps) {
  return (
    <SettingsUnsavedChangesProvider>
      <SettingsTabsInner user={user} />
    </SettingsUnsavedChangesProvider>
  );
}
