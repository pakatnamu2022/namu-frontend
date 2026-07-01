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
import { ATTENDANCE_EXCLUSION } from "@/features/gp/gestionhumana/asistencias/exclusiones/lib/attendance-exclusion.constants";
import { useAttendanceExclusions } from "@/features/gp/gestionhumana/asistencias/exclusiones/lib/attendance-exclusion.hook";
import {
  deleteAttendanceExclusion,
  updateAttendanceExclusion,
} from "@/features/gp/gestionhumana/asistencias/exclusiones/lib/attendance-exclusion.actions";
import AttendanceExclusionActions from "@/features/gp/gestionhumana/asistencias/exclusiones/components/AttendanceExclusionActions";
import AttendanceExclusionTable from "@/features/gp/gestionhumana/asistencias/exclusiones/components/AttendanceExclusionTable";
import AttendanceExclusionOptions from "@/features/gp/gestionhumana/asistencias/exclusiones/components/AttendanceExclusionOptions";
import AttendanceExclusionModal from "@/features/gp/gestionhumana/asistencias/exclusiones/components/AttendanceExclusionModal";
import { attendanceExclusionColumns } from "@/features/gp/gestionhumana/asistencias/exclusiones/components/AttendanceExclusionColumns";

const { MODEL, ROUTE } = ATTENDANCE_EXCLUSION;

export default function AttendanceExclusionPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, active, per_page]);

  const { data, isLoading, refetch } = useAttendanceExclusions({
    search: search || undefined,
    active: active || undefined,
    per_page,
    page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAttendanceExclusion(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message,
        ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: number, value: boolean) => {
    try {
      await updateAttendanceExclusion(id, { active: value });
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message,
        ERROR_MESSAGE(MODEL, "update"),
      );
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <AttendanceExclusionActions />
      </HeaderTableWrapper>

      <AttendanceExclusionTable
        isLoading={isLoading}
        columns={attendanceExclusionColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
          onToggleActive: handleToggleActive,
        })}
        data={data?.data || []}
      >
        <AttendanceExclusionOptions
          search={search}
          setSearch={setSearch}
          active={active}
          setActive={setActive}
        />
      </AttendanceExclusionTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {editId !== null && (
        <AttendanceExclusionModal
          id={editId}
          title={`Editar ${MODEL.name}`}
          open={true}
          onClose={() => setEditId(null)}
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
