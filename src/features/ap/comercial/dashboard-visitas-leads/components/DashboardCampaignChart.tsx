"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Megaphone, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { IndicatorsByCampaign } from "../lib/dashboard.interface";

interface DashboardCampaignChartProps {
  data: IndicatorsByCampaign[];
}

export default function DashboardCampaignChart({
  data,
}: DashboardCampaignChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle>Indicadores por Campaña</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos de campañas disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  const opportunityStates = [
    { key: "FRIO", label: "Frío", color: "bg-blue-600" },
    { key: "TEMPLADO", label: "Templado", color: "bg-orange-500" },
    { key: "CALIENTE", label: "Caliente", color: "bg-red-600" },
    {
      key: "VENTA CONCRETADA",
      label: "Venta Concretada",
      color: "bg-green-600",
    },
    { key: "CERRADA", label: "Cerrada", color: "bg-gray-600" },
  ];

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  // Calcular el máximo de visitas para escalar las barras
  const maxLeads = Math.max(...data.map((campaign) => campaign.total_visitas));

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <CardTitle>Indicadores por Campaña</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Comparativa de visitas y estados de oportunidad por campaña
        </p>
      </CardHeader>
      <CardContent>
        {/* Grid de Campañas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((campaign, index) => {
            const totalOportunidades = campaign.por_estado_oportunidad
              ? Object.values(campaign.por_estado_oportunidad).reduce(
                  (sum, val) => sum + (val || 0),
                  0
                )
              : 0;

            const barWidth =
              maxLeads > 0 ? (campaign.total_visitas / maxLeads) * 100 : 0;

            return (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header de Campaña */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">
                    {campaign.campaign || "Sin nombre"}
                  </h4>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {campaign.total_visitas}
                    </p>
                    <p className="text-xs text-muted-foreground">visitas</p>
                  </div>
                </div>

                {/* Barra de visitas totales */}
                <div className="mb-3">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Estados de Visita - Más compacto */}
                <div className="flex gap-1.5 mb-3">
                  <div className="flex-1 bg-green-50 dark:bg-green-950/20 p-1.5 rounded border border-green-200 dark:border-green-800">
                    <p className="text-[10px] text-green-700 dark:text-green-400 font-medium leading-tight">
                      Atend.
                    </p>
                    <p className="text-base font-bold text-green-700 dark:text-green-400">
                      {campaign.estados_visita?.atendidos || 0}
                    </p>
                  </div>

                  <div className="flex-1 bg-yellow-50 dark:bg-yellow-950/20 p-1.5 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-[10px] text-yellow-700 dark:text-yellow-400 font-medium leading-tight">
                      No At.
                    </p>
                    <p className="text-base font-bold text-yellow-700 dark:text-yellow-400">
                      {campaign.estados_visita?.no_atendidos || 0}
                    </p>
                  </div>

                  <div className="flex-1 bg-red-50 dark:bg-red-950/20 p-1.5 rounded border border-red-200 dark:border-red-800">
                    <p className="text-[10px] text-red-700 dark:text-red-400 font-medium leading-tight">
                      Desc.
                    </p>
                    <p className="text-base font-bold text-red-700 dark:text-red-400">
                      {campaign.estados_visita?.descartados || 0}
                    </p>
                  </div>
                </div>

                {/* Estados de Oportunidad - Barra apilada */}
                <div>
                  <p className="text-xs font-medium mb-1.5">
                    Estados de Oportunidad
                  </p>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex">
                    {opportunityStates.map(({ key, color }) => {
                      const value = campaign.por_estado_oportunidad
                        ? campaign.por_estado_oportunidad[
                            key as keyof typeof campaign.por_estado_oportunidad
                          ] || 0
                        : 0;
                      const percentage = getPercentage(
                        value,
                        totalOportunidades
                      );

                      if (value === 0) return null;

                      return (
                        <div
                          key={key}
                          className={`${color} flex items-center justify-center transition-all duration-500 relative group`}
                          style={{ width: `${percentage}%` }}
                          title={`${key}: ${value} (${percentage.toFixed(1)}%)`}
                        >
                          {percentage > 12 && (
                            <span className="text-white text-[10px] font-semibold">
                              {value}
                            </span>
                          )}
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                            {key}: {value}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Leyenda de estados - Más compacta */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px]">
                    {opportunityStates.map(({ key, label, color }) => {
                      const value = campaign.por_estado_oportunidad
                        ? campaign.por_estado_oportunidad[
                            key as keyof typeof campaign.por_estado_oportunidad
                          ] || 0
                        : 0;
                      if (value === 0) return null;

                      return (
                        <div key={key} className="flex items-center gap-0.5">
                          <div className={`w-1.5 h-1.5 ${color} rounded-sm`} />
                          <span className="text-muted-foreground">
                            {label}: {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico de Barras - Leads por Campaña */}
        <div className="mt-6 pt-4 border-t">
          <div className="mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ingreso de Leads por Campaña
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Comparativa visual del total de leads generadas
            </p>
          </div>
          <ChartContainer
            config={{
              total_visitas: {
                label: "Leads",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data.map((campaign) => ({
                campaign: campaign.campaign || "Sin nombre",
                total_visitas: campaign.total_visitas,
              }))}
              layout="vertical"
              margin={{
                right: 40,
                left: 10,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="campaign"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="total_visitas" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="total_visitas"
                layout="vertical"
                fill="var(--color-total_visitas)"
                radius={4}
              >
                <LabelList
                  dataKey="campaign"
                  position="insideLeft"
                  offset={8}
                  className="fill-background"
                  fontSize={12}
                  fontWeight={500}
                />
                <LabelList
                  dataKey="total_visitas"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* Resumen Total - Fuera del grid, al pie */}
        {data.length > 1 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-around gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Campañas</p>
                <p className="text-xl font-bold text-primary">{data.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Leads</p>
                <p className="text-xl font-bold">
                  {data.reduce(
                    (sum, campaign) => sum + campaign.total_visitas,
                    0
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Atendidos
                </p>
                <p className="text-xl font-bold text-green-600">
                  {data.reduce(
                    (sum, campaign) =>
                      sum + (campaign.estados_visita?.atendidos || 0),
                    0
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Oportunidades
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {data.reduce(
                    (sum, campaign) =>
                      sum +
                      (campaign.por_estado_oportunidad
                        ? Object.values(campaign.por_estado_oportunidad).reduce(
                            (s, v) => s + (v || 0),
                            0
                          )
                        : 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
