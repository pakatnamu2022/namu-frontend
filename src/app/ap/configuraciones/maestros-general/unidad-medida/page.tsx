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
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { UNIT_MEASUREMENT } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.constants";
import { useUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook";
import {
  deleteUnitMeasurement,
  updateUnitMeasurement,
} from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.actions";
import UnitMeasurementActions from "@/features/ap/configuraciones/maestros-general/unidad-medida/components/UnitMeasurementActions";
import UnitMeasurementTable from "@/features/ap/configuraciones/maestros-general/unidad-medida/components/UnitMeasurementTable";
import { unitMeasurementColumns } from "@/features/ap/configuraciones/maestros-general/unidad-medida/components/UnitMeasurementColumns";
import UnitMeasurementOptions from "@/features/ap/configuraciones/maestros-general/unidad-medida/components/UnitMeasurementOptions";
import UnitMeasurementModal from "@/features/ap/configuraciones/maestros-general/unidad-medida/components/UnitMeasurementModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function UnitMeasurementPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = UNIT_MEASUREMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useUnitMeasurement({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateUnitMeasurement(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUnitMeasurement(deleteId);
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
          subtitle={"Unidades de Medida"}
          icon={currentView.icon}
        />
        <UnitMeasurementActions permissions={permissions} />
      </HeaderTableWrapper>
      <UnitMeasurementTable
        isLoading={isLoading}
        columns={unitMeasurementColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <UnitMeasurementOptions search={search} setSearch={setSearch} />
      </UnitMeasurementTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <UnitMeasurementModal
          id={updateId}
          title={"Actualizar Unidad de Medida"}
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
