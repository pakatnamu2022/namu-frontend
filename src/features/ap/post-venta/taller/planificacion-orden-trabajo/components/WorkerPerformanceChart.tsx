"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";

interface WorkerPerformanceChartProps {
  data: WorkOrderPlanningResource[];
}

const chartConfig = {
  estimadas: {
    label: "Horas Estimadas",
    color: "var(--chart-1)",
  },
  reales: {
    label: "Horas Reales",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function WorkerPerformanceChart({ data }: WorkerPerformanceChartProps) {
  const workerMap = data.reduce(
    (acc, planning) => {
      const name = planning.worker_name;
      if (!acc[name]) {
        acc[name] = { name, estimadas: 0, reales: 0, tareas: 0 };
      }
      acc[name].estimadas += Number(planning.estimated_hours) || 0;
      acc[name].reales += Number(planning.actual_hours) || 0;
      acc[name].tareas += 1;
      return acc;
    },
    {} as Record<
      string,
      { name: string; estimadas: number; reales: number; tareas: number }
    >,
  );

  const chartData = Object.values(workerMap).map((w) => ({
    ...w,
    estimadas: parseFloat(w.estimadas.toFixed(1)),
    reales: parseFloat(w.reales.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Trabajador</CardTitle>
        <CardDescription>
          Horas estimadas vs horas reales por operario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart data={chartData} margin={{ left: 8, right: 8, bottom: 40 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(v) => `${v}h`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span>
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                        :
                      </span>
                      <span className="font-semibold">{value}h</span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="estimadas"
              fill="var(--color-estimadas)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="reales"
              fill="var(--color-reales)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
