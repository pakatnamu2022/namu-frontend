"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Trash2,
  Snowflake,
  Flame,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { IndicatorsByDateTotalRange } from "../lib/dashboard.interface";

interface DashboardOverviewCardsProps {
  data: IndicatorsByDateTotalRange;
  type: "VISITA" | "LEADS";
}

export default function DashboardOverviewCards({
  data,
  type,
}: DashboardOverviewCardsProps) {
  const opportunityStateIcons: Record<string, any> = {
    FRIO: Snowflake,
    TEMPLADO: Flame,
    CALIENTE: TrendingUp,
    "VENTA CONCRETADA": CheckCircle2,
    CERRADA: XCircle,
  };

  const opportunityStateColors: Record<string, string> = {
    FRIO: "text-blue-600",
    TEMPLADO: "text-orange-500",
    CALIENTE: "text-red-600",
    "VENTA CONCRETADA": "text-green-600",
    CERRADA: "text-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {type === "LEADS" ? "Total Leads" : "Total Visitas"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_visitas}</div>
            <p className="text-xs text-muted-foreground">
              {type === "LEADS"
                ? "Todos los leads registrados"
                : "Todas las visitas registradas"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendidos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.atendidos}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {data.total_visitas > 0
                ? `${((data.atendidos / data.total_visitas) * 100).toFixed(1)}%`
                : "0%"}{" "}
              del total
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{
                  width: `${
                    data.total_visitas > 0
                      ? ((data.atendidos / data.total_visitas) * 100).toFixed(1)
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Atendidos</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.no_atendidos}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {data.total_visitas > 0
                ? `${((data.no_atendidos / data.total_visitas) * 100).toFixed(
                    1
                  )}%`
                : "0%"}{" "}
              del total
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-600 transition-all duration-500"
                style={{
                  width: `${
                    data.total_visitas > 0
                      ? (
                          (data.no_atendidos / data.total_visitas) *
                          100
                        ).toFixed(1)
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descartados</CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.descartados}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {data.total_visitas > 0
                ? `${((data.descartados / data.total_visitas) * 100).toFixed(
                    1
                  )}%`
                : "0%"}{" "}
              del total
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${
                    data.total_visitas > 0
                      ? ((data.descartados / data.total_visitas) * 100).toFixed(
                          1
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity States */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Estados de Oportunidad</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(data.por_estado_oportunidad).map(([state, count]) => {
            const Icon = opportunityStateIcons[state] || Users;
            const colorClass = opportunityStateColors[state] || "text-gray-600";
            const borderColor =
              state === "FRIO"
                ? "#2563eb"
                : state === "TEMPLADO"
                ? "#f97316"
                : state === "CALIENTE"
                ? "#dc2626"
                : state === "VENTA CONCRETADA"
                ? "#16a34a"
                : "#6b7280";
            const bgColor =
              state === "FRIO"
                ? "bg-blue-600"
                : state === "TEMPLADO"
                ? "bg-orange-500"
                : state === "CALIENTE"
                ? "bg-red-600"
                : state === "VENTA CONCRETADA"
                ? "bg-green-600"
                : "bg-gray-600";

            return (
              <Card
                key={state}
                className="hover:shadow-lg transition-shadow border-l-4"
                style={{
                  borderLeftColor: borderColor,
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{state}</CardTitle>
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${colorClass}`}>
                    {count}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {data.total_visitas > 0
                      ? `${((count / data.total_visitas) * 100).toFixed(1)}%`
                      : "0%"}{" "}
                    del total
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bgColor} transition-all duration-500`}
                      style={{
                        width: `${
                          data.total_visitas > 0
                            ? ((count / data.total_visitas) * 100).toFixed(1)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
