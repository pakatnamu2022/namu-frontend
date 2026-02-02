"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
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
import { PRODUCT } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants.ts";
import ProductActions from "@/features/ap/post-venta/gestion-almacen/productos/components/ProductActions.tsx";
import ProductTable from "@/features/ap/post-venta/gestion-almacen/productos/components/ProductTable.tsx";
import { productColumns } from "@/features/ap/post-venta/gestion-almacen/productos/components/ProductColumns.tsx";
import ProductOptions from "@/features/ap/post-venta/gestion-almacen/productos/components/ProductOptions.tsx";
import ProductDetailSheet from "@/features/ap/post-venta/gestion-almacen/productos/components/ProductDetailSheet.tsx";
import { useProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import {
  deleteProduct,
  updateProduct,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.actions.ts";

export default function ProductPVPage() {
  const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewProductId, setViewProductId] = useState<number | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, ROUTE_ADD } = PRODUCT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useProduct({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: string) => {
    try {
      await updateProduct(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleView = (id: number) => {
    setViewProductId(id);
    setIsDetailSheetOpen(true);
  };

  const handleAssignWarehouse = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/asignar-almacen/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
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
        <ProductActions permissions={permissions} route={ROUTE_ADD} />
      </HeaderTableWrapper>
      <ProductTable
        isLoading={isLoading}
        columns={productColumns({
          onStatusChange: handleToggleStatus,
          onUpdate: (id: number) =>
            router(`${ABSOLUTE_ROUTE}/actualizar/${id}`),
          onDelete: setDeleteId,
          onView: handleView,
          onAssignWarehouse: handleAssignWarehouse,
          permissions,
        })}
        data={data?.data || []}
      >
        <ProductOptions search={search} setSearch={setSearch} />
      </ProductTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <ProductDetailSheet
        productId={viewProductId}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
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
