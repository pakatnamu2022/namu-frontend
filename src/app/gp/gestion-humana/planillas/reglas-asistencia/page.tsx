"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useAttendanceRules } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.hook";
import AttendanceRuleTable from "@/features/gp/gestionhumana/planillas/reglas-asistencia/components/AttendanceRuleTable";
import { attendanceRuleColumns } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/components/AttendanceRuleColumns";
import AttendanceRuleOptions from "@/features/gp/gestionhumana/planillas/reglas-asistencia/components/AttendanceRuleOptions";
import AttendanceRuleActions from "@/features/gp/gestionhumana/planillas/reglas-asistencia/components/AttendanceRuleActions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteAttendanceRule } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { ATTENDANCE_RULE } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.constant";

export default function AttendanceRulePage() {
  const { MODEL, ROUTE } = ATTENDANCE_RULE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useAttendanceRules({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAttendanceRule(deleteId);
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
        <AttendanceRuleActions />
      </HeaderTableWrapper>

      <AttendanceRuleTable
        isLoading={isLoading}
        columns={attendanceRuleColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <AttendanceRuleOptions search={search} setSearch={setSearch} />
      </AttendanceRuleTable>

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
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
