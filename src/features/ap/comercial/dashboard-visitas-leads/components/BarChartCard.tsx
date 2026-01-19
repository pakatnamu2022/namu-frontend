"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BarChartData {
  fecha: Date;
  total_visitas: number;
  promedio_tiempo: string;
  porcentaje_atendidos: number;
}

interface BarChartCardProps {
  data: BarChartData[];
  type: "VISITA" | "LEADS";
  onBarClick: (index: number) => void;
}

const barChartConfig = {
  total_visitas: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
};

export default function BarChartCard({
  data,
  type,
  onBarClick,
}: BarChartCardProps) {
  const totalCount = data.reduce((acc, curr) => acc + curr.total_visitas, 0);
  const typeLabel = type === "LEADS" ? "Leads" : "Visitas";

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6!">
          <CardTitle>{typeLabel} por Fecha</CardTitle>
          <CardDescription>
            Haz clic en una barra para ver los detalles de esa fecha
          </CardDescription>
        </div>
        <div className="flex items-center justify-center px-6 py-4 sm:py-6 border-t sm:border-t-0 sm:border-l bg-muted/20">
          <div className="text-center">
            <span className="text-muted-foreground text-xs">
              Total de {typeLabel}
            </span>
            <div className="text-lg leading-none font-bold sm:text-3xl mt-1">
              {totalCount.toLocaleString()}
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
            data={data}
            margin={{ left: 12, right: 12 }}
            onClick={(e) => {
              if (e && e.activeTooltipIndex !== undefined) {
                onBarClick(e.activeTooltipIndex);
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
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <div className="mb-2 border-b pb-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {format(new Date(item.fecha), "PPP", { locale: es })}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Total de {typeLabel}:
                        </span>
                        <span className="text-sm font-bold">
                          {item.total_visitas}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Promedio de Tiempo:
                        </span>
                        <span className="text-sm font-bold">
                          {item.promedio_tiempo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Porcentaje Atendidos:
                        </span>
                        <span className="text-sm font-bold">
                          {item.porcentaje_atendidos}%
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
              onClick={(_, index) => onBarClick(index)}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
