"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PayrollPeriodResource } from "../lib/payroll-period.interface";
import { Button } from "@/components/ui/button";
import { Pencil, Lock, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type PayrollPeriodColumns = ColumnDef<PayrollPeriodResource>;

const statusConfig: Record<
  string,
  { label: string; color: "default" | "secondary" | "destructive" | "muted" }
> = {
  OPEN: { label: "Abierto", color: "muted" },
  CALCULATED: { label: "Calculado", color: "secondary" },
  CLOSED: { label: "Cerrado", color: "default" },
};

export const payrollPeriodColumns = ({
  onDelete,
  onClose,
  onEdit,
  onCalculate,
}: {
  onDelete: (id: number) => void;
  onClose: (id: number) => void;
  onEdit: (id: number) => void;
  onCalculate: (period: PayrollPeriodResource) => void;
}): PayrollPeriodColumns[] => [
  {
    accessorKey: "code",
    header: "Codigo",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "year",
    header: "Año",
  },
  {
    accessorKey: "month",
    header: "Mes",
    cell: ({ getValue }) => {
      const month = getValue() as number;
      const date = new Date(2024, month - 1, 1);
      return format(date, "MMMM", { locale: es });
    },
  },
  {
    accessorKey: "start_date",
    header: "Inicio",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "end_date",
    header: "Fin",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "payment_date",
    header: "Fecha de Pago",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const config = statusConfig[status] || {
        label: status,
        color: "default",
      };
      return <Badge color={config.color}>{config.label}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, can_modify, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onCalculate(row.original)}
            tooltip="Calcular nómina"
          >
            <Calculator className="size-4" />
          </Button>
          {can_modify && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onEdit(id)}
              tooltip="Editar periodo"
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {status !== "CLOSED" && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onClose(id)}
              tooltip="Cerrar periodo"
            >
              <Lock className="size-4" />
            </Button>
          )}
          {can_modify && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
