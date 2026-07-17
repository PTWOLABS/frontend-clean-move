"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/features/user/types";

import {
  SettingsUnsavedChangesProvider,
  useSettingsUnsavedChangesLookup,
} from "../context/settings-unsaved-changes-context";
import { useSettingsTabLeaveGuard } from "../hooks/use-settings-tab-leave-guard";
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

  const showBusinessTab = user.role === "ESTABLISHMENT" && !!user.establishmentId;
  const visibleTabIds = useMemo(() => getVisibleSettingsTabIds(showBusinessTab), [showBusinessTab]);

  const activeTab = resolveSettingsTabId(searchParams.get("tab"), { showBusinessTab });

  const navigateToTab = useCallback(
    (tab: SettingsTabId) => {
      router.replace(`/settings?tab=${tab}`, { scroll: false });
    },
    [router],
  );

  const {
    dialogOpen,
    dialogIsSaving,
    handleTabChange,
    handleSave,
    handleDiscard,
    handleCancel,
    handleDialogOpenChange,
  } = useSettingsTabLeaveGuard({
    activeTab,
    showBusinessTab,
    getHandlers,
    navigateToTab,
  });

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
