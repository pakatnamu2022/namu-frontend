"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ProductivityHistoricalTrends } from "../lib/productivityHistorical.interface";

interface ProductivityOtsCoverageChartProps {
  trends: ProductivityHistoricalTrends;
  year: number;
}

const chartConfig = {
  ots_closed: {
    label: "OTs cerradas",
    color: "#8b5cf6",
  },
  labour_coverage_rate: {
    label: "% OTs con M.O. registrada",
    color: "#f59e0b",
  },
};

export default function ProductivityOtsCoverageChart({
  trends,
  year,
}: ProductivityOtsCoverageChartProps) {
  const chartData = trends.labels.map((label, index) => ({
    month: label,
    ots_closed: trends.ots_closed[index],
    labour_coverage_rate: trends.labour_coverage_rate[index],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>OTs Cerradas y % con Mano de Obra Registrada</CardTitle>
        <CardDescription>Año {year}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      {item.month} {year}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          OTs cerradas:
                        </span>
                        <span className="text-sm font-bold">
                          {item.ots_closed.toLocaleString("es-PE")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          % OTs con M.O. registrada:
                        </span>
                        <span className="text-sm font-bold">
                          {item.labour_coverage_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ots_closed"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="labour_coverage_rate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
