"use client";

import { Banknote, CreditCard, QrCode, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form/field";
import { WizardStepHeader } from "@/shared/components/wizard-step-header";
import { cn } from "@/shared/utils/cn";

import { useQuotePaymentStep } from "../../../hooks/use-quote-payment-step";
import { QuotePaymentOptionCard } from "./quote-payment-option-card";

type QuotePaymentStepProps = {
  title: string;
  description: string;
  className?: string;
};

const quickPaymentOptions = [
  { method: "CASH", label: "Dinheiro", icon: Banknote },
  { method: "PIX", label: "Pix", icon: QrCode },
  { method: "CARD", label: "Cartão", icon: CreditCard },
  { method: "OTHER", label: "Outro", icon: WalletCards },
] as const;

export function QuotePaymentStep({ title, description, className }: QuotePaymentStepProps) {
  const {
    addPaymentOption,
    control,
    handleDiscountTypeChange,
    handlePaymentMethodChange,
    paymentOptionRows,
    removePaymentOption,
  } = useQuotePaymentStep();

  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <WizardStepHeader title={title} description={description} icon={CreditCard} />

      <CardContent className="space-y-6">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Adicionar pagamento</h3>
            <p className="text-xs text-muted-foreground">
              Defina as formas que poderão ser apresentadas ao cliente neste orçamento.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {quickPaymentOptions.map(({ method, label, icon: Icon }) => (
              <Button
                key={method}
                type="button"
                variant="outline"
                onClick={() => addPaymentOption(method)}
                className="justify-start"
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Button>
            ))}
          </div>

          <FormField control={control} name="stepThree.paymentOptions" renderControl={false}>
            {() => null}
          </FormField>
        </section>

        <section className="space-y-4" aria-label="Formas de pagamento do orçamento">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Condições de pagamento</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajuste descrição, parcelas, juros e descontos antes de finalizar.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/55 px-3 py-2 text-sm">
              <WalletCards aria-hidden className="size-4 text-primary" />
              <span className="text-muted-foreground">Opções</span>
              <p className="font-semibold text-foreground">{paymentOptionRows.length}</p>
            </div>
          </div>

          {paymentOptionRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-background/45 p-6 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard aria-hidden className="size-5" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-foreground">
                Nenhuma forma de pagamento adicionada
              </h4>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Adicione pelo menos uma condição de pagamento para continuar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentOptionRows.map(({ fieldId, index, paymentOption }) => (
                <QuotePaymentOptionCard
                  key={fieldId}
                  control={control}
                  discountType={paymentOption?.discountType ?? null}
                  index={index}
                  isCardPayment={paymentOption?.method === "CARD"}
                  method={paymentOption?.method ?? "CASH"}
                  onDiscountTypeChange={handleDiscountTypeChange}
                  onMethodChange={handlePaymentMethodChange}
                  onRemove={removePaymentOption}
                />
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
