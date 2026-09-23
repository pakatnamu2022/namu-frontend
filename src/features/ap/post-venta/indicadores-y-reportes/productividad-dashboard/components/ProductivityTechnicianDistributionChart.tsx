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
import {
  PRODUCTIVITY_STATUS_HEX,
  PRODUCTIVITY_STATUS_LABEL,
} from "../lib/productivityDashboard.constants";
import { ProductivityHistoricalTrends } from "../lib/productivityHistorical.interface";

interface ProductivityTechnicianDistributionChartProps {
  trends: ProductivityHistoricalTrends;
  year: number;
}

const chartConfig = {
  technicians_exceeded: {
    label: PRODUCTIVITY_STATUS_LABEL.exceeded,
    color: PRODUCTIVITY_STATUS_HEX.exceeded,
  },
  technicians_on_track: {
    label: PRODUCTIVITY_STATUS_LABEL.on_track,
    color: PRODUCTIVITY_STATUS_HEX.on_track,
  },
  technicians_warning: {
    label: PRODUCTIVITY_STATUS_LABEL.warning,
    color: PRODUCTIVITY_STATUS_HEX.warning,
  },
  technicians_critical: {
    label: PRODUCTIVITY_STATUS_LABEL.critical,
    color: PRODUCTIVITY_STATUS_HEX.critical,
  },
};

export default function ProductivityTechnicianDistributionChart({
  trends,
  year,
}: ProductivityTechnicianDistributionChartProps) {
  const chartData = trends.labels.map((label, index) => ({
    month: label,
    technicians_exceeded: trends.technicians_exceeded[index],
    technicians_on_track: trends.technicians_on_track[index],
    technicians_warning: trends.technicians_warning[index],
    technicians_critical: trends.technicians_critical[index],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución Mensual de Técnicos por Performance</CardTitle>
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
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
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
                        <span className="text-xs" style={{ color: PRODUCTIVITY_STATUS_HEX.exceeded }}>
                          {PRODUCTIVITY_STATUS_LABEL.exceeded}:
                        </span>
                        <span className="text-sm font-bold">{item.technicians_exceeded}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs" style={{ color: PRODUCTIVITY_STATUS_HEX.on_track }}>
                          {PRODUCTIVITY_STATUS_LABEL.on_track}:
                        </span>
                        <span className="text-sm font-bold">{item.technicians_on_track}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs" style={{ color: PRODUCTIVITY_STATUS_HEX.warning }}>
                          {PRODUCTIVITY_STATUS_LABEL.warning}:
                        </span>
                        <span className="text-sm font-bold">{item.technicians_warning}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs" style={{ color: PRODUCTIVITY_STATUS_HEX.critical }}>
                          {PRODUCTIVITY_STATUS_LABEL.critical}:
                        </span>
                        <span className="text-sm font-bold">{item.technicians_critical}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="technicians_exceeded"
              stackId="technicians"
              fill={PRODUCTIVITY_STATUS_HEX.exceeded}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="technicians_on_track"
              stackId="technicians"
              fill={PRODUCTIVITY_STATUS_HEX.on_track}
            />
            <Bar
              dataKey="technicians_warning"
              stackId="technicians"
              fill={PRODUCTIVITY_STATUS_HEX.warning}
            />
            <Bar
              dataKey="technicians_critical"
              stackId="technicians"
              fill={PRODUCTIVITY_STATUS_HEX.critical}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
