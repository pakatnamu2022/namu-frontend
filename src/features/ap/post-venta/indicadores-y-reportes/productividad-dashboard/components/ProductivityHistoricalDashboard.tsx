"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import { currentYear } from "@/core/core.function";
import ProductivityHistoricalFilters from "./ProductivityHistoricalFilters";
import ProductivityHistoricalKpiCards from "./ProductivityHistoricalKpiCards";
import ProductivityTrendChart from "./ProductivityTrendChart";
import ProductivityHoursComparisonChart from "./ProductivityHoursComparisonChart";
import ProductivityOtsCoverageChart from "./ProductivityOtsCoverageChart";
import ProductivityTechnicianDistributionChart from "./ProductivityTechnicianDistributionChart";
import ProductivityMultiYearSummary from "./ProductivityMultiYearSummary";
import ProductivityYearComparePicker from "./ProductivityYearComparePicker";
import ProductivityYearComparisonChart from "./ProductivityYearComparisonChart";
import {
  useProductivityAnnualTrends,
  useProductivityCompareYears,
  useProductivityMonthSnapshot,
  useProductivityMultiYearSummary,
  PRODUCTIVITY_ANNUAL_TRENDS_QUERY_KEY,
  PRODUCTIVITY_MONTH_SNAPSHOT_QUERY_KEY,
  PRODUCTIVITY_MULTI_YEAR_SUMMARY_QUERY_KEY,
} from "../lib/productivityHistorical.hook";
import { PRODUCTIVITY_DASHBOARD } from "../lib/productivityDashboard.constants";

// Abreviaturas de mes tal como las envía el backend en trends.labels (ej. "Sep")
const MONTH_ABBREVIATIONS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Convierte el último label de trends (ej. "Sep") al número de mes calendario (9).
 * No se puede usar period_count para esto: period_count es solo la CANTIDAD de
 * meses que trae el array (ej. 3), no el número del mes calendario del último
 * período, y ambos valores solo coinciden por casualidad si el año empieza en
 * enero sin huecos.
 */
function getLastMonthNumber(labels: string[] | undefined): number | null {
  if (!labels || labels.length === 0) return null;
  const lastLabel = labels[labels.length - 1];
  const index = MONTH_ABBREVIATIONS.indexOf(lastLabel);
  return index >= 0 ? index + 1 : null;
}

type DashboardMode = "monthly" | "historical";

interface Props {
  dashboardMode: DashboardMode;
  onDashboardModeChange: (value: DashboardMode) => void;
}

