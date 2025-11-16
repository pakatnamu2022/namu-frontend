"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { IndicatorsByUser } from "../lib/dashboard.interface";

interface DashboardUserIndicatorsProps {
  data: IndicatorsByUser[];
}

export default function DashboardUserIndicators({
  data,
}: DashboardUserIndicatorsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Importaciones Marketing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos de usuarios disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  const opportunityStates = [
    {
      key: "FRIO",
      label: "Frío",
      color: "text-blue-600",
      bgColor: "bg-blue-600",
    },
    {
      key: "TEMPLADO",
      label: "Templado",
      color: "text-orange-500",
      bgColor: "bg-orange-500",
    },
    {
      key: "CALIENTE",
      label: "Caliente",
      color: "text-red-600",
      bgColor: "bg-red-600",
    },
    {
      key: "VENTA CONCRETADA",
      label: "Venta",
      color: "text-green-600",
      bgColor: "bg-green-600",
    },
    {
      key: "CERRADA",
      label: "Cerrada",
      color: "text-gray-600",
      bgColor: "bg-gray-600",
    },
  ];

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Importaciones Marketing</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Comparativa de importación de leads por usuario y estado de
          oportunidad
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Usuario</TableHead>
                <TableHead className="text-center">Total Leads</TableHead>
                <TableHead className="text-center">Atendidos</TableHead>
                <TableHead className="text-center">No Atendidos</TableHead>
                <TableHead className="text-center">Descartados</TableHead>
                {opportunityStates.map(({ key, label }) => (
                  <TableHead key={key} className="text-center min-w-[80px]">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user, index) => {
                const totalOportunidades = user.por_estado_oportunidad
                  ? Object.values(user.por_estado_oportunidad).reduce(
                      (sum, val) => sum + (val || 0),
                      0
                    )
                  : 0;

                return (
                  <TableRow key={user.user_id || index}>
                    <TableCell className="font-medium">
                      {user.user_nombre || "Sin nombre"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-primary">
                        {user.total_visitas}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {user.estados_visita?.atendidos || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getPercentage(
                            user.estados_visita?.atendidos || 0,
                            user.total_visitas
                          )}
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                          {user.estados_visita?.no_atendidos || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getPercentage(
                            user.estados_visita?.no_atendidos || 0,
                            user.total_visitas
                          )}
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-red-700 dark:text-red-400">
                          {user.estados_visita?.descartados || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getPercentage(
                            user.estados_visita?.descartados || 0,
                            user.total_visitas
                          )}
                          %
                        </span>
                      </div>
                    </TableCell>
                    {opportunityStates.map(({ key, color, bgColor }) => {
                      const value = user.por_estado_oportunidad
                        ? user.por_estado_oportunidad[
                            key as keyof typeof user.por_estado_oportunidad
                          ] || 0
                        : 0;
                      const percentage = getPercentage(
                        value,
                        totalOportunidades
                      );

                      return (
                        <TableCell key={key} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-semibold ${color}`}>
                              {value}
                            </span>
                            {value > 0 && (
                              <div className="w-full max-w-[60px]">
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${bgColor} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Resumen total */}
        {data.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Usuarios
                </p>
                <p className="text-2xl font-bold text-primary">{data.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Leads
                </p>
                <p className="text-2xl font-bold">
                  {data.reduce((sum, user) => sum + user.total_visitas, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Atendidos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {data.reduce(
                    (sum, user) => sum + (user.estados_visita?.atendidos || 0),
                    0
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Oportunidades
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.reduce(
                    (sum, user) =>
                      sum +
                      (user.por_estado_oportunidad
                        ? Object.values(user.por_estado_oportunidad).reduce(
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
