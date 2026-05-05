"use client";

import { useState, useMemo, useEffect } from "react";
import { IndicatorsByDateRange } from "../lib/dashboard.interface";
import BarChartCard from "./BarChartCard";
import ChartLoadingSkeleton from "./ChartLoadingSkeleton";
import { ChartConfig } from "@/components/ui/chart";
import { InteractivePieChart } from "@/shared/charts/InteractivePieChart";

interface DashboardChartsSectionProps {
  data: IndicatorsByDateRange[];
  type: "VISITA" | "LEADS";
}

// Colores para estados de visita
const VISIT_STATUS_COLORS = {
  atendidos: "var(--chart-2)",
  no_atendidos: "var(--chart-3)",
  descartados: "var(--chart-4)",
};

// Colores para estados de oportunidad
const OPPORTUNITY_STATUS_COLORS: { [key: string]: string } = {
  CALIENTE: "var(--chart-1)",
  TEMPLADA: "var(--chart-5)",
  FRIO: "var(--chart-2)",
  "VENTA CONCRETADA": "var(--chart-4)",
  CERRADA: "var(--chart-3)",
};

export default function DashboardChartsSection({
  data,
  type,
}: DashboardChartsSectionProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const opportunityConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Cantidad" },
    };
    selectedDateData?.por_estado_oportunidad.forEach((item) => {
      config[item.estado_oportunidad] = {
        label: item.estado_oportunidad,
        color: OPPORTUNITY_STATUS_COLORS[item.estado_oportunidad],
      };
    });
    return config;
  }, [selectedDateData]);

  const opportunityPieData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    console;
    if (!selectedDateData) return [];
    return selectedDateData.por_estado_oportunidad
      .map((item) => ({
        name: item.estado_oportunidad,
        value: item.cantidad,
        fill: OPPORTUNITY_STATUS_COLORS[item.estado_oportunidad] || "#6b7280",
      }))
      .filter((item) => item.value > 0);
  }, [selectedDateData]);

  const visitStatusConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Cantidad" },
      Atendidos: { label: "Atendidos", color: VISIT_STATUS_COLORS.atendidos },
      Pendientes: {
        label: "Pendientes",
        color: VISIT_STATUS_COLORS.no_atendidos,
      },
      Descartados: {
        label: "Descartados",
        color: VISIT_STATUS_COLORS.descartados,
      },
    };
    return config;
  }, []);

  const visitStatusPieData = useMemo(() => {
    if (!selectedDateData) return [];
    return [
      {
        name: "Atendidos",
        value: selectedDateData.estados_visita.atendidos,
        fill: VISIT_STATUS_COLORS.atendidos,
      },
      {
        name: "Pendientes",
        value: selectedDateData.estados_visita.no_atendidos,
        fill: VISIT_STATUS_COLORS.no_atendidos,
      },
      {
        name: "Descartados",
        value: selectedDateData.estados_visita.descartados,
        fill: VISIT_STATUS_COLORS.descartados,
      },
    ].filter((item) => item.value > 0);
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
      <BarChartCard
        selectedDated={selectedDateData?.fecha}
        indexBar={selectedDateIndex}
        data={barChartData}
        type={type}
        onBarClick={handleBarClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <InteractivePieChart
          id="opportunity-status-chart"
          config={opportunityConfig}
          data={opportunityPieData}
          title="Estado de Oportunidades"
          subtitle="Distribución por estado de oportunidad"
          showLegend
        />

        <InteractivePieChart
          id="visit-status-chart"
          config={visitStatusConfig}
          data={visitStatusPieData}
          title={`Estado de ${typeLabel}`}
          subtitle="Distribución por estado de atención"
          showLegend
        />
      </div>
    </div>
  );
}
