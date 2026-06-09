"use client";

import { CarFront, Info, Mail, Palette, Phone, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form/input-field";
import { cn } from "@/shared/utils/cn";

type CustomerAndVehicleStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function CustomerAndVehicleStep({
  title,
  description,
  className,
}: CustomerAndVehicleStepProps) {
  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <CardHeader className="pb-6">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <UserRound aria-hidden className="size-5" strokeWidth={2.2} />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </CardTitle>

            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <section className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Cliente</h3>

            <p className="text-xs text-muted-foreground">
              Informe os dados básicos do primeiro cliente.
            </p>
          </div>

          <InputField
            id="onboarding-customer-full-name"
            name="customerFullName"
            label="Nome completo"
            placeholder="Ex.: João da Silva"
            autoComplete="name"
            icon={
              <UserRound
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />
            }
            className="h-12 rounded-xl bg-background/60 pl-12 text-sm shadow-none"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              id="onboarding-customer-phone"
              name="customerPhone"
              label="Telefone"
              placeholder="(11) 99999-9999"
              mask="(__) _____-____"
              inputMode="tel"
              autoComplete="tel"
              icon={
                <Phone
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                />
              }
              className="h-12 rounded-xl bg-background/60 pl-12 text-sm shadow-none"
            />

            <InputField
              id="onboarding-customer-email"
              name="customerEmail"
              label="E-mail"
              type="email"
              placeholder="cliente@email.com"
              autoComplete="email"
              icon={
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                />
              }
              className="h-12 rounded-xl bg-background/60 pl-12 text-sm shadow-none"
            />
          </div>
        </section>

        <div className="h-px bg-border" />

        <section className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Veículo</h3>

            <p className="text-xs text-muted-foreground">
              Vincule um veículo para simular o primeiro atendimento.
            </p>
          </div>

          <InputField
            id="onboarding-vehicle-plate"
            name="vehiclePlate"
            label="Placa"
            maxLength={7}
            placeholder="Ex.: ABC1D23"
            autoComplete="off"
            icon={
              <CarFront
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />
            }
            className="h-12 rounded-xl bg-background/60 pl-12 text-sm uppercase shadow-none"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              id="onboarding-vehicle-model"
              name="vehicleModel"
              label="Marca/Modelo"
              placeholder="Ex.: Honda Civic"
              autoComplete="off"
              icon={
                <CarFront
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                />
              }
              className="h-12 rounded-xl bg-background/60 pl-12 text-sm shadow-none"
            />

            <InputField
              id="onboarding-vehicle-color"
              name="vehicleColor"
              label="Cor"
              placeholder="Ex.: Preto"
              autoComplete="off"
              icon={
                <Palette
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                />
              }
              className="h-12 rounded-xl bg-background/60 pl-12 text-sm shadow-none"
            />
          </div>
        </section>
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" /> Você poderá
          complementar o cadastro do cliente e do veículo depois.
        </div>
      </CardContent>
    </Card>
  );
}
