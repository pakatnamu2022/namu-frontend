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
import { Building2 } from "lucide-react";
import type { AdoptionSede } from "../lib/adoption.interface";

interface Props {
  data: AdoptionSede[];
}

const semaphoreColor: Record<string, string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
};

const semaphoreLabel: Record<string, string> = {
  green: "Óptimo",
  yellow: "En seguimiento",
  red: "Rezagada",
};

const chartConfig = {
  adoption_index: { label: "Índice adopción", color: "#6366f1" },
};

export default function AdoptionSedesRanking({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.adoption_index - a.adoption_index);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4 text-violet-600" />
          Ranking por Sedes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin datos para el período seleccionado
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="sede_name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="adoption_index" name="Índice adopción" radius={[4, 4, 0, 0]}>
                    {sorted.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={semaphoreColor[entry.compliance_semaphore] ?? "#6366f1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left px-3 py-1.5 font-semibold">Sede</th>
                    <th className="text-right px-3 py-1.5 font-semibold">Usuarios</th>
                    <th className="text-right px-3 py-1.5 font-semibold">Ops</th>
                    <th className="text-right px-3 py-1.5 font-semibold">Ops/usr</th>
                    <th className="text-right px-3 py-1.5 font-semibold">Índice</th>
                    <th className="text-left px-3 py-1.5 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((sede) => (
                    <tr
                      key={sede.sede_id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-1.5 font-medium">{sede.sede_name}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {sede.active_users}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {sede.total_ops.toLocaleString()}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {sede.ops_per_user.toFixed(1)}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-semibold">
                        {sede.adoption_index.toFixed(1)}%
                      </td>
                      <td className="px-3 py-1.5">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <span
                            className="size-2 rounded-full inline-block"
                            style={{ background: semaphoreColor[sede.compliance_semaphore] }}
                          />
                          {semaphoreLabel[sede.compliance_semaphore]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
