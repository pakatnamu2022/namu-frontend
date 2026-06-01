"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { ATTENDANCE } from "@/features/gp/gestionhumana/asistencias/lib/attendance.constants";
import { useAttendanceRecords } from "@/features/gp/gestionhumana/asistencias/lib/attendance.hook";
import { getAttendanceColumns } from "@/features/gp/gestionhumana/asistencias/components/AttendanceColumns";
import AttendanceFiltersBar from "@/features/gp/gestionhumana/asistencias/components/AttendanceFilters";
import AttendanceTable from "@/features/gp/gestionhumana/asistencias/components/AttendanceTable";
import AttendanceSheet from "@/features/gp/gestionhumana/asistencias/components/AttendanceSheet";
import AttendanceSyncRangeDialog from "@/features/gp/gestionhumana/asistencias/components/AttendanceSyncRangeDialog";
import type {
  AttendanceFilters,
  AttendanceRecord,
} from "@/features/gp/gestionhumana/asistencias/lib/attendance.interface";
import PageWrapper from "@/shared/components/PageWrapper";

function toDateStr(d: Date | undefined): string | undefined {
  return d ? format(d, "yyyy-MM-dd") : undefined;
}

const DEFAULT_PER_PAGE = 10;

export default function AttendancePage() {
  const { ROUTE, PERSON_ABSOLUTE_ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [filters, setFilters] = useState<Omit<AttendanceFilters, "date" | "date_from" | "date_to">>({
    per_page: DEFAULT_PER_PAGE,
    page: 1,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useAttendanceRecords({
    ...filters,
    date: toDateStr(date),
    date_from: toDateStr(dateFrom),
    date_to: toDateStr(dateTo),
  });

  const handleFiltersChange = (partial: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handleReset = () => {
    setDate(new Date());
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilters({ per_page: DEFAULT_PER_PAGE, page: 1 });
  };

  const columns = getAttendanceColumns({
    onRowClick: (row: AttendanceRecord) => setSelectedId(row.id),
    personBaseRoute: PERSON_ABSOLUTE_ROUTE,
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper>
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
            disabled={isFetching}
          >
            <RefreshCw className={`size-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <AttendanceSyncRangeDialog onSynced={refetch} />
        </div>
      </HeaderTableWrapper>

      <AttendanceTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={filters.page ?? 1}
        perPage={filters.per_page ?? DEFAULT_PER_PAGE}
        totalPages={data?.meta?.last_page ?? 1}
        total={data?.meta?.total ?? 0}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPerPageChange={(per_page) =>
          setFilters((prev) => ({ ...prev, per_page, page: 1 }))
        }
      >
        <AttendanceFiltersBar
          filters={filters}
          date={date}
          setDate={setDate}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />
      </AttendanceTable>

      <AttendanceSheet
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </PageWrapper>
  );
}
