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
import { PRODUCT } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.constants";
import ProductActions from "@/features/ap/post-venta/gestion-productos/productos/components/ProductActions";
import ProductTable from "@/features/ap/post-venta/gestion-productos/productos/components/ProductTable";
import { productColumns } from "@/features/ap/post-venta/gestion-productos/productos/components/ProductColumns";
import ProductOptions from "@/features/ap/post-venta/gestion-productos/productos/components/ProductOptions";
import ProductDetailSheet from "@/features/ap/post-venta/gestion-productos/productos/components/ProductDetailSheet";
import { useProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  deleteProduct,
  updateProduct,
} from "@/features/ap/post-venta/gestion-productos/productos/lib/product.actions";

export default function ProductPVPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewProductId, setViewProductId] = useState<number | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const { MODEL, ROUTE } = PRODUCT;
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
        <ProductActions permissions={permissions} />
      </HeaderTableWrapper>
      <ProductTable
        isLoading={isLoading}
        columns={productColumns({
          onStatusChange: handleToggleStatus,
          onDelete: setDeleteId,
          onView: handleView,
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
