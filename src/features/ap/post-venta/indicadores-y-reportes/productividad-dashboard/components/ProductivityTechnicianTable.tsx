"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/DataTable";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { ProductivityTechnicianDetail } from "../lib/productivityDashboard.interface";
import { productivityTechnicianColumns } from "./ProductivityTechnicianColumns";
import {
  PRODUCTIVITY_STATUS_BADGE_COLOR,
  PRODUCTIVITY_STATUS_LABEL,
} from "../lib/productivityDashboard.constants";

interface ProductivityTechnicianTableProps {
  data: ProductivityTechnicianDetail[];
}

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

const formatHours = (value: number) =>
  `${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)} h`;

export default function ProductivityTechnicianTable({
  data,
}: ProductivityTechnicianTableProps) {
  const [sedeFilter, setSedeFilter] = useState("");

  const columns = useMemo(() => productivityTechnicianColumns(), []);

  const sedeOptions = useMemo(() => {
    const unique = new Map<number, string>();
    data.forEach((tech) => {
      if (!unique.has(tech.sede_id)) unique.set(tech.sede_id, tech.sede_name);
    });
    return Array.from(unique.entries()).map(([value, label]) => ({
      value: value.toString(),
      label,
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!sedeFilter) return data;
    return data.filter((tech) => tech.sede_id.toString() === sedeFilter);
  }, [data, sedeFilter]);

  const mobileCardRender = (tech: ProductivityTechnicianDetail) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">
              #{tech.rank} · {tech.worker_name}
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
          <div>
            <div className="text-xs text-muted-foreground">Estándar</div>
            <div className="font-semibold">
              {formatHours(tech.standard_hours)}
            </div>
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
                tech.productivity_hours < 0
                  ? "text-red-600"
                  : "text-green-600",
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
              {formatCurrency(tech.earnings)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Detalle por Técnico</CardTitle>
        </div>
        <SearchableSelect
          value={sedeFilter}
          onChange={setSedeFilter}
          options={sedeOptions}
          placeholder="Todas las sedes"
          buttonSize="sm"
          classNameDiv="min-w-[180px]"
        />
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={filteredData}
          variant="simple"
          isVisibleColumnFilter={false}
          mobileCardRender={mobileCardRender}
        />
      </CardContent>
    </Card>
  );
}