export default function ProductivityHistoricalDashboard({
  dashboardMode,
  onDashboardModeChange,
}: Props) {
  const { currentView } = useCurrentModule();
  const queryClient = useQueryClient();
  const [showCompare, setShowCompare] = useState(false);

  const { values: filtersState, setFieldValue: setFilter } = useScopedFilters(
    PRODUCTIVITY_DASHBOARD.ABSOLUTE_ROUTE,
    {
      histYear: currentYear(),
      histSedeId: "",
      histCompareYears: [] as number[],
    },
  );
  const {
    histYear: year,
    histSedeId: sedeId,
    histCompareYears: compareYears,
  } = filtersState;
  const setYear = (value: number) => setFilter("histYear", value);
  const setSedeId = (value: string) => setFilter("histSedeId", value);
  const setCompareYears = (values: number[]) =>
    setFilter("histCompareYears", values);

  const sedeIdNumber = sedeId ? Number(sedeId) : undefined;

  const trendsFilters = { year, sede_id: sedeIdNumber };
  const { data: trendsData, isLoading: isLoadingTrends } =
    useProductivityAnnualTrends(trendsFilters);

  // Snapshot del último mes con datos disponible según las tendencias del año.
  // Se espera a que trends cargue realmente antes de consultar: así se evita
  // disparar una petición extra con un mes "placeholder" que luego se descarta.
  const lastMonthNumber = getLastMonthNumber(trendsData?.data.trends.labels);
  const snapshotFilters = {
    year,
    month: lastMonthNumber ?? 1,
    sede_id: sedeIdNumber,
  };
  const { data: snapshotData, isLoading: isLoadingSnapshot } =
    useProductivityMonthSnapshot(snapshotFilters, lastMonthNumber !== null);

  const { data: multiYearData, isLoading: isLoadingMultiYear } =
    useProductivityMultiYearSummary({ sede_id: sedeIdNumber });

  const compareFilters =
    showCompare && compareYears.length >= 2
      ? { years: compareYears, sede_id: sedeIdNumber }
      : null;
  const { data: compareData, isLoading: isLoadingCompare } =
    useProductivityCompareYears(compareFilters);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: [PRODUCTIVITY_ANNUAL_TRENDS_QUERY_KEY],
    });
    await queryClient.invalidateQueries({
      queryKey: [PRODUCTIVITY_MONTH_SNAPSHOT_QUERY_KEY],
    });
    await queryClient.invalidateQueries({
      queryKey: [PRODUCTIVITY_MULTI_YEAR_SUMMARY_QUERY_KEY],
    });
  };

  const trends = trendsData?.data;
  const snapshot = snapshotData?.data;
  const isLoading = isLoadingTrends;

  return (
    <PageWrapper>
      <TitleComponent
        title="Dashboard de Productividad"
        subtitle={
          trendsData?.data
            ? `Tendencia Anual · ${trendsData.data.sede_name}`
            : "Postventa · Taller · Tendencia Anual"
        }
        icon={currentView?.icon || "Gauge"}
      >
        <ButtonGroup>
          <Button
            size="sm"
            variant={dashboardMode === "monthly" ? "default" : "outline"}
            onClick={() => onDashboardModeChange("monthly")}
          >
            Detalle Mensual
          </Button>
          <Button
            size="sm"
            variant={dashboardMode === "historical" ? "default" : "outline"}
            onClick={() => onDashboardModeChange("historical")}
          >
            Tendencia Anual
          </Button>
        </ButtonGroup>
      </TitleComponent>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <ProductivityHistoricalFilters
          year={year}
          sedeId={sedeId}
          onYearChange={setYear}
          onSedeChange={setSedeId}
          onRefresh={handleRefresh}
        />

        <Button
          size="sm"
          variant={showCompare ? "default" : "outline"}
          onClick={() => setShowCompare((prev) => !prev)}
        >
          <GitCompareArrows className="h-4 w-4 mr-2" />
          Comparar años
        </Button>
      </div>

      {showCompare && (
        <div className="rounded-lg border p-4 space-y-3">
          <ProductivityYearComparePicker
            selectedYears={compareYears}
            onChange={setCompareYears}
          />
          {compareYears.length < 2 && (
            <p className="text-xs text-muted-foreground">
              Selecciona al menos 2 años para ver la comparación.
            </p>
          )}
          {isLoadingCompare && <FormSkeleton />}
          {!isLoadingCompare && compareData?.data && (
            <ProductivityYearComparisonChart data={compareData.data} />
          )}
        </div>
      )}

      {isLoading && <FormSkeleton />}

      {!isLoading && !trends && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay información histórica disponible para el año seleccionado.
        </div>
      )}

      {!isLoading && trends && (
        <>
          {snapshot && (
            <ProductivityHistoricalKpiCards
              snapshot={snapshot.snapshot}
              comparison={snapshot.comparison_with_previous_month}
              periodDescription={snapshot.period_description}
              isLoading={isLoadingSnapshot}
            />
          )}

          <ProductivityHoursComparisonChart
            trends={trends.trends}
            year={year}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProductivityTrendChart trends={trends.trends} year={year} />
            <ProductivityOtsCoverageChart trends={trends.trends} year={year} />
          </div>

          <ProductivityTechnicianDistributionChart
            trends={trends.trends}
            year={year}
          />

          {!isLoadingMultiYear && multiYearData?.data.years && (
            <ProductivityMultiYearSummary years={multiYearData.data.years} />
          )}
        </>
      )}
    </PageWrapper>
  );
}
