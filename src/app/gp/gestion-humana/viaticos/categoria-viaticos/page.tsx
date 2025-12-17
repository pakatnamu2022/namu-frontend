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
import PerDiemCategoryActions from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/components/PerDiemCategoryActions";
import PerDiemCategoryTable from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/components/PerDiemCategoryTable";
import { perDiemCategoryColumns } from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/components/PerDiemCategoryColumns";
import PerDiemCategoryOptions from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/components/PerDiemCategoryOptions";
import PerDiemCategoryModal from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/components/PerDiemCategoryModal";
import { useGetPerDiemCategory } from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/lib/perDiemCategory.hook";
import {
  deletePerDiemCategory,
  updatePerDiemCategory,
} from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/lib/perDiemCategory.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PER_DIEM_CATEGORY } from "@/features/gp/gestionhumana/viaticos/categoria-viaticos/lib/perDiemCategory.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function PerDiemCategoryPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PER_DIEM_CATEGORY;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useGetPerDiemCategory({
    params: {
      page,
      search,
      per_page,
    },
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updatePerDiemCategory(id, { active: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerDiemCategory(deleteId);
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
          subtitle={"Categorias de Viáticos"}
          icon={currentView.icon}
        />
        <PerDiemCategoryActions permissions={permissions} />
      </HeaderTableWrapper>
      <PerDiemCategoryTable
        isLoading={isLoading}
        columns={perDiemCategoryColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <PerDiemCategoryOptions search={search} setSearch={setSearch} />
      </PerDiemCategoryTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <PerDiemCategoryModal
          id={updateId}
          title={"Actualizar Categoria de Viático"}
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
