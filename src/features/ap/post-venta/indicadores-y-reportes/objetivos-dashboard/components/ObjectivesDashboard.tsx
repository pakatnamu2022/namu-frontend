"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent";
import PageWrapper from "@/shared/components/PageWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import ExportButtons from "@/shared/components/ExportButtons";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  errorToast,
  successToast,
  currentMonth,
  currentYear,
} from "@/core/core.function";
import ObjectivesDashboardFilters from "./ObjectivesDashboardFilters";
import ObjectivesExecutiveSummary from "./ObjectivesExecutiveSummary";
import ObjectivesHeadquartersChart from "./ObjectivesHeadquartersChart";
import ObjectivesHeadquartersTable from "./ObjectivesHeadquartersTable";
import ObjectivesHeadquarterDetailSheet from "./ObjectivesHeadquarterDetailSheet";
import {
  useObjectivesDashboard,
  OBJECTIVES_DASHBOARD_QUERY_KEY,
} from "../lib/objectivesDashboard.hook";
import {
  refreshObjectivesDashboard,
  exportObjectivesDashboard,
} from "../lib/objectivesDashboard.actions";
import { HeadquarterSummary } from "../lib/objectivesDashboard.interface";

export default function ObjectivesDashboard() {
  const { currentView } = useCurrentModule();
  const queryClient = useQueryClient();

  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());
  const [sedeId, setSedeId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSede, setSelectedSede] = useState<HeadquarterSummary | null>(
    null,
  );
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const filters = {
    year,
    month,
    sede_id: sedeId ? Number(sedeId) : undefined,
  };

  const { data, isLoading, isFetching } = useObjectivesDashboard(filters);

  const dashboard = data?.data;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshObjectivesDashboard(filters);
      await queryClient.invalidateQueries({
        queryKey: [OBJECTIVES_DASHBOARD_QUERY_KEY],
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

  const handleSedeClick = (sede: HeadquarterSummary) => {
    setSelectedSede(sede);
    setDetailSheetOpen(true);
  };

  const selectedDetail =
    dashboard?.headquarters_detail.find(
      (item) => item.id === selectedSede?.id,
    ) ?? null;

  return (
    <PageWrapper>
      <TitleComponent
        title="Dashboard de Objetivos"
        subtitle={
          dashboard ? dashboard.period.name : "Postventa · Taller y Mostrador"
        }
        icon={currentView?.icon || "Target"}
      >
        <ExportButtons
          onExcelDownload={() => exportObjectivesDashboard(filters)}
          disableExcel={isLoading}
        />
      </TitleComponent>

      <ObjectivesDashboardFilters
        year={year}
        month={month}
        sedeId={sedeId}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onSedeChange={setSedeId}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isFetching}
      />

      {isLoading && <FormSkeleton />}

      {!isLoading && !dashboard && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay información disponible para el período seleccionado.
        </div>
      )}

      {!isLoading && dashboard && (
        <div className="space-y-6">
          <ObjectivesExecutiveSummary
            summary={dashboard.executive_summary}
            period={dashboard.period}
          />

          {dashboard.headquarters_comparison.ranking.length > 0 && (
            <>
              <ObjectivesHeadquartersChart
                chartData={dashboard.headquarters_comparison.chart_data}
              />

              <ObjectivesHeadquartersTable
                data={dashboard.headquarters_comparison.ranking}
                onSedeClick={handleSedeClick}
              />
            </>
          )}
        </div>
      )}

      <ObjectivesHeadquarterDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        detail={selectedDetail}
      />
    </PageWrapper>
  );
}
