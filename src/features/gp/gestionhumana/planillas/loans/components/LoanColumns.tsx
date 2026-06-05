"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoanResource } from "../lib/loan.interface";
import { Button } from "@/components/ui/button";
import { Banknote, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { useNavigate } from "react-router-dom";
import { LOAN } from "../lib/loan.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatMoney } from "@/core/core.function";

export type LoanColumns = ColumnDef<LoanResource>;

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
    accessorKey: "delivery_date",
    header: "Fecha Entrega",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: "payment_start",
    header: "Inicio de Pago",
    cell: ({ getValue }) => (
      <span>{getValue() ? formatDate(getValue() as string) : "—"}</span>
    ),
  },
  {
    accessorKey: "loan_amount",
    header: "Monto",
    cell: ({ getValue }) => (
      <span className="font-mono">{formatMoney(getValue() as number)}</span>
    ),
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
          {formatMoney(val)}
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
        <span className="font-mono">{val > 0 ? formatMoney(val) : "—"}</span>
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
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = LOAN;

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() =>
                    router(`${ABSOLUTE_ROUTE}/${id}/amortizaciones`)
                  }
                >
                  <Banknote className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Amortizaciones</p>
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
