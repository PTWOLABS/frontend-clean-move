import { Building2 } from "lucide-react";

import { WizardStepHeader } from "@/shared/components/wizard-step-header";

type StepHeaderProps = {
  title: string;
  description: string;
};

export function StepHeader({ title, description }: StepHeaderProps) {
  return <WizardStepHeader title={title} description={description} icon={Building2} />;
}
