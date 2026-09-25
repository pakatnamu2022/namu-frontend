"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ProductivityHistoricalTrends } from "../lib/productivityHistorical.interface";

interface ProductivityTrendChartProps {
  trends: ProductivityHistoricalTrends;
  year: number;
}

const chartConfig = {
  productivity_percentage: {
    label: "Productividad",
    color: "var(--primary)",
  },
};

export default function ProductivityTrendChart({
  trends,
  year,
}: ProductivityTrendChartProps) {
  const chartData = trends.labels.map((label, index) => ({
    month: label,
    productivity_percentage: trends.productivity_percentage[index],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Productividad Mensual</CardTitle>
        <CardDescription>Año {year}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <BarChart
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
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={["dataMin - 10", "dataMax + 10"]}
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
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-xs text-muted-foreground">
                        Productividad:
                      </span>
                      <span className="text-sm font-bold">
                        {item.productivity_percentage}%
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="productivity_percentage"
              fill="var(--primary)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
