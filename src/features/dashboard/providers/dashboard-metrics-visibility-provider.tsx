"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const DASHBOARD_METRICS_VISIBILITY_STORAGE_KEY = "clean-move:dashboard-metrics-visible";
const DASHBOARD_METRICS_VISIBILITY_CHANGE_EVENT = "dashboard-metrics-visibility-change";
const DASHBOARD_METRICS_UNLOCK_CODE = "clean-move-bocucci";

let fallbackMetricsVisibility = true;

type DashboardMetricsVisibilityContextValue = {
  shouldShowMetrics: boolean;
  toggleMetricsVisibility: () => void;
};

const DashboardMetricsVisibilityContext =
  createContext<DashboardMetricsVisibilityContextValue | null>(null);

function getStoredMetricsVisibility() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const storedValue = window.localStorage.getItem(DASHBOARD_METRICS_VISIBILITY_STORAGE_KEY);

    if (storedValue === null) {
      return true;
    }

    return storedValue === "true";
  } catch {
    return fallbackMetricsVisibility;
  }
}

function persistMetricsVisibility(shouldShowMetrics: boolean) {
  fallbackMetricsVisibility = shouldShowMetrics;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      DASHBOARD_METRICS_VISIBILITY_STORAGE_KEY,
      String(shouldShowMetrics),
    );
  } catch {
    // Temporário: se o navegador bloquear storage, mantemos apenas o estado em memória.
  }

  window.dispatchEvent(new Event(DASHBOARD_METRICS_VISIBILITY_CHANGE_EVENT));
}

function subscribeToMetricsVisibility(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key !== DASHBOARD_METRICS_VISIBILITY_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  }

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(DASHBOARD_METRICS_VISIBILITY_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(DASHBOARD_METRICS_VISIBILITY_CHANGE_EVENT, onStoreChange);
  };
}

export function DashboardMetricsVisibilityProvider({ children }: { children: ReactNode }) {
  const shouldShowMetrics = useSyncExternalStore(
    subscribeToMetricsVisibility,
    getStoredMetricsVisibility,
    () => true,
  );

  const updateMetricsVisibility = useCallback((nextShouldShowMetrics: boolean) => {
    persistMetricsVisibility(nextShouldShowMetrics);
  }, []);

  const toggleMetricsVisibility = useCallback(() => {
    if (shouldShowMetrics) {
      updateMetricsVisibility(false);
      return;
    }

    const code = window.prompt("Digite o código:");

    if (code?.trim() === DASHBOARD_METRICS_UNLOCK_CODE) {
      updateMetricsVisibility(true);
    }
  }, [shouldShowMetrics, updateMetricsVisibility]);

  const value = useMemo(
    () => ({
      shouldShowMetrics,
      toggleMetricsVisibility,
    }),
    [shouldShowMetrics, toggleMetricsVisibility],
  );

  return (
    <DashboardMetricsVisibilityContext.Provider value={value}>
      {children}
    </DashboardMetricsVisibilityContext.Provider>
  );
}

export function useDashboardMetricsVisibility() {
  const context = useContext(DashboardMetricsVisibilityContext);

  if (!context) {
    throw new Error(
      "useDashboardMetricsVisibility must be used within DashboardMetricsVisibilityProvider",
    );
  }

  return context;
}
