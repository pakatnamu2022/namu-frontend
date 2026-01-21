import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IndicatorByAdvisor } from "../lib/dashboard.interface";

export type DashboardAdvisorColumn = ColumnDef<IndicatorByAdvisor>;

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
    </div>
  );
}

interface Props {
  selectedSedeId?: number | null;
}

export const dashboardAdvisorColumns = ({
  selectedSedeId,
}: Props): DashboardAdvisorColumn[] => {
  const columns: DashboardAdvisorColumn[] = [
    {
      accessorKey: "worker_nombre",
      header: "Asesor",
      cell: ({ row }) => (
        <div className="font-semibold">{row.original.worker_nombre}</div>
      ),
    },
  ];

  if (!selectedSedeId) {
    columns.push({
      accessorKey: "sede_nombre",
      header: "Sede",
      cell: ({ row }) => {
        const advisor = row.original;
        return (
          <div>
            <div className="text-sm">{advisor.sede_nombre}</div>
            <div className="text-xs text-muted-foreground">
              {advisor.sede_abreviatura}
            </div>
          </div>
        );
      },
    });
  }

  columns.push(
    {
      accessorKey: "marca_nombre",
      header: "Marca",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.marca_nombre}</div>
      ),
    },
    {
      accessorKey: "total_visitas",
      header: "Total",
      cell: ({ getValue }) => (
        <div className="font-bold text-lg text-center">
          {getValue() as number}
        </div>
      ),
    },
    {
      accessorKey: "atendidos",
      header: "Atendidos",
      cell: ({ row }) => (
        <div className="text-center">
          <ProgressCell
            value={row.original.atendidos}
            total={row.original.total_visitas}
            colorClass="text-green-600"
          />
        </div>
      ),
    },
    {
      accessorKey: "no_atendidos",
      header: "No Atendidos",
      cell: ({ row }) => (
        <div className="text-center">
          <ProgressCell
            value={row.original.no_atendidos}
            total={row.original.total_visitas}
            colorClass="text-yellow-600"
          />
        </div>
      ),
    },
    {
      accessorKey: "descartados",
      header: "Descartados",
      cell: ({ row }) => (
        <div className="text-center">
          <ProgressCell
            value={row.original.descartados}
            total={row.original.total_visitas}
            colorClass="text-red-600"
          />
        </div>
      ),
    },
    {
      id: "estados_oportunidad",
      header: "Estados de Oportunidad",
      cell: ({ row }) => {
        const advisor = row.original;

        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(advisor.por_estado_oportunidad).map(
              ([state, count]) =>
                (count as number) > 0 && (
                  <Badge
                    key={`${advisor.worker_id}-${advisor.sede_id}-${advisor.vehicle_brand_id}-${state}`}
                    variant="outline"
                    color={
                      state === "FRIO"
                        ? "secondary"
                        : state === "TEMPLADO"
                          ? "default"
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
  );

  return columns;
};
