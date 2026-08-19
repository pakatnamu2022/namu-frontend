"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarAppointmentsByTypePlanning } from "../lib/appointmentPlanning.interface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppointmentTypeStatusFilter = "tomadas" | "pendientes" | null;

interface AppointmentTypePlanningChartProps {
  data: CalendarAppointmentsByTypePlanning[];
  statusFilter?: AppointmentTypeStatusFilter;
  onStatusFilterChange?: (status: AppointmentTypeStatusFilter) => void;
}

const chartConfig = {
  count: {
    label: "Citas",
    color: "var(--primary)",
  },
};

const STATUS_FILTER_LABEL: Record<
  NonNullable<AppointmentTypeStatusFilter> | "todo",
  string
> = {
  todo: "Todas las citas",
  tomadas: "Solo citas tomadas",
  pendientes: "Solo citas pendientes",
};

const FILTER_OPTIONS: { key: NonNullable<AppointmentTypeStatusFilter> | "todo"; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "tomadas", label: "Tomadas" },
  { key: "pendientes", label: "Pendientes" },
];

export default function AppointmentTypePlanningChart({
  data,
  statusFilter,
  onStatusFilterChange,
}: AppointmentTypePlanningChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      type_planning: item.type_planning,
      count: item.count,
      percentage: item.percentage,
    }));

  const chartHeight = Math.max(chartData.length * 36, 120);
  const activeFilter = statusFilter ?? "todo";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Citas por Tipo de Trabajo</CardTitle>
          <CardDescription>
            {STATUS_FILTER_LABEL[activeFilter]}
          </CardDescription>
        </div>
        {onStatusFilterChange && (
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.key}
                type="button"
                size="sm"
                variant={activeFilter === option.key ? "default" : "ghost"}
                className={cn("h-7 px-2.5 text-xs")}
                onClick={() =>
                  onStatusFilterChange(
                    option.key === "todo" ? null : option.key,
                  )
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height: chartHeight }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="type_planning"
              tickLine={false}
              axisLine={false}
              width={150}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      {item.type_planning}
                    </p>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-xs text-muted-foreground">
                        Citas:
                      </span>
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-xs text-muted-foreground">
                        Porcentaje:
                      </span>
                      <span className="text-sm font-bold">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" fill="var(--primary)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
