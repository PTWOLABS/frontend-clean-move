/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import {
  SettingsUnsavedChangesProvider,
  useRegisterSettingsUnsavedChanges,
  useSettingsUnsavedChangesLookup,
  type SettingsUnsavedChangesHandlers,
} from "../context/settings-unsaved-changes-context";
import { useSettingsTabLeaveGuard } from "../hooks/use-settings-tab-leave-guard";
import type { SettingsSaveResult } from "../types/settings-save-result";
import type { SettingsTabId } from "../lib/settings-tabs-config";

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsUnsavedChangesProvider>{children}</SettingsUnsavedChangesProvider>;
}

function useIntegrationHarness(
  handlers: SettingsUnsavedChangesHandlers,
  navigateToTab: (tab: SettingsTabId) => void,
  activeTab: SettingsTabId = "profile",
) {
  useRegisterSettingsUnsavedChanges(activeTab, handlers);
  const { getHandlers } = useSettingsUnsavedChangesLookup();
  const guard = useSettingsTabLeaveGuard({
    activeTab,
    showBusinessTab: true,
    getHandlers,
    navigateToTab,
  });

  return { guard };
}

describe("settings tabs leave-guard integration", () => {
  it("discards dirty tab changes and navigates to the pending tab", () => {
    const discard = vi.fn();
    const save = vi.fn(async (): Promise<SettingsSaveResult> => true);
    const navigateToTab = vi.fn();

    const { result } = renderHook(
      () =>
        useIntegrationHarness(
          {
            hasUnsavedChanges: true,
            isSaving: false,
            save,
            discard,
          },
          navigateToTab,
        ),
      { wrapper },
    );

    act(() => {
      result.current.guard.handleTabChange("security");
    });

    expect(result.current.guard.dialogOpen).toBe(true);

    act(() => {
      result.current.guard.handleDiscard();
    });

    expect(discard).toHaveBeenCalledTimes(1);
    expect(navigateToTab).toHaveBeenCalledWith("security");
    expect(result.current.guard.dialogOpen).toBe(false);
  });

  it("saves successfully and navigates to the pending tab", async () => {
    const discard = vi.fn();
    const save = vi.fn(async (): Promise<SettingsSaveResult> => true);
    const navigateToTab = vi.fn();

    const { result } = renderHook(
      () =>
        useIntegrationHarness(
          {
            hasUnsavedChanges: true,
            isSaving: false,
            save,
            discard,
          },
          navigateToTab,
        ),
      { wrapper },
    );

    act(() => {
      result.current.guard.handleTabChange("company");
    });

    await act(async () => {
      await result.current.guard.handleSave();
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(navigateToTab).toHaveBeenCalledWith("company");
    expect(result.current.guard.dialogOpen).toBe(false);
  });

  it("keeps the dialog open when save fails", async () => {
    const discard = vi.fn();
    const save = vi.fn(async (): Promise<SettingsSaveResult> => false);
    const navigateToTab = vi.fn();

    const { result } = renderHook(
      () =>
        useIntegrationHarness(
          {
            hasUnsavedChanges: true,
            isSaving: false,
            save,
            discard,
          },
          navigateToTab,
        ),
      { wrapper },
    );

    act(() => {
      result.current.guard.handleTabChange("appearance");
    });

    await act(async () => {
      await result.current.guard.handleSave();
    });

    expect(navigateToTab).not.toHaveBeenCalled();
    expect(result.current.guard.dialogOpen).toBe(true);
    expect(result.current.guard.pendingTab).toBe("appearance");
  });

  it("preserves pendingTab when security save defers to its sub-flow", async () => {
    const discard = vi.fn();
    const save = vi.fn(async (): Promise<SettingsSaveResult> => "deferred");
    const navigateToTab = vi.fn();

    const { result } = renderHook(
      () =>
        useIntegrationHarness(
          {
            hasUnsavedChanges: true,
            isSaving: false,
            save,
            discard,
          },
          navigateToTab,
          "security",
        ),
      { wrapper },
    );

    act(() => {
      result.current.guard.handleTabChange("profile");
    });

    await act(async () => {
      await result.current.guard.handleSave();
    });

    expect(navigateToTab).not.toHaveBeenCalled();
    expect(result.current.guard.dialogOpen).toBe(false);
    expect(result.current.guard.pendingTab).toBe("profile");
  });
});
