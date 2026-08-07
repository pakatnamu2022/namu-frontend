import type { ColumnDef } from "@tanstack/react-table";
import { InternalNoteMigrationResource } from "../lib/internalNoteMigration.interface";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/core/core.function";
import { CopyCell } from "@/shared/components/CopyCell";
import { InternalNoteMigrationActionCell } from "./InternalNoteMigrationActionCell";

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
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <CopyCell className="font-semibold" value={value} />;
    },
  },
  {
    accessorKey: "work_order_correlative",
    header: "Orden de Trabajo",
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
    accessorKey: "closed_date",
    header: "Fecha Cierre",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      if (!value) return "-";
      try {
        return formatDate(value);
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const color = value === "invoiced" ? "green" : "gray";
      return (
        <Badge variant="outline" color={color}>
          {value === "invoiced" ? "Facturado" : "Pendiente"}
        </Badge>
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
