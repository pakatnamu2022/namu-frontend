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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Rectangle, XAxis } from "recharts";
import { ResultsStats } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.interface";
import { SCALE_TO_COLOR_MAP } from "../../parametros/lib/parameter.constans";
import { getScales } from "../../parametros/lib/parameter.hook";

type EvaluationResultsChartProps = {
  resultsStats?: ResultsStats;
};

type ChartDatum = {
  rangeLabel: string;
  count: number;
  percentage: number;
  fill: string;
};

export function EvaluationResultsChart({
  resultsStats,
}: EvaluationResultsChartProps) {
  if (!resultsStats || resultsStats.ranges.length === 0) {
    return null;
  }

  const chartData: ChartDatum[] = resultsStats.ranges.map((range, index) => {
    const PARAMETER_SCALES = getScales(resultsStats.ranges.length);
    const scaleClass = PARAMETER_SCALES[index % PARAMETER_SCALES.length];
    return {
      rangeLabel: range.range_label,
      count: range.count,
      percentage: range.percentage,
      fill: SCALE_TO_COLOR_MAP[scaleClass],
    };
  });

  const totalEvaluated = resultsStats.total_evaluated ?? 0;
  const parameterName = resultsStats.parameter_name || "Resultados";

  const activeIndex = chartData.reduce((maxIndex, item, index, array) => {
    return item.count > array[maxIndex].count ? index : maxIndex;
  }, 0);

  const chartConfig: ChartConfig = chartData.reduce<ChartConfig>(
    (config, item) => ({
      ...config,
      [item.rangeLabel]: {
        label: item.rangeLabel,
        color: item.fill,
      },
    }),
    {
      count: {
        label: "Colaboradores",
      },
    },
  );

  const percentageFormatter = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados - Parámetro {parameterName}</CardTitle>
        <CardDescription>
          Distribucion de colaboradores por niveles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rangeLabel"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent nameKey="rangeLabel" className="w-auto" />
              }
            />
            <Bar
              dataKey="count"
              radius={8}
              activeIndex={activeIndex}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                );
              }}
            >
              {chartData.map((item) => (
                <Cell key={item.rangeLabel} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium leading-none text-foreground">
          Total evaluados: {totalEvaluated.toLocaleString("es-ES")}
        </div>
        <span>
          Cada barra representa el numero de colaboradores en el rango.
        </span>
      </CardFooter>
    </Card>
  );
}
