"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { usePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.hook";
import { deletePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.actions";
import PurchaseOrderProductsActions from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsActions";
import PurchaseOrderProductsTable from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsTable";
import { purchaseOrderProductsColumns } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsColumns";
import PurchaseOrderProductsOptions from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsOptions";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.constants";
import { PurchaseOrderProductsViewSheet } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsSheet";
import { PurchaseOrderProductsResource } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.interface";
import { TYPES_OPERATION_ID } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.constants";

export default function PurchaseOrderProductsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewData, setViewData] =
    useState<PurchaseOrderProductsResource | null>(null);
  const { MODEL, ROUTE, ROUTE_ADD, ROUTE_UPDATE, ABSOLUTE_ROUTE } =
    PURCHASE_ORDER_PRODUCT;
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
        <PurchaseOrderProductsActions
          permissions={permissions}
          routeAdd={ROUTE_ADD}
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
          routeUpdate: ROUTE_UPDATE,
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
