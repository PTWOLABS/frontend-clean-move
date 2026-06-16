import type { User } from "@/features/user/types";

import { SettingsProfileForm } from "./settings-profile-form";

type SettingsProfileTabProps = {
  user: User;
};

export function SettingsProfileTab({ user }: SettingsProfileTabProps) {
  return <SettingsProfileForm user={user} />;
}
