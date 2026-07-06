"use client";

import { BadgeDollarSign, Plus, Search, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox/combobox";
import { FormField } from "@/components/ui/form/field";
import { WizardStepHeader } from "@/shared/components/wizard-step-header";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { cn } from "@/shared/utils/cn";

import { useQuoteServicesStep } from "../../../hooks/use-quote-services-step";
import { QuoteServiceItemCard } from "./quote-service-item-card";

type QuoteServicesStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function QuoteServicesStep({ title, description, className }: QuoteServicesStepProps) {
  const {
    addManualService,
    addSelectedService,
    canAddSelectedService,
    control,
    handleCourtesyChange,
    handleServiceSelectedItemChange,
    hasSelectedServiceInList,
    removeService,
    serviceEmptyMessage,
    serviceLabel,
    serviceOptionsItems,
    serviceRows,
    setServiceLabel,
    setServiceSearch,
    totalInCents,
  } = useQuoteServicesStep();

  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <WizardStepHeader title={title} description={description} icon={Wrench} />

      <CardContent className="space-y-6">
        <section className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Adicionar serviços</h3>
            <p className="text-xs text-muted-foreground">
              Busque serviços do catálogo ou crie itens avulsos para este orçamento.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-1.5">
              <label
                htmlFor="quote-service-search"
                className="text-sm font-medium leading-none text-foreground"
              >
                Buscar serviço existente
              </label>
              <Combobox
                id="quote-service-search"
                value={serviceLabel}
                onValueChange={setServiceLabel}
                onDebouncedValueChange={setServiceSearch}
                onSelectedItemChange={handleServiceSelectedItemChange}
                items={serviceOptionsItems}
                placeholder="Digite o nome do serviço"
                emptyMessage={serviceEmptyMessage}
                autoComplete="off"
                className="w-full shadow-xs"
              />
              {hasSelectedServiceInList && (
                <p className="text-xs text-muted-foreground">Este serviço já está na lista.</p>
              )}
            </div>

            <Button
              type="button"
              className={cn(hasSelectedServiceInList ? "lg:mb-5.5" : "lg:mb-1.5")}
              onClick={addSelectedService}
              disabled={!canAddSelectedService}
            >
              <Search aria-hidden className="size-4" />
              Adicionar existente
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border/80 bg-background/45 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground">Serviço avulso</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Use quando o serviço ainda não existe no catálogo.
              </p>
            </div>

            <Button type="button" variant="outline" onClick={addManualService}>
              <Plus aria-hidden className="size-4" />
              Adicionar avulso
            </Button>
          </div>

          <FormField control={control} name="stepTwo.services" renderControl={false}>
            {() => null}
          </FormField>
        </section>

        <section className="space-y-4" aria-label="Serviços do orçamento">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Lista de serviços</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajuste valores, marque cortesias ou remova itens antes de salvar.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/55 px-3 py-2 text-sm">
              <BadgeDollarSign aria-hidden className="size-4 text-primary" />
              <span className="text-muted-foreground">Total</span>
              <strong className="font-semibold text-foreground">
                {formatBrlFromCents(totalInCents)}
              </strong>
            </div>
          </div>

          {serviceRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-background/45 p-6 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench aria-hidden className="size-5" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-foreground">
                Nenhum serviço adicionado
              </h4>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Adicione ao menos um serviço existente ou avulso para continuar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceRows.map(({ fieldId, index, service }) => (
                <QuoteServiceItemCard
                  key={fieldId}
                  control={control}
                  index={index}
                  isCourtesy={Boolean(service?.isCourtesy)}
                  isExistingService={Boolean(service?.serviceId)}
                  maxPriceInCents={service?.maxPriceInCents}
                  minPriceInCents={service?.minPriceInCents}
                  priceType={service?.priceType}
                  serviceLabel={service?.serviceLabel}
                  onCourtesyChange={handleCourtesyChange}
                  onRemove={removeService}
                />
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
