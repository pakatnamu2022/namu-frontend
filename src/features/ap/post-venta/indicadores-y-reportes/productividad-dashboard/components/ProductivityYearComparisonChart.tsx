"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ProductivityCompareYearsData } from "../lib/productivityHistorical.interface";

interface ProductivityYearComparisonChartProps {
  data: ProductivityCompareYearsData;
}

const YEAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const MONTH_ORDER = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default function ProductivityYearComparisonChart({
  data,
}: ProductivityYearComparisonChartProps) {
  const years = data.years;

  // Combina los labels de todos los años en el eje X, en orden calendario
  const chartData = MONTH_ORDER.map((month) => {
    const row: Record<string, string | number> = { month };
    years.forEach((year) => {
      const entry = data.comparison[year.toString()];
      const index = entry?.trends.labels.indexOf(month);
      row[`year_${year}`] =
        index !== undefined && index >= 0
          ? entry.trends.productivity_percentage[index]
          : NaN;
    });
    return row;
  });

  const chartConfig = years.reduce(
    (config, year, index) => {
      config[`year_${year}`] = {
        label: year.toString(),
        color: YEAR_COLORS[index % YEAR_COLORS.length],
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación de Productividad entre Años</CardTitle>
        <CardDescription>{years.join(" · ")}</CardDescription>
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
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      {label}
                    </p>
                    <div className="space-y-1.5">
                      {payload.map((entry) => (
                        <div
                          key={entry.dataKey as string}
                          className="flex items-center justify-between gap-8"
                        >
                          <span
                            className="text-xs"
                            style={{ color: entry.color }}
                          >
                            {chartConfig[entry.dataKey as string]?.label}:
                          </span>
                          <span className="text-sm font-bold">
                            {typeof entry.value === "number" && !isNaN(entry.value)
                              ? `${entry.value}%`
                              : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {years.map((year, index) => (
              <Line
                key={year}
                type="monotone"
                dataKey={`year_${year}`}
                stroke={YEAR_COLORS[index % YEAR_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
