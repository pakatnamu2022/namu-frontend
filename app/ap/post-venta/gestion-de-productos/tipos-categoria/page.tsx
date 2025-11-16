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
import { TYPES_CATEGORY } from "@/features/ap/post-venta/gestion-productos/tipos-categoria/lib/typesCategory.constants";
import TypesCategoryActions from "@/features/ap/post-venta/gestion-productos/tipos-categoria/components/TypesCategoryActions";
import TypesCategoryTable from "@/features/ap/post-venta/gestion-productos/tipos-categoria/components/TypesCategoryTable";
import { typesCategoryColumns } from "@/features/ap/post-venta/gestion-productos/tipos-categoria/components/TypesCategoryColumns";
import TypesCategoryOptions from "@/features/ap/post-venta/gestion-productos/tipos-categoria/components/TypesCategoryOptions";
import TypesCategoryModal from "@/features/ap/post-venta/gestion-productos/tipos-categoria/components/TypesCategoryModal";
import { useTypesCategory } from "@/features/ap/post-venta/gestion-productos/tipos-categoria/lib/typesCategory.hook";
import NotFound from '@/app/not-found';
import {

  deleteTypesCategory,
  updateTypesCategory,
} from "@/features/ap/post-venta/gestion-productos/tipos-categoria/lib/typesCategory.actions";

export default function TypesCategoryPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TYPES_CATEGORY;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTypesCategory({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTypesCategory(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypesCategory(deleteId);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Tipos de Motor de Vehículos"}
          icon={currentView.icon}
        />
        <TypesCategoryActions permissions={permissions} />
      </HeaderTableWrapper>
      <TypesCategoryTable
        isLoading={isLoading}
        columns={typesCategoryColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypesCategoryOptions search={search} setSearch={setSearch} />
      </TypesCategoryTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TypesCategoryModal
          id={updateId}
          title={"Actualizar Tipo de Motor"}
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
