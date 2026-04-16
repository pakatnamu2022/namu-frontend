"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import {
  ERROR_MESSAGE,
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useNavigate } from "react-router-dom";
import { PURCHASE_REQUEST_TALLER } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.constants.ts";
import PurchaseRequestActions from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestActions.tsx";
import { purchaseRequestColumns } from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestColumns.tsx";
import PurchaseRequestTable from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestTable.tsx";
import PurchaseRequestOptions from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestOptions.tsx";
import {
  approvePurchaseRequest,
  cancelPurchaseRequest,
  deletePurchaseRequest,
  notifyManagersPurchaseRequest,
} from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.actions.ts";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog.tsx";
import { usePurchaseRequests } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.hook.ts";
import { useMyPhysicalWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { PurchaseRequestResource } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.interface";
import { PurchaseRequestDetailSheet } from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestDetailSheet";

export default function PurchaseRequestPVPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [notifyId, setNotifyId] = useState<number | null>(null);
  const [selectedPurchaseRequestId, setSelectedPurchaseRequestId] = useState<
    number | null
  >(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const { MODEL, ROUTE, ROUTE_UPDATE, ROUTE_ADD } = PURCHASE_REQUEST_TALLER;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getFirstDayOfMonth(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getCurrentDayOfMonth(currentDate),
  );

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateTo(dateFrom);
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  // Obtener mis almacenes físicos de postventa
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useMyPhysicalWarehouse();

  const { data, isLoading, refetch } = usePurchaseRequests({
    page,
    search,
    per_page,
    requested_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    warehouse_id: warehouseId,
  });

  useEffect(() => {
    if (!isLoadingWarehouses && warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id.toString());
    }
  }, [isLoadingWarehouses, warehouses, warehouseId]);

  const handleApprove = async () => {
    if (!approveId) return;
    try {
      await approvePurchaseRequest(approveId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    } finally {
      setApproveId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelPurchaseRequest(cancelId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    } finally {
      setCancelId(null);
    }
  };

  const handleNotifyManagers = async () => {
    if (!notifyId) return;
    try {
      await notifyManagersPurchaseRequest(notifyId);
      await refetch();
      successToast("Notificación enviada a jefatura correctamente.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al enviar la notificación.");
    } finally {
      setNotifyId(null);
    }
  };

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
          onApprove: setApproveId,
          onCancel: setCancelId,
          onNotifyManagers: setNotifyId,
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

      <ConfirmationDialog
        trigger={<span />}
        open={approveId !== null}
        onOpenChange={(open) => !open && setApproveId(null)}
        title="Aprobar solicitud"
        description="¿Estás seguro de que deseas aprobar esta solicitud de compra?"
        confirmText="Sí, aprobar"
        cancelText="No, cancelar"
        icon="info"
        onConfirm={handleApprove}
      />

      <ConfirmationDialog
        trigger={<span />}
        open={cancelId !== null}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancelar solicitud"
        description="¿Estás seguro de que deseas cancelar esta solicitud de compra? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="No, volver"
        icon="danger"
        variant="destructive"
        onConfirm={handleCancel}
      />

      <ConfirmationDialog
        trigger={<span />}
        open={notifyId !== null}
        onOpenChange={(open) => !open && setNotifyId(null)}
        title="Notificar a Jefatura"
        description="¿Deseas enviar una notificación a jefatura para esta solicitud de compra?"
        confirmText="Sí, notificar"
        cancelText="No, cancelar"
        icon="info"
        onConfirm={handleNotifyManagers}
      />

      <PurchaseRequestDetailSheet
        purchaseRequestId={selectedPurchaseRequestId}
        open={isDetailSheetOpen}
        onClose={handleCloseDetailSheet}
        onRefresh={refetch}
      />
    </div>
  );
}
