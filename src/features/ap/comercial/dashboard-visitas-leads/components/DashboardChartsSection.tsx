"use client";

import { useState, useMemo, useEffect } from "react";
import { IndicatorsByDateRange } from "../lib/dashboard.interface";
import BarChartCard from "./BarChartCard";
import DonutChart, { DonutChartDataItem } from "./DonutChart";
import SelectedDateBanner from "./SelectedDateBanner";
import ChartLoadingSkeleton from "./ChartLoadingSkeleton";
import { XampleBarChart } from "./XampleBarChart";

interface DashboardChartsSectionProps {
  data: IndicatorsByDateRange[];
  type: "VISITA" | "LEADS";
}

// Colores para estados de visita
const VISIT_STATUS_COLORS = {
  atendidos: "#22c55e",
  no_atendidos: "#eab308",
  descartados: "#ef4444",
};

// Colores para estados de oportunidad
const OPPORTUNITY_STATUS_COLORS: { [key: string]: string } = {
  CALIENTE: "#ef4444",
  TEMPLADO: "#f59e0b",
  FRIO: "#3b82f6",
  "VENTA CONCRETADA": "#22c55e",
  CERRADA: "#6b7280",
};

export default function DashboardChartsSection({
  data,
  type,
}: DashboardChartsSectionProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const barChartData = useMemo(() => {
    return data.map((item) => ({
      fecha: item.fecha,
      total_visitas: item.total_visitas,
      promedio_tiempo: item.promedio_tiempo,
      porcentaje_atendidos: item.porcentaje_atendidos,
    }));
  }, [data]);

  const selectedDateData = data[selectedDateIndex] || data[0];

  const visitStatusData: DonutChartDataItem[] = useMemo(() => {
    if (!selectedDateData) return [];
    return [
      {
        name: "Atendidos",
        value: selectedDateData.estados_visita.atendidos,
        color: VISIT_STATUS_COLORS.atendidos,
      },
      {
        name: "No Atendidos",
        value: selectedDateData.estados_visita.no_atendidos,
        color: VISIT_STATUS_COLORS.no_atendidos,
      },
      {
        name: "Descartados",
        value: selectedDateData.estados_visita.descartados,
        color: VISIT_STATUS_COLORS.descartados,
      },
    ].filter((item) => item.value > 0);
  }, [selectedDateData]);

  const opportunityStatusData: DonutChartDataItem[] = useMemo(() => {
    if (!selectedDateData) return [];
    return selectedDateData.por_estado_oportunidad
      .map((item) => ({
        name: item.estado_oportunidad,
        value: item.cantidad,
        color:
          OPPORTUNITY_STATUS_COLORS[item.estado_oportunidad] ||
          OPPORTUNITY_STATUS_COLORS.FRIO,
      }))
      .filter((item) => item.value > 0);
  }, [selectedDateData]);

  const handleBarClick = (index: number) => {
    setSelectedDateIndex(index);
  };

  if (!isMounted) {
    return <ChartLoadingSkeleton type={type} />;
  }

  const typeLabel = type === "LEADS" ? "Leads" : "Visitas";

  return (
    <div className="space-y-6">
      <XampleBarChart />
      <BarChartCard
        data={barChartData}
        type={type}
        onBarClick={handleBarClick}
      />

      <SelectedDateBanner date={selectedDateData?.fecha || null} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title={`Estado de ${typeLabel}`}
          description="Distribución de visitas por estado de atención"
          data={visitStatusData}
        />

        <DonutChart
          title="Estado de Oportunidades"
          description="Distribución de visitas por estado de oportunidad"
          data={opportunityStatusData}
        />
      </div>
    </div>
  );
}
