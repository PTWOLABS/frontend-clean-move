"use client";

import { ListChecks, Power, Scissors } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/ui/form/input-field";
import { FormControl } from "@/components/ui/form/form-primitives";
import { FormField } from "@/components/ui/form/field";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/shared/utils/cn";
import { Select } from "@/components/ui/select/select";
import { StepHeader } from "./step-header";

const serviceCategoryOptions = [
  {
    label: "Lavagem",
    value: "WASH",
  },
  {
    label: "Polimento",
    value: "POLISHING",
  },
  {
    label: "Higienização",
    value: "SANITIZATION",
  },
  {
    label: "Vitrificação",
    value: "COATING",
  },
  {
    label: "Martelinho de ouro",
    value: "PAINTLESS_DENT_REPAIR",
  },
  {
    label: "Outro",
    value: "OTHER",
  },
];
type ServiceStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function ServiceStep({ title, description, className }: ServiceStepProps) {
  const { control } = useFormContext();

  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <StepHeader title={title} description={description} />

      <CardContent className="space-y-5">
        <InputField
          id="onboarding-service-name"
          name="name"
          label="Nome do serviço"
          placeholder="Ex.: Lavagem premium"
          autoComplete="off"
          icon={
            <Scissors
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
          }
          className="h-12 rounded-xl bg-background/60 pl-12 text-sm shadow-none"
        />

        <FormField
          control={control}
          name="description"
          label="Descrição"
          id="onboarding-service-description"
          renderControl={false}
        >
          {({ field }) => (
            <FormControl>
              <Textarea
                {...field}
                id="onboarding-service-description"
                placeholder="Descreva o que está incluído neste serviço."
                className="min-h-28 resize-none rounded-xl bg-background/60 text-sm shadow-none"
                value={field.value ?? ""}
              />
            </FormControl>
          )}
        </FormField>

        <FormField
          name="category"
          label="Categoria"
          id="onboarding-service-category"
          renderControl={false}
        >
          {({ field }) => (
            <FormControl>
              <Select
                className="h-12 rounded-xl border-border/80 bg-background/60 text-sm shadow-none"
                options={serviceCategoryOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          )}
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            id="onboarding-service-min-duration"
            name="minDurationInMinutes"
            label="Duração mín. (min)"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="30"
            className="h-12 rounded-xl bg-background/60 text-sm shadow-none"
          />

          <InputField
            id="onboarding-service-max-duration"
            name="maxDurationInMinutes"
            label="Duração máx. (min)"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="60"
            className="h-12 rounded-xl bg-background/60 text-sm shadow-none"
          />
        </div>

        <InputField
          id="onboarding-service-price"
          name="price"
          label="Preço (R$)"
          inputMode="decimal"
          placeholder="30,00"
          className="h-12 rounded-xl bg-background/60 text-sm shadow-none"
        />

        <FormField
          control={control}
          name="isActive"
          id="onboarding-service-active"
          renderControl={false}
        >
          {({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Power aria-hidden className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Serviço ativo no catálogo</p>

                  <p className="text-xs text-muted-foreground">
                    O serviço ficará disponível para uso em agendamentos.
                  </p>
                </div>
              </div>

              <FormControl>
                <Switch
                  id="onboarding-service-active"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>
          )}
        </FormField>

        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <ListChecks aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />

          <p>
            Por enquanto será cadastrado apenas um serviço. Depois você poderá adicionar novos
            serviços pelo catálogo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
