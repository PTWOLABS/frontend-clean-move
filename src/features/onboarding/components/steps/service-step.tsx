"use client";

import { Droplets, ListChecks, Power } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { FormControl } from "@/components/ui/form/form-primitives";
import { FormField } from "@/components/ui/form/field";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/shared/utils/cn";
import { Select } from "@/components/ui/select/select";
import { StepHeader } from "./step-header";
import { StandartInputField } from "@/components/ui/form/standart-input-field";
import { useServiceCategoryOptions } from "@/features/service-category/hooks/use-service-category-options";
import { DURATION_HHMM_MASK } from "@/features/service/lib/duration-hhmm";

const NONE_CATEGORY_VALUE = "__none__";

type ServiceStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function ServiceStep({ title, description, className }: ServiceStepProps) {
  const { control } = useFormContext();
  const { data, isLoading } = useServiceCategoryOptions({ limit: 100 });
  const serviceCategoryOptions = [
    { label: "Nenhuma", value: NONE_CATEGORY_VALUE },
    ...(data?.categories.map((category) => ({
      label: category.label,
      value: category.id,
    })) ?? []),
  ];

  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <StepHeader title={title} description={description} />

      <CardContent className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <StandartInputField
            id="onboarding-service-name"
            name="serviceName"
            label="Nome do serviço"
            placeholder="Ex.: Lavagem premium"
            autoComplete="off"
            icon={Droplets}
            className="shadow-xs"
          />

          <FormField
            control={control}
            name="category"
            label="Categoria"
            id="onboarding-service-category"
            renderControl={false}
          >
            {({ field }) => (
              <FormControl>
                <Select
                  id="onboarding-service-category"
                  className="shadow-xs w-full"
                  options={serviceCategoryOptions}
                  placeholder={isLoading ? "Carregando categorias" : "Selecione a categoria"}
                  value={field.value || NONE_CATEGORY_VALUE}
                  onChange={(value) =>
                    field.onChange(value === NONE_CATEGORY_VALUE ? undefined : value)
                  }
                  onBlur={field.onBlur}
                  disabled={isLoading}
                />
              </FormControl>
            )}
          </FormField>
        </div>

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
                rows={4}
                className="resize-y  shadow-xs"
                value={field.value ?? ""}
              />
            </FormControl>
          )}
        </FormField>

        <div className="grid gap-5 md:grid-cols-3">
          <StandartInputField
            id="onboarding-service-min-duration"
            name="minDurationInMinutes"
            label="Duração mín."
            mask={DURATION_HHMM_MASK}
            inputMode="numeric"
            placeholder="00:30"
            className="shadow-xs"
          />

          <StandartInputField
            id="onboarding-service-max-duration"
            name="maxDurationInMinutes"
            label="Duração máx."
            mask={DURATION_HHMM_MASK}
            inputMode="numeric"
            placeholder="01:00"
            className="shadow-xs"
          />
          <StandartInputField
            id="onboarding-service-price"
            name="price"
            label="Preço (R$)"
            inputMode="decimal"
            autoComplete="off"
            placeholder="30,00"
            className="tabular-nums shadow-xs"
          />
        </div>

        <FormField
          control={control}
          name="isActive"
          id="onboarding-service-active"
          renderControl={false}
        >
          {({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 px-4 py-4 shadow-xs">
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
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  aria-label="Serviço ativo no catálogo"
                  className="shrink-0"
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
