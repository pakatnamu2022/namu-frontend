"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatHours } from "@/core/core.function";
import { ProductivityHistoricalTrends } from "../lib/productivityHistorical.interface";

interface ProductivityHoursComparisonChartProps {
  trends: ProductivityHistoricalTrends;
  year: number;
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

export default function ProductivityHoursComparisonChart({
  trends,
  year,
}: ProductivityHoursComparisonChartProps) {
  const chartData = trends.labels.map((label, index) => ({
    month: label,
    standard_hours: trends.standard_hours[index],
    billed_hours: trends.billed_hours[index],
  }));

  return (
    <Card className="pt-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Horas Facturadas vs. Horas Estándar</CardTitle>
        <CardDescription>Año {year}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 12 }}
          >
            <defs>
              <linearGradient id="fillStandardHours" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-standard_hours)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-standard_hours)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBilledHours" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-billed_hours)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-billed_hours)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => formatHours(value)}
            />
            <ChartTooltip
              cursor={false}
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
                          Horas estándar:
                        </span>
                        <span className="text-sm font-bold">
                          {formatHours(item.standard_hours)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas facturadas:
                        </span>
                        <span className="text-sm font-bold">
                          {formatHours(item.billed_hours)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="standard_hours"
              type="natural"
              fill="url(#fillStandardHours)"
              stroke="var(--color-standard_hours)"
            />
            <Area
              dataKey="billed_hours"
              type="natural"
              fill="url(#fillBilledHours)"
              stroke="var(--color-billed_hours)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
