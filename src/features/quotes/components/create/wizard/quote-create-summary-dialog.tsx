"use client";

import {
  BadgeDollarSign,
  CarFront,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { cn } from "@/shared/utils/cn";

import { QUOTE_CREATE_FORM_ID } from "../../../constants/quote-wizard";
import type { CreateQuoteFormInput } from "../../../types/create-quote";
import { buildVehicleDisplayName } from "@/features/vehicle/lib/format-vehicle-catalog";
import {
  getContactLabel,
  getCustomerDescription,
  getDisplayValue,
  getPaymentDetails,
  getPaymentDiscountInCents,
  getServiceLabel,
  getServicesTotalInCents,
  getVehicleDescription,
} from "@/features/quotes/lib/quote-summary-helpers";

type QuoteCreateSummaryDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  stepOne: CreateQuoteFormInput["stepOne"];
  stepTwo: CreateQuoteFormInput["stepTwo"];
  stepThree: CreateQuoteFormInput["stepThree"];
  onOpenChange: (open: boolean) => void;
};

export function QuoteCreateSummaryDialog({
  open,
  isSubmitting,
  stepOne,
  stepTwo,
  stepThree,
  onOpenChange,
}: QuoteCreateSummaryDialogProps) {
  const servicesTotalInCents = getServicesTotalInCents(stepTwo.services);
  const servicesCount = stepTwo.services.length;
  const paymentOptionsCount = stepThree.paymentOptions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[92dvh] w-[calc(100vw-2rem)] min-w-0 overflow-hidden p-0",
          "border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl",
          "sm:max-w-2xl md:max-w-3xl",
        )}
      >
        <div className="flex max-h-[92dvh] min-w-0 flex-col">
          <DialogHeader className="border-b border-border/70 px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3 overflow-hidden sm:gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-14">
                  <ClipboardList aria-hidden className="size-5 sm:size-7" />
                </div>

                <div className="min-w-0 max-w-full space-y-1 overflow-hidden">
                  <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Resumo do orçamento
                  </DialogTitle>

                  <DialogDescription className="line-clamp-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Confira cliente, veículo, serviços e pagamento antes de confirmar a criação.
                  </DialogDescription>
                </div>
              </div>

              <Badge
                variant="outline"
                className="w-fit shrink-0 gap-1.5 rounded-full border-success/25 bg-success/10 px-3 py-1 text-xs font-medium text-success"
              >
                <CheckCircle2 aria-hidden className="size-3.5" />
                Pronto para confirmar
              </Badge>
            </div>
          </DialogHeader>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-4">
              <SummarySection
                icon={UserRound}
                title="Cliente"
                description={getCustomerDescription(stepOne)}
              >
                <SummaryGrid>
                  <SummaryField label="Nome" value={getDisplayValue(stepOne.customer.name)} />
                  <SummaryField label="Contato" value={getContactLabel(stepOne.customer)} />
                  <SummaryField
                    label="Documento"
                    value={getDisplayValue(stepOne.customer.cpfCnpj)}
                  />
                </SummaryGrid>
              </SummarySection>

              <SummarySection
                icon={CarFront}
                title="Veículo"
                description={getVehicleDescription(stepOne)}
              >
                <SummaryGrid>
                  <SummaryField
                    label="Marca/Modelo"
                    value={buildVehicleDisplayName({
                      brand:
                        typeof stepOne.vehicle.brand === "string" ? stepOne.vehicle.brand : null,
                      model:
                        typeof stepOne.vehicle.model === "string" ? stepOne.vehicle.model : null,
                    })}
                  />
                  <SummaryField label="Placa" value={getDisplayValue(stepOne.vehicle.plate)} />
                  <SummaryField label="Ano" value={getDisplayValue(stepOne.vehicle.year)} />
                </SummaryGrid>
              </SummarySection>

              <SummarySection
                icon={Wrench}
                title="Serviços"
                description={`${servicesCount} ${servicesCount === 1 ? "serviço" : "serviços"} no orçamento.`}
                aside={formatBrlFromCents(servicesTotalInCents)}
              >
                <div className="space-y-2">
                  {stepTwo.services.map((service, index) => (
                    <div
                      key={`${service.serviceId ?? service.serviceName ?? "service"}-${index}`}
                      className="flex min-w-0 flex-col gap-2 rounded-xl border border-border/70 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 max-w-full overflow-hidden">
                        <p className="max-w-full truncate text-sm font-semibold text-foreground">
                          {getServiceLabel(service)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {service.isCourtesy ? "Cortesia" : "Serviço cobrado"}
                        </p>
                      </div>

                      <p
                        className={cn(
                          "max-w-full shrink-0 truncate text-sm font-semibold text-foreground",
                          service.isCourtesy &&
                            "text-muted-foreground line-through decoration-2",
                        )}
                      >
                        {formatBrlFromCents(service.priceInCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </SummarySection>

              <SummarySection
                icon={CreditCard}
                title="Pagamento"
                description={`${paymentOptionsCount} ${paymentOptionsCount === 1 ? "condição" : "condições"} de pagamento.`}
              >
                <div className="space-y-2">
                  {stepThree.paymentOptions.map((paymentOption, index) => {
                    const discountInCents = getPaymentDiscountInCents(
                      paymentOption,
                      servicesTotalInCents,
                    );
                    const finalTotalInCents = Math.max(servicesTotalInCents - discountInCents, 0);

                    return (
                      <div
                        key={`${paymentOption.method}-${paymentOption.label}-${index}`}
                        className="min-w-0 rounded-xl border border-border/70 bg-background/60 p-3"
                      >
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 max-w-full overflow-hidden">
                            <p className="max-w-full truncate text-sm font-semibold text-foreground">
                              {paymentOption.label}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {getPaymentDetails(paymentOption)}
                            </p>
                          </div>

                          <BadgeDollarSign
                            aria-hidden
                            className="hidden size-5 shrink-0 text-primary sm:block"
                          />
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <SummaryMetric
                            label="Total"
                            value={formatBrlFromCents(servicesTotalInCents)}
                          />
                          <SummaryMetric
                            label="Desconto"
                            infoLabel={
                              paymentOption.discountType === "PERCENTAGE"
                                ? `${paymentOption.discountValue}%`
                                : undefined
                            }
                            infoClassName="w-fit shrink-0 rounded-full border-border/70 bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                            value={
                              discountInCents > 0
                                ? `-${formatBrlFromCents(discountInCents)}`
                                : "Sem desconto"
                            }
                          />
                          <SummaryMetric
                            label="Final"
                            value={formatBrlFromCents(finalTotalInCents)}
                            highlighted
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SummarySection>
            </div>
          </div>

          <DialogFooter className="min-w-0 gap-2 border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="h-10 min-w-0 w-full shadow-xs sm:w-auto"
            >
              Voltar e editar
            </Button>

            <Button
              type="submit"
              form={QUOTE_CREATE_FORM_ID}
              disabled={isSubmitting}
              className="h-10 min-w-0 w-full shadow-xs sm:w-auto sm:min-w-40"
            >
              Confirmar orçamento
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummarySection({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-background/55 p-4 shadow-xs">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 overflow-hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-foreground">
            <Icon aria-hidden className="size-5" />
          </div>

          <div className="min-w-0 max-w-full overflow-hidden">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{title}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">
              {description}
            </p>
          </div>
        </div>

        {aside ? (
          <Badge
            variant="outline"
            className="max-w-full truncate rounded-full px-3 py-1 text-xs font-semibold sm:w-fit"
          >
            {aside}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function SummaryGrid({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-3 sm:grid-cols-3">{children}</div>;
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card/45 px-3 py-2.5">
      <p className="truncate text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 max-w-full truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  highlighted,
  infoLabel,
  infoClassName,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  infoLabel?: string;
  infoClassName?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border px-3 py-2.5",
        highlighted
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border/70 bg-card/45 text-foreground",
      )}
    >
      <div className="flex items-center gap-2 justify-between">
        <p className="truncate text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
        {infoLabel && <Badge className={cn("max-h-5 self-end", infoClassName)}>{infoLabel}</Badge>}
      </div>
      <p className="mt-1 max-w-full truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
