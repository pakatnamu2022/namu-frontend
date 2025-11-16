"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
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

// Interfaces
interface ProgressStats {
  completed_participants: number;
  in_progress_participants: number;
  not_started_participants: number;
  total_participants: number;
}

interface ParticipationChartProps {
  progressStats: ProgressStats;
}

interface ParticipationDataItem {
  status: string;
  participants: number;
  fill: string;
}

// Configuración del chart con tus colores específicos
const chartConfig = {
  participants: {
    label: "Participantes",
  },
  completed: {
    label: "Completado",
    color: "hsl(var(--primary))",
  },
  in_progress: {
    label: "En Progreso",
    color: "hsl(var(--tertiary))",
  },
  not_started: {
    label: "Sin Iniciar",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

export const ParticipationChart: React.FC<ParticipationChartProps> = ({
  progressStats,
}) => {
  const id = "participation-chart";

  // Preparar los datos
  const participationData: ParticipationDataItem[] = React.useMemo(
    () => [
      {
        status: "completed",
        participants: progressStats.completed_participants,
        fill: "var(--color-completed)",
      },
      {
        status: "in_progress",
        participants: progressStats.in_progress_participants,
        fill: "var(--color-in_progress)",
      },
      {
        status: "not_started",
        participants: progressStats.not_started_participants,
        fill: "var(--color-not_started)",
      },
    ],
    [progressStats]
  );

  // Estado para el elemento activo
  const [activeStatus, setActiveStatus] = React.useState(
    participationData[0].status
  );

  // Calcular el índice activo
  const activeIndex = React.useMemo(
    () => participationData.findIndex((item) => item.status === activeStatus),
    [activeStatus, participationData]
  );

  // Lista de estados disponibles
  const statuses = React.useMemo(
    () => participationData.map((item) => item.status),
    [participationData]
  );

  // Calcular porcentaje del elemento activo
  const activePercentage = React.useMemo(() => {
    const activeItem = participationData[activeIndex];
    return (
      (activeItem.participants / progressStats.total_participants) *
      100
    ).toFixed(1);
  }, [activeIndex, participationData, progressStats.total_participants]);

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Distribución de Participantes</CardTitle>
          <CardDescription>Estado actual de las evaluaciones</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger
            className="ml-auto h-7 w-[140px] rounded-lg pl-2.5"
            aria-label="Seleccionar estado"
          >
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {statuses.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
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
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="flex flex-row items-center justify-between h-full">
          {/* Gráfico de pie */}
          <div className="flex-shrink-0">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="w-[280px] h-[280px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={participationData}
                  dataKey="participants"
                  nameKey="status"
                  innerRadius={70}
                  outerRadius={120}
                  strokeWidth={2}
                  activeIndex={activeIndex}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 8} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 20}
                        innerRadius={outerRadius + 12}
                        fillOpacity={0.3}
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
                              y={viewBox.cy ?? 0 - 12}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {participationData[
                                activeIndex
                              ].participants.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                              className="fill-muted-foreground text-sm"
                            >
                              Participantes
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 38}
                              className="fill-muted-foreground text-sm font-medium"
                            >
                              {activePercentage}%
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Leyenda lateral */}
          <div className="flex flex-col gap-6 ml-8 flex-1">
            {participationData.map((item, index) => {
              const config =
                chartConfig[item.status as keyof typeof chartConfig];
              const percentage = (
                (item.participants / progressStats.total_participants) *
                100
              ).toFixed(1);
              const isActive = item.status === activeStatus;

              return (
                <button
                  key={index}
                  onClick={() => setActiveStatus(item.status)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                    isActive ? "bg-muted ring-2 ring-ring/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: `var(--color-${item.status})` }}
                    />
                    <span className="text-sm font-medium text-left">
                      {config?.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{item.participants}</p>
                    <p className="text-xs text-muted-foreground">
                      {percentage}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
