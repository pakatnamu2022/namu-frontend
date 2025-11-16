"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { TYPE_PERSON } from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.constants";
import { useTypeClient } from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.hook";
import {
  deleteTypeClient,
  updateTypeClient,
} from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.actions";
import TypeClientActions from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/components/TypeClientActions";
import TypeClientTable from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/components/TypeClientTable";
import { typeClientColumns } from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/components/TypeClientColumns";
import TypeClientOptions from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/components/TypeClientOptions";
import TypeClientModal from "@/src/features/ap/configuraciones/maestros-general/tipos-persona/components/TypeClientModal";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function TypeClientPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TYPE_PERSON;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTypeClient({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTypeClient(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypeClient(deleteId);
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
          subtitle={"Tipos de Persona"}
          icon={currentView.icon}
        />
        <TypeClientActions permissions={permissions} />
      </HeaderTableWrapper>
      <TypeClientTable
        isLoading={isLoading}
        columns={typeClientColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypeClientOptions search={search} setSearch={setSearch} />
      </TypeClientTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TypeClientModal
          id={updateId}
          title={"Actualizar Tipo de Persona"}
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
