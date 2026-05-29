"use client";

import { useState } from "react";
import { FileSpreadsheet, Search, User } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { Link } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { ATTENDANCE } from "../lib/attendance.constants";
import { useInternalReport } from "../lib/attendance.hook";
import { exportInternalReport } from "../lib/attendance.actions";
import type {
  AttendanceInternalRow,
  AttendanceReportFilters,
} from "../lib/attendance.interface";
import PageWrapper from "@/shared/components/PageWrapper";

const today = format(new Date(), "yyyy-MM-dd");
const firstOfMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

function buildColumns(
  personBaseRoute: string,
): ColumnDef<AttendanceInternalRow>[] {
  return [
    {
      accessorKey: "emp_code",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.emp_code}</span>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.full_name}</span>
      ),
    },
    {
      accessorKey: "days_present",
      header: "Días Presentes",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {row.original.days_present}
        </span>
      ),
    },
    {
      accessorKey: "expected_hours",
      header: "H. Esperadas",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {row.original.expected_hours.toFixed(2)}h
        </span>
      ),
    },
    {
      accessorKey: "hours_worked",
      header: "H. Trabajadas",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {row.original.hours_worked.toFixed(2)}h
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const b = row.original.balance;
        return (
          <span
            className={cn(
              "tabular-nums text-sm font-medium",
              b >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {b >= 0 ? "+" : ""}
            {b.toFixed(2)}h
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const pid = row.original.person_id;
        if (!pid) return null;
        return (
          <Button asChild size="sm" variant="ghost" className="h-7 px-2">
            <Link to={`${personBaseRoute}/${pid}`}>
              <User className="size-3.5 mr-1" />
              Ver persona
            </Link>
          </Button>
        );
      },
    },
  ];
}

function toStr(d: Date | undefined): string | undefined {
  return d ? format(d, "yyyy-MM-dd") : undefined;
}

export default function AttendanceInternalReport() {
  const { ROUTE, PERSON_ABSOLUTE_ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [filters, setFilters] = useState<{
    date_from?: string;
    date_to?: string;
  }>({
    date_from: firstOfMonth,
    date_to: today,
  });
  const [search, setSearch] = useState("");
  const [submittedFilters, setSubmittedFilters] =
    useState<AttendanceReportFilters | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  const activeFilters: AttendanceReportFilters | null = submittedFilters
    ? {
        ...submittedFilters,
        search: search || undefined,
        page,
        per_page: perPage,
      }
    : null;

  const { data, isLoading } = useInternalReport(activeFilters);
  const columns = buildColumns(PERSON_ABSOLUTE_ROUTE);
  const canAction = !!(filters.date_from && filters.date_to);

  const handleLoad = () => {
    if (!canAction) return;
    setPage(1);
    setSubmittedFilters({
      date_from: filters.date_from!,
      date_to: filters.date_to!,
    });
  };

  const handleExport = async () => {
    if (!canAction) return;
    setExporting(true);
    try {
      await exportInternalReport({
        date_from: filters.date_from!,
        date_to: filters.date_to!,
      });
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
        <Button
          size="sm"
          disabled={!canAction || exporting}
          onClick={handleExport}
        >
          <FileSpreadsheet
            className={`size-4 mr-1.5 ${exporting ? "animate-pulse" : ""}`}
          />
          Exportar Excel
        </Button>
      </HeaderTableWrapper>

      <FilterWrapper>
        <DatePicker
          value={filters.date_from}
          onChange={(d) =>
            setFilters((prev) => ({ ...prev, date_from: toStr(d) }))
          }
          placeholder="Desde"
        />
        <DatePicker
          value={filters.date_to}
          onChange={(d) =>
            setFilters((prev) => ({ ...prev, date_to: toStr(d) }))
          }
          placeholder="Hasta"
        />
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
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

      <div className="space-y-2">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
        />
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
