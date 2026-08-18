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

interface AppointmentTypePlanningChartProps {
  data: CalendarAppointmentsByTypePlanning[];
}

const chartConfig = {
  count: {
    label: "Citas",
    color: "var(--primary)",
  },
};

export default function AppointmentTypePlanningChart({
  data,
}: AppointmentTypePlanningChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      type_planning: item.type_planning,
      count: item.count,
      percentage: item.percentage,
    }));

  const chartHeight = Math.max(chartData.length * 36, 120);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Citas por Tipo de Trabajo</CardTitle>
        <CardDescription>Cantidad de citas del período</CardDescription>
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
