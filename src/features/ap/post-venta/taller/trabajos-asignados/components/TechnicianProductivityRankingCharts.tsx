"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Users } from "lucide-react";
import { GoalFlagLabel } from "@/shared/components/charts/GoalFlagLabel";
import { TechnicianProductivityRankingItem } from "../lib/technicianProductivityRanking.interface";

const STATUS_HEX: Record<string, string> = {
  critical: "#dc2626",
  warning: "#d97706",
  on_track: "#16a34a",
  exceeded: "#2563eb",
};

const STATUS_LABEL: Record<string, string> = {
  critical: "Crítico",
  warning: "En riesgo",
  on_track: "En meta",
  exceeded: "Superado",
};

const STATUS_LEGEND: (keyof typeof STATUS_LABEL)[] = [
  "critical",
  "warning",
  "on_track",
  "exceeded",
];

interface TechnicianProductivityRankingChartsProps {
  data: TechnicianProductivityRankingItem[];
  currentWorkerId: number | null;
}

const ROW_HEIGHT = 40;
const MIN_HEIGHT = 160;

const chartConfig = {
  productivity_percentage: {
    label: "Productividad",
    color: "var(--primary)",
  },
};

export default function TechnicianProductivityRankingCharts({
  data,
  currentWorkerId,
}: TechnicianProductivityRankingChartsProps) {
  const chartData = [...data]
    .sort((a, b) => b.productivity_percentage - a.productivity_percentage)
    .map((tech) => ({
      technician:
        tech.worker_id === currentWorkerId
          ? `${tech.worker_name} · Tú`
          : tech.worker_name,
      worker_id: tech.worker_id,
      productivity_percentage: tech.productivity_percentage,
      status: tech.status,
      isCurrent: tech.worker_id === currentWorkerId,
    }));

  const height = Math.max(MIN_HEIGHT, chartData.length * ROW_HEIGHT);

  const longestName = chartData.reduce(
    (max, entry) => Math.max(max, entry.technician.length),
    0,
  );
  const yAxisWidth = Math.min(280, Math.max(150, longestName * 6.5));

  const maxPercentage = chartData.reduce(
    (max, entry) => Math.max(max, entry.productivity_percentage),
    0,
  );
  const xAxisMax = Math.max(120, Math.ceil((maxPercentage + 10) / 10) * 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Comparativo con tus compañeros</CardTitle>
        </div>
        <CardDescription>
          Productividad del equipo de tu sede en el período seleccionado
        </CardDescription>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
          {STATUS_LEGEND.map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: STATUS_HEX[status] }}
              />
              <span className="text-xs text-muted-foreground">
                {STATUS_LABEL[status]}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 12, right: 40, top: 28 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              domain={[0, xAxisMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              dataKey="technician"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={yAxisWidth}
              interval={0}
              tick={(props) => {
                const { x, y, payload } = props;
                const isCurrent = chartData.find(
                  (d) => d.technician === payload.value,
                )?.isCurrent;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    fontSize={12}
                    fontWeight={isCurrent ? 700 : 400}
                    fill={isCurrent ? "var(--primary)" : "var(--foreground)"}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      {item.technician}
                    </p>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-xs text-muted-foreground">
                        Productividad:
                      </span>
                      <span className="text-sm font-bold">
                        {item.productivity_percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-xs text-muted-foreground">
                        Estado:
                      </span>
                      <span className="text-sm font-bold">
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="productivity_percentage" radius={6}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_HEX[entry.status]}
                  fillOpacity={entry.isCurrent ? 1 : 0.55}
                />
              ))}
              <LabelList
                dataKey="productivity_percentage"
                position="right"
                className="fill-foreground"
                fontSize={12}
                fontWeight={500}
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
            <ReferenceLine
              x={100}
              stroke="var(--foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={<GoalFlagLabel />}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
