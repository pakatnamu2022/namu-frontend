import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { Badge } from "@/components/ui/badge";

export type PurchaseRequestColumns = ColumnDef<PurchaseRequestResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const purchaseRequestColumns = ({
  onUpdate,
  onDelete,
  permissions,
}: Props): PurchaseRequestColumns[] => [
  {
    accessorKey: "request_number",
    header: "Número de Solicitud",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "requested_date",
    header: "Fecha Solicitada",
  },
  {
    accessorKey: "warehouse_dyn_code",
    header: "Almacén",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const { status, status_color } = row.original;
      return (
        <Badge
          style={{
            backgroundColor: status_color || "#6B7280",
          }}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value || "N/A";
    },
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
