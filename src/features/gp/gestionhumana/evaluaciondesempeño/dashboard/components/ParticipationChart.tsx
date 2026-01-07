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
      <CardHeader className="flex-col sm:flex-row items-start space-y-2 sm:space-y-0 pb-4 sm:pb-0">
        <div className="grid gap-1 flex-1">
          <CardTitle className="text-primary">Distribución de Participantes</CardTitle>
          <CardDescription>Estado actual de las evaluaciones</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger
            className="w-full sm:w-[140px] sm:ml-auto h-7 rounded-lg pl-2.5"
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
      <CardContent className="flex flex-col h-full px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between h-full gap-6 lg:gap-8">
          {/* Gráfico de pie */}
          <div className="shrink-0 flex items-center justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="w-60 h-60 sm:w-[280px] sm:h-[280px]"
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
                  innerRadius={60}
                  outerRadius={100}
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
                              className="fill-primary text-3xl sm:text-4xl font-bold"
                            >
                              {participationData[
                                activeIndex
                              ].participants.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-primary/70 text-xs sm:text-sm"
                            >
                              Participantes
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 36}
                              className="fill-primary text-xs sm:text-sm font-medium"
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

          {/* Leyenda lateral/inferior */}
          <div className="flex flex-col gap-4 lg:gap-6 w-full lg:flex-1 lg:ml-0">
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
                      className="w-4 h-4 rounded-sm shrink-0"
                      style={{ backgroundColor: `var(--color-${item.status})` }}
                    />
                    <span className="text-sm font-medium text-left text-primary">
                      {config?.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-primary">{item.participants}</p>
                    <p className="text-xs text-primary/60">
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
