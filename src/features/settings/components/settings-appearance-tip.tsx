import { Lightbulb } from "lucide-react";

import { APPEARANCE_PAGE_TIP } from "../lib/settings-appearance-config";

export function SettingsAppearanceTip() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <p className="text-sm leading-6 text-muted-foreground">{APPEARANCE_PAGE_TIP}</p>
    </div>
  );
}
