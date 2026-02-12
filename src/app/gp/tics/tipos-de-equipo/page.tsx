"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import EquipmentTypeTable from "@/features/gp/tics/equipmentType/components/EquipmentTypeTable";
import { useEquipmentTypes } from "@/features/gp/tics/equipmentType/lib/equipmentType.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import EquipmentTypeOptions from "@/features/gp/tics/equipmentType/components/EquipmentTypeOptions";
import EquipmentTypeActions from "@/features/gp/tics/equipmentType/components/EquipmentTypeActions";
import { equipmentTypeColumns } from "@/features/gp/tics/equipmentType/components/EquipmentTypeColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteEquipmentType } from "@/features/gp/tics/equipmentType/lib/equipmentType.actions";
import { errorToast, successToast } from "@/core/core.function";
import EquipmentTypeModal from "@/features/gp/tics/equipmentType/components/EquipmentTypeModal";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

export default function EquipmentTypePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useEquipmentTypes({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEquipmentType(deleteId);
      await refetch();
      successToast("Tipo de equipo eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el tipo de equipo.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("tipos-de-equipo")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Tipos de Equipo"}
          icon={currentView.icon}
        />
        <EquipmentTypeActions />
      </HeaderTableWrapper>
      <EquipmentTypeTable
        isLoading={isLoading}
        columns={equipmentTypeColumns({
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
        })}
        data={data?.data || []}
      >
        <EquipmentTypeOptions search={search} setSearch={setSearch} />
      </EquipmentTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <EquipmentTypeModal
          id={updateId}
          title={"Actualizar Tipo de Equipo"}
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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
