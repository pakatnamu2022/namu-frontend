"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { TYPE_PLANNING } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.constants.ts";
import { useTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook.ts";
import {
  deleteTypesPlanning,
  updateTypesPlanning,
} from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.actions.ts";
import TypesPlanningOptions from "@/features/ap/configuraciones/postventa/tipos-planificacion/components/TypesPlanningOptions.tsx";
import TypesPlanningActions from "@/features/ap/configuraciones/postventa/tipos-planificacion/components/TypesPlanningActions.tsx";
import TypesPlanningTable from "@/features/ap/configuraciones/postventa/tipos-planificacion/components/TypesPlanningTable.tsx";
import { typesPlanningColumns } from "@/features/ap/configuraciones/postventa/tipos-planificacion/components/TypesPlanningColumns.tsx";
import TypesPlanningModal from "@/features/ap/configuraciones/postventa/tipos-planificacion/components/TypesPlanningModal.tsx";

export default function TypesPlanningPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TYPE_PLANNING;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTypesPlanning({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTypesPlanning(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypesPlanning(deleteId);
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
          subtitle={"Tipos de Planificación"}
          icon={currentView.icon}
        />
        <TypesPlanningActions permissions={permissions} />
      </HeaderTableWrapper>
      <TypesPlanningTable
        isLoading={isLoading}
        columns={typesPlanningColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypesPlanningOptions search={search} setSearch={setSearch} />
      </TypesPlanningTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TypesPlanningModal
          id={updateId}
          title={"Actualizar Tipo de Planificación"}
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
