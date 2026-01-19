"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { TrendingUp, Users } from "lucide-react";
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
  footerInfo?: {
    label: string;
    value: string | number;
    trend?: string;
    icon?: React.ReactNode;
  };
}

function InteractivePieChart({
  id,
  title,
  data,
  config,
  valueLabel = "Cantidad",
  footerInfo,
}: InteractivePieChartProps) {
  const [activeItem, setActiveItem] = React.useState(data[0]?.name || "");

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [activeItem, data],
  );

  const items = React.useMemo(() => data.map((item) => item.name), [data]);

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex-col gap-2 items-center space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-fit rounded-lg pl-2.5"
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
          className="mx-auto aspect-square w-full max-w-56"
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
      {footerInfo && (
        <CardFooter className="flex-col gap-1 text-sm pt-4">
          <div className="flex items-center gap-2 font-medium leading-none">
            {footerInfo.label}: {footerInfo.value}
            {footerInfo.icon}
          </div>
          {footerInfo.trend && (
            <div className="text-muted-foreground text-xs">
              {footerInfo.trend}
            </div>
          )}
        </CardFooter>
      )}
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
      fill: "hsl(var(--chart-2))",
    },
    {
      name: "Pendientes",
      value: teamTotals.not_attended,
      fill: "hsl(var(--chart-3))",
    },
    {
      name: "Descartados",
      value: teamTotals.discarded,
      fill: "hsl(var(--chart-1))",
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
    Pendientes: {
      label: "Pendientes",
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
    }),
  );

  const opportunityConfig = Object.entries(
    teamTotals.by_opportunity_status,
  ).reduce(
    (acc, [status], index) => {
      acc[status] = {
        label: status,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    },  
    { value: { label: "Cantidad" } } as ChartConfig,
  );

  return (
    <div className="space-y-6 grid grid-cols-4 gap-4">
      {/* Gráfico de Estado de Atención */}
      <InteractivePieChart
        id="attention-chart"
        title="Estado de Atención"
        data={attentionData}
        config={attentionConfig}
        valueLabel="Visitas"
        footerInfo={{
          label: "Total visitas",
          value: teamTotals.total_visits.toLocaleString(),
          trend: `${teamTotals.attention_percentage.toFixed(1)}% atendidos`,
          icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
        }}
      />

      {/* Gráfico de Estados de Oportunidad */}
      {opportunityData.length > 0 && (
        <InteractivePieChart
          id="opportunity-chart"
          title="Estados de Oportunidad"
          data={opportunityData}
          config={opportunityConfig}
          valueLabel="Oportunidades"
          footerInfo={{
            label: "Total oportunidades",
            value: Object.values(teamTotals.by_opportunity_status)
              .reduce((sum, val) => sum + val, 0)
              .toLocaleString(),
            trend: `${teamTotals.total_advisors} asesores`,
            icon: <Users className="h-4 w-4 text-blue-500" />,
          }}
        />
      )}
    </div>
  );
}
