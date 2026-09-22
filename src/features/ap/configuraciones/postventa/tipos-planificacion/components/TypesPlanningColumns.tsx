import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch.tsx";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { TypesPlanningResource } from "../lib/typesPlanning.interface.ts";
import {
  CATEGORY_TYPE_LABELS,
  TYPE_DOCUMENT_LABELS,
} from "../lib/typesPlanning.constants.ts";

export type TypesPlanningColumns = ColumnDef<TypesPlanningResource>;

interface Props {
  onUpdate: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
  };
}

export const typesPlanningColumns = ({
  onUpdate,
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
    accessorKey: "notes",
    header: "Notas",
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
    header: "Valida Operario",
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
      return TYPE_DOCUMENT_LABELS[value] || value;
    },
  },
  {
    accessorKey: "category_type",
    header: "Categoría",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return CATEGORY_TYPE_LABELS[value] || value;
    },
  },
  {
    accessorKey: "consider_vehicle_traffic",
    header: "Paso Vehicular",
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
        </div>
      );
    },
  },
];
