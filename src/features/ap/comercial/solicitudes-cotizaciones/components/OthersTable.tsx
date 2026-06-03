"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EmptyState";

export interface OthersRow {
  id: string;
  description: string;
  type: "FIJO" | "PORCENTAJE";
  value: number;
  isLocked?: boolean;
}

interface OthersTableProps {
  currencySymbol?: string;
  salePrice?: number;
  onRowsChange?: (rows: OthersRow[]) => void;
  initialData?: OthersRow[];
  showCommissionSuggestion?: boolean;
  freightValue?: number;
}

const FLETE_DESCRIPTION = "FLETE E INMATRICULACIÓN";
const COMMISSION_DESCRIPTION = "COMISION DE VENDEDOR";

export function OthersTable({
  currencySymbol = "S/",
  salePrice = 0,
  onRowsChange,
  initialData = [],
  showCommissionSuggestion = false,
  freightValue,
}: OthersTableProps) {
  const [rows, setRows] = useState<OthersRow[]>(initialData);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setRows(initialData);
      onRowsChange?.(initialData);
    }
  }, [initialData]);

  const updateRows = (updated: OthersRow[]) => {
    setRows(updated);
    onRowsChange?.(updated);
  };

  const addRow = () => {
    updateRows([
      ...rows,
      { id: Date.now().toString(), description: "", type: "PORCENTAJE", value: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    updateRows(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, patch: Partial<OthersRow>) => {
    updateRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addFleteRow = () => {
    updateRows([
      { id: "flete-default", description: FLETE_DESCRIPTION, type: "FIJO", value: freightValue ?? 0, isLocked: true },
      ...rows,
    ]);
  };

  const addCommissionRow = () => {
    updateRows([
      ...rows,
      { id: Date.now().toString(), description: COMMISSION_DESCRIPTION, type: "FIJO", value: 0 },
    ]);
  };

  const hasFleteRow = rows.some((r) => r.description === FLETE_DESCRIPTION);
  const hasCommissionRow = rows.some((r) => r.description === COMMISSION_DESCRIPTION);
  const showFleteSuggestion = freightValue !== undefined && !hasFleteRow;

  const computedAmount = (row: OthersRow) =>
    row.type === "PORCENTAJE" ? (salePrice * row.value) / 100 : row.value;

  const suggestionButtons = (
    <>
      {showFleteSuggestion && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-dashed text-muted-foreground hover:text-foreground h-8"
          onClick={addFleteRow}
        >
          <Plus className="h-4 w-4" />
          Flete e Inmatriculación
        </Button>
      )}
      {showCommissionSuggestion && !hasCommissionRow && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-dashed text-muted-foreground hover:text-foreground h-8"
          onClick={addCommissionRow}
        >
          <Plus className="h-4 w-4" />
          Comisión de Vendedor
        </Button>
      )}
    </>
  );

  const hasSuggestions =
    showFleteSuggestion || (showCommissionSuggestion && !hasCommissionRow);

  return (
    <GroupFormSection
      title="Otros (Costos Internos)"
      icon={DollarSign}
      color="gray"
      cols={{ sm: 1 }}
      headerExtra={
        <Button
          type="button"
          onClick={addRow}
          variant="default"
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      }
    >
      <div className="col-span-full space-y-2">
        {rows.length === 0 ? (
          <>
            <EmptyState
              title="Sin costos internos"
              description="Agrega comisiones, bonos de cierre u otros costos internos."
              icon={DollarSign}
            />
            {hasSuggestions && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {suggestionButtons}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_140px_120px_90px_36px] gap-2 px-1 text-xs font-medium text-muted-foreground">
              <span>Descripción</span>
              <span>Tipo</span>
              <span>Valor</span>
              <span className="text-right">Monto</span>
              <span />
            </div>

            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_140px_120px_90px_36px] gap-2 items-center"
              >
                <Input
                  value={row.description}
                  onChange={(e) =>
                    updateRow(row.id, { description: e.target.value.toUpperCase() })
                  }
                  placeholder="COMISION VENDEDOR"
                  className="h-8 text-sm uppercase"
                />

                <Select
                  value={row.type}
                  onValueChange={(v) =>
                    updateRow(row.id, { type: v as "FIJO" | "PORCENTAJE" })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                    <SelectItem value="FIJO">Fijo</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.value || ""}
                    onChange={(e) =>
                      updateRow(row.id, { value: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="h-8 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    {row.type === "PORCENTAJE" ? "%" : currencySymbol}
                  </span>
                </div>

                <span className="text-right text-sm tabular-nums text-muted-foreground">
                  {row.value > 0
                    ? computedAmount(row).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {hasSuggestions && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {suggestionButtons}
                <span className="text-xs text-muted-foreground">sugerencia</span>
              </div>
            )}

            <div className="flex justify-end pt-1 text-sm">
              <span className="text-muted-foreground mr-2">Total OTROS:</span>
              <span className="font-semibold tabular-nums">
                {currencySymbol}{" "}
                {rows
                  .reduce((s, r) => s + computedAmount(r), 0)
                  .toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </span>
            </div>
          </>
        )}
      </div>
    </GroupFormSection>
  );
}
