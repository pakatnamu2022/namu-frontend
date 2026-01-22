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
import { useMemo, useState } from "react";
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
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const chartData: ChartDatum[] = useMemo(() => {
    if (!resultsStats || resultsStats.ranges.length === 0) {
      return [];
    }
    return resultsStats.ranges.map((range, index) => {
      const PARAMETER_SCALES = getScales(resultsStats.ranges.length);
      const scaleClass = PARAMETER_SCALES[index % PARAMETER_SCALES.length];
      return {
        rangeLabel: range.range_label,
        count: range.count,
        percentage: range.percentage,
        fill: SCALE_TO_COLOR_MAP[scaleClass],
      };
    });
  }, [resultsStats]);

  const activeIndex = useMemo(() => {
    if (activeItem) {
      const idx = chartData.findIndex((item) => item.rangeLabel === activeItem);
      if (idx !== -1) return idx;
    }
    // Default: el que tiene mayor count
    return chartData.reduce((maxIndex, item, index, array) => {
      return item.count > array[maxIndex].count ? index : maxIndex;
    }, 0);
  }, [activeItem, chartData]);

  if (!resultsStats || resultsStats.ranges.length === 0) {
    return null;
  }

  const totalEvaluated = resultsStats.total_evaluated ?? 0;
  const parameterName = resultsStats.parameter_name || "Resultados";

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

  const activeData = chartData[activeIndex];

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
                <ChartTooltipContent
                  hideLabel
                  nameKey="rangeLabel"
                  formatter={(value, _name, item) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-xs"
                          style={{ backgroundColor: item.payload.fill }}
                        />
                        <span className="font-medium">
                          {item.payload.rangeLabel}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 pl-4 text-muted-foreground">
                        <span>Colaboradores: {value}</span>
                        <span>
                          Porcentaje:{" "}
                          {percentageFormatter.format(item.payload.percentage)}%
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="count"
              radius={8}
              activeIndex={activeIndex}
              className="cursor-pointer"
              onClick={(data) => {
                if (data?.rangeLabel) {
                  setActiveItem(data.rangeLabel);
                }
              }}
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
      <CardFooter className="flex-col items-start gap-1 text-sm">
        {activeData && (
          <>
            <div className="flex items-center gap-2 font-medium leading-none text-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: activeData.fill }}
              />
              {activeData.rangeLabel}:{" "}
              {activeData.count.toLocaleString("es-ES")} colaboradores
            </div>
            <div className="text-muted-foreground text-xs">
              Representa el{" "}
              <strong>
                {percentageFormatter.format(activeData.percentage)}%
              </strong>{" "}
              del total de {totalEvaluated.toLocaleString("es-ES")} evaluados
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
