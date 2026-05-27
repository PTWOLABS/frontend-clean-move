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
import { ApiError } from "@/shared/api/httpClient";
import { useDebounce } from "@/shared/hooks/use-debounced-value";

import { useCustomers } from "../hooks/use-customers";
import { useCustomerVehicles } from "../hooks/use-customer-vehicles";
import { useDeleteCustomer } from "../hooks/use-delete-customer";
import type { CustomerWithPrimaryVehicle } from "../types";
import { CustomerCatalogHeader } from "./customer-catalog-header";
import { CustomerCatalogListSkeleton } from "./customer-catalog-list-skeleton";
import { CustomerCatalogMobileCards } from "./customer-catalog-mobile-cards";
import { CustomerCatalogPagination } from "./customer-catalog-pagination";
import { CustomerCatalogTable } from "./customer-catalog-table";
import { CustomerCatalogToolbar } from "./customer-catalog-toolbar";
import { CustomerFormSheet } from "./customer-form-sheet";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export function CustomerCatalog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithPrimaryVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerWithPrimaryVehicle | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const customersQuery = useCustomers({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
  });

  const deleteMutation = useDeleteCustomer();

  const { data } = customersQuery;
  const total = data?.total ?? 0;
  const customers = useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayedPage = data?.page ?? page;

  const vehicleQueries = useCustomerVehicles(customers.map((item) => item.id));

  const customersWithVehicle = useMemo(() => {
    return customers.map((customer, index) => ({
      ...customer,
      primaryVehicle: vehicleQueries[index]?.data?.vehicles?.[0] ?? null,
    }));
  }, [customers, vehicleQueries]);

  const isLoadingVehicles = vehicleQueries.some((query) => query.isLoading);
  const isErrorVehicles = vehicleQueries.some((query) => query.isError);

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

  if (isErrorVehicles) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar veículos</CardTitle>
          <CardDescription className="text-destructive/90">
            Não foi possível carregar o veículo principal de um ou mais clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => customersQuery.refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showListSkeleton = (customersQuery.isLoading && !data) || isLoadingVehicles;

  return (
    <div className="space-y-6">
      <CustomerCatalogHeader
        totalCount={total}
        onAddCustomer={() => {
          setEditingCustomer(null);
          setCustomerSheetOpen(true);
        }}
      />

      <CustomerFormSheet
        open={customerSheetOpen}
        onOpenChange={(open) => {
          setCustomerSheetOpen(open);
          if (!open) setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser anulada. O cliente{" "}
              <span className="font-medium text-foreground">{deleteTarget?.fullName ?? ""}</span> será
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || !deleteTarget?.id}
              onClick={() => {
                if (!deleteTarget?.id) return;
                deleteMutation.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              {deleteMutation.isPending ? "A confirmar..." : "Confirmar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardContent className="space-y-6 rounded-lg bg-card/80 p-4 sm:p-6">
          <CustomerCatalogToolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />

          {showListSkeleton ? (
            <CustomerCatalogListSkeleton count={PAGE_SIZE} />
          ) : customersWithVehicle.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado para os filtros atuais.
            </p>
          ) : (
            <>
              <CustomerCatalogTable
                items={customersWithVehicle}
                onEdit={(item) => {
                  setEditingCustomer(item);
                  setCustomerSheetOpen(true);
                }}
                onDelete={(item) => setDeleteTarget(item)}
              />
              <CustomerCatalogMobileCards
                items={customersWithVehicle}
                onEdit={(item) => {
                  setEditingCustomer(item);
                  setCustomerSheetOpen(true);
                }}
                onDelete={(item) => setDeleteTarget(item)}
              />
            </>
          )}

          {!showListSkeleton && total > 0 ? (
            <CustomerCatalogPagination
              page={displayedPage}
              totalPages={totalPages}
              total={total}
              isFetching={customersQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
