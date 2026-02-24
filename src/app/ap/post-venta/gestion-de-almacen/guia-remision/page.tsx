"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { deleteProductTransfer } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.actions.ts";
import ProductTransferActions from "@/features/ap/post-venta/gestion-almacen/guia-remision/components/ProductTransferActions.tsx";
import ProductTransferTable from "@/features/ap/post-venta/gestion-almacen/guia-remision/components/ProductTransferTable.tsx";
import { productTransferColumns } from "@/features/ap/post-venta/gestion-almacen/guia-remision/components/ProductTransferColumns.tsx";
import ProductTransferOptions from "@/features/ap/post-venta/gestion-almacen/guia-remision/components/ProductTransferOptions.tsx";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.constants.ts";
import {
  useProductTransfers,
  useSendShippingGuideToNubefact,
  useQueryShippingGuideFromNubefact,
} from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.hook.ts";
import { getAllTransferReceptions } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.actions.ts";
import { useNavigate } from "react-router-dom";
import { ProductTransferViewSheet } from "@/features/ap/post-venta/gestion-almacen/guia-remision/components/ProductTransferViewSheet.tsx";
import { useMyPhysicalWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";

export default function ProductTransferPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sendToNubefactId, setSendToNubefactId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number>(0);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const { MODEL, ROUTE, ROUTE_UPDATE } = PRODUCT_TRANSFER;
  const permissions = useModulePermissions(ROUTE);
  const sendToNubefactMutation = useSendShippingGuideToNubefact();
  const queryFromNubefactMutation = useQueryShippingGuideFromNubefact();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getFirstDayOfMonth(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getCurrentDayOfMonth(currentDate),
  );

  // Obtener mis almacenes físicos de postventa
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useMyPhysicalWarehouse();

  // Setear el primer almacén por defecto
  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouses]);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateTo(dateFrom);
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  const { data, isLoading, refetch } = useProductTransfers({
    page,
    search,
    per_page,
    movement_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    warehouse_id: warehouseId || undefined,
  });

  const handleView = (id: number) => {
    setViewId(id);
    setIsViewSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductTransfer(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleSendToNubefact = async () => {
    if (!sendToNubefactId) return;
    sendToNubefactMutation.mutate(sendToNubefactId, {
      onSettled: () => {
        refetch();
        setSendToNubefactId(null);
      },
    });
  };

  const handleReceive = async (id: number) => {
    const ROUTE_RECEPTION =
      "/ap/post-venta/gestion-de-almacen/guia-remision/recepcion";
    const receptions = await getAllTransferReceptions({
      productTransferId: id,
    });
    if (receptions.length === 0) {
      navigate(`${ROUTE_RECEPTION}/agregar/${id}`);
    } else {
      navigate(`${ROUTE_RECEPTION}/${id}`);
    }
  };

  const handleQueryFromNubefact = (id: number) => {
    queryFromNubefactMutation.mutate(id, {
      onSettled: () => {
        refetch();
      },
    });
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
        <ProductTransferActions permissions={permissions} />
      </HeaderTableWrapper>
      <ProductTransferTable
        isLoading={isLoading}
        columns={productTransferColumns({
          onDelete: setDeleteId,
          onView: handleView,
          onSendToNubefact: setSendToNubefactId,
          onQueryFromNubefact: handleQueryFromNubefact,
          permissions: {
            ...permissions,
            canReceive: permissions.canCreate,
          },
          onReceive: handleReceive,
          routeUpdate: ROUTE_UPDATE,
          warehouseId,
        })}
        data={data?.data || []}
      >
        <ProductTransferOptions
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
      </ProductTransferTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {sendToNubefactId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setSendToNubefactId(null)}
          onConfirm={handleSendToNubefact}
          title="Enviar a Nubefact"
          description="¿Está seguro de que desea enviar esta guía de remisión a Nubefact? Una vez enviada, no podrá editarla ni eliminarla."
          confirmText="Sí, enviar"
          cancelText="Cancelar"
          variant="default"
          icon="warning"
          isLoading={sendToNubefactMutation.isPending}
        />
      )}

      <ProductTransferViewSheet
        open={isViewSheetOpen}
        onOpenChange={setIsViewSheetOpen}
        transferId={viewId}
      />

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
