"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { errorToast } from "@/core/core.function";
import { ATTENDANCE } from "../lib/attendance.constants";
import { useInternalReport } from "../lib/attendance.hook";
import { exportInternalReport } from "../lib/attendance.actions";
import type { AttendanceReportFilters } from "../lib/attendance.interface";
import { getInternalReportColumns } from "./AttendanceInternalColumns";
import AttendanceReportFilterBar from "./AttendanceReportFilterBar";

const today = format(new Date(), "yyyy-MM-dd");
const firstOfMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

export default function AttendanceInternalReport() {
  const { ROUTE, PERSON_ABSOLUTE_ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [search, setSearch] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState<{
    date_from: string;
    date_to: string;
  } | null>({ date_from: firstOfMonth, date_to: today });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  const activeFilters = useMemo<AttendanceReportFilters | null>(
    () =>
      submittedFilters
        ? { ...submittedFilters, search: search || undefined, page, per_page: perPage }
        : null,
    [submittedFilters, search, page, perPage],
  );

  const { data, isLoading } = useInternalReport(activeFilters);
  const columns = useMemo(
    () => getInternalReportColumns(PERSON_ABSOLUTE_ROUTE),
    [PERSON_ABSOLUTE_ROUTE],
  );
  const canAction = !!(dateFrom && dateTo);

  const handleLoad = () => {
    if (!canAction) return;
    setPage(1);
    setSubmittedFilters({ date_from: dateFrom, date_to: dateTo });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleExport = async () => {
    if (!canAction) return;
    setExporting(true);
    try {
      await exportInternalReport({ date_from: dateFrom, date_to: dateTo });
    } catch {
      errorToast("Error al exportar el reporte interno");
    } finally {
      setExporting(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title="Reporte Interno"
          subtitle="Resumen de horas por colaborador en el período seleccionado"
          icon={currentView.icon}
        />
        <Button size="sm" disabled={!canAction || exporting} onClick={handleExport}>
          <FileSpreadsheet
            className={`size-4 mr-1.5 ${exporting ? "animate-pulse" : ""}`}
          />
          Exportar Excel
        </Button>
      </HeaderTableWrapper>

      <div className="space-y-2">
        <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading}>
          <AttendanceReportFilterBar
            dateFrom={dateFrom}
            dateTo={dateTo}
            search={search}
            onDateFromChange={(v) => setDateFrom(v ?? firstOfMonth)}
            onDateToChange={(v) => setDateTo(v ?? today)}
            onSearchChange={handleSearchChange}
            onLoad={handleLoad}
            canLoad={canAction}
            isLoading={isLoading}
          />
        </DataTable>
        <DataTablePagination
          page={page}
          per_page={perPage}
          totalPages={data?.meta.last_page ?? 1}
          totalData={data?.meta.total ?? 0}
          onPageChange={setPage}
          setPerPage={(pp) => {
            setPerPage(pp);
            setPage(1);
          }}
        />
      </div>
    </PageWrapper>
  );
}
