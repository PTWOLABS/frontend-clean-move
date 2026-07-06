"use client";

import { CarFront, FileText, IdCard, Info, Mail, Palette, Phone, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox/combobox";
import { FormField } from "@/components/ui/form/field";
import { FormControl, FormDescription } from "@/components/ui/form/form-primitives";
import { StandartInputField } from "@/components/ui/form/standart-input-field";
import { WizardStepHeader } from "@/shared/components/wizard-step-header";
import { cn } from "@/shared/utils/cn";

import { useQuoteCustomerVehicleStep } from "../../../hooks/use-quote-customer-vehicle-step";

type QuoteCustomerVehicleStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function QuoteCustomerVehicleStep({
  title,
  description,
  className,
}: QuoteCustomerVehicleStepProps) {
  const {
    control,
    customerEmptyMessage,
    customerLabel,
    customerOptionsItems,
    handleCustomerSelectedItemChange,
    handleVehicleSelectedItemChange,
    hasSelectedCustomer,
    hasSelectedVehicle,
    isFetchingSelectedCustomer,
    isFetchingSelectedVehicle,
    selectedCustomerId,
    setCustomerLabel,
    setCustomerSearch,
    setVehicleLabel,
    setVehicleSearch,
    vehicleEmptyMessage,
    vehicleLabel,
    vehicleOptionsItems,
  } = useQuoteCustomerVehicleStep();

  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <WizardStepHeader title={title} description={description} icon={UserRound} />

      <CardContent className="space-y-6">
        <section className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Cliente</h3>
            <p className="text-xs text-muted-foreground">
              Informe os dados principais para identificar o cliente no orçamento.
            </p>
          </div>

          <FormField
            control={control}
            name="stepOne.customerId"
            label="Buscar cliente existente"
            renderControl={false}
          >
            {({ field }) => (
              <div className="space-y-1.5">
                <FormControl>
                  <Combobox
                    ref={field.ref}
                    id={field.name}
                    name={field.name}
                    value={customerLabel}
                    onValueChange={setCustomerLabel}
                    onDebouncedValueChange={setCustomerSearch}
                    onSelectedItemChange={handleCustomerSelectedItemChange}
                    onBlur={field.onBlur}
                    items={customerOptionsItems}
                    placeholder="Digite o nome do cliente"
                    emptyMessage={customerEmptyMessage}
                    autoComplete="name"
                    className="w-full shadow-xs"
                  />
                </FormControl>
                <FormDescription>
                  {isFetchingSelectedCustomer ? (
                    "Carregando dados do cliente selecionado..."
                  ) : (
                    <span className="inline-flex items-start gap-1.5">
                      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>
                        Selecione um cliente cadastrado ou preencha os campos abaixo manualmente.
                      </span>
                    </span>
                  )}
                </FormDescription>
              </div>
            )}
          </FormField>

          <StandartInputField
            id="quote-customer-name"
            name="stepOne.customer.name"
            label="Nome do cliente"
            placeholder="Ex.: João da Silva"
            autoComplete="name"
            icon={UserRound}
            className="shadow-xs"
            disabled={hasSelectedCustomer}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <StandartInputField
              id="quote-customer-phone"
              name="stepOne.customer.phone"
              label="Telefone"
              placeholder="(11) 99999-9999"
              mask="(__) _____-____"
              inputMode="tel"
              autoComplete="tel"
              icon={Phone}
              className="shadow-xs"
              disabled={hasSelectedCustomer}
            />

            <StandartInputField
              id="quote-customer-email"
              name="stepOne.customer.email"
              label="E-mail"
              type="email"
              placeholder="cliente@email.com"
              autoComplete="email"
              icon={Mail}
              className="shadow-xs"
              disabled={hasSelectedCustomer}
            />
          </div>

          <StandartInputField
            id="quote-customer-document"
            name="stepOne.customer.cpfCnpj"
            label="CPF/CNPJ"
            placeholder="CPF ou CNPJ do cliente"
            inputMode="numeric"
            autoComplete="off"
            icon={IdCard}
            className="shadow-xs"
            disabled={hasSelectedCustomer}
          />
        </section>

        <div className="h-px bg-border" />

        <section className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Veículo</h3>
            <p className="text-xs text-muted-foreground">
              Adicione os dados do veículo que receberá os serviços orçados.
            </p>
          </div>

          <FormField
            control={control}
            name="stepOne.vehicleId"
            label="Buscar veículo existente"
            renderControl={false}
          >
            {({ field }) => (
              <div className="space-y-1.5">
                <FormControl>
                  <Combobox
                    ref={field.ref}
                    id={field.name}
                    name={field.name}
                    value={vehicleLabel}
                    onValueChange={setVehicleLabel}
                    onDebouncedValueChange={setVehicleSearch}
                    onSelectedItemChange={handleVehicleSelectedItemChange}
                    onBlur={field.onBlur}
                    items={vehicleOptionsItems}
                    placeholder="Digite placa, marca ou modelo"
                    emptyMessage={vehicleEmptyMessage}
                    autoComplete="off"
                    disabled={!selectedCustomerId}
                    className="w-full shadow-xs"
                  />
                </FormControl>
                <FormDescription>
                  {isFetchingSelectedVehicle
                    ? "Carregando dados do veículo selecionado..."
                    : selectedCustomerId
                      ? "Ao selecionar um veículo cadastrado, os dados abaixo são preenchidos e bloqueados."
                      : "Selecione um cliente existente para buscar veículos vinculados."}
                </FormDescription>
              </div>
            )}
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <StandartInputField
              id="quote-vehicle-plate"
              name="stepOne.vehicle.plate"
              label="Placa"
              maxLength={7}
              placeholder="Ex.: ABC1D23"
              autoComplete="off"
              icon={CarFront}
              className="uppercase shadow-xs"
              disabled={hasSelectedVehicle}
            />

            <StandartInputField
              id="quote-vehicle-color"
              name="stepOne.vehicle.color"
              label="Cor"
              placeholder="Ex.: Preto"
              autoComplete="off"
              icon={Palette}
              className="shadow-xs"
              disabled={hasSelectedVehicle}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <StandartInputField
              id="quote-vehicle-brand"
              name="stepOne.vehicle.brand"
              label="Marca"
              placeholder="Ex.: Honda"
              autoComplete="off"
              icon={CarFront}
              className="shadow-xs"
              disabled={hasSelectedVehicle}
            />

            <StandartInputField
              id="quote-vehicle-model"
              name="stepOne.vehicle.model"
              label="Modelo"
              placeholder="Ex.: Civic"
              autoComplete="off"
              icon={CarFront}
              className="shadow-xs"
              disabled={hasSelectedVehicle}
            />

            <StandartInputField
              id="quote-vehicle-year"
              name="stepOne.vehicle.year"
              label="Ano"
              maxLength={4}
              placeholder="Ex.: 2024"
              inputMode="numeric"
              autoComplete="off"
              icon={FileText}
              className="shadow-xs"
              disabled={hasSelectedVehicle}
            />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
