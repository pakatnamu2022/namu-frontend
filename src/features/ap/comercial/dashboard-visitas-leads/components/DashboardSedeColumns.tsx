import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IndicatorBySede } from "../lib/dashboard.interface";

export type DashboardSedeColumn = ColumnDef<IndicatorBySede>;

interface ProgressCellProps {
  value: number;
  total: number;
  colorClass: string;
}

function ProgressCell({ value, total, colorClass }: ProgressCellProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className={cn("font-semibold", colorClass)}>{value}</div>
      <div className="text-xs text-muted-foreground">
        {percentage.toFixed(1)}%
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
        <div
          className={cn(
            "h-full transition-all duration-500",
            colorClass.replace("text-", "bg-"),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface Props {
  selectedSedeId?: number | null;
  onRowClick?: (sede: IndicatorBySede) => void;
}

const cellClickClass = "cursor-pointer -m-2 p-2";

export const dashboardSedeColumns = ({
  selectedSedeId,
  onRowClick,
}: Props): DashboardSedeColumn[] => [
  {
    accessorKey: "sede_nombre",
    header: "Sede",
    cell: ({ row }) => {
      const sede = row.original;
      const isSelected = selectedSedeId === sede.sede_id;

      return (
        <div onClick={() => onRowClick?.(sede)} className={cellClickClass}>
          <div className={cn("font-semibold", isSelected && "text-primary")}>
            {sede.sede_nombre}
          </div>
          <div className="text-xs text-muted-foreground">
            {sede.sede_abreviatura}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "total_visitas",
    header: "Total",
    cell: ({ row, getValue }) => {
      const sede = row.original;
      const isSelected = selectedSedeId === sede.sede_id;
      return (
        <div
          onClick={() => onRowClick?.(sede)}
          className={cn(
            cellClickClass,
            "font-bold text-lg text-center",
            isSelected && "text-primary",
          )}
        >
          {getValue() as number}
        </div>
      );
    },
  },
  {
    accessorKey: "atendidos",
    header: "Atendidos",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div
          onClick={() => onRowClick?.(sede)}
          className={cn(cellClickClass, "text-center")}
        >
          <ProgressCell
            value={sede.atendidos}
            total={sede.total_visitas}
            colorClass="text-green-600"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "no_atendidos",
    header: "No Atendidos",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div
          onClick={() => onRowClick?.(sede)}
          className={cn(cellClickClass, "text-center")}
        >
          <ProgressCell
            value={sede.no_atendidos}
            total={sede.total_visitas}
            colorClass="text-yellow-600"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "descartados",
    header: "Descartados",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div
          onClick={() => onRowClick?.(sede)}
          className={cn(cellClickClass, "text-center")}
        >
          <ProgressCell
            value={sede.descartados}
            total={sede.total_visitas}
            colorClass="text-red-600"
          />
        </div>
      );
    },
  },
  {
    id: "estados_oportunidad",
    header: "Estados de Oportunidad",
    cell: ({ row }) => {
      const sede = row.original;

      return (
        <div
          onClick={() => onRowClick?.(sede)}
          className={cn(cellClickClass, "flex flex-wrap gap-1")}
        >
          {Object.entries(sede.por_estado_oportunidad).map(
            ([state, count]) =>
              (count as number) > 0 && (
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
              ),
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div onClick={() => onRowClick?.(row.original)} className={cellClickClass}>
        <ChevronRight className="h-5 w-5 transition-transform duration-200" />
      </div>
    ),
  },
];
