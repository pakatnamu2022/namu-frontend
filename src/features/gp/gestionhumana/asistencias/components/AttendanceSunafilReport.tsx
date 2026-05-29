"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Search } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { errorToast } from "@/core/core.function";
import { ATTENDANCE } from "../lib/attendance.constants";
import { useSunafilReport } from "../lib/attendance.hook";
import { exportSunafilReport } from "../lib/attendance.actions";
import type {
  AttendanceSunafilRow,
  AttendanceSunafilFilters,
} from "../lib/attendance.interface";

const today = format(new Date(), "yyyy-MM-dd");
const firstOfMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

function timeStr(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "-";
}

function hoursStr(h: number | null | undefined) {
  if (h == null) return "-";
  return `${h.toFixed(2)}h`;
}

const columns: ColumnDef<AttendanceSunafilRow>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "emp_code",
    header: "Código",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.emp_code}</span>
    ),
  },
  {
    accessorKey: "vat",
    header: "DNI",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.vat ?? "-"}</span>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Colaborador",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.full_name}</span>
    ),
  },
  {
    accessorKey: "check_in",
    header: "Entrada",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {timeStr(row.original.check_in)}
      </span>
    ),
  },
  {
    accessorKey: "check_out",
    header: "Salida",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {timeStr(row.original.check_out)}
      </span>
    ),
  },
  {
    accessorKey: "hours_worked",
    header: "H. Trabajadas",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {hoursStr(row.original.hours_worked)}
      </span>
    ),
  },
];

function toStr(d: Date | undefined): string | undefined {
  return d ? format(d, "yyyy-MM-dd") : undefined;
}

export default function AttendanceSunafilReport() {
  const { ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [search, setSearch] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState<{
    date_from: string;
    date_to: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState<"csv" | "xlsx" | null>(null);

  const activeFilters: AttendanceSunafilFilters | null = submittedFilters
    ? {
        ...submittedFilters,
        search: search || undefined,
        page,
        per_page: perPage,
      }
    : null;

  const { data, isLoading } = useSunafilReport(activeFilters);

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

  const handleExport = async (exportFormat: "csv" | "xlsx") => {
    if (!canAction) return;
    setLoading(exportFormat);
    try {
      await exportSunafilReport(
        { date_from: dateFrom, date_to: dateTo },
        exportFormat,
      );
    } catch {
      errorToast("Error al exportar el reporte SUNAFIL");
    } finally {
      setLoading(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Reporte SUNAFIL"
          subtitle="Exporta el registro de asistencias en formato SUNAFIL"
          icon={currentView.icon}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canAction || !!loading}
            onClick={() => handleExport("csv")}
          >
            <FileDown
              className={`size-4 mr-1.5 ${loading === "csv" ? "animate-pulse" : ""}`}
            />
            Exportar CSV
          </Button>
          <Button
            size="sm"
            disabled={!canAction || !!loading}
            onClick={() => handleExport("xlsx")}
          >
            <FileSpreadsheet
              className={`size-4 mr-1.5 ${loading === "xlsx" ? "animate-pulse" : ""}`}
            />
            Exportar Excel
          </Button>
        </div>
      </HeaderTableWrapper>

      <div className="space-y-2">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
        >
          <FilterWrapper>
            <DatePicker
              value={dateFrom}
              onChange={(d) => setDateFrom(toStr(d) ?? firstOfMonth)}
              placeholder="Desde"
            />
            <DatePicker
              value={dateTo}
              onChange={(d) => setDateTo(toStr(d) ?? today)}
              placeholder="Hasta"
            />
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar colaborador..."
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!canAction || isLoading}
              onClick={handleLoad}
            >
              <Search className="size-4 mr-1.5" />
              Cargar
            </Button>
          </FilterWrapper>
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
    </div>
  );
}
