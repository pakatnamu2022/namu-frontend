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
import { Pie, PieChart, Cell, Legend } from "recharts";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="relative mx-auto aspect-square h-[300px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <span className="text-3xl font-bold">{total}</span>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>

            <ChartContainer
              config={donutChartConfig}
              className="mx-auto aspect-square h-[300px]"
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
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm">
                      {value}: <strong>{entry.payload.value}</strong>
                    </span>
                  )}
                />
              </PieChart>
            </ChartContainer>
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
