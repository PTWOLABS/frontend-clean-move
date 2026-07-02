import { CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";
import type { LucideIcon } from "lucide-react";

type WizardStepHeaderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
};

export function WizardStepHeader({
  title,
  description,
  icon: Icon,
  className,
}: WizardStepHeaderProps) {
  return (
    <CardHeader className={cn("pb-6", className)}>
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon aria-hidden className="size-5" strokeWidth={2.2} />
        </div>

        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </CardTitle>

          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardHeader>
  );
}
