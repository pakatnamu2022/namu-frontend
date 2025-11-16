"use client";

import { useState } from "react";
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
import {
  IndicatorBySede,
  IndicatorBySedeAndBrand,
  IndicatorByAdvisor,
} from "../lib/dashboard.interface";
import { Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLeadsVisitSheet from "./DashboardLeadsVisitSheet";

interface DashboardSedeTableProps {
  data: IndicatorBySede[];
  selectedSedeId?: number | null;
  onSedeSelect?: (sedeId: number | null) => void;
  brandData?: IndicatorBySedeAndBrand[];
  advisorData?: IndicatorByAdvisor[];
}

export default function DashboardSedeTable({
  data,
  selectedSedeId,
  onSedeSelect,
  brandData = [],
  advisorData = [],
}: DashboardSedeTableProps) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedSedeForSheet, setSelectedSedeForSheet] =
    useState<IndicatorBySede | null>(null);

  const handleSedeClick = (sede: IndicatorBySede) => {
    // Open action sheet with sede details
    setSelectedSedeForSheet(sede);
    setActionSheetOpen(true);
  };

  const filteredBrandData = selectedSedeForSheet
    ? brandData.filter((item) => item.sede_id === selectedSedeForSheet.sede_id)
    : [];

  const filteredAdvisorData = selectedSedeForSheet
    ? advisorData.filter(
        (item) => item.sede_id === selectedSedeForSheet.sede_id
      )
    : [];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Indicadores por Sede</CardTitle>
          </div>
          {selectedSedeId && (
            <p className="text-sm text-muted-foreground">
              Haz clic en una fila para ver detalles
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Sede</TableHead>
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
                {onSedeSelect && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                data.map((sede) => {
                  const isSelected = selectedSedeId === sede.sede_id;
                  return (
                    <TableRow
                      key={sede.sede_id}
                      onClick={() => handleSedeClick(sede)}
                      className={cn(
                        "transition-all duration-200 cursor-pointer hover:bg-muted/70",
                        isSelected &&
                          "bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary"
                      )}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div
                            className={cn(
                              "font-semibold",
                              isSelected && "text-primary"
                            )}
                          >
                            {sede.sede_nombre}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sede.sede_abreviatura}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={cn(
                            "font-bold text-lg",
                            isSelected && "text-primary"
                          )}
                        >
                          {sede.total_visitas}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-green-600">
                            {sede.atendidos}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sede.total_visitas > 0
                              ? `${(
                                  (sede.atendidos / sede.total_visitas) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full bg-green-600 transition-all duration-500"
                              style={{
                                width: `${
                                  sede.total_visitas > 0
                                    ? (sede.atendidos / sede.total_visitas) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-yellow-600">
                            {sede.no_atendidos}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sede.total_visitas > 0
                              ? `${(
                                  (sede.no_atendidos / sede.total_visitas) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full bg-yellow-600 transition-all duration-500"
                              style={{
                                width: `${
                                  sede.total_visitas > 0
                                    ? (sede.no_atendidos / sede.total_visitas) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-red-600">
                            {sede.descartados}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sede.total_visitas > 0
                              ? `${(
                                  (sede.descartados / sede.total_visitas) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full bg-red-600 transition-all duration-500"
                              style={{
                                width: `${
                                  sede.total_visitas > 0
                                    ? (sede.descartados / sede.total_visitas) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(sede.por_estado_oportunidad).map(
                            ([state, count]) =>
                              count > 0 && (
                                <Badge
                                  key={`${sede.sede_id}-${state}`}
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
                      <TableCell>
                        <ChevronRight className="h-5 w-5 transition-transform duration-200" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Action Sheet */}
      <DashboardLeadsVisitSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        sede={selectedSedeForSheet}
        brandData={filteredBrandData}
        advisorData={filteredAdvisorData}
      />
    </Card>
  );
}
