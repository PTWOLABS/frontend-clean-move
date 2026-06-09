"use client";

import { Suspense } from "react";

import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";

import { SettingsHeader } from "./settings-header";
import { SettingsPageSkeleton } from "./settings-page-skeleton";
import { SettingsTabs } from "./settings-tabs";

function SettingsTabsWithData() {
  const { data: user, isLoading, error } = useCurrentUser();

  const errorFeedback = useQueryFeedbackError({
    resourceKey: "user-me",
    resourceLabel: "as configurações",
    error,
  });

  const showSkeleton = isLoading && !user;

  if (showSkeleton) {
    return <SettingsPageSkeleton />;
  }

  if (error && !user) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {errorFeedback?.description ?? "Não foi possível carregar as configurações."}
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return <SettingsTabs user={user} />;
}

export function SettingsPage() {
  return (
    <section className="space-y-6">
      <SettingsHeader />
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsTabsWithData />
      </Suspense>
    </section>
  );
}
