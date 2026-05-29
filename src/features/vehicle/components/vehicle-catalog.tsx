"use client";

import { useCallback, useMemo, useState } from "react";

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
import { useListCustomerOptions } from "@/features/appointments/hooks/queries/use-list-customer-options";
import { ApiError } from "@/shared/api/httpClient";
import { useDebounce } from "@/shared/hooks/use-debounced-value";

import { useDeleteVehicle } from "../hooks/use-delete-vehicle";
import { useEstablishmentVehicles } from "../hooks/use-establishment-vehicles";
import type { VehicleDto } from "../types";
import { VehicleCatalogHeader } from "./vehicle-catalog-header";
import { VehicleCatalogListSkeleton } from "./vehicle-catalog-list-skeleton";
import { VehicleCatalogMobileCards } from "./vehicle-catalog-mobile-cards";
import { VehicleCatalogPagination } from "./vehicle-catalog-pagination";
import { VehicleCatalogTable } from "./vehicle-catalog-table";
import { VehicleCatalogToolbar } from "./vehicle-catalog-toolbar";
import { VehicleFormSheet } from "./vehicle-form-sheet";

const PAGE_SIZE = 10;
const CUSTOMER_LOOKUP_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 350;

export function VehicleCatalog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createCustomerId, setCreateCustomerId] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleDto | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const { data: customerLookupOptions } = useListCustomerOptions({
    limit: CUSTOMER_LOOKUP_LIMIT,
  });

  const customerLabelById = useMemo(() => {
    const map = new Map<string, string>();

    for (const option of customerLookupOptions?.customers ?? []) {
      map.set(option.id, option.label);
    }

    return map;
  }, [customerLookupOptions]);

  const getCustomerLabel = useCallback(
    (customerId: string) => customerLabelById.get(customerId),
    [customerLabelById],
  );

  const openCreateForm = useCallback((customerId: string) => {
    setEditingVehicle(null);
    setCreateCustomerId(customerId);
    setShowCustomerPicker(false);
    setVehicleSheetOpen(true);
  }, []);

  const openCreateFormFromHeader = useCallback(() => {
    setEditingVehicle(null);
    setCreateCustomerId("");
    setShowCustomerPicker(true);
    setVehicleSheetOpen(true);
  }, []);

  const vehiclesQuery = useEstablishmentVehicles({
    page,
    size: PAGE_SIZE,
    name: debouncedSearch.trim() || undefined,
  });

  const deleteMutation = useDeleteVehicle();

  const { data } = vehiclesQuery;
  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayedPage = data?.page ?? page;

  const showListSkeleton = vehiclesQuery.isLoading && !data;
  const showVehiclesError = vehiclesQuery.isError;

  if (showVehiclesError) {
    const message =
      vehiclesQuery.error instanceof ApiError
        ? vehiclesQuery.error.message
        : "Não foi possível carregar os veículos.";

    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar veículos</CardTitle>
          <CardDescription className="text-destructive/90">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => vehiclesQuery.refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <VehicleCatalogHeader totalCount={total} onAddVehicle={openCreateFormFromHeader} />

      <VehicleFormSheet
        open={vehicleSheetOpen}
        onOpenChange={(open) => {
          setVehicleSheetOpen(open);
          if (!open) {
            setEditingVehicle(null);
            setCreateCustomerId("");
            setShowCustomerPicker(false);
          }
        }}
        customerId={createCustomerId}
        showCustomerPicker={showCustomerPicker}
        editingVehicle={editingVehicle}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser anulada. O veículo com placa{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.plate?.trim() || "sem placa"}
              </span>{" "}
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || !deleteTarget}
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(
                  { customerId: deleteTarget.customerId, vehicleId: deleteTarget.id },
                  { onSuccess: () => setDeleteTarget(null) },
                );
              }}
            >
              {deleteMutation.isPending ? "A apagar..." : "Apagar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardContent className="space-y-6 rounded-lg bg-card/80 p-4 sm:p-6">
          <VehicleCatalogToolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />

          {showListSkeleton ? (
            <VehicleCatalogListSkeleton count={PAGE_SIZE} />
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum veículo encontrado para os filtros atuais.
            </p>
          ) : (
            <>
              <VehicleCatalogTable
                items={items}
                getCustomerLabel={getCustomerLabel}
                onAddVehicle={(item) => openCreateForm(item.customerId)}
                onEdit={(item) => {
                  setEditingVehicle(item);
                  setShowCustomerPicker(false);
                  setVehicleSheetOpen(true);
                }}
                onDelete={setDeleteTarget}
              />
              <VehicleCatalogMobileCards
                items={items}
                getCustomerLabel={getCustomerLabel}
                onAddVehicle={(item) => openCreateForm(item.customerId)}
                onEdit={(item) => {
                  setEditingVehicle(item);
                  setShowCustomerPicker(false);
                  setVehicleSheetOpen(true);
                }}
                onDelete={setDeleteTarget}
              />
            </>
          )}

          {!showListSkeleton && total > 0 ? (
            <VehicleCatalogPagination
              page={displayedPage}
              totalPages={totalPages}
              total={total}
              isFetching={vehiclesQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
