"use client";

import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { notFound } from "next/navigation";
import TitleComponent from "@/src/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";
import { PRODUCT_CATEGORY } from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/lib/productCategory.constants";
import ProductCategoryActions from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/components/ProductCategoryActions";
import ProductCategoryTable from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/components/ProductCategoryTable";
import { productCategoryColumns } from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/components/ProductCategoryColumns";
import ProductCategoryOptions from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/components/ProductCategoryOptions";
import ProductCategoryModal from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/components/ProductCategoryModal";
import { useProductCategory } from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/lib/productCategory.hook";
import {
  deleteProductCategory,
  updateProductCategory,
} from "@/src/features/ap/post-venta/gestion-productos/categorias-producto/lib/productCategory.actions";

export default function ProductCategoryPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PRODUCT_CATEGORY;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useProductCategory({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateProductCategory(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductCategory(deleteId);
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
          subtitle={"Tipos de Motor de Vehículos"}
          icon={currentView.icon}
        />
        <ProductCategoryActions permissions={permissions} />
      </HeaderTableWrapper>
      <ProductCategoryTable
        isLoading={isLoading}
        columns={productCategoryColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ProductCategoryOptions search={search} setSearch={setSearch} />
      </ProductCategoryTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ProductCategoryModal
          id={updateId}
          title={"Actualizar Categoría de Producto"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
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
