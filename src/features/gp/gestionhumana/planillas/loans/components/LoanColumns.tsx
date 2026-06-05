"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoanResource } from "../lib/loan.interface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { useNavigate } from "react-router-dom";
import { LOAN } from "../lib/loan.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type LoanColumns = ColumnDef<LoanResource>;

export const loanColumns = ({
  onDelete,
  onAmortize,
  onDetail,
}: {
  onDelete: (id: number) => void;
  onAmortize: (id: number) => void;
  onDetail: (id: number) => void;
}): LoanColumns[] => [
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "delivery_date",
    header: "Fecha Entrega",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "payment_start",
    header: "Inicio de Pago",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
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
    accessorKey: "remaining_balance",
    header: "Saldo",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span
          className={`font-mono ${Number(val) > 0 ? "text-destructive" : "text-green-600"}`}
        >
          S/ {Number(val).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "installment_amount",
    header: "Cuota",
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
      const active = getValue() as boolean;
      return (
        <Badge variant={active ? "default" : "outline"}>
          {active ? "Activo" : "Inactivo"}
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
                  onClick={() => onDetail(id)}
                >
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => onAmortize(id)}
                >
                  <Banknote className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Amortizar deuda</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
