"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Loader2, Search, RefreshCw, FileSpreadsheet } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { useAllPeriods } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.hook";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  exportReportByPeriods,
  getReportByPeriods,
} from "../lib/reportByPeriods.actions";
import {
  ReportByPeriodsRequest,
  ReportByPeriodsRow,
} from "../lib/reportByPeriods.interface";

const BASE_COLUMNS = ["apellido", "nombre", "dni", "cargo", "categoria"];

function buildRequestPayload(
  periodIds: number[],
  page?: number,
  perPage?: number,
): ReportByPeriodsRequest {
  return {
    periodos_id: periodIds,
    filters: {
      sede_id: null,
      area_id: null,
      cargo: null,
      categoria: null,
      dni: null,
      nombre: null,
    },
    ...(page ? { page } : {}),
    ...(perPage ? { per_page: perPage } : {}),
  };
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function readableHeader(columnKey: string): string {
  return columnKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPeriodColumnHeader(
  columnKey: string,
  periodNameById: Map<number, string>,
): string {
  const match = columnKey.match(/^periodo_(\d+)_(porcentaje|texto)$/);
  if (!match) return readableHeader(columnKey);

  const periodId = Number(match[1]);
  const metric = match[2];
  const periodName = periodNameById.get(periodId) ?? `Período ${periodId}`;

  return metric === "porcentaje"
    ? `${periodName} - %`
    : `${periodName} - Resultado`;
}

export default function ReportByPeriodsPage() {
  const periodForm = useForm<{ periodos_id: number[] }>({
    defaultValues: {
      periodos_id: [],
    },
  });
  const periodIds = periodForm.watch("periodos_id") ?? [];

  const [rows, setRows] = useState<ReportByPeriodsRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const { data: periodsData, isLoading: isLoadingPeriods } = useAllPeriods();

  const periodNameById = useMemo(() => {
    const map = new Map<number, string>();
    (periodsData ?? []).forEach((period) => map.set(period.id, period.name));
    return map;
  }, [periodsData]);

  const fetchReport = async (
    targetPage: number = page,
    targetPerPage: number = perPage,
  ) => {
    if (periodIds.length === 0) {
      return;
    }

    setIsLoadingRows(true);
    try {
      const payload = buildRequestPayload(periodIds, targetPage, targetPerPage);
      const response = await getReportByPeriods(payload);

      setRows(response.rows);
      setTotalRows(response.total);
      setLastPage(response.lastPage);
      setPage(response.currentPage);
      setHasSearched(true);
    } catch (_error) {
      errorToast("No se pudo cargar el reporte por períodos.");
    } finally {
      setIsLoadingRows(false);
    }
  };

  const handleSearch = async () => {
    setPage(1);
    await fetchReport(1, perPage);
  };

  const handleClear = () => {
    periodForm.reset({ periodos_id: [] });
    setRows([]);
    setHasSearched(false);
    setTotalRows(0);
    setLastPage(1);
    setPage(1);
  };

  const handleExport = async () => {
    if (periodIds.length === 0) return;

    setIsExporting(true);
    try {
      const payload = {
        ...buildRequestPayload(periodIds),
        selected_person_ids: [],
      };

      const blob = await exportReportByPeriods(payload);
      downloadBlob(blob, "reporte-evaluacion-por-periodos.xlsx");
      successToast("Exportación completada");
    } catch (_error) {
      errorToast("No se pudo exportar el reporte.");
    } finally {
      setIsExporting(false);
    }
  };

  const dynamicColumnKeys = useMemo(() => {
    if (periodIds.length > 0) {
      return periodIds.flatMap((periodId) => [
        `periodo_${periodId}_porcentaje`,
        `periodo_${periodId}_texto`,
      ]);
    }

    const keys = new Set<string>();
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key.startsWith("periodo_")) keys.add(key);
      });
    });
    return Array.from(keys);
  }, [periodIds, rows]);

  const columns = useMemo<ColumnDef<ReportByPeriodsRow>[]>(() => {
    const baseColumns: ColumnDef<ReportByPeriodsRow>[] = BASE_COLUMNS.map(
      (key) => ({
        accessorKey: key,
        header: readableHeader(key),
        cell: ({ row }) => {
          const value = row.original[key];
          return <span>{value ? String(value) : "-"}</span>;
        },
      }),
    );

    const periodColumns: ColumnDef<ReportByPeriodsRow>[] =
      dynamicColumnKeys.map((key) => ({
        accessorKey: key,
        header: getPeriodColumnHeader(key, periodNameById),
        cell: ({ row }) => {
          const value = row.original[key];
          return (
            <span>
              {value === null || value === undefined || value === ""
                ? "-"
                : String(value)}
            </span>
          );
        },
      }));

    return [...baseColumns, ...periodColumns];
  }, [dynamicColumnKeys, periodNameById]);

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Reporte de Evaluación por Períodos"
          subtitle="Filtra, revisa resultados y exporta a Excel"
          icon="FileSpreadsheet"
        />
      </HeaderTableWrapper>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-xl">
          <Form {...periodForm}>
            <form>
              <MultiSelectTags
                control={periodForm.control}
                name="periodos_id"
                placeholder="Selecciona períodos"
                searchPlaceholder="Buscar período..."
                options={periodsData ?? []}
                getDisplayValue={(item) => item.name}
                getSecondaryText={(item) =>
                  `${item.start_date} - ${item.end_date}`
                }
                disabled={isLoadingPeriods}
                required
              />
            </form>
          </Form>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button type="button" variant="outline" onClick={handleClear}>
            <RefreshCw className="size-4 mr-2" />
            Limpiar
          </Button>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isLoadingRows || periodIds.length === 0}
          >
            {isLoadingRows ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="size-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={periodIds.length === 0 || isExporting}
            className="min-w-[180px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="size-4 mr-2" />
                Exportar Excel
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable columns={columns} data={rows} isLoading={isLoadingRows} />
      </div>

      {hasSearched && !isLoadingRows && rows.length === 0 && (
        <p className="text-sm text-muted-foreground px-1">
          No se encontraron registros para los períodos seleccionados.
        </p>
      )}

      <DataTablePagination
        page={page}
        totalPages={lastPage}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          fetchReport(nextPage, perPage);
        }}
        per_page={perPage}
        setPerPage={(nextPerPage) => {
          setPerPage(nextPerPage);
          setPage(1);
          fetchReport(1, nextPerPage);
        }}
        totalData={totalRows}
      />
    </div>
  );
}
