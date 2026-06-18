export const SETTINGS_TAB_IDS = ["profile", "company", "appearance"] as const;

export type SettingsTabId = (typeof SETTINGS_TAB_IDS)[number];

export const DEFAULT_SETTINGS_TAB: SettingsTabId = "profile";

export const SETTINGS_TAB_LABELS: Record<SettingsTabId, string> = {
  profile: "Perfil",
  company: "Negócio",
  appearance: "Aparência",
};

export function isSettingsTabId(value: string | null): value is SettingsTabId {
  return SETTINGS_TAB_IDS.includes(value as SettingsTabId);
}

export function resolveSettingsTabId(
  value: string | null,
  options?: { showBusinessTab?: boolean },
): SettingsTabId {
  if (!isSettingsTabId(value)) {
    return DEFAULT_SETTINGS_TAB;
  }

  if (value === "company" && options?.showBusinessTab === false) {
    return DEFAULT_SETTINGS_TAB;
  }

  return value;
}

export function getVisibleSettingsTabIds(showBusinessTab: boolean): SettingsTabId[] {
  return showBusinessTab
    ? [...SETTINGS_TAB_IDS]
    : SETTINGS_TAB_IDS.filter((tabId) => tabId !== "company");
}
