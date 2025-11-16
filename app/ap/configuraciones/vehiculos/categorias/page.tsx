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
import VehicleCategoryActions from "@/features/ap/configuraciones/vehiculos/categoria/components/VehicleCategoryActions";
import VehicleCategoryTable from "@/features/ap/configuraciones/vehiculos/categoria/components/VehicleCategoryTable";
import { vehicleCategoryColumns } from "@/features/ap/configuraciones/vehiculos/categoria/components/VehicleCategoryColumns";
import VehicleCategoryOptions from "@/features/ap/configuraciones/vehiculos/categoria/components/VehicleCategoryOptions";
import VehicleCategoryModal from "@/features/ap/configuraciones/vehiculos/categoria/components/VehicleCategoryModal";
import { useVehicleCategory } from "@/features/ap/configuraciones/vehiculos/categoria/lib/vehicleCategory.hook";
import {
  deleteVehicleCategory,
  updateVehicleCategory,
} from "@/features/ap/configuraciones/vehiculos/categoria/lib/vehicleCategory.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { VEHICLE_CATEGORY } from "@/features/ap/configuraciones/vehiculos/categoria/lib/vehicleCategory.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";


export default function VehicleCategoryPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = VEHICLE_CATEGORY;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useVehicleCategory({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateVehicleCategory(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicleCategory(deleteId);
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
          subtitle={"Categorias de Vehículos"}
          icon={currentView.icon}
        />
        <VehicleCategoryActions permissions={permissions} />
      </HeaderTableWrapper>
      <VehicleCategoryTable
        isLoading={isLoading}
        columns={vehicleCategoryColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <VehicleCategoryOptions search={search} setSearch={setSearch} />
      </VehicleCategoryTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <VehicleCategoryModal
          id={updateId}
          title={"Actualizar Categoria de Vehículo"}
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
