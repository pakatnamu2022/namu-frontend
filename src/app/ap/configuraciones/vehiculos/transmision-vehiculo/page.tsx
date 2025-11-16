"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useGearShiftType } from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/lib/gearShiftType.hook";
import {
  deleteGearShiftType,
  updateGearShiftType,
} from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/lib/gearShiftType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import GearShiftTypeActions from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/components/GearShiftTypeActions";
import GearShiftTypeTable from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/components/GearShiftTypeTable";
import { gearShiftTypeColumns } from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/components/GearShiftTypeColumns";
import GearShiftTypeOptions from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/components/GearShiftTypeOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import GearShiftTypeModal from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/components/GearShiftTypeModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { TYPE_TRANSMISSION } from "@/features/ap/configuraciones/vehiculos/transmision-vehiculo/lib/gearShiftType.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function GearShiftTypePage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TYPE_TRANSMISSION;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useGearShiftType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateGearShiftType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGearShiftType(deleteId);
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
          subtitle={"Tipos de cambio de marcha de Vehículos"}
          icon={currentView.icon}
        />
        <GearShiftTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <GearShiftTypeTable
        isLoading={isLoading}
        columns={gearShiftTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <GearShiftTypeOptions search={search} setSearch={setSearch} />
      </GearShiftTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <GearShiftTypeModal
          id={updateId}
          title={"Actualizar Transmisión vehículo"}
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
