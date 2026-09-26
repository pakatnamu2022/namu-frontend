"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/core/core.function";
import { LifePolicyResource } from "../lib/life-policy.interface";

export type LifePolicyColumns = ColumnDef<LifePolicyResource>;

export const money = (value: string | number | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const lifePolicyColumns = ({
  onView,
  onEdit,
  onRecalculate,
  isRecalculating,
}: {
  onView: (id: number) => void;
  onEdit: (policy: LifePolicyResource) => void;
  onRecalculate: (id: number) => void;
  isRecalculating?: (id: number) => boolean;
}): LifePolicyColumns[] => [
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.company ?? "—"}</span>
    ),
  },
  {
    accessorKey: "insurer",
    header: "Aseguradora",
    cell: ({ row }) => <span>{row.original.insurer ?? "—"}</span>,
  },
  {
    accessorKey: "policy_number",
    header: "N° Póliza",
    cell: ({ row }) => <span>{row.original.policy_number ?? "—"}</span>,
  },
  {
    id: "vigencia",
    header: "Vigencia",
    cell: ({ row }) => (
      <span>
        {formatDate(row.original.start_date)} al{" "}
        {formatDate(row.original.end_date)}{" "}
        <span className="text-muted-foreground">({row.original.days} d)</span>
      </span>
    ),
  },
  {
    accessorKey: "monthly_rate",
    header: "Tasa mensual",
    cell: ({ row }) => (
      <span>{(Number(row.original.monthly_rate) * 100).toFixed(4)}%</span>
    ),
  },
  {
    accessorKey: "total_insured_salary",
    header: "Total asegurado",
    cell: ({ row }) => <span>S/ {money(row.original.total_insured_salary)}</span>,
  },
  {
    accessorKey: "net_premium",
    header: "Prima neta",
    cell: ({ row }) => <span>S/ {money(row.original.net_premium)}</span>,
  },
  {
    accessorKey: "workers_count",
    header: "Asegurados",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.workers_count ?? 0}</Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const recalculating = isRecalculating?.(row.original.id) ?? false;
      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(row.original.id)}
          >
            <Eye className="size-4 mr-2" /> Ver asegurados
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4 mr-2" /> Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={recalculating}
            onClick={() => onRecalculate(row.original.id)}
            title="Vuelve a leer el sueldo vigente al inicio de la póliza de cada asegurado original y recalcula los totales"
          >
            <RefreshCw
              className={`size-4 mr-2 ${recalculating ? "animate-spin" : ""}`}
            />
            Recalcular
          </Button>
        </div>
      );
    },
  },
];
