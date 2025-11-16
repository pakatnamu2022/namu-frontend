"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useVehicleStatus } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.hook";
import {
  deleteVehicleStatus,
  updateVehicleStatus,
} from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.actions";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import VehicleStatusActions from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/components/VehicleStatusActions";
import VehicleStatusTable from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/components/VehicleStatusTable";
import { vehicleStatusColumns } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/components/VehicleStatusColumns";
import VehicleStatusOptions from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/components/VehicleStatusOptions";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { VEHICLE_STATUS } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function VehicleStatusPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = VEHICLE_STATUS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useVehicleStatus({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateVehicleStatus(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicleStatus(deleteId);
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <VehicleStatusActions permissions={permissions} />
      </HeaderTableWrapper>
      <VehicleStatusTable
        isLoading={isLoading}
        columns={vehicleStatusColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <VehicleStatusOptions search={search} setSearch={setSearch} />
      </VehicleStatusTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
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
