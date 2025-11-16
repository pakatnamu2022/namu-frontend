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
import { useVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import {
  deleteVehicleColor,
  updateVehicleColor,
} from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.actions";
import TitleComponent from "@/shared/components/TitleComponent";
import VehicleColorActions from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorActions";
import VehicleColorTable from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorTable";
import { vehicleColorColumns } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorColumns";
import VehicleColorModal from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import VehicleColorOptions from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorOptions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { VEHICLE_COLOR } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function VehicleColorPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { ROUTE, MODEL } = VEHICLE_COLOR;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useVehicleColor({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateVehicleColor(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicleColor(deleteId);
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
          subtitle={"Colores de Vehículos"}
          icon={currentView.icon}
        />
        <VehicleColorActions permissions={permissions} />
      </HeaderTableWrapper>
      <VehicleColorTable
        isLoading={isLoading}
        columns={vehicleColorColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <VehicleColorOptions search={search} setSearch={setSearch} />
      </VehicleColorTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <VehicleColorModal
          id={updateId}
          title={"Actualizar Color de Vehículo"}
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
