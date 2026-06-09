"use client";

import {
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleAlert,
  Store,
  UserRound,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";

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
import { cn } from "@/shared/utils/cn";

import type { OnboardingDTO } from "../types/onboarding-types";
import { useRouter } from "next/navigation";

type OnboardingSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result?: OnboardingDTO | null;
};

type SummaryItem = {
  key: keyof OnboardingDTO["onboarding"];
  label: string;
  successLabel: string;
  errorLabel: string;
  icon: LucideIcon;
};

const summaryItems: SummaryItem[] = [
  {
    key: "establishmentUpdated",
    label: "Dados do estabelecimento",
    successLabel: "Atualizados",
    errorLabel: "Não atualizados",
    icon: Store,
  },
  {
    key: "serviceCreated",
    label: "Serviço",
    successLabel: "Criado",
    errorLabel: "Não criado",
    icon: Wrench,
  },
  {
    key: "customerCreated",
    label: "Cliente",
    successLabel: "Criado",
    errorLabel: "Não criado",
    icon: UserRound,
  },
  {
    key: "vehicleCreated",
    label: "Veículo",
    successLabel: "Criado",
    errorLabel: "Não criado",
    icon: CarFront,
  },
  {
    key: "appointmentCreated",
    label: "Agendamento",
    successLabel: "Criado",
    errorLabel: "Não criado",
    icon: CalendarClock,
  },
];

export function OnboardingSummaryDialog({
  open,
  onOpenChange,
  result,
}: OnboardingSummaryDialogProps) {
  const router = useRouter();
  const completedItemsCount = summaryItems.filter((item) => result?.onboarding[item.key]).length;
  const hasErrors = completedItemsCount < summaryItems.length;

  function handleFinish() {
    onOpenChange(false);
    router.push("/dashboard");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-hidden border-border/70 bg-card/95 p-0 shadow-2xl backdrop-blur-xl sm:max-w-3xl">
        <div className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="space-y-0 px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full sm:size-14",
                    hasErrors ? "bg-destructive/10" : "bg-primary/10",
                  )}
                >
                  {hasErrors ? (
                    <CircleAlert className="size-6 text-destructive sm:size-7" />
                  ) : (
                    <CheckCircle2 className="size-6 text-primary sm:size-7" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Resumo do onboarding
                  </DialogTitle>

                  <DialogDescription className="max-w-md text-sm leading-6 text-muted-foreground">
                    Confira o que foi criado e atualizado durante a configuração inicial.
                  </DialogDescription>
                </div>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "w-fit gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  hasErrors
                    ? "border-destructive/20 bg-destructive/5 text-destructive"
                    : "border-primary/20 bg-primary/10 text-primary",
                )}
              >
                {hasErrors ? (
                  <CircleAlert className="size-3.5" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                {completedItemsCount} de {summaryItems.length} ações concluídas
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-3 px-5 pb-5 sm:px-6">
            {summaryItems.map((item) => {
              const isSuccess = Boolean(result?.onboarding[item.key]);
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className={cn(
                    "flex min-w-0 items-center gap-3 rounded-xl border bg-background/60 p-3 shadow-xs transition-colors sm:gap-4 sm:p-4",
                    isSuccess ? "border-border/70" : "border-destructive/20 bg-destructive/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg border sm:size-11",
                      isSuccess
                        ? "border-border/70 bg-muted/60 text-foreground"
                        : "border-destructive/20 bg-background text-destructive",
                    )}
                  >
                    <Icon className="size-4.5 sm:size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground sm:text-base">
                      {item.label}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex",
                      isSuccess
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-destructive/20 bg-destructive/10 text-destructive",
                    )}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="mr-1 size-3.5" />
                    ) : (
                      <XCircle className="mr-1 size-3.5" />
                    )}
                    {isSuccess ? item.successLabel : item.errorLabel}
                  </Badge>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="h-9 shrink-0 px-4 shadow-xs"
                  >
                    Ver
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6">
            <Button
              type="button"
              onClick={handleFinish}
              className="w-full shadow-xs sm:ml-auto sm:w-auto sm:min-w-36"
            >
              Concluir
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
