import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import type { AdoptionTrendPoint } from "../lib/adoption.interface";

interface Props {
  data: AdoptionTrendPoint[];
}

const chartConfig = {
  total_ops: { label: "Operaciones", color: "#6366f1" },
  active_users: { label: "Usuarios activos", color: "#10b981" },
};

export default function AdoptionTrend({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.day), "dd/MM", { locale: es }),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-indigo-600" />
          Tendencia Diaria de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin datos para el período seleccionado
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_ops"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  name="Operaciones"
                />
                <Line
                  type="monotone"
                  dataKey="active_users"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Usuarios activos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
