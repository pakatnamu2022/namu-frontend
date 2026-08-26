"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { GoalFlagLabel } from "@/shared/components/charts/GoalFlagLabel";
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

  const maxPercentage = chartData.reduce(
    (max, entry) => Math.max(max, entry.productivity_percentage),
    0,
  );
  const xAxisMax = Math.max(120, Math.ceil((maxPercentage + 10) / 10) * 10);

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
        margin={{ left: 12, right: 40, top: 28 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          domain={[0, xAxisMax]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => `${value}%`}
        />
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
          <LabelList
            dataKey="productivity_percentage"
            position="right"
            className="fill-foreground"
            fontSize={11}
            fontWeight={500}
            formatter={(value: number) => `${value}%`}
          />
        </Bar>
        <ReferenceLine
          x={100}
          stroke="var(--foreground)"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          label={<GoalFlagLabel />}
        />
      </BarChart>
    </ChartContainer>
  );
}
