"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
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
import NotFound from "@/app/not-found";
import { usePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.hook";
import { deletePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.actions";
import PurchaseOrderProductsActions from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsActions";
import PurchaseOrderProductsTable from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsTable";
import { purchaseOrderProductsColumns } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsColumns";
import PurchaseOrderProductsOptions from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsOptions";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.constants";

export default function PurchaseOrderProductsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PURCHASE_ORDER_PRODUCT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, statusFilter]);

  const { data, isLoading, refetch } = usePurchaseOrderProducts({
    page,
    search,
    per_page,
    ...(statusFilter !== "all" && { status: statusFilter }),
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
    console.log("Ver orden:", id);
    // Aquí puedes implementar un modal o navegar a una vista de detalle
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

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
          routeAdd={`${ROUTE}/agregar`}
        />
      </HeaderTableWrapper>
      <PurchaseOrderProductsTable
        isLoading={isLoading}
        columns={purchaseOrderProductsColumns({
          onDelete: setDeleteId,
          onView: handleView,
          permissions,
          routeUpdate: `${ROUTE}/actualizar`,
        })}
        data={data?.data || []}
      >
        <PurchaseOrderProductsOptions
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </PurchaseOrderProductsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

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
