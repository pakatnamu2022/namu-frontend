// app/dashboard/[company]/[module]/equipos/page.tsx
"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import EquipmentTable from "@/features/gp/tics/equipment/components/EquipmentTable";
import { useEquipments } from "@/features/gp/tics/equipment/lib/equipment.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import EquipmentOptions from "@/features/gp/tics/equipment/components/EquipmentOptions";
import EquipmentActions from "@/features/gp/tics/equipment/components/EquipmentActions";
import { equipmentColumns } from "@/features/gp/tics/equipment/components/EquipmentColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteEquipment } from "@/features/gp/tics/equipment/lib/equipment.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import EquipmentAssignModal from "@/features/gp/tics/equipment/components/EquipmentAssignModal";
import EquipmentHistorySheet from "@/features/gp/tics/equipment/components/EquipmentHistorySheet";

export default function EquipmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [useStatus, setUseStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignId, setAssignId] = useState<number | null>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useEquipments({
    page,
    search,
    status_id: status === "all" ? undefined : status,
    estado_uso: useStatus === "all" ? undefined : useStatus,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEquipment(deleteId);
      await refetch();
      successToast("Equipo eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el equipo.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("equipos")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <EquipmentActions />
      </HeaderTableWrapper>
      <EquipmentTable
        isLoading={isLoading}
        columns={equipmentColumns({
          onDelete: setDeleteId,
          onAssign: setAssignId,
          onHistory: setHistoryId,
        })}
        data={data?.data || []}
      >
        <EquipmentOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          useStatus={useStatus}
          setUseStatus={setUseStatus}
        />
      </EquipmentTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {assignId !== null && (
        <EquipmentAssignModal
          open={true}
          equipmentId={assignId}
          onClose={() => setAssignId(null)}
          onSuccess={() => refetch()}
        />
      )}

      <EquipmentHistorySheet
        open={historyId !== null}
        equipmentId={historyId}
        onClose={() => setHistoryId(null)}
        onSuccess={() => refetch()}
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
