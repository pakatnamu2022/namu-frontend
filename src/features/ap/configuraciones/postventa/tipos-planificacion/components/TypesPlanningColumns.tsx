import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { TypesPlanningResource } from "../lib/typesPlanning.interface.ts";

export type TypesPlanningColumns = ColumnDef<TypesPlanningResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const typesPlanningColumns = ({
  onUpdate,
  onDelete,
  onToggleStatus,
  permissions,
}: Props): TypesPlanningColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "validate_receipt",
    header: "Valida Recepción",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "blue"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "validate_labor",
    header: "Valida Mano de Obra",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant="outline" color={value ? "green" : "blue"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "type_document",
    header: "Tipo Documento",
    cell: ({ getValue }) => {
      const value = getValue() as string;

      const typeDocumentLabels: Record<string, string> = {
        INTERNA: "INTERNA",
        PAYMENT_RECEIPTS: "COMPROBANTE DE PAGO",
      };

      return typeDocumentLabels[value] || value;
    },
  },
  {
    accessorKey: "status",
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
      const { id, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn(status ? "bg-primary" : "bg-secondary")}
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
