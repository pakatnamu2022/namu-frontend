"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TelephonePlanTable from "@/features/gp/tics/telephonePlan/components/TelephonePlanTable";
import { useTelephonePlans } from "@/features/gp/tics/telephonePlan/lib/telephonePlan.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import TelephonePlanOptions from "@/features/gp/tics/telephonePlan/components/TelephonePlanOptions";
import TelephonePlanActions from "@/features/gp/tics/telephonePlan/components/TelephonePlanActions";
import { telephonePlanColumns } from "@/features/gp/tics/telephonePlan/components/TelephonePlanColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteTelephonePlan } from "@/features/gp/tics/telephonePlan/lib/telephonePlan.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import TelephonePlanModal from "@/features/gp/tics/telephonePlan/components/TelephonePlanModal";

export default function TelephonePlanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useTelephonePlans({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTelephonePlan(deleteId);
      await refetch();
      successToast("Plan telefónico eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el plan telefónico.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenModal = (planId?: string) => {
    setEditPlanId(planId || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditPlanId(null);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("planes-telefonicos")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <TelephonePlanActions onAdd={() => handleOpenModal()} />
      </HeaderTableWrapper>
      <TelephonePlanTable
        isLoading={isLoading}
        columns={telephonePlanColumns({
          onDelete: setDeleteId,
          onEdit: handleOpenModal,
        })}
        data={data?.data || []}
      >
        <TelephonePlanOptions search={search} setSearch={setSearch} />
      </TelephonePlanTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <TelephonePlanModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        planId={editPlanId}
      />

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
