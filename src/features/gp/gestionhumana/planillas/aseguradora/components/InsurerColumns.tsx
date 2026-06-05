import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";

export type InsurerColumns = ColumnDef<SuppliersResource>;

interface Props {
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const insurerColumns = ({
  onUpdate,
  onDelete,
  permissions,
}: Props): InsurerColumns[] => [
  {
    accessorKey: "full_name",
    header: "Nombre Completo",
  },
  {
    accessorKey: "num_doc",
    header: "Documento",
  },
  {
    accessorKey: "document_type",
    header: "Tipo Documento",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("document_type")}</Badge>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "direction",
    header: "Dirección",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <div className="flex items-center gap-2">
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
