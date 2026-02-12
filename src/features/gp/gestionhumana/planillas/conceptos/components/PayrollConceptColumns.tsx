"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PayrollConceptResource } from "../lib/payroll-concept.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PAYROLL_CONCEPT } from "../lib/payroll-concept.constant";

export type PayrollConceptColumns = ColumnDef<PayrollConceptResource>;

const typeColorMap: Record<string, "default" | "destructive" | "secondary"> = {
  EARNING: "default",
  DEDUCTION: "destructive",
  CONTRIBUTION: "secondary",
};

const typeLabelMap: Record<string, string> = {
  EARNING: "Ingreso",
  DEDUCTION: "Descuento",
  CONTRIBUTION: "Aportación",
};

const categoryLabelMap: Record<string, string> = {
  BASE_SALARY: "Salario Base",
  BONUS: "Bonificación",
  OVERTIME: "Horas Extra",
  ALLOWANCE: "Asignación",
  COMMISSION: "Comisión",
  TAX: "Impuesto",
  SOCIAL_SECURITY: "Seguro Social",
  PENSION: "Pensión",
  LOAN: "Préstamo",
  OTHER: "Otro",
};

export const payrollConceptColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): PayrollConceptColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-xs">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="line-clamp-1 text-wrap!">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <Badge color={typeColorMap[type] || "default"}>
          {typeLabelMap[type] || type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ getValue }) => {
      const category = getValue() as string;
      return (
        <span className="text-sm text-muted-foreground">
          {categoryLabelMap[category] || category}
        </span>
      );
    },
  },
  {
    accessorKey: "is_taxable",
    header: "Afecto",
    cell: ({ getValue }) => {
      const isTaxable = getValue() as boolean;
      return (
        <Badge color={isTaxable ? "default" : "secondary"}>
          {isTaxable ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "calculation_order",
    header: "Orden",
    cell: ({ getValue }) => (
      <span className="text-center">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ getValue }) => {
      const active = getValue() as boolean;
      return (
        <Badge color={active ? "default" : "destructive"}>
          {active ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;
      const { ROUTE_UPDATE } = PAYROLL_CONCEPT;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-4" />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
