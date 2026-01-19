"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IndicatorBySede,
  IndicatorBySedeAndBrand,
  IndicatorByAdvisor,
} from "../lib/dashboard.interface";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLeadsVisitSheet from "./DashboardLeadsVisitSheet";
import { DataTable } from "@/shared/components/DataTable";
import { dashboardSedeColumns } from "./DashboardSedeColumns";

interface DashboardSedeTableProps {
  data: IndicatorBySede[];
  selectedSedeId?: number | null;
  brandData?: IndicatorBySedeAndBrand[];
  advisorData?: IndicatorByAdvisor[];
}

export default function DashboardSedeTable({
  data,
  selectedSedeId,
  brandData = [],
  advisorData = [],
}: DashboardSedeTableProps) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedSedeForSheet, setSelectedSedeForSheet] =
    useState<IndicatorBySede | null>(null);

  const handleSedeClick = useCallback((sede: IndicatorBySede) => {
    setSelectedSedeForSheet(sede);
    setActionSheetOpen(true);
  }, []);

  const filteredBrandData = selectedSedeForSheet
    ? brandData.filter((item) => item.sede_id === selectedSedeForSheet.sede_id)
    : [];

  const filteredAdvisorData = selectedSedeForSheet
    ? advisorData.filter(
        (item) => item.sede_id === selectedSedeForSheet.sede_id,
      )
    : [];

  const columns = useMemo(
    () => dashboardSedeColumns({ selectedSedeId, onRowClick: handleSedeClick }),
    [selectedSedeId, handleSedeClick],
  );

  const mobileCardRender = (sede: IndicatorBySede) => {
    const isSelected = selectedSedeId === sede.sede_id;

    return (
      <Card
        onClick={() => handleSedeClick(sede)}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:bg-muted/70",
          isSelected &&
            "bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary",
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div
                className={cn("font-semibold", isSelected && "text-primary")}
              >
                {sede.sede_nombre}
              </div>
              <div className="text-xs text-muted-foreground">
                {sede.sede_abreviatura}
              </div>
            </div>
            <div
              className={cn("font-bold text-lg", isSelected && "text-primary")}
            >
              {sede.total_visitas}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Atendidos</div>
              <div className="font-semibold text-green-600">
                {sede.atendidos}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">No Atendidos</div>
              <div className="font-semibold text-yellow-600">
                {sede.no_atendidos}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Descartados</div>
              <div className="font-semibold text-red-600">
                {sede.descartados}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <DataTable
          columns={columns}
          data={data}
          variant="simple"
          isVisibleColumnFilter={false}
          mobileCardRender={mobileCardRender}
          className={cn(
            "[&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-all [&_tbody_tr]:duration-200",
          )}
        />
      </CardContent>

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
