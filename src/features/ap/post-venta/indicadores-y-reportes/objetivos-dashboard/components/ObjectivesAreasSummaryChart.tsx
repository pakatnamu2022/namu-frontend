"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import { RadialBar, RadialBarChart, PolarGrid } from "recharts";
import { GlobalAreaSummary } from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
  OBJECTIVE_STATUS_HEX,
} from "../lib/objectivesDashboard.constants";

interface ObjectivesAreasSummaryChartProps {
  areas: GlobalAreaSummary[];
}

const chartConfig = {
  total_objective: {
    label: "Objetivo",
    color: "var(--color-gray-300)",
  },
  total_progress: {
    label: "Avance",
    color: "var(--primary)",
  },
};

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-PE").format(value);

type AreaDatum = GlobalAreaSummary & { label: string };

function AreaBadge({
  area,
  showAreaName = true,
}: {
  area: AreaDatum;
  showAreaName?: boolean;
}) {
  return (
    <Badge
      color={OBJECTIVE_STATUS_BADGE_COLOR[area.status]}
      className="text-xs font-medium"
    >
      {showAreaName && `${area.label}: `}
      {area.completion_percentage.toFixed(1)}% ·{" "}
      {OBJECTIVE_STATUS_LABEL[area.status]}
    </Badge>
  );
}

function AreaRadialItem({
  area,
  formatValue,
}: {
  area: AreaDatum;
  formatValue: (value: number) => string;
}) {
  const clamped = Math.min(area.completion_percentage, 100);
  const color = OBJECTIVE_STATUS_HEX[area.status];
  const data = [{ ...area, fill: color }];

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-2">
      <div className="relative mx-auto aspect-square h-36 w-full shrink-0">
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="text-xl font-bold">
            {area.completion_percentage.toFixed(0)}%
          </span>
        </div>

        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-36"
        >
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={90 - (clamped / 100) * 360}
            innerRadius={55}
            outerRadius={80}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[59, 51]}
            />
            <RadialBar
              dataKey="completion_percentage"
              background
              cornerRadius={10}
            />
          </RadialBarChart>
        </ChartContainer>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium">{area.label}</span>
        <Badge
          color={OBJECTIVE_STATUS_BADGE_COLOR[area.status]}
          className="text-xs font-medium"
        >
          {OBJECTIVE_STATUS_LABEL[area.status]}
        </Badge>
      </div>

      <div className="w-full space-y-1 border-t pt-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Objetivo</span>
          <span className="font-medium">
            {formatValue(area.total_objective)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Avance</span>
          <span className="font-medium">
            {formatValue(area.total_progress)}
          </span>
        </div>
      </div>
    </div>
  );
}

function AreaRadialChart({
  data,
  formatValue,
}: {
  data: AreaDatum[];
  formatValue: (value: number) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
      {data.map((area) => (
        <AreaRadialItem
          key={area.area_id}
          area={area}
          formatValue={formatValue}
        />
      ))}
    </div>
  );
}

export default function ObjectivesAreasSummaryChart({
  areas,
}: ObjectivesAreasSummaryChartProps) {
  const data: AreaDatum[] = areas.map((area) => ({
    ...area,
    label: area.is_vehicular_crossing ? "Paso Vehicular" : area.area_name,
  }));

  const monetaryAreas = data.filter((area) => !area.is_vehicular_crossing);
  const vehicularAreas = data.filter((area) => area.is_vehicular_crossing);

  return (
    <div
      className={
        vehicularAreas.length > 0
          ? "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]"
          : "grid grid-cols-1 gap-4"
      }
    >
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Resumen Global</CardTitle>
            <CardDescription>
              Objetivo vs. avance real del período (S/)
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {monetaryAreas.map((area) => (
              <AreaBadge key={area.area_id} area={area} />
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-4">
          <AreaRadialChart data={monetaryAreas} formatValue={formatCurrency} />
        </CardContent>
      </Card>

      {vehicularAreas.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-start sm:justify-between">
            <div className="shrink-0">
              <CardTitle className="whitespace-nowrap">
                Paso Vehicular
              </CardTitle>
              <CardDescription className="whitespace-nowrap">
                Objetivo vs. avance
              </CardDescription>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {vehicularAreas.map((area) => (
                <AreaBadge
                  key={area.area_id}
                  area={area}
                  showAreaName={false}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-4">
            <AreaRadialChart data={vehicularAreas} formatValue={formatNumber} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
