"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import { useTractionType } from "@/features/ap/configuraciones/vehiculos/tipos-traccion/lib/tractionType.hook";
import {
  deleteTractionType,
  updateTractionType,
} from "@/features/ap/configuraciones/vehiculos/tipos-traccion/lib/tractionType.actions";
import TractionTypeActions from "@/features/ap/configuraciones/vehiculos/tipos-traccion/components/TractionTypeActions";
import TractionTypeTable from "@/features/ap/configuraciones/vehiculos/tipos-traccion/components/TractionTypeTable";
import { tractionTypeColumns } from "@/features/ap/configuraciones/vehiculos/tipos-traccion/components/TractionTypeColumns";
import TractionTypeOptions from "@/features/ap/configuraciones/vehiculos/tipos-traccion/components/TractionTypeOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import TractionTypeModal from "@/features/ap/configuraciones/vehiculos/tipos-traccion/components/TractionTypeModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { TRACTION_TYPE } from "@/features/ap/configuraciones/vehiculos/tipos-traccion/lib/tractionType.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";


export default function TractionTypePage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { ROUTE, MODEL } = TRACTION_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTractionType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTractionType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTractionType(deleteId);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Tipos de tracción"}
          icon={currentView.icon}
        />
        <TractionTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <TractionTypeTable
        isLoading={isLoading}
        columns={tractionTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TractionTypeOptions search={search} setSearch={setSearch} />
      </TractionTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TractionTypeModal
          id={updateId}
          title={"Actualizar Tipo de tracción"}
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
