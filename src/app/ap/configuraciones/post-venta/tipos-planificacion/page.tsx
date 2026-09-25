"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { TYPE_PLANNING } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.constants.ts";
import { useTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook.ts";
import { updateTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.actions.ts";
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
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { ROUTE } = TYPE_PLANNING;
  const permissions = useModulePermissions(ROUTE);

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
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypesPlanningOptions search={search} setSearch={setSearch} />
      </TypesPlanningTable>

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
