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
import { deleteAdjustmentsProduct } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.actions";
import AdjustmentsProductActions from "@/features/ap/post-venta/gestion-compras/ajuste-producto/components/AdjustmentsProductActions";
import AdjustmentsProductTable from "@/features/ap/post-venta/gestion-compras/ajuste-producto/components/AdjustmentsProductTable";
import { adjustmentsProductColumns } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/components/AdjustmentsProductColumns";
import AdjustmentsProductOptions from "@/features/ap/post-venta/gestion-compras/ajuste-producto/components/AdjustmentsProductOptions";
import { ADJUSTMENT } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.constants";
import { useAdjustmentsProduct } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.hook";

export default function AdjustmentsProductPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ADJUSTMENT;
  const permissions = useModulePermissions(ROUTE);

  const { data, isLoading, refetch } = useAdjustmentsProduct({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdjustmentsProduct(deleteId);
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
        <AdjustmentsProductActions permissions={permissions} />
      </HeaderTableWrapper>
      <AdjustmentsProductTable
        isLoading={isLoading}
        columns={adjustmentsProductColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <AdjustmentsProductOptions search={search} setSearch={setSearch} />
      </AdjustmentsProductTable>

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
