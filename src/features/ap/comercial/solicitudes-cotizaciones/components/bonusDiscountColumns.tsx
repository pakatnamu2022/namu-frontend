import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { BonusDiscountRow } from "./BonusDiscountTable";

interface GetBonusDiscountColumnsParams {
  conceptsOptions: ConceptDiscountBondResource[];
  currencySymbol: string;
  costoReferencia: number;
  onEdit: (row: BonusDiscountRow) => void;
  onDelete: (id: string) => void;
  /** Cotización ya aprobada: los descuentos existentes quedan fijos, solo los bonos son editables. */
  lockDiscounts?: boolean;
}

export function getBonusDiscountColumns({
  conceptsOptions,
  currencySymbol,
  costoReferencia,
  onEdit,
  onDelete,
  lockDiscounts = false,
}: GetBonusDiscountColumnsParams): ColumnDef<BonusDiscountRow>[] {
  return [
    {
      accessorKey: "parent_concept_id",
      header: "Concepto",
      cell: ({ getValue }) => {
        const parentId = getValue() as string;
        const conceptLabel =
          conceptsOptions.find((c) => c.id.toString() === parentId)?.description || parentId;
        return <span className="font-medium">{conceptLabel}</span>;
      },
    },
    {
      accessorKey: "concept_label",
      header: "Descripción",
    },
    {
      accessorKey: "isPercentage",
      header: "Tipo",
      cell: ({ getValue }) => {
        const isPercentage = getValue() as boolean;
        return <span className="text-right">{isPercentage ? "Porcentaje" : "Fijo"}</span>;
      },
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ row }) => {
        const { isPercentage, valor } = row.original;
        return (
          <span className="text-right">
            {isPercentage ? `${valor}%` : `${currencySymbol} ${valor.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      id: "descuento",
      header: "Descuento",
      cell: ({ row }) => {
        const { isPercentage, valor, isNegative } = row.original;
        const costo = Number(costoReferencia) || 0;
        const descuentoCalculado = isPercentage ? (costo * valor) / 100 : valor;
        return (
          <span
            className={`text-right font-medium ${isNegative ? "text-red-600" : "text-primary"}`}
          >
            {isNegative ? "- " : ""}
            {currencySymbol} <NumberFormat value={descuentoCalculado.toFixed(2)} />
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        // Con la cotización aprobada, los descuentos (isNegative) ya existentes
        // quedan fijos; solo los bonos siguen siendo editables/eliminables.
        if (lockDiscounts && row.original.isNegative) {
          return (
            <span className="block text-center text-xs text-muted-foreground">
              Bloqueado
            </span>
          );
        }
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
