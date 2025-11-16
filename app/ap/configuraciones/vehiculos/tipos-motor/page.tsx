"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useEngineTypes } from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.hook";
import {
  deleteEngineTypes,
  updateEngineTypes,
} from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.actions";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import EngineTypesActions from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/components/EngineTypesActions";
import EngineTypesTable from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/components/EngineTypesTable";
import EngineTypesOptions from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/components/EngineTypesOptions";
import EngineTypesModal from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/components/EngineTypesModal";
import { engineTypesColumns } from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/components/EngineTypesColumns";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { ENGINE_TYPES } from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function EngineTypesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ENGINE_TYPES;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useEngineTypes({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateEngineTypes(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEngineTypes(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
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
          subtitle={"Tipos de Motor de Vehículos"}
          icon={currentView.icon}
        />
        <EngineTypesActions permissions={permissions} />
      </HeaderTableWrapper>
      <EngineTypesTable
        isLoading={isLoading}
        columns={engineTypesColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <EngineTypesOptions search={search} setSearch={setSearch} />
      </EngineTypesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <EngineTypesModal
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
