import type { User } from "@/features/user/types";

import { SettingsPasswordForm } from "./settings-password-form";

type SettingsSecurityTabProps = {
  user: User;
};

export function SettingsSecurityTab({ user }: SettingsSecurityTabProps) {
  return <SettingsPasswordForm key={String(user.hasPassword)} user={user} />;
}
