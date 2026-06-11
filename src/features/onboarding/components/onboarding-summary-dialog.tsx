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
import { useRouter } from "@bprogress/next";

type OnboardingSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result?: OnboardingDTO | null;
};

type SummaryItem = {
  key: keyof OnboardingDTO["onboarding"];
  label: string;
  description: string;
  successLabel: string;
  errorLabel: string;
  href: string;
  resource: string;
  missingActionLabel: string;
  icon: LucideIcon;
};

const summaryItems: SummaryItem[] = [
  {
    key: "establishmentUpdated",
    label: "Dados do estabelecimento",
    description: "Informações principais do negócio.",
    successLabel: "Atualizados",
    errorLabel: "Não atualizados",
    href: "/settings",
    resource: "establishment",
    missingActionLabel: "Completar",
    icon: Store,
  },
  {
    key: "serviceCreated",
    label: "Serviço",
    description: "Serviço inicial para começar a vender.",
    successLabel: "Criado",
    errorLabel: "Não criado",
    href: "/services",
    resource: "service",
    missingActionLabel: "Criar",
    icon: Wrench,
  },
  {
    key: "customerCreated",
    label: "Cliente",
    description: "Primeiro cliente.",
    successLabel: "Criado",
    errorLabel: "Não criado",
    href: "/customers",
    resource: "customer",
    missingActionLabel: "Criar",
    icon: UserRound,
  },
  {
    key: "vehicleCreated",
    label: "Veículo",
    description: "Veículo vinculado ao cliente.",
    successLabel: "Criado",
    errorLabel: "Não criado",
    href: "/vehicles",
    resource: "vehicle",
    missingActionLabel: "Criar",
    icon: CarFront,
  },
  {
    key: "appointmentCreated",
    label: "Agendamento",
    description: "Primeiro agendamento do sistema.",
    successLabel: "Criado",
    errorLabel: "Não criado",
    href: "/appointments",
    resource: "appointment",
    missingActionLabel: "Agendar",
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

  function handleResourceAction(item: SummaryItem, isSuccess: boolean) {
    const searchParams = new URLSearchParams({
      onboardingResource: item.resource,
      onboardingStatus: isSuccess ? "created" : "pending",
    });

    onOpenChange(false);
    router.push(`${item.href}?${searchParams.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={cn(
          "max-h-[92dvh] w-[calc(100vw-2rem)] overflow-hidden p-0",
          "border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl",
          "sm:max-w-2xl md:max-w-3xl",
        )}
      >
        <div className="flex max-h-[92dvh] flex-col">
          <DialogHeader className="border-b border-border/70 px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full sm:size-14",
                    hasErrors
                      ? "bg-destructive/10 text-destructive ring-1 ring-destructive/15"
                      : "bg-success/10 text-success ring-1 ring-success/15",
                  )}
                >
                  {hasErrors ? (
                    <CircleAlert className="size-5 sm:size-7" />
                  ) : (
                    <CheckCircle2 className="size-5 sm:size-7" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Resumo do onboarding
                  </DialogTitle>

                  <DialogDescription className="max-w-md text-pretty text-sm leading-6 text-muted-foreground">
                    Confira o que foi criado e atualizado durante a configuração inicial.
                  </DialogDescription>
                </div>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "w-fit shrink-0 gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  hasErrors
                    ? "border-destructive/25 bg-destructive/10 text-destructive"
                    : "border-success/25 bg-success/10 text-success",
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

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-3">
              {summaryItems.map((item) => {
                const isSuccess = Boolean(result?.onboarding[item.key]);
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className={cn(
                      "group rounded-2xl border p-4 shadow-xs transition-colors",
                      "bg-background/60 hover:bg-background/80",
                      isSuccess ? "border-border/70" : "border-destructive/25 bg-destructive/5",
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <div
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                            isSuccess
                              ? "border-border/70 bg-muted/60 text-foreground"
                              : "border-destructive/25 bg-background text-destructive",
                          )}
                        >
                          <Icon className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold leading-5 text-foreground sm:text-base">
                              {item.label}
                            </p>

                            <Badge
                              variant="outline"
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium sm:hidden",
                                isSuccess
                                  ? "border-success/20 bg-success/10 text-success"
                                  : "border-destructive/20 bg-destructive/10 text-destructive",
                              )}
                            >
                              {isSuccess ? (
                                <CheckCircle2 className="mr-1 size-3" />
                              ) : (
                                <XCircle className="mr-1 size-3" />
                              )}
                              {isSuccess ? item.successLabel : item.errorLabel}
                            </Badge>
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
                        <Badge
                          variant="outline"
                          className={cn(
                            "hidden h-7 shrink-0 rounded-full px-2.5 text-xs font-medium sm:inline-flex",
                            isSuccess
                              ? "border-success/20 bg-success/10 text-success"
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
                          variant={isSuccess ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => handleResourceAction(item, isSuccess)}
                          className={cn(
                            "h-10 min-w-28 flex-1 px-4 shadow-xs sm:flex-none",
                            !isSuccess && "bg-secondary hover:bg-secondary/80",
                          )}
                        >
                          {isSuccess ? "Ver" : item.missingActionLabel}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6">
            <Button
              type="button"
              onClick={handleFinish}
              className="h-10 w-full shadow-xs sm:ml-auto sm:w-auto sm:min-w-36"
            >
              Concluir
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
