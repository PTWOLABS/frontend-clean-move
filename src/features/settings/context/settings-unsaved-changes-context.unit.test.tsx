/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import {
  SettingsUnsavedChangesProvider,
  useRegisterSettingsUnsavedChanges,
  useSettingsUnsavedChangesLookup,
  type SettingsUnsavedChangesHandlers,
} from "./settings-unsaved-changes-context";

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsUnsavedChangesProvider>{children}</SettingsUnsavedChangesProvider>;
}

function useRegistryHarness(handlers: SettingsUnsavedChangesHandlers) {
  useRegisterSettingsUnsavedChanges("profile", handlers);
  return useSettingsUnsavedChangesLookup();
}

describe("settings-unsaved-changes-context", () => {
  it("registers handlers and exposes the latest hasUnsavedChanges via getters", () => {
    const save = vi.fn(async () => true);
    const discard = vi.fn();

    const { result, rerender } = renderHook(
      ({ dirty }) =>
        useRegistryHarness({
          hasUnsavedChanges: dirty,
          isSaving: false,
          save,
          discard,
        }),
      {
        wrapper,
        initialProps: { dirty: false },
      },
    );

    expect(result.current.getHandlers("profile")?.hasUnsavedChanges).toBe(false);

    rerender({ dirty: true });

    expect(result.current.getHandlers("profile")?.hasUnsavedChanges).toBe(true);
  });

  it("forwards save and discard to the latest registered handlers", async () => {
    const save = vi.fn(async () => true);
    const discard = vi.fn();

    const { result } = renderHook(
      () =>
        useRegistryHarness({
          hasUnsavedChanges: true,
          isSaving: false,
          save,
          discard,
        }),
      { wrapper },
    );

    const handlers = result.current.getHandlers("profile");
    expect(handlers).not.toBeNull();

    await act(async () => {
      await expect(handlers!.save()).resolves.toBe(true);
    });
    expect(save).toHaveBeenCalledTimes(1);

    act(() => {
      handlers!.discard();
    });
    expect(discard).toHaveBeenCalledTimes(1);
  });

  it("returns null for tabs without a registration", () => {
    const { result } = renderHook(
      () =>
        useRegistryHarness({
          hasUnsavedChanges: false,
          isSaving: false,
          save: async () => true,
          discard: () => undefined,
        }),
      { wrapper },
    );

    expect(result.current.getHandlers("security")).toBeNull();
  });
});
