"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { CustomerVehiclesDialog } from "@/features/customer/components/customer-vehicles-dialog";
import { ApiError } from "@/shared/api/httpClient";
import { useDebounce } from "@/shared/hooks/use-debounced-value";
import { resolveCatalogSelection } from "@/shared/lib/resolve-catalog-selection";

import { useDeleteVehicle } from "../hooks/use-delete-vehicle";
import { useCustomerVehicleCounts } from "../hooks/use-customer-vehicle-counts";
import { useEstablishmentVehicles } from "../hooks/use-establishment-vehicles";
import { buildEstablishmentVehiclesFiltersFromSearch } from "../lib/build-establishment-vehicles-filters-from-search";
import { isSameVehicleItem } from "../lib/is-same-vehicle-item";
import type { VehicleDto, VehicleSearchType } from "../types";
import { VehicleCatalogDetailsPanel } from "./vehicle-catalog-details-panel";
import { VehicleCatalogHeader } from "./vehicle-catalog-header";
import { VehicleCatalogListSkeleton } from "./vehicle-catalog-list-skeleton";
import { VehicleCatalogMobileCards } from "./vehicle-catalog-mobile-cards";
import { VehicleCatalogPagination } from "./vehicle-catalog-pagination";
import { VehicleCatalogTable } from "./vehicle-catalog-table";
import { VehicleCatalogToolbar } from "./vehicle-catalog-toolbar";
import { VehicleFormSheet } from "./vehicle-form-sheet";

const PAGE_SIZE = 6;
const CUSTOMER_LOOKUP_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 350;

type VehiclesDialogCustomer = {
  id: string;
  name: string;
  count: number;
};

