import type { ColumnDef } from "@tanstack/react-table";
import { ProductTransferResource } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Eye, Pencil, PackageCheck, Send, RefreshCw } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type ProductTransferColumns = ColumnDef<ProductTransferResource>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  onSendToNubefact?: (id: number) => void;
  onQueryFromNubefact?: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
    canReceive?: boolean;
  };
  routeUpdate?: string;
  routeReception?: string;
  warehouseId?: string;
}

export const productTransferColumns = ({
  onDelete,
  onView,
  onSendToNubefact,
  onQueryFromNubefact,
  permissions,
  routeUpdate,
  routeReception,
  warehouseId,
}: Props): ProductTransferColumns[] => [
  {
    accessorKey: "movement_number",
    header: "N° Movimiento",
  },
  {
    accessorKey: "movement_date",
    header: "Fecha de Movimiento",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (!date) return "-";
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
      } catch {
        return date;
      }
    },
  },
  {
    accessorKey: "warehouse_code",
    header: "Almacén Origen",
  },
  {
    accessorKey: "warehouse_destination_code",
    header: "Almacén Destino",
  },
  {
    accessorKey: "user_name",
    header: "Registrado Por",
  },
  {
    accessorKey: "notes",
    header: "Observaciones",
  },
  {
    accessorKey: "movement_type",
    header: "Tipo Movimiento",
    cell: () => {
      return (
        <Badge
          color="default"
          className="capitalize w-28 flex items-center justify-center"
        >
          TRANSFERENCIA
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const { reference } = row.original;
      const isSent = !!reference?.sent_at;
      const isAcceptedBySunat = reference?.aceptada_por_sunat === true;
      const isReceived = reference?.is_received === true;

      if (isReceived) {
        return (
          <Badge variant="default" color="blue">
            RECEPCIONADO
          </Badge>
        );
      }
      if (isSent && isAcceptedBySunat) {
        return (
          <Badge variant="default" color="green">
            ACEPTADO POR SUNAT
          </Badge>
        );
      }
      if (isSent) {
        return (
          <Badge variant="default" color="orange">
            ENVIADO
          </Badge>
        );
      }
      return (
        <Badge variant="default" color="gray">
          PENDIENTE
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_items",
    header: "Total de Ítems",
  },
  {
    accessorKey: "total_quantity",
    header: "Cantidad Total",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const {
        id,
        reference,
        reference_id,
        warehouse_origin_id,
        warehouse_destination_id,
      } = row.original;
      const isSent = !!reference?.sent_at;
      const isAcceptedBySunat = reference?.aceptada_por_sunat === true;
      const isReceived = reference?.is_received === true;

      const currentWarehouseId = warehouseId ? Number(warehouseId) : null;
      const isOrigin = currentWarehouseId === warehouse_origin_id;
      const isDestination = currentWarehouseId === warehouse_destination_id;

      return (
        <div className="flex items-center gap-2">
          {/* Ver - Visible tanto para origen como destino */}
          {permissions.canView && onView && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Ver"
              onClick={() => onView(id)}
            >
              <Eye className="size-5" />
            </Button>
          )}

          {/* Enviar a Nubefact - Solo origen y si NO ha sido enviado */}
          {isOrigin && !isSent && onSendToNubefact && reference_id && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Enviar a Nubefact"
              onClick={() => onSendToNubefact(reference_id)}
            >
              <Send className="size-4" />
            </Button>
          )}

          {/* Consultar estado en Nubefact - Solo origen, enviado y NO aceptado */}
          {isOrigin &&
            isSent &&
            !isAcceptedBySunat &&
            onQueryFromNubefact &&
            reference_id && (
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Consultar estado en SUNAT"
                onClick={() => onQueryFromNubefact(reference_id)}
              >
                <RefreshCw className="size-4" />
              </Button>
            )}

          {/* Recepcionar - Solo destino, enviado, aceptado por SUNAT y no recepcionado aún */}
          {isDestination &&
            permissions.canReceive &&
            routeReception &&
            isSent &&
            isAcceptedBySunat &&
            !isReceived && (
              <Link to={`${routeReception}/${id}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  tooltip="Recepcionar"
                >
                  <PackageCheck className="size-4" />
                </Button>
              </Link>
            )}

          {/* Editar - Solo origen, oculto si fue aceptada por SUNAT */}
          {isOrigin &&
            permissions.canUpdate &&
            routeUpdate &&
            !isAcceptedBySunat && (
              <Link to={`${routeUpdate}/${id}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  tooltip="Editar"
                >
                  <Pencil className="size-5" />
                </Button>
              </Link>
            )}

          {/* Eliminar - Solo origen, oculto si fue aceptada por SUNAT */}
          {isOrigin && permissions.canDelete && !isAcceptedBySunat && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
