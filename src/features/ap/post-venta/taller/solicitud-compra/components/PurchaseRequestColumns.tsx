import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PURCHASE_REQUEST_STATUS } from "../lib/purchaseRequest.constants";

export type PurchaseRequestColumns = ColumnDef<PurchaseRequestResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onViewDetail?: (purchaseRequest: PurchaseRequestResource) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const purchaseRequestColumns = ({
  onUpdate,
  onDelete,
  onViewDetail,
  permissions,
}: Props): PurchaseRequestColumns[] => [
  {
    accessorKey: "request_number",
    header: "Número de Solicitud",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "requested_date",
    header: "Fecha Solicitud",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
    enableSorting: false,
  },
  {
    accessorKey: "requested_by",
    header: "Solicitado Por",
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
      const statusText =
        PURCHASE_REQUEST_STATUS[
          status as keyof typeof PURCHASE_REQUEST_STATUS
        ] || status;
      return (
        <Badge
          style={{
            backgroundColor: status_color || "#6B7280",
          }}
        >
          {statusText}
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
          {onViewDetail && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Ver Detalle"
              onClick={() => onViewDetail(row.original)}
            >
              <Eye className="size-5" />
            </Button>
          )}

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
