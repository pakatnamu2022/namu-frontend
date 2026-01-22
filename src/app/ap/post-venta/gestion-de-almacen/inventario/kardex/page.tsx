import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useState } from "react";
import { INVENTORY } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import BackButton from "@/shared/components/BackButton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import InventoryKardexTable from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryKardexTable.tsx";
import InventoryMovementsOptions from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryMovementsOptions.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { useInventoryKardex } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { inventoryKardexColumns } from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryKardexColumns.tsx";

export default function InventoryKardexPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { ABSOLUTE_ROUTE, ROUTE } = INVENTORY;

  const { data, isLoading } = useInventoryKardex({
    page,
    search,
    per_page,
    date_from: dateFrom ? dateFrom.toISOString().split("T")[0] : undefined,
    date_to: dateTo ? dateTo.toISOString().split("T")[0] : undefined,
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Kardex de Inventario"
          subtitle={`Kardex del inventario`}
          icon={currentView.icon}
        />
        <BackButton
          route={`${ABSOLUTE_ROUTE}`}
          name={"Inventario"}
          fullname={false}
        />
      </HeaderTableWrapper>
      <InventoryKardexTable
        isLoading={isLoading}
        columns={inventoryKardexColumns()}
        data={data?.data || []}
      >
        <InventoryMovementsOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </InventoryKardexTable>
      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
