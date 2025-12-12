"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesManagerStatsResponse } from "../lib/dashboard.interface";

interface SalesManagerStatsCardsProps {
  teamTotals: SalesManagerStatsResponse["data"]["team_totals"];
}

// Componente reutilizable para gráficos pie interactivos
interface InteractivePieChartProps {
  id: string;
  title: string;
  data: Array<{ name: string; value: number; fill: string }>;
  config: ChartConfig;
  valueLabel?: string;
}

function InteractivePieChart({
  id,
  title,
  data,
  config,
  valueLabel = "Cantidad",
}: InteractivePieChartProps) {
  const [activeItem, setActiveItem] = React.useState(data[0]?.name || "");

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [activeItem, data]
  );

  const items = React.useMemo(() => data.map((item) => item.name), [data]);

  return (
    <Card data-chart={id} className="flex flex-col border-none shadow-none">
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Selecciona un valor"
          >
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {items.map((key) => {
              const itemConfig = config[key as keyof typeof config];

              if (!itemConfig) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {itemConfig?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={config}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {data[activeIndex]?.value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {valueLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function SalesManagerStatsCards({
  teamTotals,
}: SalesManagerStatsCardsProps) {
  // Datos para el gráfico de atención
  const attentionData = [
    {
      name: "Atendidos",
      value: teamTotals.attended,
      fill: "var(--color-Atendidos)",
    },
    {
      name: "No Atendidos",
      value: teamTotals.not_attended,
      fill: "var(--color-No Atendidos)",
    },
    {
      name: "Descartados",
      value: teamTotals.discarded,
      fill: "var(--color-Descartados)",
    },
  ];

  const attentionConfig = {
    value: {
      label: "Cantidad",
    },
    Atendidos: {
      label: "Atendidos",
      color: "hsl(var(--chart-2))",
    },
    "No Atendidos": {
      label: "No Atendidos",
      color: "hsl(var(--chart-3))",
    },
    Descartados: {
      label: "Descartados",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Datos para el gráfico de estados de oportunidad
  const opportunityData = Object.entries(teamTotals.by_opportunity_status).map(
    ([name, value]) => ({
      name,
      value,
      fill: `var(--color-${name})`,
    })
  );

  const opportunityConfig = Object.entries(
    teamTotals.by_opportunity_status
  ).reduce(
    (acc, [status], index) => {
      acc[status] = {
        label: status,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    },
    { value: { label: "Cantidad" } } as ChartConfig
  );

  return (
    <div className="space-y-6">
      {/* Gráfico de Estado de Atención */}
      <InteractivePieChart
        id="attention-chart"
        title="Estado de Atención"
        data={attentionData}
        config={attentionConfig}
        valueLabel="Visitas"
      />

      {/* Gráfico de Estados de Oportunidad */}
      {opportunityData.length > 0 && (
        <InteractivePieChart
          id="opportunity-chart"
          title="Estados de Oportunidad"
          data={opportunityData}
          config={opportunityConfig}
          valueLabel="Oportunidades"
        />
      )}
    </div>
  );
}
