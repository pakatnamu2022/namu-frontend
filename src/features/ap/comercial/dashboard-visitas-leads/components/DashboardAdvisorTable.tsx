"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndicatorByAdvisor } from "../lib/dashboard.interface";
import { UserCircle } from "lucide-react";

interface DashboardAdvisorTableProps {
  data: IndicatorByAdvisor[];
  selectedSedeId?: number | null;
}

export default function DashboardAdvisorTable({
  data,
  selectedSedeId,
}: DashboardAdvisorTableProps) {
  // Sort by total visits descending
  const sortedData = [...data].sort(
    (a, b) => b.total_visitas - a.total_visitas
  );

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Rendimiento por Asesor</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Asesor</TableHead>
                {!selectedSedeId && (
                  <TableHead className="font-bold">Sede</TableHead>
                )}
                <TableHead className="font-bold">Marca</TableHead>
                <TableHead className="text-center font-bold">Total</TableHead>
                <TableHead className="text-center font-bold">
                  Atendidos
                </TableHead>
                <TableHead className="text-center font-bold">
                  No Atendidos
                </TableHead>
                <TableHead className="text-center font-bold">
                  Descartados
                </TableHead>
                <TableHead className="font-bold">
                  Estados de Oportunidad
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((advisor) => (
                  <TableRow
                    key={`${advisor.worker_id}-${advisor.sede_id}-${advisor.vehicle_brand_id}`}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div className="font-semibold">
                        {advisor.worker_nombre}
                      </div>
                    </TableCell>
                    {!selectedSedeId && (
                      <TableCell>
                        <div>
                          <div className="text-sm">{advisor.sede_nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {advisor.sede_abreviatura}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-sm font-medium">
                        {advisor.marca_nombre}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold text-lg">
                        {advisor.total_visitas}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold text-green-600">
                        {advisor.atendidos}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.total_visitas > 0
                          ? `${(
                              (advisor.atendidos / advisor.total_visitas) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold text-yellow-600">
                        {advisor.no_atendidos}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.total_visitas > 0
                          ? `${(
                              (advisor.no_atendidos / advisor.total_visitas) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold text-red-600">
                        {advisor.descartados}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.total_visitas > 0
                          ? `${(
                              (advisor.descartados / advisor.total_visitas) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(advisor.por_estado_oportunidad).map(
                          ([state, count]) =>
                            count > 0 && (
                              <Badge
                                key={`${advisor.worker_id}-${advisor.sede_id}-${advisor.vehicle_brand_id}-${state}`}
                                variant={
                                  state === "FRIO"
                                    ? "secondary"
                                    : state === "TEMPLADO"
                                    ? "outline"
                                    : state === "CALIENTE"
                                    ? "destructive"
                                    : state === "VENTA CONCRETADA"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {state}: {count as number}
                              </Badge>
                            )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
