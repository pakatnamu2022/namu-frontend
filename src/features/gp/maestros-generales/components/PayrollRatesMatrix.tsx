"use client";

import { useState } from "react";
import { GeneralMastersResource } from "../lib/generalMasters.interface";
import {
  MANDATORY_CONTRIBUTION_TYPE,
  INSURANCE_PREMIUM_TYPE,
  VARIABLE_COMMISSION_TYPE,
} from "../lib/generalMasters.constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMN_TYPES = [
  { key: MANDATORY_CONTRIBUTION_TYPE, label: "A/OBL." },
  { key: INSURANCE_PREMIUM_TYPE, label: "PRIMA SEG." },
  { key: VARIABLE_COMMISSION_TYPE, label: "COM. VAR." },
] as const;

interface MatrixRow {
  code: string;
  description: string;
  entries: Partial<Record<string, GeneralMastersResource>>;
}

function buildMatrix(data: GeneralMastersResource[]): MatrixRow[] {
  const map = new Map<string, MatrixRow>();
  for (const item of data) {
    if (!map.has(item.code)) {
      map.set(item.code, {
        code: item.code,
        description: item.description,
        entries: {},
      });
    }
    map.get(item.code)!.entries[item.type] = item;
  }
  // Only keep rows that still have at least one entry
  return Array.from(map.values()).filter(
    (row) => Object.keys(row.entries).length > 0,
  );
}

interface EditingCell {
  id: number;
  value: string;
}

export interface AddCellPayload {
  code: string;
  description: string;
  type: string;
}

interface PayrollRatesMatrixProps {
  data: GeneralMastersResource[];
  isLoading?: boolean;
  onSaveValue: (id: number, value: string) => Promise<void>;
  onDelete: (id: number) => void;
  onAdd: (payload: AddCellPayload) => void;
  permissions: { canUpdate?: boolean; canDelete?: boolean; canCreate?: boolean };
  search?: string;
}

export default function PayrollRatesMatrix({
  data,
  isLoading,
  onSaveValue,
  onDelete,
  onAdd,
  permissions,
  search = "",
}: PayrollRatesMatrixProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const rows = buildMatrix(data).filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.code.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q)
    );
  });

  const handleSave = async (item: GeneralMastersResource) => {
    if (!editingCell || editingCell.id !== item.id) return;
    setSavingId(item.id);
    try {
      await onSaveValue(item.id, editingCell.value);
    } finally {
      setSavingId(null);
      setEditingCell(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-10 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-md border p-10 text-center text-sm text-muted-foreground">
        No se encontraron registros.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
            <th className="px-5 py-3 text-left font-semibold w-44">COD</th>
            <th className="px-5 py-3 text-left font-semibold">DESCRIPCIÓN</th>
            {COLUMN_TYPES.map((col) => (
              <th key={col.key} className="px-5 py-3 text-center font-semibold w-48">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.code}
              className="border-b last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-5 py-4 font-semibold text-foreground">{row.code}</td>
              <td className="px-5 py-4 text-muted-foreground">{row.description}</td>

              {COLUMN_TYPES.map((col) => {
                const item = row.entries[col.key];
                const isEditing = !!item && editingCell?.id === item.id;
                const isSaving = !!item && savingId === item.id;

                return (
                  <td key={col.key} className="px-3 py-3 text-center">
                    {item ? (
                      <div className="group relative flex flex-col items-center justify-center gap-1.5 min-h-14">
                        {isEditing ? (
                          <Input
                            autoFocus
                            className="h-8 w-28 text-center text-sm font-semibold"
                            value={editingCell.value}
                            onChange={(e) =>
                              setEditingCell({ ...editingCell, value: e.target.value })
                            }
                            onBlur={() => handleSave(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave(item);
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            disabled={isSaving}
                          />
                        ) : (
                          <span
                            className={cn(
                              "text-base font-semibold text-foreground tabular-nums",
                              item.status !== 1 && "opacity-40 line-through",
                            )}
                          >
                            {item.value || "0"}
                          </span>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {permissions.canUpdate && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() =>
                                  setEditingCell({
                                    id: item.id,
                                    value: item.value ?? "",
                                  })
                                }
                                title="Editar valor"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            {permissions.canDelete && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(item.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-14">
                        {permissions.canCreate ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-muted-foreground/40 hover:text-primary hover:bg-primary/10 border border-dashed border-muted-foreground/20 hover:border-primary transition-all"
                            onClick={() =>
                              onAdd({
                                code: row.code,
                                description: row.description,
                                type: col.key,
                              })
                            }
                            title="Agregar"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
