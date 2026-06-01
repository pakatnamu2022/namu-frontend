"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InsuranceResource } from "../lib/insurance.interface";
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
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "business_partner",
    header: "Socio de Negocio",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">
        {(getValue() as string) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "paternal_surname",
    header: "Apellido Paterno",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "maternal_surname",
    header: "Apellido Materno",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "first_name",
    header: "Nombres",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "doc_number_affiliate",
    header: "N° Documento",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "rate_with_tax",
    header: "Tasa c/ IGV",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span className="font-mono">
          S/{" "}
          {val?.toLocaleString("es-PE", { minimumFractionDigits: 2 }) ?? "0.00"}
        </span>
      );
    },
  },
  {
    accessorKey: "affiliation_from",
    header: "Afiliación Desde",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "affiliation_until",
    header: "Afiliación Hasta",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
    ),
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