export function VehicleCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createParamHandledRef = useRef(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<VehicleSearchType>("name");
  const [createCustomerId, setCreateCustomerId] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
  const [vehicleFormSession, setVehicleFormSession] = useState(0);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleDto | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null);
  const [vehiclesDialogCustomer, setVehiclesDialogCustomer] =
    useState<VehiclesDialogCustomer | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const shouldOpenCreateSheet = searchParams.get("new") === "true";
  const createCustomerIdParam = searchParams.get("customerId")?.trim() ?? "";

  const removeCreateSearchParams = useCallback(() => {
    if (!searchParams.has("new") && !searchParams.has("customerId")) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("new");
    nextSearchParams.delete("customerId");
    const queryString = nextSearchParams.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

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
    setVehicleFormSession((current) => current + 1);
    setEditingVehicle(null);
    setCreateCustomerId(customerId);
    setShowCustomerPicker(false);
    setVehicleSheetOpen(true);
  }, []);

  const openCreateFormFromHeader = useCallback(() => {
    setVehicleFormSession((current) => current + 1);
    setEditingVehicle(null);
    setCreateCustomerId("");
    setShowCustomerPicker(true);
    setVehicleSheetOpen(true);
  }, []);

  useEffect(() => {
    if (!shouldOpenCreateSheet) {
      createParamHandledRef.current = false;
      return;
    }

    if (createParamHandledRef.current) return;

    createParamHandledRef.current = true;

    /* eslint-disable react-hooks/set-state-in-effect -- abre o sheet a partir de ?new=true ou ?customerId= na URL */
    if (createCustomerIdParam) {
      openCreateForm(createCustomerIdParam);
    } else {
      openCreateFormFromHeader();
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    removeCreateSearchParams();
  }, [
    createCustomerIdParam,
    openCreateForm,
    openCreateFormFromHeader,
    removeCreateSearchParams,
    shouldOpenCreateSheet,
  ]);

  const listFilters = useMemo(
    () =>
      buildEstablishmentVehiclesFiltersFromSearch(searchType, debouncedSearch, {
        page,
        size: PAGE_SIZE,
      }),
    [searchType, debouncedSearch, page],
  );

  const vehiclesQuery = useEstablishmentVehicles(listFilters);

  const deleteMutation = useDeleteVehicle();

  const { data } = vehiclesQuery;
  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const customerIds = useMemo(() => items.map((item) => item.customerId), [items]);
  const { countsByCustomerId, isLoading: isCustomerVehicleCountsLoading } =
    useCustomerVehicleCounts(customerIds);

  const handleShowAllVehicles = useCallback(
    (payload: { customerId: string; customerName: string; vehiclesCount: number }) => {
      setVehiclesDialogCustomer({
        id: payload.customerId,
        name: payload.customerName,
        count: payload.vehiclesCount,
      });
    },
    [],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayedPage = data?.page ?? page;

  const resolvedSelectedVehicle = useMemo(
    () => resolveCatalogSelection(items, selectedVehicle, isSameVehicleItem),
    [items, selectedVehicle],
  );

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
            removeCreateSearchParams();
          }
        }}
        customerId={createCustomerId}
        lockedCustomerLabel={
          createCustomerId && !showCustomerPicker ? getCustomerLabel(createCustomerId) : undefined
        }
        showCustomerPicker={showCustomerPicker}
        formSessionKey={vehicleFormSession}
        editingVehicle={editingVehicle}
      />

      <CustomerVehiclesDialog
        customerId={vehiclesDialogCustomer?.id ?? null}
        customerName={vehiclesDialogCustomer?.name ?? ""}
        vehiclesCount={vehiclesDialogCustomer?.count}
        open={vehiclesDialogCustomer !== null}
        onOpenChange={(open) => {
          if (!open) setVehiclesDialogCustomer(null);
        }}
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
            searchType={searchType}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onSearchTypeChange={(value) => {
              setSearchType(value);
              setPage(1);
            }}
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
              <div className="space-y-6">
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
                      selectedVehicle={resolvedSelectedVehicle}
                      onSelect={setSelectedVehicle}
                      getCustomerLabel={getCustomerLabel}
                      customerVehicleCounts={countsByCustomerId}
                      isCustomerVehicleCountsLoading={isCustomerVehicleCountsLoading}
                      onShowAllVehicles={handleShowAllVehicles}
                      onAddVehicle={(item) => openCreateForm(item.customerId)}
                      onEdit={(item) => {
                        setVehicleFormSession((current) => current + 1);
                        setEditingVehicle(item);
                        setShowCustomerPicker(false);
                        setVehicleSheetOpen(true);
                      }}
                      onDelete={setDeleteTarget}
                    />
                    <VehicleCatalogMobileCards
                      items={items}
                      getCustomerLabel={getCustomerLabel}
                      customerVehicleCounts={countsByCustomerId}
                      isCustomerVehicleCountsLoading={isCustomerVehicleCountsLoading}
                      onShowAllVehicles={handleShowAllVehicles}
                      onAddVehicle={(item) => openCreateForm(item.customerId)}
                      onEdit={(item) => {
                        setVehicleFormSession((current) => current + 1);
                        setEditingVehicle(item);
                        setShowCustomerPicker(false);
                        setVehicleSheetOpen(true);
                      }}
                      onDelete={setDeleteTarget}
                    />
                  </>
                )}
              </div>

              {!showListSkeleton && total > 0 ? (
                <VehicleCatalogPagination
                  page={displayedPage}
                  totalPages={totalPages}
                  total={total}
                  isFetching={vehiclesQuery.isFetching}
                  onPageChange={setPage}
                  className="mt-auto shrink-0"
                />
              ) : null}
            </div>

            <VehicleCatalogDetailsPanel
              vehicle={resolvedSelectedVehicle}
              customerLabel={
                resolvedSelectedVehicle
                  ? getCustomerLabel(resolvedSelectedVehicle.customerId)
                  : undefined
              }
              vehiclesCount={
                resolvedSelectedVehicle
                  ? countsByCustomerId.get(resolvedSelectedVehicle.customerId)
                  : undefined
              }
              isCustomerVehicleCountsLoading={isCustomerVehicleCountsLoading}
              onShowAllVehicles={handleShowAllVehicles}
              className="hidden w-full shrink-0 lg:block lg:w-80"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
