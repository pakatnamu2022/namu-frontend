"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useParams, Link } from "react-router-dom";
import { INVENTORY } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.constants.ts";
import InventoryMovementsTable from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsTable.tsx";
import { inventoryMovementsColumns } from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsColumns.tsx";
import InventoryMovementsOptions from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsOptions.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/shared/components/BackButton.tsx";
import { errorToast } from "@/core/core.function";
import { useInventoryMovements } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.hook";

export default function ProductKardexPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { ROUTE, ABSOLUTE_ROUTE } = INVENTORY;
  const params = useParams();

  const productId = parseInt(params.productId as string);
  const warehouseId = parseInt(params.warehouseId as string);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, dateFrom, dateTo]);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  const { data, isLoading } = useInventoryMovements(
    productId,
    warehouseId,
    {
      page,
      search,
      per_page,
      date_from: formatDate(dateFrom),
      date_to: formatDate(dateTo),
    },
    {
      enabled: !isNaN(productId) && !isNaN(warehouseId),
    }
  );

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isNaN(productId) || isNaN(warehouseId)) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-destructive">
            Error: Parámetros inválidos
          </p>
          <Link to={`${ABSOLUTE_ROUTE}/inventario`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Obtener nombres del producto y almacén desde los datos
  const firstMovement = data?.data?.[0];
  const productName =
    firstMovement?.details?.[0]?.product?.name || `Producto #${productId}`;
  const warehouseName =
    firstMovement?.warehouse_origin?.description ||
    firstMovement?.warehouse_destination?.description ||
    `Almacén #${warehouseId}`;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Movimiento de Producto"
          subtitle={`Movimientos de ${productName} en ${warehouseName}`}
          icon={currentView.icon}
        />
        <BackButton
          route={`${ABSOLUTE_ROUTE}/inventario`}
          name={"Inventario"}
          fullname={false}
        />
      </HeaderTableWrapper>
      <InventoryMovementsTable
        isLoading={isLoading}
        columns={inventoryMovementsColumns()}
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
      </InventoryMovementsTable>
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
