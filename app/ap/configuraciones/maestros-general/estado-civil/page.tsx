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
import { MARITAL_STATUS } from "@/features/ap/configuraciones/maestros-general/estado-civil/lib/maritalStatus.constants";
import { useMaritalStatus } from "@/features/ap/configuraciones/maestros-general/estado-civil/lib/maritalStatus.hook";
import {
  deleteMaritalStatus,
  updateMaritalStatus,
} from "@/features/ap/configuraciones/maestros-general/estado-civil/lib/maritalStatus.actions";
import MaritalStatusActions from "@/features/ap/configuraciones/maestros-general/estado-civil/components/MaritalStatusActions";
import MaritalStatusTable from "@/features/ap/configuraciones/maestros-general/estado-civil/components/MaritalStatusTable";
import { maritalStatusColumns } from "@/features/ap/configuraciones/maestros-general/estado-civil/components/MaritalStatusColumns";
import MaritalStatusOptions from "@/features/ap/configuraciones/maestros-general/estado-civil/components/MaritalStatusOptions";
import MaritalStatusModal from "@/features/ap/configuraciones/maestros-general/estado-civil/components/MaritalStatusModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function MaritalStatusPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = MARITAL_STATUS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useMaritalStatus({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateMaritalStatus(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMaritalStatus(deleteId);
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
          subtitle={"Estado Civil"}
          icon={currentView.icon}
        />
        <MaritalStatusActions permissions={permissions} />
      </HeaderTableWrapper>
      <MaritalStatusTable
        isLoading={isLoading}
        columns={maritalStatusColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <MaritalStatusOptions search={search} setSearch={setSearch} />
      </MaritalStatusTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <MaritalStatusModal
          id={updateId}
          title={"Actualizar Estado Civil"}
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
