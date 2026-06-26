import { CatalogPagination } from "@/shared/components/catalog-pagination";

type ServiceCatalogPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  /** Enquanto a query está a buscar (ex.: mudança de página), mostra spinner e bloqueia os botões. */
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
};

export function ServiceCatalogPagination({
  page,
  totalPages,
  total,
  isFetching = false,
  onPageChange,
  className,
}: ServiceCatalogPaginationProps) {
  return (
    <CatalogPagination
      page={page}
      totalPages={totalPages}
      total={total}
      itemLabel={{ singular: "serviço", plural: "serviços" }}
      isFetching={isFetching}
      onPageChange={onPageChange}
      className={className}
    />
  );
}
