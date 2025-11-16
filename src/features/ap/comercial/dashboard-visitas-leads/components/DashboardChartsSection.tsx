"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IndicatorsByDateRange } from "../lib/dashboard.interface";

interface DashboardChartsSectionProps {
  data: IndicatorsByDateRange[];
  type: "VISITA" | "LEADS";
}

// Colores para estados de visita
const VISIT_STATUS_COLORS = {
  atendidos: "#22c55e", // green-600
  no_atendidos: "#eab308", // yellow-600
  descartados: "#ef4444", // red-600
};

// Colores para estados de oportunidad
const OPPORTUNITY_STATUS_COLORS: { [key: string]: string } = {
  CALIENTE: "#ef4444", // red-500
  TEMPLADO: "#f59e0b", // amber-500
  FRIO: "#3b82f6", // blue-500
  "VENTA CONCRETADA": "#22c55e", // green-500
  CERRADA: "#6b7280", // gray-500
};

export default function DashboardChartsSection({
  data,
  type,
}: DashboardChartsSectionProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Montar solo en el cliente para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Preparar datos para el gráfico de barras
  const barChartData = useMemo(() => {
    return data.map((item) => ({
      fecha: item.fecha,
      total_visitas: item.total_visitas,
      promedio_tiempo: item.promedio_tiempo, // Convertir a número
      porcentaje_atendidos: item.porcentaje_atendidos,
    }));
  }, [data]);

  // Configuración del chart de barras
  const barChartConfig = {
    total_visitas: {
      label: "Total de " + (type === "LEADS" ? "Leads" : "Visitas"),
      color: "hsl(var(--primary))",
    },
    promedio_tiempo: {
      label: "Promedio de Tiempo",
      color: "hsl(var(--secondary))",
    },
    porcentaje_atendidos: {
      label: "Porcentaje Atendidos",
      color: "hsl(var(--accent))",
    },
  };

  // Datos de la fecha seleccionada
  const selectedDateData = data[selectedDateIndex] || data[0];

  // Preparar datos para el gráfico de anillo de estados de visita
  const visitStatusData = useMemo(() => {
    if (!selectedDateData) return [];
    return [
      {
        name: "Atendidos",
        value: selectedDateData.estados_visita.atendidos,
        color: VISIT_STATUS_COLORS.atendidos,
      },
      {
        name: "No Atendidos",
        value: selectedDateData.estados_visita.no_atendidos,
        color: VISIT_STATUS_COLORS.no_atendidos,
      },
      {
        name: "Descartados",
        value: selectedDateData.estados_visita.descartados,
        color: VISIT_STATUS_COLORS.descartados,
      },
    ].filter((item) => item.value > 0);
  }, [selectedDateData]);

  // Preparar datos para el gráfico de anillo de estados de oportunidad
  const opportunityStatusData = useMemo(() => {
    if (!selectedDateData) return [];
    return selectedDateData.por_estado_oportunidad
      .map((item) => ({
        name: item.estado_oportunidad,
        value: item.cantidad,
        color:
          OPPORTUNITY_STATUS_COLORS[item.estado_oportunidad] ||
          OPPORTUNITY_STATUS_COLORS.FRIO,
      }))
      .filter((item) => item.value > 0);
  }, [selectedDateData]);

  // Configuración para gráficos de anillo
  const donutChartConfig = {
    value: {
      label: "Cantidad",
    },
  };

  // Handler para clic en barra
  const handleBarClick = (_: any, index: number) => {
    setSelectedDateIndex(index);
  };

  // Si no está montado, mostrar un placeholder o skeleton
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <Card className="py-0">
          <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6!">
              <CardTitle>
                {type === "LEADS" ? "Leads " : "Visitas "} por Fecha
              </CardTitle>
              <CardDescription>Cargando gráficos...</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Barras - Total de Visitas por Fecha */}
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6!">
            <CardTitle>
              {type === "LEADS" ? "Leads " : "Visitas "} por Fecha
            </CardTitle>
            <CardDescription>
              Haz clic en una barra para ver los detalles de esa fecha
            </CardDescription>
          </div>
          <div className="flex items-center justify-center px-6 py-4 sm:py-6 border-t sm:border-t-0 sm:border-l bg-muted/20">
            <div className="text-center">
              <span className="text-muted-foreground text-xs">
                Total de {type === "LEADS" ? " Leads" : " Visitas"}
              </span>
              <div className="text-lg leading-none font-bold sm:text-3xl mt-1">
                {data
                  .reduce((acc, curr) => acc + curr.total_visitas, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={barChartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={barChartData}
              margin={{
                left: 12,
                right: 12,
              }}
              onClick={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  handleBarClick(e, e.activeTooltipIndex);
                }
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return format(date, "dd MMM", { locale: es });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="mb-2 border-b pb-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {format(new Date(data.fecha), "PPP", { locale: es })}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-xs text-muted-foreground">
                            Total de
                            {type === "LEADS" ? " Leads" : " Visitas"}:
                          </span>
                          <span className="text-sm font-bold">
                            {data.total_visitas}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-xs text-muted-foreground">
                            Promedio de Tiempo:
                          </span>
                          <span className="text-sm font-bold">
                            {data.promedio_tiempo}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-xs text-muted-foreground">
                            Porcentaje Atendidos:
                          </span>
                          <span className="text-sm font-bold">
                            {data.porcentaje_atendidos}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="total_visitas"
                fill="var(--color-total_visitas)"
                radius={[4, 4, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(data, index) => handleBarClick(data, index)}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Fecha Seleccionada */}
      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-muted-foreground">Mostrando datos de:</p>
        <p className="text-lg font-bold text-primary">
          {selectedDateData
            ? format(new Date(selectedDateData.fecha), "PPP", { locale: es })
            : "Selecciona una fecha"}
        </p>
      </div>

      {/* Gráficos de Anillo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Anillo - Estados de Visita */}
        <Card>
          <CardHeader>
            <CardTitle>
              Estado de
              {type === "LEADS" ? " Leads" : " Visitas"}
            </CardTitle>
            <CardDescription>
              Distribución de visitas por estado de atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visitStatusData.length > 0 ? (
              <div className="relative mx-auto aspect-square h-[300px]">
                {/* Texto del total en el centro */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-3xl font-bold">
                    {visitStatusData.reduce((acc, curr) => acc + curr.value, 0)}
                  </span>
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
                            <>
                              <div className="flex items-center gap-2 w-full">
                                <span className="font-medium">{name}:</span>
                                <span className="ml-auto font-mono font-bold">
                                  {value}
                                </span>
                              </div>
                            </>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={visitStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {visitStatusData.map((entry, index) => (
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
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Anillo - Estados de Oportunidad */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Oportunidades</CardTitle>
            <CardDescription>
              Distribución de visitas por estado de oportunidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            {opportunityStatusData.length > 0 ? (
              <div className="relative mx-auto aspect-square h-[300px]">
                {/* Texto del total en el centro */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-3xl font-bold">
                    {opportunityStatusData.reduce(
                      (acc, curr) => acc + curr.value,
                      0
                    )}
                  </span>
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
                            <>
                              <div className="flex items-center gap-2 w-full">
                                <span className="font-medium">{name}:</span>
                                <span className="ml-auto font-mono font-bold">
                                  {value}
                                </span>
                              </div>
                            </>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={opportunityStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {opportunityStatusData.map((entry, index) => (
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
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
