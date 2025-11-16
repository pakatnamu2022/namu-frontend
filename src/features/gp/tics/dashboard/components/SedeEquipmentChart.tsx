"use client";

import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEquipmentsBySede } from "../lib/tics.hook";

const chartConfig = {
  visitors: {
    label: "Cantidad de Equipos|",
  },
} as const;

export function EquipmentsBySedeChart() {
  const { data } = useEquipmentsBySede();

  const chartData =
    data?.map((item: { sede: string; total: number }, index: number) => {
      // Calcula la opacidad entre 0.4 y 1 según el índice
      const minOpacity = 1;
      const maxOpacity = 0.7;
      const steps = data.length > 1 ? data.length - 1 : 1;
      const opacity = minOpacity + ((maxOpacity - minOpacity) * index) / steps;

      return {
        browser: item.sede,
        visitors: item.total,
        fill: `rgba(0, 34, 125, ${opacity.toFixed(2)})`,
      };
    }) ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="title-chart">Equipos por empresa</CardTitle>
        <CardDescription className="subtitle-chart">Comparativa visual de cantidades</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pb-0">
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart
            data={chartData}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="browser"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="visitors"
              strokeWidth={1}
              radius={6}
              activeIndex={chartData.findIndex(
                (d) =>
                  d.visitors === Math.max(...chartData.map((c) => c.visitors))
              )}
              activeBar={({ ...props }) => (
                <Rectangle
                  {...props}
                  fillOpacity={1}
                  stroke={props.payload.fill}
                  strokeDasharray={4}
                  strokeDashoffset={4}
                />
              )}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
        <div className="text-muted-foreground leading-none">
          Datos agrupados por empresa registrados en el sistema
        </div>
      </CardFooter>
    </Card>
  );
}
