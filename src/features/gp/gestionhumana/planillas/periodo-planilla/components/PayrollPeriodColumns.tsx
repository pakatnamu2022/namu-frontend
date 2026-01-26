"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PayrollPeriodResource } from "../lib/payroll-period.interface";
import { Button } from "@/components/ui/button";
import { Pencil, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PAYROLL_PERIOD } from "../lib/payroll-period.constant";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type PayrollPeriodColumns = ColumnDef<PayrollPeriodResource>;

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "Abierto", variant: "outline" },
  CALCULATED: { label: "Calculado", variant: "secondary" },
  CLOSED: { label: "Cerrado", variant: "default" },
};

export const payrollPeriodColumns = ({
  onDelete,
  onClose,
}: {
  onDelete: (id: number) => void;
  onClose: (id: number) => void;
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
      const config = statusConfig[status] || { label: status, variant: "outline" as const };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { id, can_modify, status } = row.original;
      const { ROUTE_UPDATE } = PAYROLL_PERIOD;

      return (
        <div className="flex items-center gap-2">
          {can_modify && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
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
              title="Cerrar periodo"
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
