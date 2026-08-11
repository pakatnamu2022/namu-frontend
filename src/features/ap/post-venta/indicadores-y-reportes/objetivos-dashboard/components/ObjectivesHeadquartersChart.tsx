"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { HeadquartersComparisonChartData } from "../lib/objectivesDashboard.interface";

interface ObjectivesHeadquartersChartProps {
  chartData: HeadquartersComparisonChartData;
}

const chartConfig = {
  objectives: {
    label: "Objetivo",
    color: "var(--color-gray-300)",
  },
  progress: {
    label: "Avance",
    color: "var(--primary)",
  },
};

export default function ObjectivesHeadquartersChart({
  chartData,
}: ObjectivesHeadquartersChartProps) {
  const data = chartData.labels.map((label, index) => ({
    sede: label,
    objectives: chartData.datasets.objectives[index] ?? 0,
    progress: chartData.datasets.progress[index] ?? 0,
    completion_percentage: chartData.datasets.completion_percentages[index] ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo por Sede</CardTitle>
        <CardDescription>Objetivo vs. avance real del período</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="sede" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      {item.sede}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">Objetivo:</span>
                        <span className="text-sm font-bold">
                          S/ {item.objectives.toLocaleString("es-PE")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">Avance:</span>
                        <span className="text-sm font-bold">
                          S/ {item.progress.toLocaleString("es-PE")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">Cumplimiento:</span>
                        <span className="text-sm font-bold">
                          {item.completion_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="objectives" fill="var(--color-gray-300)" radius={4} />
            <Bar dataKey="progress" fill="var(--primary)" radius={4}>
              <LabelList
                dataKey="completion_percentage"
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
