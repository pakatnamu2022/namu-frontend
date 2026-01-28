"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import {
  CM_POSTVENTA_ID,
  DEFAULT_PER_PAGE,
  EMPRESA_AP,
} from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import InventoryOptions from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryOptions";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { INVENTORY_REPUESTOS } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook";
import InventoryTable from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryTable";
import { inventoryColumns } from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryColumns";
import InventoryActions from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryActions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import type { SortingState } from "@tanstack/react-table";

export default function InventoryRepuestoPage() {
  const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { ROUTE, ABSOLUTE_ROUTE } = INVENTORY_REPUESTOS;
  const permissions = useModulePermissions(ROUTE);

  // Obtener mis almacenes físicos de postventa
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_POSTVENTA_ID,
      only_physical: 1,
    });

  // Setear automáticamente el primer almacén cuando se carguen
  useEffect(() => {
    if (!isLoadingWarehouses && warehouses.length > 0 && !warehouseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarehouseId(warehouses[0].id.toString());
    }
  }, [isLoadingWarehouses, warehouses, warehouseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, warehouseId, sorting]);

  // Extraer order_by_stock del sorting state
  const orderByStock =
    sorting.length > 0 && sorting[0].id === "quantity"
      ? sorting[0].desc
        ? "desc"
        : "asc"
      : undefined;

  const { data, isLoading } = useInventory(
    {
      page,
      search,
      per_page,
      warehouse_id: warehouseId,
      ...(orderByStock && { order_by_stock: orderByStock }),
    },
    {
      enabled: !!warehouseId,
    }
  );

  if (isLoadingModule || isLoadingWarehouses) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  // Mostrar mensaje si no hay almacenes disponibles
  if (!isLoadingWarehouses && warehouses.length === 0) {
    return (
      <div className="space-y-4">
        <HeaderTableWrapper>
          <TitleComponent
            title={currentView.descripcion}
            subtitle={currentView.descripcion}
            icon={currentView.icon}
          />
        </HeaderTableWrapper>
        <div className="flex items-center justify-center py-12 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg font-semibold mb-2">
              No hay almacenes disponibles
            </p>
            <p className="text-sm">
              No se encontraron almacenes físicos asignados para consultar el
              inventario.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <InventoryActions permissions={permissions} />
      </HeaderTableWrapper>
      <InventoryTable
        isLoading={isLoading}
        columns={inventoryColumns({
          onMovements: (id, warehouse_id) =>
            router(`${ABSOLUTE_ROUTE}/movimientos/${id}/${warehouse_id}`),
        })}
        data={data?.data || []}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting={true}
      >
        <InventoryOptions
          search={search}
          setSearch={setSearch}
          warehouses={warehouses}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
        />
      </InventoryTable>

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
