import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Crie orçamentos com o Clean Move.",
};

export default function QuotesPage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Visão operacional dos orçamentos.</p>
        </div>

        <Button asChild className="h-11 w-full sm:w-auto sm:min-w-50">
          <Link href="/appointments?new=true">
            <Plus className="size-4" aria-hidden />
            Novo Orçamento
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="grid gap-4">
          <p>Em breve...</p>
          <p>Página em construção.</p>
        </div>
      </div>
    </section>
  );
}
