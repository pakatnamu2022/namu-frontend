"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { deleteProductTransfer } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.actions.ts";
import ProductTransferActions from "@/features/ap/post-venta/gestion-compras/transferencia-producto/components/ProductTransferActions.tsx";
import ProductTransferTable from "@/features/ap/post-venta/gestion-compras/transferencia-producto/components/ProductTransferTable.tsx";
import { productTransferColumns } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/components/ProductTransferColumns.tsx";
import ProductTransferOptions from "@/features/ap/post-venta/gestion-compras/transferencia-producto/components/ProductTransferOptions.tsx";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.constants.ts";
import { useProductTransfers } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.hook.ts";
import { ProductTransferViewSheet } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/components/ProductTransferViewSheet";

export default function ProductTransferPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const { MODEL, ROUTE, ROUTE_UPDATE } = PRODUCT_TRANSFER;
  const permissions = useModulePermissions(ROUTE);
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : undefined;
  };

  const { data, isLoading, refetch } = useProductTransfers({
    page,
    search,
    per_page,
    movement_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
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

  if (isLoadingModule) return <PageSkeleton />;
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
          permissions: {
            ...permissions,
            canReceive: permissions.canCreate,
          },
          routeUpdate: ROUTE_UPDATE,
          routeReception:
            "/ap/post-venta/gestion-de-compras/transferencia-producto/recepcion",
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
        />
      </ProductTransferTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
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
