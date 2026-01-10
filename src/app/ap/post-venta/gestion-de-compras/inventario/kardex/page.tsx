import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useState } from "react";
import { INVENTORY } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.constants";
import BackButton from "@/shared/components/BackButton";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import InventoryKardexTable from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryKardexTable";
import InventoryMovementsOptions from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsOptions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useInventoryKardex } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.hook";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { inventoryKardexColumns } from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryKardexColumns";

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
