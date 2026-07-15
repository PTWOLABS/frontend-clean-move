/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SettingsUnsavedChangesHandlers } from "../context/settings-unsaved-changes-context";
import { useSettingsTabLeaveGuard } from "./use-settings-tab-leave-guard";

function createHandlers(
  overrides: Partial<SettingsUnsavedChangesHandlers> = {},
): SettingsUnsavedChangesHandlers {
  return {
    hasUnsavedChanges: false,
    isSaving: false,
    save: vi.fn(async () => true),
    discard: vi.fn(),
    ...overrides,
  };
}

describe("useSettingsTabLeaveGuard", () => {
  it("navigates immediately when the active tab has no unsaved changes", () => {
    const handlers = createHandlers({ hasUnsavedChanges: false });
    const navigateToTab = vi.fn();
    const getHandlers = vi.fn(() => handlers);

    const { result } = renderHook(() =>
      useSettingsTabLeaveGuard({
        activeTab: "profile",
        showBusinessTab: true,
        getHandlers,
        navigateToTab,
      }),
    );

    act(() => {
      result.current.handleTabChange("security");
    });

    expect(navigateToTab).toHaveBeenCalledWith("security");
    expect(result.current.dialogOpen).toBe(false);
  });

  it("opens the dialog and does not navigate when the active tab is dirty", () => {
    const handlers = createHandlers({ hasUnsavedChanges: true });
    const navigateToTab = vi.fn();

    const { result } = renderHook(() =>
      useSettingsTabLeaveGuard({
        activeTab: "profile",
        showBusinessTab: true,
        getHandlers: () => handlers,
        navigateToTab,
      }),
    );

    act(() => {
      result.current.handleTabChange("security");
    });

    expect(navigateToTab).not.toHaveBeenCalled();
    expect(result.current.dialogOpen).toBe(true);
  });

  it("discards changes, navigates to the pending tab, and closes the dialog", () => {
    const handlers = createHandlers({ hasUnsavedChanges: true });
    const navigateToTab = vi.fn();

    const { result } = renderHook(() =>
      useSettingsTabLeaveGuard({
        activeTab: "profile",
        showBusinessTab: true,
        getHandlers: () => handlers,
        navigateToTab,
      }),
    );

    act(() => {
      result.current.handleTabChange("company");
    });

    act(() => {
      result.current.handleDiscard();
    });

    expect(handlers.discard).toHaveBeenCalledTimes(1);
    expect(navigateToTab).toHaveBeenCalledWith("company");
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.pendingTab).toBeNull();
  });

  it("navigates and closes the dialog when save returns true", async () => {
    const handlers = createHandlers({
      hasUnsavedChanges: true,
      save: vi.fn(async () => true),
    });
    const navigateToTab = vi.fn();

    const { result } = renderHook(() =>
      useSettingsTabLeaveGuard({
        activeTab: "profile",
        showBusinessTab: true,
        getHandlers: () => handlers,
        navigateToTab,
      }),
    );

    act(() => {
      result.current.handleTabChange("appearance");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(handlers.save).toHaveBeenCalledTimes(1);
    expect(navigateToTab).toHaveBeenCalledWith("appearance");
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.pendingTab).toBeNull();
  });

  it("keeps the dialog open when save returns false on any tab", async () => {
    const handlers = createHandlers({
      hasUnsavedChanges: true,
      save: vi.fn(async () => false),
    });
    const navigateToTab = vi.fn();

    const { result } = renderHook(() =>
      useSettingsTabLeaveGuard({
        activeTab: "security",
        showBusinessTab: true,
        getHandlers: () => handlers,
        navigateToTab,
      }),
    );

    act(() => {
      result.current.handleTabChange("profile");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(navigateToTab).not.toHaveBeenCalled();
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.pendingTab).toBe("profile");
  });

  it("dismisses the dialog but keeps pendingTab when save returns deferred", async () => {
    const handlers = createHandlers({
      hasUnsavedChanges: true,
      save: vi.fn(async (): Promise<"deferred"> => "deferred"),
    });
    const navigateToTab = vi.fn();

    const { result } = renderHook(() =>
      useSettingsTabLeaveGuard({
        activeTab: "security",
        showBusinessTab: true,
        getHandlers: () => handlers,
        navigateToTab,
      }),
    );

    act(() => {
      result.current.handleTabChange("profile");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(navigateToTab).not.toHaveBeenCalled();
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.pendingTab).toBe("profile");
  });
});
