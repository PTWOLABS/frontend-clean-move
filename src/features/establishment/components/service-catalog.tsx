"use client";

import { useEffect, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { ApiError } from "@/shared/api/httpClient";

import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useEstablishmentServices } from "../hooks/use-establishment-services";

import { ServiceCatalogHeader } from "./service-catalog-header";
import { ServiceCatalogMobileCards } from "./service-catalog-mobile-cards";
import { ServiceCatalogToolbar, type ServiceActiveFilter } from "./service-catalog-toolbar";
import { ServiceCatalogTable } from "./service-catalog-table";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

function filterToIsActive(filter: ServiceActiveFilter): boolean | undefined {
  if (filter === "all") return undefined;
  return filter === "active";
}

export function ServiceCatalog() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const ownerId = user?.id;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ServiceActiveFilter>("all");

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    // Ao mudar filtros enviados ao servidor, a página deve voltar a 1 (evita página vazia).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronização explícita com debounce + tabs
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  const isActiveParam = filterToIsActive(activeFilter);

  const servicesQuery = useEstablishmentServices({
    ownerId: ownerId ?? "",
    enabled: Boolean(ownerId) && !userLoading,
    page,
    size: PAGE_SIZE,
    name: debouncedSearch.trim() || undefined,
    isActive: isActiveParam,
  });

  const { data, isLoading, isRefetching, isError, error, refetch } = servicesQuery;
  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!ownerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil indisponível</CardTitle>
          <CardDescription>
            Não foi possível obter o identificador da sua conta. Atualize a página ou volte a
            iniciar sessão.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError) {
    const message =
      error instanceof ApiError ? error.message : "Não foi possível carregar os serviços.";
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
          <CardDescription className="text-destructive/90">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showSkeleton = isLoading && !data;

  return (
    <div className="space-y-6">
      <ServiceCatalogHeader
        totalCount={total}
        isRefreshing={isRefetching}
        onRefresh={() => void refetch()}
      />

      <Card>
        <CardContent className="space-y-6 p-4 sm:p-6 bg-card/80 rounded-lg">
          <ServiceCatalogToolbar
            search={search}
            onSearchChange={setSearch}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
          />

          {showSkeleton ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum serviço encontrado para os filtros atuais.
            </p>
          ) : (
            <>
              <ServiceCatalogTable items={items} />
              <ServiceCatalogMobileCards items={items} />
            </>
          )}

          {!showSkeleton && total > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
                <span className="mx-2 hidden sm:inline">·</span>
                <span className="block sm:inline">{total} resultado(s)</span>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Seguinte
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
