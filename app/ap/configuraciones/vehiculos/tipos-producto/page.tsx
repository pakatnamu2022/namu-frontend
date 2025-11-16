"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useProductType } from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/lib/productType.hook";
import {
  deleteProductType,
  updateProductType,
} from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/lib/productType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleComponent from "@/src/shared/components/TitleComponent";
import ProductTypeActions from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/components/ProductTypeActions";
import ProductTypeTable from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/components/ProductTypeTable";
import ProductTypeOptions from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/components/ProductTypeOptions";
import { productTypeColumns } from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/components/ProductTypeColumns";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import ProductTypeModal from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/components/ProductTypeModal";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { PRODUCT_TYPE } from "@/src/features/ap/configuraciones/vehiculos/tipos-producto/lib/productType.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function ProductTypePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PRODUCT_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useProductType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateProductType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductType(deleteId);
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
          subtitle={"Tipos de producto"}
          icon={currentView.icon}
        />
        <ProductTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <ProductTypeTable
        isLoading={isLoading}
        columns={productTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ProductTypeOptions search={search} setSearch={setSearch} />
      </ProductTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ProductTypeModal
          id={updateId}
          title={"Actualizar Tipo de producto"}
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
