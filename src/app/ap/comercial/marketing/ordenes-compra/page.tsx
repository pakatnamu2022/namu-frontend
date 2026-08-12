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
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { MARKETING_PURCHASE_ORDERS } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.constants";
import { usePurchaseOrders } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.hook";
import {
  changePurchaseOrderStatus,
  deletePurchaseOrders,
} from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.actions";
import PurchaseOrdersActions from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersActions";
import PurchaseOrdersTable from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersTable";
import { purchaseOrdersColumns } from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersColumns";
import PurchaseOrdersOptions from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function MarketingPurchaseOrdersPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = MARKETING_PURCHASE_ORDERS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePurchaseOrders({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePurchaseOrders(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await changePurchaseOrderStatus(id, status);
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
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
        <PurchaseOrdersActions permissions={permissions} />
      </HeaderTableWrapper>
      <PurchaseOrdersTable
        isLoading={isLoading}
        columns={purchaseOrdersColumns({
          onDelete: setDeleteId,
          onChangeStatus: handleChangeStatus,
          permissions,
        })}
        data={data?.data || []}
      >
        <PurchaseOrdersOptions search={search} setSearch={setSearch} />
      </PurchaseOrdersTable>

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
