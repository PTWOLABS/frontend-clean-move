import { CarFront } from "lucide-react";

export function OnboardingHeader() {
  return (
    <header className="flex items-start gap-4">
      <CarFront className="mt-1 size-10 shrink-0 text-primary" strokeWidth={1.8} />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Bem-vindo ao <span className="text-primary">CleanMove</span>
        </h1>

        <p className="text-sm font-medium text-slate-400 sm:text-base">
          Vamos configurar sua operação para você começar a atender em poucos minutos.
        </p>
      </div>
    </header>
  );
}
