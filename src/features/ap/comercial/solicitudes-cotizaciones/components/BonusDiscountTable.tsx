"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Gift } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { DataTable } from "@/shared/components/DataTable";
import EmptyState from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EmptyState";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { getBonusDiscountColumns } from "./bonusDiscountColumns";
import { BonusDiscountSheet } from "./BonusDiscountSheet";
import { warningToast } from "@/core/core.function";

export interface BonusDiscountRow {
  id: string;
  /** Id del concepto raíz seleccionado (861/862/863), solo para reconstruir el selector "Concepto". */
  parent_concept_id: string;
  /** Id final a enviar al backend: el hijo (ej. 1367) o el mismo raíz si no tiene hijos (ej. 863). */
  concept_id: string;
  /** Etiqueta del concepto final (hijo o raíz), para mostrar en la columna "Descripción". */
  concept_label: string;
  isPercentage: boolean;
  valor: number;
  isNegative: boolean;
  /** Si el valor ya fue guardado neto, con la retención del 7% aplicada (x0.93). */
  hasRetention?: boolean;
}

interface BonusDiscountTableProps {
  conceptsOptions: ConceptDiscountBondResource[];
  costoReferencia?: number;
  currencySymbol?: string;
  onRowsChange?: (rows: BonusDiscountRow[]) => void;
  title?: string;
  initialData?: BonusDiscountRow[];
  /** Cotización ya aprobada: los descuentos existentes quedan fijos, solo se permite agregar/editar bonos. */
  lockDiscounts?: boolean;
}

export const BonusDiscountTable = ({
  conceptsOptions,
  costoReferencia = 50000,
  currencySymbol = "S/",
  onRowsChange,
  title = "Bonos / Descuentos",
  initialData = [],
  lockDiscounts = false,
}: BonusDiscountTableProps) => {
  const [rows, setRows] = useState<BonusDiscountRow[]>(initialData);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BonusDiscountRow | null>(null);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setRows(initialData);
      if (onRowsChange) onRowsChange(initialData);
    }
  }, [initialData]);

  const updateRows = (updatedRows: BonusDiscountRow[]) => {
    setRows(updatedRows);
    if (onRowsChange) onRowsChange(updatedRows);
  };

  const handleAdd = (values: Omit<BonusDiscountRow, "id">) => {
    if (lockDiscounts && values.isNegative) {
      warningToast(
        "Descuentos bloqueados",
        "La cotización ya está aprobada: solo se pueden agregar bonos, no descuentos.",
      );
      return;
    }
    updateRows([...rows, { ...values, id: Date.now().toString() }]);
  };

  const handleEdit = (values: Omit<BonusDiscountRow, "id">) => {
    if (!editingRow) return;
    if (lockDiscounts && (editingRow.isNegative || values.isNegative)) {
      warningToast(
        "Descuento bloqueado",
        "La cotización ya está aprobada: los descuentos existentes no se pueden modificar.",
      );
      return;
    }
    updateRows(
      rows.map((row) =>
        row.id === editingRow.id ? { ...values, id: row.id } : row,
      ),
    );
    setEditingRow(null);
  };

  const handleOpenEdit = (row: BonusDiscountRow) => {
    setEditingRow(row);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (lockDiscounts && row?.isNegative) {
      warningToast(
        "Descuento bloqueado",
        "La cotización ya está aprobada: los descuentos existentes no se pueden eliminar.",
      );
      return;
    }
    updateRows(rows.filter((row) => row.id !== id));
  };

  const calcularDescuentoTotal = () => {
    const costo = Number(costoReferencia) || 0;
    return rows.reduce((total, row) => {
      const valor = row.isPercentage ? (costo * row.valor) / 100 : row.valor;
      return row.isNegative ? total - valor : total + valor;
    }, 0);
  };

  const columns = getBonusDiscountColumns({
    conceptsOptions,
    currencySymbol,
    costoReferencia,
    onEdit: handleOpenEdit,
    onDelete: handleDelete,
    lockDiscounts,
  });

  return (
    <GroupFormSection
      title="Bonos / Descuentos"
      icon={Gift}
      color="blue"
      cols={{ sm: 1 }}
      headerExtra={
        <Button
          type="button"
          onClick={() => setIsAddSheetOpen(true)}
          variant="default"
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Agregar Bono / Descuento
        </Button>
      }
    >
      <div className="space-y-4 col-span-full">
        {rows.length > 0 ? (
          <div className="space-y-0">
            <DataTable
              columns={columns}
              data={rows}
              variant="ghost"
              isVisibleColumnFilter={false}
            />
            <div className="bg-muted px-4 py-2 mt-1 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-sm text-muted-foreground">
                    Precio de Venta:
                  </span>
                  <span className="ml-2 font-medium">
                    {currencySymbol}{" "}
                    <NumberFormat
                      value={(Number(costoReferencia) || 0).toFixed(2)}
                    />
                  </span>
                </div>
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-muted-foreground">
                    Total Descuento:
                  </span>
                  <span className="ml-2 text-lg font-bold text-primary dark:text-primary-foreground">
                    {currencySymbol}{" "}
                    <NumberFormat value={calcularDescuentoTotal().toFixed(2)} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title={`No hay ${title}`}
            description="Agrega bonos o descuentos a la cotización."
            icon={Gift}
          />
        )}

        <BonusDiscountSheet
          open={isAddSheetOpen}
          onClose={() => setIsAddSheetOpen(false)}
          onSubmit={handleAdd}
          conceptsOptions={conceptsOptions}
          costoReferencia={costoReferencia}
          currencySymbol={currencySymbol}
          mode="add"
        />

        <BonusDiscountSheet
          open={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setEditingRow(null);
          }}
          onSubmit={handleEdit}
          conceptsOptions={conceptsOptions}
          costoReferencia={costoReferencia}
          currencySymbol={currencySymbol}
          initialValues={
            editingRow
              ? {
                  parent_concept_id: editingRow.parent_concept_id,
                  concept_id: editingRow.concept_id,
                  concept_label: editingRow.concept_label,
                  isPercentage: editingRow.isPercentage,
                  valor: editingRow.valor,
                  isNegative: editingRow.isNegative,
                  hasRetention: editingRow.hasRetention,
                }
              : undefined
          }
          mode="edit"
        />
      </div>
    </GroupFormSection>
  );
};
