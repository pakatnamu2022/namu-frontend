"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent";
import PageWrapper from "@/shared/components/PageWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  errorToast,
  successToast,
  currentMonth,
  currentYear,
} from "@/core/core.function";
import ProductivityDashboardFilters from "./ProductivityDashboardFilters";
import ProductivityExecutiveSummary from "./ProductivityExecutiveSummary";
import ProductivityHeadquartersChart from "./ProductivityHeadquartersChart";
import ProductivityHeadquartersTable from "./ProductivityHeadquartersTable";
import ProductivityTopTechniciansChart from "./ProductivityTopTechniciansChart";
import ProductivityTechnicianTable from "./ProductivityTechnicianTable";
import {
  useProductivityDashboard,
  PRODUCTIVITY_DASHBOARD_QUERY_KEY,
} from "../lib/productivityDashboard.hook";
import { refreshProductivityDashboard } from "../lib/productivityDashboard.actions";
import { useDownloadReport } from "@/shared/lib/reports/reports.hook";

const BILLED_HOURS_EXPORT_ENDPOINT =
  "/ap/postVenta/reports/closed-work-order-billed-hours/export";

function toDateRange(year: number, month: number): [string, string] {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return [`${year}-${pad(month)}-01`, `${year}-${pad(month)}-${pad(lastDay)}`];
}

export default function ProductivityDashboard() {
  const { currentView } = useCurrentModule();
  const queryClient = useQueryClient();

  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());
  const [sedeId, setSedeId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = {
    year,
    month,
    sede_id: sedeId ? Number(sedeId) : undefined,
  };

  const { data, isLoading, isFetching } = useProductivityDashboard(filters);
  const { mutate: downloadReport, isPending: isExporting } =
    useDownloadReport();

  const dashboard = data?.data;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProductivityDashboard(filters);
      await queryClient.invalidateQueries({
        queryKey: [PRODUCTIVITY_DASHBOARD_QUERY_KEY],
      });
      successToast("Dashboard actualizado correctamente");
    } catch (error: any) {
      errorToast(
        "Error al actualizar el dashboard",
        error.response?.data?.message?.toString(),
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    downloadReport({
      endpoint: BILLED_HOURS_EXPORT_ENDPOINT,
      params: {
        format: "excel",
        date_range: toDateRange(year, month),
        ...(filters.sede_id && { sede_id: filters.sede_id }),
      },
      fileName: "reporte_horas_trabajadas_por_sede",
    });
  };

  return (
    <PageWrapper>
      <TitleComponent
        title="Dashboard de Productividad"
        subtitle={
          dashboard ? dashboard.period.description : "Postventa · Taller"
        }
        icon={currentView?.icon || "Gauge"}
      />

      <ProductivityDashboardFilters
        year={year}
        month={month}
        sedeId={sedeId}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onSedeChange={setSedeId}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isFetching}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {isLoading && <FormSkeleton />}

      {!isLoading && !dashboard && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay información disponible para el período seleccionado.
        </div>
      )}

      {!isLoading && dashboard && (
        <div className="space-y-6">
          <ProductivityExecutiveSummary
            summary={dashboard.executive_summary}
            period={dashboard.period}
          />

          {dashboard.headquarters_summary.length > 0 && (
            <>
              <ProductivityHeadquartersChart
                data={dashboard.headquarters_summary}
              />

              <ProductivityHeadquartersTable
                data={dashboard.headquarters_summary}
              />
            </>
          )}

          {dashboard.chart_data.labels.length > 0 && (
            <ProductivityTopTechniciansChart chartData={dashboard.chart_data} />
          )}

          {dashboard.technician_detail.length > 0 && (
            <ProductivityTechnicianTable data={dashboard.technician_detail} />
          )}
        </div>
      )}
    </PageWrapper>
  );
}
