/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { UseFormHandleSubmit } from "react-hook-form";

import {
  SettingsUnsavedChangesProvider,
  useSettingsUnsavedChangesLookup,
} from "../context/settings-unsaved-changes-context";
import type { PasswordSettingsFormValues } from "../schemas/password-settings-schema";
import { useSettingsPasswordTabGuard } from "./use-settings-password-tab-guard";

const toastInfoMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    info: (...args: unknown[]) => toastInfoMock(...args),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsUnsavedChangesProvider>{children}</SettingsUnsavedChangesProvider>;
}

function useHarness(params: Parameters<typeof useSettingsPasswordTabGuard>[0]) {
  useSettingsPasswordTabGuard(params);
  return useSettingsUnsavedChangesLookup();
}

describe("useSettingsPasswordTabGuard", () => {
  beforeEach(() => {
    toastInfoMock.mockReset();
  });

  it("returns deferred when credentials are valid and opens the confirm dialog", async () => {
    const onOpenConfirmDialog = vi.fn();
    const handleSubmit = vi.fn((onValid) => {
      return async () => {
        onValid({} as PasswordSettingsFormValues);
      };
    }) as unknown as UseFormHandleSubmit<PasswordSettingsFormValues>;

    const { result } = renderHook(
      () =>
        useHarness({
          isDirty: true,
          step: "credentials",
          confirmDialogOpen: false,
          isSaving: false,
          handleSubmit,
          onOpenConfirmDialog,
          onDiscard: vi.fn(),
        }),
      { wrapper },
    );

    const handlers = result.current.getHandlers("security");
    expect(handlers).not.toBeNull();

    let saved: Awaited<ReturnType<NonNullable<typeof handlers>["save"]>> = false;
    await act(async () => {
      saved = await handlers!.save();
    });

    expect(saved).toBe("deferred");
    expect(onOpenConfirmDialog).toHaveBeenCalledTimes(1);
  });

  it("returns false and shows toast when on confirmation step", async () => {
    const onOpenConfirmDialog = vi.fn();
    const handleSubmit = vi.fn() as unknown as UseFormHandleSubmit<PasswordSettingsFormValues>;

    const { result } = renderHook(
      () =>
        useHarness({
          isDirty: false,
          step: "confirmation",
          confirmDialogOpen: false,
          isSaving: false,
          handleSubmit,
          onOpenConfirmDialog,
          onDiscard: vi.fn(),
        }),
      { wrapper },
    );

    const handlers = result.current.getHandlers("security");

    let saved: Awaited<ReturnType<NonNullable<typeof handlers>["save"]>> = true;
    await act(async () => {
      saved = await handlers!.save();
    });

    expect(saved).toBe(false);
    expect(toastInfoMock).toHaveBeenCalled();
    expect(onOpenConfirmDialog).not.toHaveBeenCalled();
  });

  it("returns false when form validation fails", async () => {
    const onOpenConfirmDialog = vi.fn();
    const handleSubmit = vi.fn((_onValid, onInvalid) => {
      return async () => {
        onInvalid?.({});
      };
    }) as unknown as UseFormHandleSubmit<PasswordSettingsFormValues>;

    const { result } = renderHook(
      () =>
        useHarness({
          isDirty: true,
          step: "credentials",
          confirmDialogOpen: false,
          isSaving: false,
          handleSubmit,
          onOpenConfirmDialog,
          onDiscard: vi.fn(),
        }),
      { wrapper },
    );

    const handlers = result.current.getHandlers("security");

    let saved: Awaited<ReturnType<NonNullable<typeof handlers>["save"]>> = true;
    await act(async () => {
      saved = await handlers!.save();
    });

    expect(saved).toBe(false);
    expect(onOpenConfirmDialog).not.toHaveBeenCalled();
  });
});
