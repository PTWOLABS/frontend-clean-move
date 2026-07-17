"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { SettingsTabId } from "../lib/settings-tabs-config";
import type { SettingsSaveResult } from "../types/settings-save-result";

export type SettingsUnsavedChangesHandlers = {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  save: () => Promise<SettingsSaveResult>;
  discard: () => void;
};

type SettingsUnsavedChangesContextValue = {
  register: (tabId: SettingsTabId, handlers: SettingsUnsavedChangesHandlers) => void;
  unregister: (tabId: SettingsTabId) => void;
  getHandlers: (tabId: SettingsTabId) => SettingsUnsavedChangesHandlers | null;
};

const SettingsUnsavedChangesContext = createContext<SettingsUnsavedChangesContextValue | null>(
  null,
);

export function SettingsUnsavedChangesProvider({ children }: { children: ReactNode }) {
  const handlersByTabRef = useRef(new Map<SettingsTabId, SettingsUnsavedChangesHandlers>());

  const register = useCallback((tabId: SettingsTabId, handlers: SettingsUnsavedChangesHandlers) => {
    handlersByTabRef.current.set(tabId, handlers);
  }, []);

  const unregister = useCallback((tabId: SettingsTabId) => {
    handlersByTabRef.current.delete(tabId);
  }, []);

  const getHandlers = useCallback((tabId: SettingsTabId) => {
    return handlersByTabRef.current.get(tabId) ?? null;
  }, []);

  const value = useMemo(
    () => ({ register, unregister, getHandlers }),
    [register, unregister, getHandlers],
  );

  return (
    <SettingsUnsavedChangesContext.Provider value={value}>
      {children}
    </SettingsUnsavedChangesContext.Provider>
  );
}

function useSettingsUnsavedChangesContext() {
  const context = useContext(SettingsUnsavedChangesContext);

  if (!context) {
    throw new Error(
      "useRegisterSettingsUnsavedChanges must be used within SettingsUnsavedChangesProvider",
    );
  }

  return context;
}

export function useRegisterSettingsUnsavedChanges(
  tabId: SettingsTabId,
  handlers: SettingsUnsavedChangesHandlers,
) {
  const { register, unregister } = useSettingsUnsavedChangesContext();
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const stableHandlers: SettingsUnsavedChangesHandlers = {
      get hasUnsavedChanges() {
        return handlersRef.current.hasUnsavedChanges;
      },
      get isSaving() {
        return handlersRef.current.isSaving;
      },
      save: () => handlersRef.current.save(),
      discard: () => handlersRef.current.discard(),
    };

    register(tabId, stableHandlers);

    return () => unregister(tabId);
  }, [tabId, register, unregister]);
}

export function useSettingsUnsavedChangesLookup() {
  return useSettingsUnsavedChangesContext();
}
