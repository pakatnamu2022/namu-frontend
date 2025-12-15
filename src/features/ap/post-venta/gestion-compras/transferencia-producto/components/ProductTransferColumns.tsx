import type { ColumnDef } from "@tanstack/react-table";
import { ProductTransferResource } from "../lib/productTransfer.interface";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, PackageCheck, Send, RefreshCw } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
}

export const productTransferColumns = ({
  onDelete,
  onView,
  onSendToNubefact,
  onQueryFromNubefact,
  permissions,
  routeUpdate,
  routeReception,
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
          variant="default"
          className="capitalize w-28 flex items-center justify-center"
        >
          TRANSFERENCIA
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
      const { id, reference, reference_id } = row.original;
      // Obtener valores desde la referencia (guía de remisión)
      const isSent = !!reference?.sent_at;
      const isAcceptedBySunat = reference?.aceptada_por_sunat === true;

      return (
        <div className="flex items-center gap-2">
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

          {/* Enviar a Nubefact - Solo si NO ha sido enviado */}
          {!isSent && onSendToNubefact && reference_id && (
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

          {/* Consultar estado en Nubefact - Solo si ya fue enviado y NO está aceptado */}
          {isSent &&
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

          {/* Recepcionar - Solo si fue enviado y aceptado por SUNAT */}
          {permissions.canReceive &&
            routeReception &&
            isSent &&
            isAcceptedBySunat && (
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

          {/* Editar - Oculto si fue aceptada por SUNAT */}
          {permissions.canUpdate && routeUpdate && !isAcceptedBySunat && (
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

          {/* Eliminar - Oculto si fue aceptada por SUNAT */}
          {permissions.canDelete && !isAcceptedBySunat && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
