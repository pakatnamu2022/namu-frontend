// app/dashboard/[company]/[module]/equipos/page.tsx
"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import EquipmentTable from "@/src/features/gp/tics/equipment/components/EquipmentTable";
import { useEquipments } from "@/src/features/gp/tics/equipment/lib/equipment.hook";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import EquipmentOptions from "@/src/features/gp/tics/equipment/components/EquipmentOptions";
import EquipmentActions from "@/src/features/gp/tics/equipment/components/EquipmentActions";
import { equipmentColumns } from "@/src/features/gp/tics/equipment/components/EquipmentColumns";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { deleteEquipment } from "@/src/features/gp/tics/equipment/lib/equipment.actions";
import { errorToast, successToast } from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";

export default function EquipmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [useStatus, setUseStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
        columns={equipmentColumns({ onDelete: setDeleteId })}
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
