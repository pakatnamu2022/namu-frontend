"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Table as TableIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/DataTable";
import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import { formatHours, formatMoney } from "@/core/core.function";
import { TechnicianProductivityRankingItem } from "../lib/technicianProductivityRanking.interface";
import { technicianProductivityRankingColumns } from "./TechnicianProductivityRankingColumns";
import TechnicianProductivityRankingCharts from "./TechnicianProductivityRankingCharts";
import {
  PRODUCTIVITY_STATUS_BADGE_COLOR,
  PRODUCTIVITY_STATUS_DESCRIPTION,
  PRODUCTIVITY_STATUS_LABEL,
} from "@/features/ap/post-venta/indicadores-y-reportes/productividad-dashboard/lib/productivityDashboard.constants";
import { ProductivityStatus } from "@/features/ap/post-venta/indicadores-y-reportes/productividad-dashboard/lib/productivityDashboard.interface";
import { WORK_ORDER_PLANNING_SESSION } from "../lib/assignedWork.constants";

type ViewMode = "table" | "chart";

const STATUS_LEGEND_ORDER: ProductivityStatus[] = [
  "critical",
  "warning",
  "on_track",
  "exceeded",
];

interface TechnicianProductivityRankingTableProps {
  data: TechnicianProductivityRankingItem[];
  currentPartnerId: number | null;
}

export default function TechnicianProductivityRankingTable({
  data,
  currentPartnerId,
}: TechnicianProductivityRankingTableProps) {
  const { values: tableFilters, setFieldValue: setTableFilter } =
    useScopedFilters(`${WORK_ORDER_PLANNING_SESSION.ABSOLUTE_ROUTE}/ranking`, {
      rankingViewMode: "table" as ViewMode,
    });
  const { rankingViewMode: viewMode } = tableFilters;
  const setViewMode = (value: ViewMode) =>
    setTableFilter("rankingViewMode", value);

  const columns = useMemo(() => technicianProductivityRankingColumns(), []);

  // Si el usuario logueado es uno de los técnicos de la lista, solo se muestra su fila.
  // Si no pertenece a la lista (p.ej. un supervisor viendo el filtro de otro técnico),
  // se muestra la tabla completa.
  const ownRow = useMemo(
    () =>
      currentPartnerId != null
        ? data.find((tech) => tech.worker_id === currentPartnerId)
        : undefined,
    [data, currentPartnerId],
  );

  const filteredData = useMemo(
    () => (ownRow ? [ownRow] : data),
    [ownRow, data],
  );

  const mobileCardRender = (tech: TechnicianProductivityRankingItem) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">
              #{tech.rank} · {tech.worker_name}
              {tech.is_on_leave && (
                <span className="text-red-600"> · Baja</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {tech.worker_dni} · {tech.sede_abbreviation}
            </div>
          </div>
          <Badge color={PRODUCTIVITY_STATUS_BADGE_COLOR[tech.status]}>
            {PRODUCTIVITY_STATUS_LABEL[tech.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {tech.real_hours !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">Reales</div>
              <div className="font-semibold">
                {formatHours(tech.real_hours)}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground">Estándar (8h)</div>
            <div className="font-semibold">
              {formatHours(tech.standard_hours)}
            </div>
            {tech.days_worked !== undefined && (
              <div className="text-xs text-muted-foreground">
                {tech.days_worked} x 8 = {tech.standard_hours}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Facturadas</div>
            <div className="font-semibold">
              {formatHours(tech.billed_hours)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Productividad</div>
            <div
              className={cn(
                "font-semibold",
                tech.productivity_hours < 0 ? "text-red-600" : "text-green-600",
              )}
            >
              {tech.productivity_hours >= 0 ? "+" : ""}
              {formatHours(tech.productivity_hours)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ganancia</div>
            <div
              className={cn(
                "font-semibold",
                tech.earnings < 0 ? "text-red-600" : "",
              )}
            >
              {formatMoney(tech.earnings)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{ownRow ? "Mi avance" : "Comparativo Técnicos"}</CardTitle>
          </div>
          {!ownRow && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
            >
              <ToggleGroupItem value="table" aria-label="Ver como tabla">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="chart" aria-label="Ver como gráfica">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {STATUS_LEGEND_ORDER.map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <Badge color={PRODUCTIVITY_STATUS_BADGE_COLOR[status]}>
                {PRODUCTIVITY_STATUS_LABEL[status]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {PRODUCTIVITY_STATUS_DESCRIPTION[status]}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {ownRow || viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={filteredData}
            variant="simple"
            isVisibleColumnFilter={false}
            mobileCardRender={mobileCardRender}
          />
        ) : (
          <TechnicianProductivityRankingCharts
            data={filteredData}
            currentWorkerId={currentPartnerId}
          />
        )}
      </CardContent>
    </Card>
  );
}
