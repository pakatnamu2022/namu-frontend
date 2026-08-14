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
import { ProductivityChartData } from "../lib/productivityDashboard.interface";

interface ProductivityTopTechniciansChartProps {
  chartData: ProductivityChartData;
}

const chartConfig = {
  standard_hours: {
    label: "Horas estándar",
    color: "var(--color-gray-300)",
  },
  billed_hours: {
    label: "Horas facturadas",
    color: "var(--primary)",
  },
};

export default function ProductivityTopTechniciansChart({
  chartData,
}: ProductivityTopTechniciansChartProps) {
  const data = chartData.labels.map((label, index) => ({
    technician: label,
    standard_hours: chartData.datasets.standard_hours[index] ?? 0,
    billed_hours: chartData.datasets.billed_hours[index] ?? 0,
    productivity_hours: chartData.datasets.productivity_hours[index] ?? 0,
    productivity_percentage:
      chartData.datasets.productivity_percentage[index] ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Técnicos</CardTitle>
        <CardDescription>
          Horas estándar vs. facturadas del período
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-96 w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 12, right: 24, top: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="technician"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={160}
              tick={{ fontSize: 11 }}
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas estándar:
                        </span>
                        <span className="text-sm font-bold">
                          {item.standard_hours.toLocaleString("es-PE")} h
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas facturadas:
                        </span>
                        <span className="text-sm font-bold">
                          {item.billed_hours.toLocaleString("es-PE")} h
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Productividad:
                        </span>
                        <span className="text-sm font-bold">
                          {item.productivity_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="standard_hours"
              fill="var(--color-gray-300)"
              radius={4}
            />
            <Bar dataKey="billed_hours" fill="var(--primary)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
