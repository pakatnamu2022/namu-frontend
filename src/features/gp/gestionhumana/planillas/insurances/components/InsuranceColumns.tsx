"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InsuranceResource } from "../lib/insurance.interface";
import { formatMoney, formatPeriod } from "@/core/core.function";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { useNavigate } from "react-router-dom";
import { INSURANCE } from "../lib/insurance.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type InsuranceColumns = ColumnDef<InsuranceResource>;

export const insuranceColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): InsuranceColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
        {formatPeriod(row.original.period)}
      </span>
    ),
  },
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "business_partner",
    header: "Aseguradora",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">
        {(getValue() as string) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "doc_number_affiliate",
    header: "N° Doc. Afiliado",
  },
  {
    accessorKey: "contracting_name",
    header: "Contratante",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "num_doc_contracting",
    header: "N° Doc. Contratante",
  },
  {
    accessorKey: "rate_with_tax",
    header: "Tasa c/ IGV",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return formatMoney(val);
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = INSURANCE;

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
