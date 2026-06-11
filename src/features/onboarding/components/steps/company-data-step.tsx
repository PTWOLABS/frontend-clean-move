"use client";

import { Building2, FileText, IdCard, Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";
import { StepHeader } from "./step-header";
import { StandartInputField } from "@/components/ui/form/standart-input-field";

type CompanyDataStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function CompanyDataStep({ title, description, className }: CompanyDataStepProps) {
  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <StepHeader title={title} description={description} />

      <CardContent className="space-y-5">
        <StandartInputField
          id="onboarding-trade-name"
          name="tradeName"
          label="Nome fantasia"
          placeholder="Ex.: Clean Move Detail"
          autoComplete="organization"
          icon={Building2}
          className="shadow-xs"
        />

        <StandartInputField
          id="onboarding-legal-name"
          name="legalName"
          label="Razão social"
          placeholder="Ex.: Clean Move Estética Automotiva LTDA"
          autoComplete="organization"
          icon={FileText}
          className="shadow-xs"
        />

        <StandartInputField
          id="onboarding-cnpj"
          name="cnpj"
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          mask="__.___.___/____-__"
          inputMode="numeric"
          autoComplete="off"
          icon={IdCard}
          className="shadow-xs"
        />

        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />

          <p>Você poderá ajustar essas informações mais tarde nas configurações.</p>
        </div>
      </CardContent>
    </Card>
  );
}
