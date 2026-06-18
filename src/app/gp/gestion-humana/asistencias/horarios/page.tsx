"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { WORK_SCHEDULE } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.constants";
import { useWorkSchedules } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.hook";
import { deleteWorkSchedule } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.actions";
import WorkScheduleTable from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleTable";
import { workScheduleColumns } from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleColumns";
import WorkScheduleOptions from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleOptions";
import WorkScheduleActions from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleActions";
import { WorkScheduleAssignBulkModal } from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleAssignBulkModal";

export default function WorkSchedulePage() {
  const { MODEL, ROUTE } = WORK_SCHEDULE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignBulkId, setAssignBulkId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useWorkSchedules({
    name: search || undefined,
    per_page,
    page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWorkSchedule(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <WorkScheduleActions />
      </HeaderTableWrapper>

      <WorkScheduleTable
        isLoading={isLoading}
        columns={workScheduleColumns({
          onDelete: setDeleteId,
          onAssignBulk: setAssignBulkId,
        })}
        data={data?.data || []}
      >
        <WorkScheduleOptions search={search} setSearch={setSearch} />
      </WorkScheduleTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <WorkScheduleAssignBulkModal
        open={assignBulkId !== null}
        workScheduleId={assignBulkId}
        onClose={() => setAssignBulkId(null)}
      />

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
