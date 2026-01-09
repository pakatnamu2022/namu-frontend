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
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useApMasters } from "@/features/ap/ap-master/lib/apMasters.hook";
import {
  deleteApMasters,
  updateApMasters,
} from "@/features/ap/ap-master/lib/apMasters.actions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { SortingState } from "@tanstack/react-table";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";
import ApMastersActions from "@/features/ap/ap-master/components/ApMastersActions";
import { commercialMastersColumns } from "@/features/ap/ap-master/components/ApMastersColumns";
import ApMastersTable from "@/features/ap/ap-master/components/ApMastersTable";
import ApMastersOptions from "@/features/ap/ap-master/components/ApMastersOptions";
import ApMastersModal from "@/features/ap/ap-master/components/ApMastersModal";

export default function ApMastersPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = AP_MASTERS;
  const permissions = useModulePermissions(ROUTE);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, sorting]);

  const { data, isLoading, refetch } = useApMasters({
    params: {
      page,
      search,
      per_page,
      sort: sorting.map((s) => s.id).join(","),
      direction: sorting.map((s) => (s.desc ? "desc" : "asc")).join(","),
    },
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateApMasters(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApMasters(deleteId);
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
          subtitle={"Gestión de maestros comerciales generales"}
          icon={currentView.icon}
        />
        <ApMastersActions permissions={permissions} />
      </HeaderTableWrapper>

      <ApMastersTable
        isLoading={isLoading}
        columns={commercialMastersColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting={true}
      >
        <ApMastersOptions search={search} setSearch={setSearch} />
      </ApMastersTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ApMastersModal
          id={updateId}
          open={true}
          onClose={() => setUpdateId(null)}
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
