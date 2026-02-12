"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import VehicleAssignmentActions from "@/features/tp/comercial/ControlAsignacionVehiculos/components/VehicleAssignmentActions";
import { vehicleAssignmentColumns } from "@/features/tp/comercial/ControlAsignacionVehiculos/components/VehicleAssignmentColumns";
import VehicleAssignmentOptions from "@/features/tp/comercial/ControlAsignacionVehiculos/components/VehicleAssignmentOptions";
import VehicleAssignmentTable from "@/features/tp/comercial/ControlAsignacionVehiculos/components/VehicleAssignmentTable";
import { deleteVehicleAssignment } from "@/features/tp/comercial/ControlAsignacionVehiculos/lib/vehicleAssignment.actions";
import { useVehicleAssignmentControl } from "@/features/tp/comercial/ControlAsignacionVehiculos/lib/vehicleAssignment.hook";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { VEHICLEASSIGNMENTCONTROL } from "@/features/tp/comercial/ControlAsignacionVehiculos/lib/vehicleAssignment.constants";
import VehicleAssignmentModal from "@/features/tp/comercial/ControlAsignacionVehiculos/components/VehicleAssignmentModal";

export default function ControlVehicleAssignmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [useStatus, setUseStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { ROUTE } = VEHICLEASSIGNMENTCONTROL;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useVehicleAssignmentControl({
    page,
    search,
    per_page,
    status_id: status === "all" ? undefined : status,
  });
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteVehicleAssignment(deleteId);
      await refetch();
      successToast("Asignacion eliminado correctamente. ");
    } catch (error) {
      errorToast("Error al eliminar la asignacion. ");
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = (id: number) => {
    setUpdateId(id);
  };
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateId(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
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
        <VehicleAssignmentActions onCreate={handleCreate} />
      </HeaderTableWrapper>

      <VehicleAssignmentTable
        isLoading={isLoading}
        columns={vehicleAssignmentColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
        })}
        data={data?.data || []}
      >
        <VehicleAssignmentOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          useStatus={useStatus}
          setUseStatus={setUseStatus}
        />
      </VehicleAssignmentTable>

      <VehicleAssignmentModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Nueva Asignación"
        mode="create"
      />
      {updateId && (
        <VehicleAssignmentModal
          id={updateId}
          open={!!updateId}
          onClose={handleCloseUpdateModal}
          title="Editar Asignacion"
          mode="update"
        />
      )}

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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
