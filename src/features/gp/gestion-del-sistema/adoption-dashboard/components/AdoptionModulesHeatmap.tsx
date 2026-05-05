import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LayoutGrid } from "lucide-react";
import type { AdoptionModule } from "../lib/adoption.interface";

interface Props {
  data: AdoptionModule[];
}

const MODULE_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

const chartConfig = {
  share_pct: { label: "Participación (%)", color: "#6366f1" },
  total_ops: { label: "Operaciones", color: "#10b981" },
};

export default function AdoptionModulesHeatmap({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.total_ops - a.total_ops);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="size-4 text-amber-600" />
          Uso por Módulos — Heatmap de Adopción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin datos para el período seleccionado
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Volume bar chart */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Volumen de operaciones
                </p>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sorted}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis
                        type="category"
                        dataKey="module"
                        tick={{ fontSize: 11 }}
                        width={80}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total_ops" name="Operaciones" radius={[0, 4, 4, 0]}>
                        {sorted.map((_, i) => (
                          <Cell key={i} fill={MODULE_COLORS[i % MODULE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Share % bar chart */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Participación (%)
                </p>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sorted}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <YAxis
                        type="category"
                        dataKey="module"
                        tick={{ fontSize: 11 }}
                        width={80}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="share_pct" name="Participación (%)" radius={[0, 4, 4, 0]}>
                        {sorted.map((_, i) => (
                          <Cell
                            key={i}
                            fill={MODULE_COLORS[i % MODULE_COLORS.length]}
                            fillOpacity={0.7}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Heatmap cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
              {sorted.map((mod, i) => {
                const intensity = Math.max(0.15, mod.share_pct / 100);
                const color = MODULE_COLORS[i % MODULE_COLORS.length];
                return (
                  <div
                    key={mod.module}
                    className="rounded-lg border p-3 flex flex-col gap-1"
                    style={{
                      background: `${color}${Math.round(intensity * 40).toString(16).padStart(2, "0")}`,
                      borderColor: `${color}55`,
                    }}
                  >
                    <span className="text-xs font-bold capitalize truncate" style={{ color }}>
                      {mod.module}
                    </span>
                    <span className="text-lg font-semibold tabular-nums">
                      {mod.total_ops.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mod.share_pct.toFixed(1)}% del total
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
