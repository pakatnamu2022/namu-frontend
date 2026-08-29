import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useEffect, useState } from "react";
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
import InventoryKardexActions from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryKardexActions.tsx";
import { useMyPhysicalWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { getFirstDayOfMonth } from "@/core/core.function.ts";

export default function InventoryKardexPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getFirstDayOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const { ABSOLUTE_ROUTE, ROUTE } = INVENTORY;

  // Obtener mis almacenes físicos de postventa
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useMyPhysicalWarehouse();

  // Setear automáticamente el primer almacén cuando se carguen
  useEffect(() => {
    if (!isLoadingWarehouses && warehouses.length > 0 && !warehouseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarehouseId(warehouses[0].id.toString());
    }
  }, [isLoadingWarehouses, warehouses, warehouseId]);

  const kardexFilters = {
    page,
    search,
    per_page,
    warehouse_id: warehouseId,
    date_from: dateFrom ? dateFrom.toISOString().split("T")[0] : undefined,
    date_to: dateTo ? dateTo.toISOString().split("T")[0] : undefined,
  };

  const { data, isLoading } = useInventoryKardex(kardexFilters, {
    enabled: !!warehouseId,
  });

  if (isLoadingModule || isLoadingWarehouses) return <PageSkeleton />;
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
        <div className="flex items-center gap-2">
          <InventoryKardexActions
            filters={kardexFilters}
            disabled={!warehouseId}
          />
          <BackButton
            route={`${ABSOLUTE_ROUTE}`}
            name={"Inventario"}
            fullname={false}
          />
        </div>
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
          warehouses={warehouses}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
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
