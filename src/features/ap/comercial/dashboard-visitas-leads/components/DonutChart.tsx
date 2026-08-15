"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

export interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  description: string;
  data: DonutChartDataItem[];
  emptyMessage?: string;
}

const donutChartConfig = {
  value: {
    label: "Cantidad",
  },
};

export default function DonutChart({
  title,
  description,
  data,
  emptyMessage = "No hay datos para mostrar",
}: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
            <div className="relative mx-auto aspect-square h-[260px] shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="text-3xl font-bold">{total}</span>
                <span className="text-sm text-muted-foreground">Total</span>
              </div>

              <ChartContainer
                config={donutChartConfig}
                className="mx-auto aspect-square h-[260px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium">{name}:</span>
                            <span className="ml-auto font-mono font-bold">
                              {value}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={sortedData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {sortedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            <ul className="flex w-full min-w-0 flex-col gap-2 overflow-y-auto sm:max-h-[260px] sm:w-56">
              {sortedData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <li
                    key={`legend-${index}`}
                    className="flex min-w-0 items-center gap-2 text-sm"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                    <strong className="w-10 shrink-0 text-right font-mono">
                      {item.value}
                    </strong>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
