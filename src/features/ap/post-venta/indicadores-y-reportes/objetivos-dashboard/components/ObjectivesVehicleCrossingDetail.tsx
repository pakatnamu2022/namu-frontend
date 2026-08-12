"use client";

import DonutChart, {
  DonutChartDataItem,
} from "@/features/ap/comercial/dashboard-visitas-leads/components/DonutChart";
import { VehicleCrossingDetail } from "../lib/objectivesDashboard.interface";
import ObjectivesAreaOverview from "./ObjectivesAreaOverview";

interface ObjectivesVehicleCrossingDetailProps {
  crossing: VehicleCrossingDetail;
}

const CHART_COLORS = [
  "var(--color-blue-500)",
  "var(--color-emerald-500)",
  "var(--color-amber-500)",
  "var(--color-violet-500)",
  "var(--color-rose-500)",
  "var(--color-cyan-500)",
];

export default function ObjectivesVehicleCrossingDetail({
  crossing,
}: ObjectivesVehicleCrossingDetailProps) {
  const donutData: DonutChartDataItem[] = crossing.by_brand.map(
    (brand, index) => ({
      name: brand.brand_name,
      value: brand.count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }),
  );

  return (
    <div className="space-y-4">
      <ObjectivesAreaOverview area={crossing} unit="count" />

      {crossing.by_brand.length > 0 && (
        <DonutChart
          title="Paso vehícular por Marca"
          description="Distribución de vehículos ingresados por marca"
          data={donutData}
        />
      )}
    </div>
  );
}
