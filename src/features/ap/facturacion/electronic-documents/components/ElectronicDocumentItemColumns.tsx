"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { ElectronicDocumentItemSchema } from "../lib/electronicDocument.schema";

interface ElectronicDocumentItemColumnsProps {
  currencySymbol: string;
  onRemove: (index: number) => void;
  onEdit?: (index: number) => void;
  isAdvancePayment?: boolean;
}

export const getElectronicDocumentItemColumns = ({
  currencySymbol,
  onRemove,
  onEdit,
  isAdvancePayment = false,
}: ElectronicDocumentItemColumnsProps): ColumnDef<
  ElectronicDocumentItemSchema & { index: number }
>[] => [
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="text-wrap!">
        <div
          className={`text-sm text-wrap! font-medium whitespace-pre-line ${
            row.original.anticipo_regularizacion ? "text-orange-600 italic" : ""
          }`}
        >
          {row.original.descripcion}
          {row.original.anticipo_regularizacion && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Regularización
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.unidad_de_medida}
        </div>
      </div>
    ),
    size: 300,
  },
  {
    accessorKey: "cantidad",
    header: () => <div className="text-center">Cant.</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.cantidad}</div>
    ),
    size: 80,
  },
  {
    accessorKey: "precio_unitario",
    header: () => <div className="text-right">P. Unit.</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {currencySymbol}{" "}
        {row.original.precio_unitario.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "subtotal",
    header: () => <div className="text-right">Subtotal</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {currencySymbol}{" "}
        {row.original.subtotal.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "igv",
    header: () => <div className="text-right">IGV</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {currencySymbol}{" "}
        {row.original.igv.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {currencySymbol}{" "}
        {row.original.total.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
    size: 100,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
      const isAdvanceRegularization = row.original.anticipo_regularizacion;
      // Si es venta total (no anticipo) y no es regularización, tampoco se puede editar
      // porque el item del vehículo ya tiene el precio fijo
      const isNotEditable = isAdvanceRegularization || !isAdvancePayment;

      return (
        <div className="text-center flex gap-1 justify-center">
          {isNotEditable ? (
            <span className="text-xs text-gray-500 px-2">No editable</span>
          ) : (
            <>
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(row.original.index)}
                  className="size-8"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onRemove(row.original.index)}
                className="size-8 text-destructive hover:text-destructive"
                title="Eliminar"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      );
    },
    size: 100,
  },
];
