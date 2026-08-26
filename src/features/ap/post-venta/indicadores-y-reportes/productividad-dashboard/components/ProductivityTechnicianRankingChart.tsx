"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ProductivityTechnicianDetail } from "../lib/productivityDashboard.interface";
import {
  PRODUCTIVITY_STATUS_HEX,
  PRODUCTIVITY_STATUS_LABEL,
} from "../lib/productivityDashboard.constants";

interface ProductivityTechnicianRankingChartProps {
  data: ProductivityTechnicianDetail[];
}

const chartConfig = {
  productivity_percentage: {
    label: "Productividad",
    color: "var(--primary)",
  },
};

const ROW_HEIGHT = 32;
const MIN_HEIGHT = 160;

export default function ProductivityTechnicianRankingChart({
  data,
}: ProductivityTechnicianRankingChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.productivity_percentage - a.productivity_percentage)
    .map((tech) => ({
      technician: tech.worker_name,
      sede_name: tech.sede_name,
      productivity_percentage: tech.productivity_percentage,
      status: tech.status,
    }));

  const height = Math.max(MIN_HEIGHT, chartData.length * ROW_HEIGHT);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full"
      style={{ height }}
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 12, right: 32, top: 12 }}
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
          interval={0}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const item = payload[0].payload;
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                  {item.technician} · {item.sede_name}
                </p>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-xs text-muted-foreground">
                    Productividad:
                  </span>
                  <span className="text-sm font-bold">
                    {item.productivity_percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-xs text-muted-foreground">
                    Estado:
                  </span>
                  <span className="text-sm font-bold">
                    {
                      PRODUCTIVITY_STATUS_LABEL[
                        item.status as keyof typeof PRODUCTIVITY_STATUS_LABEL
                      ]
                    }
                  </span>
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="productivity_percentage" radius={4}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PRODUCTIVITY_STATUS_HEX[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
