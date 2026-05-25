"use client";

import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { ApiError } from "@/shared/api/httpClient";

import { useDebounce } from "@/shared/hooks/use-debounced-value";
import { useDeleteService } from "../hooks/use-delete-service";
import { useServices } from "../hooks/use-services";
import { useToggleServiceActive } from "../hooks/use-toggle-service-active";
import type { ServiceItem } from "../types";

import { ServiceCatalogHeader } from "./service-catalog-header";
import { ServiceCatalogListSkeleton } from "./service-catalog-list-skeleton";
import { ServiceCatalogMobileCards } from "./service-catalog-mobile-cards";
import { ServiceCatalogPagination } from "./service-catalog-pagination";
import { ServiceCatalogToolbar, type ServiceActiveFilter } from "./service-catalog-toolbar";
import { ServiceCatalogTable } from "./service-catalog-table";
import { ServiceFormSheet } from "./service-form-sheet";

const PAGE_SIZE = 5;
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

  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  const deleteMutation = useDeleteService();
  const toggleActiveMutation = useToggleServiceActive();

  const togglingServiceId =
    toggleActiveMutation.isPending && toggleActiveMutation.variables?.id
      ? toggleActiveMutation.variables.id
      : null;

  const handleToggleActive = (item: ServiceItem) => {
    void toggleActiveMutation.mutateAsync(item).catch(() => {
      // Erro tratado em `useToggleServiceActive` (toast).
    });
  };

  // Debounce alinhado ao query param `name` (match parcial, case-insensitive no backend).
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    // Ao mudar filtros enviados ao servidor, a página deve voltar a 1 (evita página vazia).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronização explícita com debounce + tabs
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  const isActiveParam = filterToIsActive(activeFilter);

  const servicesQuery = useServices({
    ownerId: ownerId ?? "",
    enabled: Boolean(ownerId) && !userLoading,
    page,
    size: PAGE_SIZE,
    name: debouncedSearch.trim() || undefined,
    isActive: isActiveParam,
  });

  const { data, isLoading, isFetching, isError, error, refetch } = servicesQuery;
  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  /** Página alinhada aos dados mostrados (com `keepPreviousData` evita desincronizar lista vs paginação). */
  const displayedPage = data?.page ?? page;

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

  const showListSkeleton = isLoading && !data;

  const handleServiceSheetOpenChange = (open: boolean) => {
    setServiceSheetOpen(open);
    if (!open) {
      setEditingService(null);
      setDuplicateSource(null);
    }
  };

  const handleDuplicate = (item: ServiceItem) => {
    setDuplicateSource(item);
    setEditingService(null);
    setServiceSheetOpen(true);
  };

  const handleConfirmDelete = () => {
    const id = deleteTarget?.id;
    if (!id) return;
    setDeleteTarget(null);
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <ServiceCatalogHeader
        totalCount={total}
        onAddService={() => {
          setEditingService(null);
          setDuplicateSource(null);
          setServiceSheetOpen(true);
        }}
      />

      <ServiceFormSheet
        open={serviceSheetOpen}
        onOpenChange={handleServiceSheetOpenChange}
        editingService={editingService}
        duplicateSource={duplicateSource}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser anulada. O serviço{" "}
              <span className="font-medium text-foreground">{deleteTarget?.serviceName ?? ""}</span>{" "}
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || !deleteTarget?.id}
              onClick={() => void handleConfirmDelete()}
            >
              {deleteMutation.isPending ? "A confirmar…" : "Confirmar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardContent className="space-y-6 p-4 sm:p-6 bg-card/80 rounded-lg">
          <ServiceCatalogToolbar
            search={search}
            onSearchChange={setSearch}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
          />

          {showListSkeleton ? (
            <ServiceCatalogListSkeleton count={PAGE_SIZE} />
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum serviço encontrado para os filtros atuais.
            </p>
          ) : (
            <>
              <ServiceCatalogTable
                items={items}
                onEdit={(item) => {
                  setDuplicateSource(null);
                  setEditingService(item);
                  setServiceSheetOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onToggleActive={handleToggleActive}
                onDelete={(item) => setDeleteTarget(item)}
                togglingServiceId={togglingServiceId}
              />
              <ServiceCatalogMobileCards
                items={items}
                onEdit={(item) => {
                  setDuplicateSource(null);
                  setEditingService(item);
                  setServiceSheetOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onToggleActive={handleToggleActive}
                onDelete={(item) => setDeleteTarget(item)}
                togglingServiceId={togglingServiceId}
              />
            </>
          )}

          {!showListSkeleton && total > 0 ? (
            <ServiceCatalogPagination
              page={displayedPage}
              totalPages={totalPages}
              total={total}
              isFetching={isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
