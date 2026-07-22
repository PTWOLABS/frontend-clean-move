"use client";

import { useId, useState } from "react";
import { CalendarClock, Check, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePickerTime } from "@/components/ui/calendar/date-picker-time";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { cn } from "@/shared/utils/cn";

import { getQuoteVehicleLabel } from "../../lib/utils";
import type { QuoteListItemDto } from "../../types/quotes";

export type QuoteApprovalScheduleValues = {
  startsAt: string;
  endsAt?: string | null;
};

type QuoteApprovalScheduleDialogProps = {
  quote: QuoteListItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: (values: QuoteApprovalScheduleValues) => void;
};

export function QuoteApprovalScheduleDialog({
  quote,
  open,
  onOpenChange,
  onContinue,
}: QuoteApprovalScheduleDialogProps) {
  const startsAtId = useId();
  const endsAtId = useId();
  const [startsAt, setStartsAt] = useState<Date | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const canContinue = Boolean(startsAt);

  function handleContinue() {
    if (!startsAt) return;

    onContinue?.({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-xl border-border p-0 shadow-xl sm:max-w-lg">
        <div className="border-b border-border bg-muted/20 px-5 py-5 sm:px-6">
          <DialogHeader className="text-left">
            <div className="mb-3 flex items-center justify-between gap-3 pr-8">
              <span className="flex size-11 items-center justify-center rounded-xl border border-success/25 bg-success-soft text-success-soft-foreground">
                <CalendarClock className="size-5" aria-hidden="true" />
              </span>
              <Badge variant="outline" className="bg-background text-[11px] text-muted-foreground">
                Aprovação
              </Badge>
            </div>
            <DialogTitle className="text-xl">Aprovar e agendar</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Defina quando o orçamento de {quote.customerName} deve entrar na agenda.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {quote.customerName}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {getQuoteVehicleLabel(quote)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatBrlFromCents(quote.totalInCents)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={startsAtId}>
              Início do agendamento
              <span aria-hidden="true" className="ml-1 text-destructive">
                *
              </span>
            </Label>
            <DatePickerTime
              id={startsAtId}
              value={startsAt}
              onChange={setStartsAt}
              placeholder="Selecione data e horário"
              aria-describedby={`${startsAtId}-description`}
            />
            <p id={`${startsAtId}-description`} className="text-xs text-muted-foreground">
              Essa data será usada na análise antes da aprovação.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex min-h-7 items-center justify-between gap-3">
              <Label htmlFor={endsAtId}>Término do agendamento</Label>
              {endsAt ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 border-border/70 bg-background/60 px-2.5 text-xs text-muted-foreground shadow-xs"
                  onClick={() => setEndsAt(null)}
                >
                  Limpar
                </Button>
              ) : null}
            </div>
            <DatePickerTime
              id={endsAtId}
              value={endsAt}
              onChange={setEndsAt}
              placeholder="Opcional"
              aria-describedby={`${endsAtId}-description`}
            />
            <p id={`${endsAtId}-description`} className="text-xs text-muted-foreground">
              Informe apenas se já souber o horário previsto de término.
            </p>
          </div>

          <div
            className={cn(
              "flex gap-3 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground",
              canContinue && "border-success/25 bg-success-soft/35 text-success-soft-foreground",
            )}
          >
            <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              {canContinue
                ? "Data definida. Na próxima etapa vamos analisar possíveis pendências."
                : "Escolha a data de início para avançar."}
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/15 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={!canContinue} onClick={handleContinue}>
            <Check aria-hidden="true" />
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
