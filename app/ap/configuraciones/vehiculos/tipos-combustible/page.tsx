"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useFuelType } from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/lib/fuelType.hook";
import {
  deleteFuelType,
  updateFuelType,
} from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/lib/fuelType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleComponent from "@/src/shared/components/TitleComponent";
import FuelTypeActions from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/components/FuelTypeActions";
import FuelTypeTable from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/components/FuelTypeTable";
import { fuelTypeColumns } from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/components/FuelTypeColumns";
import FuelTypeOptions from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/components/FuelTypeOptions";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import FuelTypeModal from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/components/FuelTypeModal";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { FUEL_TYPE } from "@/src/features/ap/configuraciones/vehiculos/tipos-combustible/lib/fuelType.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function FuelTypePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = FUEL_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useFuelType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateFuelType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFuelType(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
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
          subtitle={"Tipos de combustible"}
          icon={currentView.icon}
        />
        <FuelTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <FuelTypeTable
        isLoading={isLoading}
        columns={fuelTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <FuelTypeOptions search={search} setSearch={setSearch} />
      </FuelTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <FuelTypeModal
          id={updateId}
          title={"Actualizar Tipo de combustible"}
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
