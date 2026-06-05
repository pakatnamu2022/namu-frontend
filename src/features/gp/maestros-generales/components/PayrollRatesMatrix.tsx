"use client";

import { useState } from "react";
import { GeneralMastersResource } from "../lib/generalMasters.interface";
import {
  MANDATORY_CONTRIBUTION_TYPE,
  INSURANCE_PREMIUM_TYPE,
  VARIABLE_COMMISSION_TYPE,
} from "../lib/generalMasters.constants";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
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
  return Array.from(map.values());
}

interface EditingCell {
  id: number;
  value: string;
}

interface PayrollRatesMatrixProps {
  data: GeneralMastersResource[];
  isLoading?: boolean;
  onSaveValue: (id: number, value: string) => Promise<void>;
  onToggleStatus: (id: number, status: boolean) => Promise<void>;
  onDelete: (id: number) => void;
  permissions: { canUpdate?: boolean; canDelete?: boolean };
  search?: string;
}

export default function PayrollRatesMatrix({
  data,
  isLoading,
  onSaveValue,
  onToggleStatus,
  onDelete,
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
            <th className="px-4 py-3 text-left font-medium w-44">COD</th>
            <th className="px-4 py-3 text-left font-medium">DESCRIPCIÓN</th>
            {COLUMN_TYPES.map((col) => (
              <th key={col.key} className="px-4 py-3 text-center font-medium w-48">
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
              <td className="px-4 py-3 font-semibold text-foreground">{row.code}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.description}</td>

              {COLUMN_TYPES.map((col) => {
                const item = row.entries[col.key];
                const isEditing = !!item && editingCell?.id === item.id;
                const isSaving = !!item && savingId === item.id;

                return (
                  <td key={col.key} className="px-4 py-2 text-center">
                    {item ? (
                      <div className="flex flex-col items-center gap-1.5">
                        {isEditing ? (
                          <Input
                            autoFocus
                            className="h-7 w-28 text-center text-xs"
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
                              "inline-block text-primary font-medium px-2 py-0.5 rounded",
                              permissions.canUpdate &&
                                "cursor-pointer hover:bg-primary/10 transition-colors",
                            )}
                            onClick={() => {
                              if (!permissions.canUpdate) return;
                              setEditingCell({ id: item.id, value: item.value ?? "" });
                            }}
                            title={permissions.canUpdate ? "Clic para editar valor" : undefined}
                          >
                            {item.value ?? "—"}
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.status === 1}
                            onCheckedChange={(checked) =>
                              onToggleStatus(item.id, checked)
                            }
                            disabled={!permissions.canUpdate}
                            className="scale-75 origin-center"
                          />
                          {permissions.canDelete && (
                            <DeleteButton onClick={() => onDelete(item.id)} />
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
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
