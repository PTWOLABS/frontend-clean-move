"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/features/user/types";

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

type SettingsTabsProps = {
  user: User;
};

export function SettingsTabs({ user }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const showBusinessTab = user.role === "ESTABLISHMENT" && !!user.establishmentId;
  const visibleTabIds = useMemo(() => getVisibleSettingsTabIds(showBusinessTab), [showBusinessTab]);

  const activeTab = resolveSettingsTabId(searchParams.get("tab"), { showBusinessTab });

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = resolveSettingsTabId(value, { showBusinessTab });
      router.replace(`/settings?tab=${tab}`, { scroll: false });
    },
    [router, showBusinessTab],
  );

  return (
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
  );
}
