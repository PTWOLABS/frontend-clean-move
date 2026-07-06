import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuotesCatalogContent } from "@/features/quotes/components/quotes-mobile-cards";
import { QuotesMetrics } from "@/features/quotes/components/quotes-metrics";

import styles from "./page.module.css";

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

        <Button asChild className="h-10 w-full sm:w-auto sm:min-w-50">
          <Link href="/quotes/new">
            <Plus className="size-4" aria-hidden />
            Novo Orçamento
          </Link>
        </Button>
      </header>

      <div className={styles.quotesLayoutContainer}>
        <div className={styles.quotesLayoutGrid}>
          <div className={styles.quotesMetricsSection}>
            <QuotesMetrics />
          </div>

          <QuotesCatalogContent
            className={styles.quotesCatalogSection}
            tableClassName={styles.quotesTableOnly}
            mobileCardsClassName={styles.quotesCardsOnly}
          />
        </div>
      </div>
    </section>
  );
}
