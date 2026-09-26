"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkingConditionResource } from "../lib/working-condition.interface";
import { Badge } from "@/components/ui/badge";
import { formatPeriod } from "@/core/core.function";
import { EditableCell } from "@/shared/components/EditableCell";

export type WorkingConditionColumns = ColumnDef<WorkingConditionResource>;

interface WorkingConditionColumnsProps {
  onUpdateAmount?: (id: number, amount: number) => void;
  canUpdate?: boolean;
}

export const workingConditionColumns = ({
  onUpdateAmount,
  canUpdate = true,
}: WorkingConditionColumnsProps = {}): WorkingConditionColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <Badge color="blue">{formatPeriod(row.original.period)}</Badge>
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
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row, getValue }) => {
      const val = getValue() as number;
      return (
        <EditableCell
          id={row.original.id}
          value={val}
          onUpdate={(id, newValue) => onUpdateAmount?.(id, Number(newValue))}
          isNumber
          min={0}
          disabled={!canUpdate || !onUpdateAmount}
          widthClass="w-24"
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="outline" color="green">
          Activo
        </Badge>
      ) : (
        <Badge variant="outline" color="gray">
          Inactivo
        </Badge>
      ),
  },
];
