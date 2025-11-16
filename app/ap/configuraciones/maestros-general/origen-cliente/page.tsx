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
import { CLIENT_ORIGIN } from "@/features/ap/configuraciones/maestros-general/origen-cliente/lib/clientOrigin.constants";
import { useClientOrigin } from "@/features/ap/configuraciones/maestros-general/origen-cliente/lib/clientOrigin.hook";
import {
  deleteClientOrigin,
  updateClientOrigin,
} from "@/features/ap/configuraciones/maestros-general/origen-cliente/lib/clientOrigin.actions";
import ClientOriginActions from "@/features/ap/configuraciones/maestros-general/origen-cliente/components/ClientOriginActions";
import ClientOriginTable from "@/features/ap/configuraciones/maestros-general/origen-cliente/components/ClientOriginTable";
import { clientOriginColumns } from "@/features/ap/configuraciones/maestros-general/origen-cliente/components/ClientOriginColumns";
import ClientOriginOptions from "@/features/ap/configuraciones/maestros-general/origen-cliente/components/ClientOriginOptions";
import ClientOriginModal from "@/features/ap/configuraciones/maestros-general/origen-cliente/components/ClientOriginModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";


export default function ClientOriginPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = CLIENT_ORIGIN;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useClientOrigin({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateClientOrigin(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClientOrigin(deleteId);
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
          subtitle={"Origenes Cliente"}
          icon={currentView.icon}
        />
        <ClientOriginActions permissions={permissions} />
      </HeaderTableWrapper>
      <ClientOriginTable
        isLoading={isLoading}
        columns={clientOriginColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ClientOriginOptions search={search} setSearch={setSearch} />
      </ClientOriginTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ClientOriginModal
          id={updateId}
          title={"Actualizar Origen Cliente"}
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
