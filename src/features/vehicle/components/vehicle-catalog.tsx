"use client";

import { useMemo, useState } from "react";

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
import { useCustomers } from "@/features/customer/hooks/use-customers";
import { ApiError } from "@/shared/api/httpClient";
import { useDebounce } from "@/shared/hooks/use-debounced-value";

import { useDeleteVehicle } from "../hooks/use-delete-vehicle";
import { useVehicles } from "../hooks/use-vehicles";
import type { VehicleDto } from "../types";
import { VehicleCatalogHeader } from "./vehicle-catalog-header";
import { VehicleCatalogListSkeleton } from "./vehicle-catalog-list-skeleton";
import { VehicleCatalogMobileCards } from "./vehicle-catalog-mobile-cards";
import { VehicleCatalogPagination } from "./vehicle-catalog-pagination";
import { VehicleCatalogTable } from "./vehicle-catalog-table";
import { VehicleCatalogToolbar } from "./vehicle-catalog-toolbar";
import { VehicleFormSheet } from "./vehicle-form-sheet";

const PAGE_SIZE = 10;
const CUSTOMER_SEARCH_DEBOUNCE_MS = 350;
const CUSTOMER_LIST_SIZE = 50;

export function VehicleCatalog() {
  const [page, setPage] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleDto | null>(null);

  const debouncedCustomerSearch = useDebounce(customerSearch, CUSTOMER_SEARCH_DEBOUNCE_MS);

  const customersQuery = useCustomers({
    page: 1,
    size: CUSTOMER_LIST_SIZE,
    search: debouncedCustomerSearch.trim() || undefined,
  });

  const customers = useMemo(() => customersQuery.data?.items ?? [], [customersQuery.data?.items]);

  const vehiclesQuery = useVehicles({
    customerId: selectedCustomerId,
    page,
    size: PAGE_SIZE,
    enabled: Boolean(selectedCustomerId),
  });

  const deleteMutation = useDeleteVehicle();

  const { data } = vehiclesQuery;
  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayedPage = data?.page ?? page;
  const hasCustomerSelected = Boolean(selectedCustomerId);

  if (customersQuery.isError) {
    const message =
      customersQuery.error instanceof ApiError
        ? customersQuery.error.message
        : "Não foi possível carregar os clientes.";

    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
          <CardDescription className="text-destructive/90">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => customersQuery.refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showListSkeleton = hasCustomerSelected && vehiclesQuery.isLoading && !data;
  const showVehiclesError = hasCustomerSelected && vehiclesQuery.isError;

  return (
    <div className="space-y-6">
      <VehicleCatalogHeader
        totalCount={hasCustomerSelected ? total : 0}
        hasCustomerSelected={hasCustomerSelected}
        onAddVehicle={() => {
          setEditingVehicle(null);
          setVehicleSheetOpen(true);
        }}
      />

      <VehicleFormSheet
        open={vehicleSheetOpen}
        onOpenChange={(open) => {
          setVehicleSheetOpen(open);
          if (!open) setEditingVehicle(null);
        }}
        customerId={selectedCustomerId}
        editingVehicle={editingVehicle}
      />

      <VehicleCatalogToolbar
        customerSearch={customerSearch}
        onCustomerSearchChange={setCustomerSearch}
        selectedCustomerId={selectedCustomerId}
        onCustomerSelect={(customerId) => {
          setSelectedCustomerId(customerId);
          setPage(1);
        }}
        customers={customers}
        isLoadingCustomers={customersQuery.isLoading}
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
                if (!deleteTarget || !selectedCustomerId) return;
                deleteMutation.mutate(
                  { customerId: selectedCustomerId, vehicleId: deleteTarget.id },
                  { onSuccess: () => setDeleteTarget(null) },
                );
              }}
            >
              {deleteMutation.isPending ? "A apagar..." : "Apagar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!hasCustomerSelected ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Selecione um cliente para ver os veículos.
          </CardContent>
        </Card>
      ) : showVehiclesError ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar veículos</CardTitle>
            <CardDescription className="text-destructive/90">
              {vehiclesQuery.error instanceof ApiError
                ? vehiclesQuery.error.message
                : "Não foi possível carregar os veículos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" onClick={() => vehiclesQuery.refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : showListSkeleton ? (
        <VehicleCatalogListSkeleton />
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum veículo cadastrado para este cliente.
          </CardContent>
        </Card>
      ) : (
        <>
          <VehicleCatalogTable
            items={items}
            onEdit={(item) => {
              setEditingVehicle(item);
              setVehicleSheetOpen(true);
            }}
            onDelete={setDeleteTarget}
          />
          <VehicleCatalogMobileCards
            items={items}
            onEdit={(item) => {
              setEditingVehicle(item);
              setVehicleSheetOpen(true);
            }}
            onDelete={setDeleteTarget}
          />
          {totalPages > 1 || total > PAGE_SIZE ? (
            <VehicleCatalogPagination
              page={displayedPage}
              totalPages={totalPages}
              total={total}
              isFetching={vehiclesQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
