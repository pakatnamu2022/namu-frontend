"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { useParams, Link } from "react-router-dom";
import { INVENTORY } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.constants";
import { useInventoryMovements } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventoryMovements.hook";
import InventoryMovementsTable from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsTable";
import { inventoryMovementsColumns } from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsColumns";
import InventoryMovementsOptions from "@/features/ap/post-venta/gestion-compras/inventario/components/InventoryMovementsOptions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/shared/components/BackButton";

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
    return date ? date.toISOString().split("T")[0] : undefined;
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
          <Link to="/ap/post-venta/gestion-de-compras/inventario">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Kardex de Producto"
          subtitle={`Movimientos del producto #${productId} en almacén #${warehouseId}`}
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
