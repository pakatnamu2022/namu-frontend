"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { GlobalAreaSummary } from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
  OBJECTIVE_STATUS_HEX,
} from "../lib/objectivesDashboard.constants";
import { formatMoney } from "@/core/core.function";

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
  const color = OBJECTIVE_STATUS_HEX[area.status];
  const remaining = Math.max(area.total_objective - area.total_progress, 0);
  const data = [
    {
      ...area,
      progress: area.total_progress,
      remaining,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-1 px-3 py-1">
      <ChartContainer
        config={chartConfig}
        className="mx-auto h-36 w-full max-w-72"
      >
        <RadialBarChart
          data={data}
          cx="50%"
          cy="100%"
          endAngle={180}
          innerRadius={70}
          outerRadius={110}
          barSize={24}
        >
          <RadialBar
            dataKey="progress"
            fill={color}
            stackId="a"
            cornerRadius={5}
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="remaining"
            fill="var(--color-gray-300)"
            stackId="a"
            cornerRadius={5}
            className="stroke-transparent stroke-2"
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 6}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {area.completion_percentage.toFixed(0)}%
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium">{area.label}</span>
        <Badge
          color={OBJECTIVE_STATUS_BADGE_COLOR[area.status]}
          className="text-xs font-medium"
        >
          {OBJECTIVE_STATUS_LABEL[area.status]}
        </Badge>
      </div>

      <div className="w-full space-y-1 border-t pt-1 text-xs">
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
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

function AreaBarTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: any[];
  formatValue: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload as AreaDatum;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
        {item.label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs text-muted-foreground">Objetivo:</span>
          <span className="text-sm font-bold">
            {formatValue(item.total_objective)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs text-muted-foreground">Avance:</span>
          <span className="text-sm font-bold">
            {formatValue(item.total_progress)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs text-muted-foreground">Cumplimiento:</span>
          <span className="text-sm font-bold">
            {item.completion_percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function AreaBarChart({
  data,
  formatValue,
}: {
  data: AreaDatum[];
  formatValue: (value: number) => string;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis hide />
        <ChartTooltip
          content={(props) => (
            <AreaBarTooltip {...props} formatValue={formatValue} />
          )}
        />
        <Bar
          dataKey="total_objective"
          fill="var(--color-gray-300)"
          radius={4}
        />
        <Bar dataKey="total_progress" fill="var(--primary)" radius={4}>
          <LabelList
            dataKey="completion_percentage"
            position="top"
            formatter={(value: number) => `${value.toFixed(0)}%`}
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
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
          <AreaRadialChart data={monetaryAreas} formatValue={formatMoney} />
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
            <AreaBarChart data={vehicularAreas} formatValue={formatNumber} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
