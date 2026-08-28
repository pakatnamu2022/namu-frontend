"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/DataTable";
import { formatHours, formatMoney } from "@/core/core.function";
import { ProductivityHeadquarterSummary } from "../lib/productivityDashboard.interface";
import { productivityHeadquartersColumns } from "./ProductivityHeadquartersColumns";
import {
  PRODUCTIVITY_STATUS_BADGE_COLOR,
  PRODUCTIVITY_STATUS_LABEL,
} from "../lib/productivityDashboard.constants";

interface ProductivityHeadquartersTableProps {
  data: ProductivityHeadquarterSummary[];
}

export default function ProductivityHeadquartersTable({
  data,
}: ProductivityHeadquartersTableProps) {
  const columns = useMemo(() => productivityHeadquartersColumns(), []);

  const mobileCardRender = (sede: ProductivityHeadquarterSummary) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">
              #{sede.rank} · {sede.sede_name}
            </div>
            <div className="text-xs text-muted-foreground">
              {sede.sede_abbreviation} · {sede.technician_count} técnicos
            </div>
          </div>
          <Badge color={PRODUCTIVITY_STATUS_BADGE_COLOR[sede.status]}>
            {PRODUCTIVITY_STATUS_LABEL[sede.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Estándar</div>
            <div className="font-semibold">
              {formatHours(sede.total_standard_hours)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Facturadas</div>
            <div className="font-semibold">
              {formatHours(sede.total_billed_hours)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Productividad</div>
            <div
              className={cn(
                "font-semibold",
                sede.total_productivity_hours < 0
                  ? "text-red-600"
                  : "text-green-600",
              )}
            >
              {sede.total_productivity_hours >= 0 ? "+" : "-"}
              {formatHours(Math.abs(sede.total_productivity_hours))}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ganancia</div>
            <div
              className={cn(
                "font-semibold",
                sede.total_earnings < 0 ? "text-red-600" : "",
              )}
            >
              {formatMoney(sede.total_earnings)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Ranking por Sede</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          variant="simple"
          isVisibleColumnFilter={false}
          mobileCardRender={mobileCardRender}
        />
      </CardContent>
    </Card>
  );
}
