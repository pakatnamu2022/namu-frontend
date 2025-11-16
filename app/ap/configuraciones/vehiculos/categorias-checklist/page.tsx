"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
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
import { useCategoryChecklist } from "@/features/ap/configuraciones/vehiculos/categorias-checklist/lib/categoryChecklist.hook";
import {
  deleteCategoryChecklist,
  updateCategoryChecklist,
} from "@/features/ap/configuraciones/vehiculos/categorias-checklist/lib/categoryChecklist.actions";
import CategoryChecklistActions from "@/features/ap/configuraciones/vehiculos/categorias-checklist/components/CategoryChecklistActions";
import CategoryChecklistTable from "@/features/ap/configuraciones/vehiculos/categorias-checklist/components/CategoryChecklistTable";
import CategoryChecklistOptions from "@/features/ap/configuraciones/vehiculos/categorias-checklist/components/CategoryChecklistOptions";
import CategoryChecklistModal from "@/features/ap/configuraciones/vehiculos/categorias-checklist/components/CategoryChecklistModal";
import { categoryChecklistColumns } from "@/features/ap/configuraciones/vehiculos/categorias-checklist/components/CategoryChecklistColumns";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { CATEGORY_CHECKLIST } from "@/features/ap/configuraciones/vehiculos/categorias-checklist/lib/categoryChecklist.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function CategoryChecklistPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = CATEGORY_CHECKLIST;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useCategoryChecklist({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateCategoryChecklist(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategoryChecklist(deleteId);
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
          subtitle={"Categorias de Checklist"}
          icon={currentView.icon}
        />
        <CategoryChecklistActions permissions={permissions} />
      </HeaderTableWrapper>
      <CategoryChecklistTable
        isLoading={isLoading}
        columns={categoryChecklistColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <CategoryChecklistOptions search={search} setSearch={setSearch} />
      </CategoryChecklistTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <CategoryChecklistModal
          id={updateId}
          title={"Actualizar Categoria de Checklist"}
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
