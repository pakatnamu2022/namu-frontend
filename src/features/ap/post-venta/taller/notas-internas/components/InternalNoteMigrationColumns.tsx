import type { ColumnDef } from "@tanstack/react-table";
import { InternalNoteMigrationResource } from "../lib/internalNoteMigration.interface";
import { formatDate } from "@/core/core.function";
import { CopyCell } from "@/shared/components/CopyCell";
import { InternalNoteMigrationActionCell } from "./InternalNoteMigrationActionCell";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import {
  MIGRATION_STATUS,
  MIGRATION_STATUS_COLOR,
  MigrationStatus,
} from "../lib/internalNoteMigration.constants";

export type InternalNoteMigrationColumns =
  ColumnDef<InternalNoteMigrationResource>;

interface Props {
  permissions: {
    canVerifyMigration: boolean;
  };
}

export const internalNoteMigrationColumns = ({
  permissions,
}: Props): InternalNoteMigrationColumns[] => [
  {
    accessorKey: "number",
    header: "Número",
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      const isReversed = !!row.original.dyn_series_in;

      if (!value) return null;

      return (
        <div className="flex flex-col items-start gap-0.5">
          <CopyCell className="font-semibold" value={value} />
          {isReversed && (
            <Badge color="red" size="xs" className="w-fit">
              Revertido
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "created_date",
    header: "Fecha Creación",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        return formatDate(value);
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "work_order_correlative",
    header: "Orden de Trabajo",
  },
  {
    accessorKey: "migration_status",
    header: "Estado Migración",
    cell: ({ getValue }) => {
      const status = getValue() as MigrationStatus;
      const label = MIGRATION_STATUS[status] ?? status;
      const color = MIGRATION_STATUS_COLOR[status] ?? "gray";

      return (
        <Badge color={color} size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "dyn_status",
    header: "Estados Dynamics",
    cell: ({ row }) => {
      const {
        dyn_series_out: seriesOut,
        dyn_series_in: seriesIn,
        is_accounted_out: isAccountedOut,
        is_accounted_in: isAccountedIn,
      } = row.original;

      if (!seriesOut && !seriesIn) return "-";

      return (
        <div className="flex flex-col gap-1">
          {seriesOut && (
            <div className="flex items-center gap-1.5">
              <span>{seriesOut}</span>
              {isAccountedOut ? (
                <Check className="size-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="size-3.5 text-red-600 dark:text-red-400" />
              )}
            </div>
          )}
          {seriesIn && (
            <div className="flex items-center gap-1.5">
              <span>{seriesIn}</span>
              {isAccountedIn ? (
                <Check className="size-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="size-3.5 text-red-600 dark:text-red-400" />
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <InternalNoteMigrationActionCell
        row={row.original}
        permissions={permissions}
      />
    ),
  },
];
