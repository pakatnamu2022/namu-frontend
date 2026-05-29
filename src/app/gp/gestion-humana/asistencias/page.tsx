"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/core/core.function";
import { ATTENDANCE } from "@/features/gp/gestionhumana/asistencias/lib/attendance.constants";
import { useAttendanceRecords } from "@/features/gp/gestionhumana/asistencias/lib/attendance.hook";
import { syncAttendance } from "@/features/gp/gestionhumana/asistencias/lib/attendance.actions";
import { getAttendanceColumns } from "@/features/gp/gestionhumana/asistencias/components/AttendanceColumns";
import AttendanceFiltersBar from "@/features/gp/gestionhumana/asistencias/components/AttendanceFilters";
import AttendanceTable from "@/features/gp/gestionhumana/asistencias/components/AttendanceTable";
import AttendanceSheet from "@/features/gp/gestionhumana/asistencias/components/AttendanceSheet";
import type { AttendanceFilters, AttendanceRecord } from "@/features/gp/gestionhumana/asistencias/lib/attendance.interface";

const DEFAULT_FILTERS: AttendanceFilters = {
  per_page: 50,
  page: 1,
};

export default function AttendancePage() {
  const { ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [filters, setFilters] = useState<AttendanceFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isLoading, refetch } = useAttendanceRecords(filters);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [
    filters.date,
    filters.date_from,
    filters.date_to,
    filters.emp_code,
    filters.mark_type,
  ]);

  const handleFiltersChange = (partial: Partial<AttendanceFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncAttendance();
      successToast(result.message ?? "Sincronización completada");
      await refetch();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al sincronizar asistencias",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const columns = getAttendanceColumns({
    onRowClick: (row: AttendanceRecord) => setSelectedId(row.id),
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-3">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="size-4 mr-1.5" />
            Actualizar
          </Button>
          <Button
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`size-4 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
            Sincronizar hoy
          </Button>
        </div>
      </HeaderTableWrapper>

      <AttendanceTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={filters.page ?? 1}
        perPage={filters.per_page ?? 50}
        totalPages={data?.last_page ?? 1}
        total={data?.total ?? 0}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPerPageChange={(per_page) => setFilters((prev) => ({ ...prev, per_page, page: 1 }))}
      >
        <AttendanceFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />
      </AttendanceTable>

      <AttendanceSheet
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
