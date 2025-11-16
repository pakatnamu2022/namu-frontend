"use client";

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
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import { useEquipmentsEstadoUso } from "../lib/tics.hook";

const chartConfig = {
  NUEVO: {
    label: "Nuevos",
    color: "#00227D",
  },
  USADO: {
    label: "Usados",
    color: "#F01E23",
  },
};

const fallbackChartData = [
  { label: "NUEVO", value: 50, fill: chartConfig.NUEVO.color },
  { label: "USADO", value: 50, fill: chartConfig.USADO.color },
];

export function UseAndNoUseEquipmentsChart() {
  const { data } = useEquipmentsEstadoUso();

  const chartData =
    data?.map((item: UseStateGraphResource) => ({
      label: item.estado_uso,
      value: item.total,
      fill: chartConfig[item.estado_uso]?.color,
    })) ?? fallbackChartData;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="title-chart">Equipos Nuevos y Usados</CardTitle>
        <CardDescription className="subtitle-chart">
          Total de equipos nuevos y usados en la empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex justify-center">
        <ChartContainer config={chartConfig} className="w-full">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="80%"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm items-center">
        <div className="text-muted-foreground leading-none text-center">
          <span className="text-primary font-medium">
            {chartConfig.NUEVO.label} (
            {chartData.find((d) => d.label === "NUEVO")?.value ?? 0})
          </span>{" "}
          vs{" "}
          <span className="text-secondary font-medium">
            {chartConfig.USADO.label} (
            {chartData.find((d) => d.label === "USADO")?.value ?? 0})
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
