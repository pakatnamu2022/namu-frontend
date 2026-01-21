"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExpenseTypeResource } from "../lib/expenseType.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type ExpenseTypeColumns = ColumnDef<ExpenseTypeResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const expenseTypeColumns = ({
  onUpdate,
  onDelete,
  onToggleStatus,
  permissions,
}: Props): ExpenseTypeColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-mono text-sm">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "parent",
    header: "Categoría Padre",
    cell: ({ getValue }) => {
      const parent = getValue() as ExpenseTypeResource["parent"];
      return parent ? (
        <p className="text-sm text-muted-foreground">{parent.name}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Sin categoría</p>
      );
    },
  },
  {
    accessorKey: "requires_receipt",
    header: "Requiere Comprobante",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge color={value ? "default" : "secondary"} className="capitalize">
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Orden",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <p className="text-center">{value}</p>;
    },
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          color={value ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, active } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={active}
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn(active ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
