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
import { usePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.hook.ts";
import { deletePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.actions.ts";
import PurchaseOrderProductsTable from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/PurchaseOrderProductsTable.tsx";
import { purchaseOrderProductsColumns } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/PurchaseOrderProductsColumns.tsx";
import PurchaseOrderProductsOptions from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/PurchaseOrderProductsOptions.tsx";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.constants.ts";
import { PurchaseOrderProductsViewSheet } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/PurchaseOrderProductsSheet.tsx";
import { PurchaseOrderProductsResource } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.interface.ts";
import { TYPES_OPERATION_ID } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.constants.ts";

export default function PurchaseOrderProductsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewData, setViewData] =
    useState<PurchaseOrderProductsResource | null>(null);
  const { MODEL, ROUTE, ABSOLUTE_ROUTE } = PURCHASE_ORDER_PRODUCT;
  const permissions = useModulePermissions(ROUTE);
  const currentDate = new Date();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  const { data, isLoading, refetch } = usePurchaseOrderProducts({
    page,
    search,
    per_page,
    type_operation_id: TYPES_OPERATION_ID.POSTVENTA,
    emission_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePurchaseOrderProducts(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleView = (id: number) => {
    const orderData = data?.data.find((item) => item.id === id);
    if (orderData) {
      setViewData(orderData);
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
      </HeaderTableWrapper>
      <PurchaseOrderProductsTable
        isLoading={isLoading}
        columns={purchaseOrderProductsColumns({
          onDelete: setDeleteId,
          onView: handleView,
          permissions: {
            ...permissions,
            canReceive: true,
          },
          routeReception: `${ABSOLUTE_ROUTE}/recepcion`,
        })}
        data={data?.data || []}
      >
        <PurchaseOrderProductsOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </PurchaseOrderProductsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <PurchaseOrderProductsViewSheet
        open={viewData !== null}
        onOpenChange={(open) => !open && setViewData(null)}
        data={viewData}
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
