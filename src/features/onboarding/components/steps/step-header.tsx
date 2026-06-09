import { CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

type StepHeaderProps = {
  title: string;
  description: string;
};

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <CardHeader className="pb-6">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Building2 aria-hidden className="size-5" strokeWidth={2.2} />
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
