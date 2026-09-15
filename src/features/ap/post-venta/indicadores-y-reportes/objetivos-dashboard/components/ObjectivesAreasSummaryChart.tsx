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

function AreaBadge({ area }: { area: AreaDatum }) {
  return (
    <Badge
      color={OBJECTIVE_STATUS_BADGE_COLOR[area.status]}
      className="text-xs font-medium"
    >
      {area.label}: {area.completion_percentage.toFixed(1)}% ·{" "}
      {OBJECTIVE_STATUS_LABEL[area.status]}
    </Badge>
  );
}

function AreaTooltip({
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
            <AreaTooltip {...props} formatValue={formatValue} />
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
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
          <AreaBarChart data={monetaryAreas} formatValue={formatCurrency} />
        </CardContent>
      </Card>

      {vehicularAreas.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Paso Vehicular</CardTitle>
              <CardDescription>Objetivo vs. avance (unidades)</CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              {vehicularAreas.map((area) => (
                <AreaBadge key={area.area_id} area={area} />
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
