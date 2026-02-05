"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  getMonday,
  getSunday,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";
import { PURCHASE_REQUEST_REPUESTOS } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.constants";
import PurchaseRequestActions from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestActions";
import { purchaseRequestColumns } from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestColumns";
import PurchaseRequestTable from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestTable";
import PurchaseRequestOptions from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestOptions";
import { deletePurchaseRequest } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.actions";
import { usePurchaseRequests } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.hook";
import { PurchaseRequestDetailSheet } from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestDetailSheet";
import type { PurchaseRequestResource } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.interface";
import { useMyPhysicalWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";

export default function PurchaseRequestRepuestoPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedPurchaseRequestId, setSelectedPurchaseRequestId] = useState<
    number | null
  >(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const { MODEL, ROUTE, ROUTE_UPDATE, ROUTE_ADD } = PURCHASE_REQUEST_REPUESTOS;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getMonday(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getSunday(currentDate),
  );

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  // Obtener mis almacenes físicos de postventa
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useMyPhysicalWarehouse();

  useEffect(() => {
    if (!isLoadingWarehouses && warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id.toString());
    }
  }, [isLoadingWarehouses, warehouses, warehouseId]);

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  const { data, isLoading, refetch } = usePurchaseRequests({
    page,
    search,
    per_page,
    requested_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePurchaseRequest(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = (id: number) => {
    router(`${ROUTE_UPDATE}/${id}`);
  };

  const handleViewDetail = (purchaseRequest: PurchaseRequestResource) => {
    setSelectedPurchaseRequestId(purchaseRequest.id);
    setIsDetailSheetOpen(true);
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false);
    setSelectedPurchaseRequestId(null);
  };

  if (isLoadingModule || isLoadingWarehouses) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PurchaseRequestActions
          permissions={permissions}
          onAdd={() => router(ROUTE_ADD!)}
        />
      </HeaderTableWrapper>

      <PurchaseRequestTable
        isLoading={isLoading}
        columns={purchaseRequestColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
          onViewDetail: handleViewDetail,
          permissions,
        })}
        data={data?.data || []}
      >
        <PurchaseRequestOptions
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
      </PurchaseRequestTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <PurchaseRequestDetailSheet
        purchaseRequestId={selectedPurchaseRequestId}
        open={isDetailSheetOpen}
        onClose={handleCloseDetailSheet}
        onRefresh={refetch}
      />
    </div>
  );
}
