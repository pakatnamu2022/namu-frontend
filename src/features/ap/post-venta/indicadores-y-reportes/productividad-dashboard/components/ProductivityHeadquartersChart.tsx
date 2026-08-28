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
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { ProductivityHeadquarterSummary } from "../lib/productivityDashboard.interface";

interface ProductivityHeadquartersChartProps {
  data: ProductivityHeadquarterSummary[];
}

const chartConfig = {
  total_standard_hours: {
    label: "Horas laborables",
    color: "var(--color-gray-300)",
  },
  total_billed_hours: {
    label: "Horas facturadas",
    color: "var(--primary)",
  },
};

export default function ProductivityHeadquartersChart({
  data,
}: ProductivityHeadquartersChartProps) {
  const chartData = data.map((sede) => ({
    sede: sede.sede_abbreviation,
    sede_name: sede.sede_name,
    total_standard_hours: sede.total_standard_hours,
    total_billed_hours: sede.total_billed_hours,
    average_productivity_percentage: sede.average_productivity_percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo por Sede</CardTitle>
        <CardDescription>
          Horas laborables vs. horas facturadas del período
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-80 w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="sede"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis hide />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      {item.sede_name}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas laborables:
                        </span>
                        <span className="text-sm font-bold">
                          {item.total_standard_hours.toLocaleString("es-PE")} h
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas facturadas:
                        </span>
                        <span className="text-sm font-bold">
                          {item.total_billed_hours.toLocaleString("es-PE")} h
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Productividad:
                        </span>
                        <span className="text-sm font-bold">
                          {item.average_productivity_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="total_standard_hours"
              fill="var(--color-gray-300)"
              radius={4}
            />
            <Bar dataKey="total_billed_hours" fill="var(--primary)" radius={4}>
              <LabelList
                dataKey="average_productivity_percentage"
                position="top"
                formatter={(value: number) => `${value}%`}
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
