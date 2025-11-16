"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleComponent from "@/src/shared/components/TitleComponent";
import { useTypeVehicleOrigin } from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/lib/typeVehicleOrigin.hook";
import {
  deleteTypeVehicleOrigin,
  updateTypeVehicleOrigin,
} from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/lib/typeVehicleOrigin.actions";
import TypeVehicleOriginActions from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/components/TypeVehicleOriginActions";
import TypeVehicleOriginTable from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/components/typeVehicleOriginTable";
import { typeVehicleOriginColumns } from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/components/typeVehicleOriginColumns";
import TypeVehicleOriginOptions from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/components/typeVehicleOriginOptions";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import TypeVehicleOriginModal from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/components/typeVehicleOriginModal";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { VEHICLE_ORIGIN } from "@/src/features/ap/configuraciones/vehiculos/origen-vehiculo/lib/typeVehicleOrigin.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function TypeVehicleOriginPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = VEHICLE_ORIGIN;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTypeVehicleOrigin({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTypeVehicleOrigin(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypeVehicleOrigin(deleteId);
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
          subtitle={"Orígenes de Vehículos"}
          icon={currentView.icon}
        />
        <TypeVehicleOriginActions permissions={permissions} />
      </HeaderTableWrapper>
      <TypeVehicleOriginTable
        isLoading={isLoading}
        columns={typeVehicleOriginColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypeVehicleOriginOptions search={search} setSearch={setSearch} />
      </TypeVehicleOriginTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TypeVehicleOriginModal
          id={updateId}
          title={"Actualizar origen de vehículo"}
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
