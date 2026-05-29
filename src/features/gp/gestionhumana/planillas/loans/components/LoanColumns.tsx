"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoanResource } from "../lib/loan.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { useNavigate } from "react-router-dom";
import { LOAN } from "../lib/loan.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type LoanColumns = ColumnDef<LoanResource>;

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVO: "default",
  COMPLETADO: "secondary",
  ANULADO: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  COMPLETADO: "Completado",
  ANULADO: "Anulado",
};

export const loanColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): LoanColumns[] => [
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "concept",
    header: "Concepto",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "delivery_date",
    header: "Fecha Entrega",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "payment_start",
    header: "Inicio de Pago",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "loan_amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span className="font-mono">
          S/ {val.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "installments_count",
    header: "Cuotas",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "installment_amount",
    header: "Monto Cuota",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span className="font-mono">
          S/ {val.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const val = getValue() as string;
      return (
        <Badge variant={STATUS_VARIANT[val] ?? "outline"}>
          {STATUS_LABELS[val] ?? val}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = LOAN;

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
