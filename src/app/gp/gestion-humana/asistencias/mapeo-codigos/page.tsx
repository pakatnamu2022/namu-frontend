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
import { ATTENDANCE_CODE_MAPPING } from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/lib/attendance-code-mapping.constants";
import { useAttendanceCodeMappings } from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/lib/attendance-code-mapping.hook";
import { deleteAttendanceCodeMapping } from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/lib/attendance-code-mapping.actions";
import AttendanceCodeMappingActions from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/components/AttendanceCodeMappingActions";
import AttendanceCodeMappingTable from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/components/AttendanceCodeMappingTable";
import AttendanceCodeMappingOptions from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/components/AttendanceCodeMappingOptions";
import AttendanceCodeMappingModal from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/components/AttendanceCodeMappingModal";
import { attendanceCodeMappingColumns } from "@/features/gp/gestionhumana/asistencias/mapeo-codigos/components/AttendanceCodeMappingColumns";

const { MODEL, ROUTE } = ATTENDANCE_CODE_MAPPING;

export default function AttendanceCodeMappingPage() {
  const { checkRouteExists, isLoadingModule, currentView } =
    useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useAttendanceCodeMappings({
    search: search || undefined,
    per_page,
    page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAttendanceCodeMapping(deleteId);
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
        <AttendanceCodeMappingActions />
      </HeaderTableWrapper>

      <AttendanceCodeMappingTable
        isLoading={isLoading}
        columns={attendanceCodeMappingColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <AttendanceCodeMappingOptions search={search} setSearch={setSearch} />
      </AttendanceCodeMappingTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {editId !== null && (
        <AttendanceCodeMappingModal
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
