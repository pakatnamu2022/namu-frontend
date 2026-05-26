import type { ColumnDef } from "@tanstack/react-table";
import { ProductTransferResource } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Eye,
  Pencil,
  PackageCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CloudUpload,
  BookCheck,
  BookX,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { TableHeaderWithTooltip } from "@/shared/components/TableHeaderWithTooltip.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import ShippingGuideHistory from "@/features/ap/comercial/envios-recepciones/components/ShippingGuideHistory";
import { CopyCell } from "@/shared/components/CopyCell";

export type ProductTransferColumns = ColumnDef<ProductTransferResource>;

interface Props {
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  onSendToNubefact?: (id: number) => void;
  onQueryFromNubefact?: (id: number) => void;
  onReceive?: (row: ProductTransferResource) => void;
  onSyncWithDynamics?: (id: number) => void;
  onCancel?: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
    canReceive?: boolean;
    canAnnul?: boolean;
  };
  routeUpdate?: string;
  warehouseId?: string;
}

export const productTransferColumns = ({
  onDelete,
  onView,
  onSendToNubefact,
  onQueryFromNubefact,
  onReceive,
  onSyncWithDynamics,
  onCancel,
  permissions,
  routeUpdate,
  warehouseId,
}: Props): ProductTransferColumns[] => [
  {
    id: "nro_reference",
    header: "Nro Referencia",
    cell: ({ row }) => {
      const { reference } = row.original;
      const cancelled_inventory_movement_id =
        row.original.cancelled_inventory_movement_id;
      if (!reference) return "-";

      return (
        <CopyCell
          value={
            reference.document_number +
            (cancelled_inventory_movement_id ? "*" : "")
          }
          className="font-mono text-sm font-semibold"
        />
      );
    },
  },
  {
    id: "nro_reference_dyn",
    header: "Serie Dyn",
    cell: ({ row }) => {
      const { reference, cancelled_inventory_movement_id, item_type } =
        row.original;
      if (!reference) return "-";

      const dynSeries =
        cancelled_inventory_movement_id !== null &&
        !reference.dyn_series?.endsWith("*")
          ? `${reference.dyn_series}*`
          : reference.dyn_series;

      return (
        <>
          {item_type === "PRODUCTO" ? (
            <CopyCell
              value={dynSeries || ""}
              className="font-mono text-sm font-semibold"
            />
          ) : (
            "-"
          )}
        </>
      );
    },
  },
  {
    id: "is_accounted",
    header: "Contabilización",
    cell: ({ row }) => {
      const {
        reference,
        reference_id,
        cancelled_inventory_movement_id,
        item_type,
      } = row.original;
      if (!reference) return "-";

      const isAccounted =
        reference.is_accounted &&
        (cancelled_inventory_movement_id === null || reference.is_annulled);

      if (isAccounted) {
        return (
          <Badge variant="outline" color="green" icon={BookCheck}>
            <span>Contabilizado</span>
          </Badge>
        );
      }

      if (!onSyncWithDynamics || !reference_id) {
        return (
          <Badge variant="outline" color="gray" icon={BookX}>
            <span>No Contabilizado</span>
          </Badge>
        );
      }

      if (item_type !== "PRODUCTO") {
        return (
          <Badge variant="outline" color="gray" icon={BookX}>
            <span>No Permitido</span>
          </Badge>
        );
      }

      return (
        <Button
          variant="outline"
          size="xs"
          color="blue"
          onClick={() => onSyncWithDynamics(reference_id)}
        >
          <CloudUpload className="size-3.5" />
          Sincronizar
        </Button>
      );
    },
  },
  {
    id: "fechas_guia",
    header: "Fechas",
    cell: ({ row }) => {
      const { reference, movement_date } = row.original;
      if (!reference) return "-";

      const issueDate = reference.issue_date;

      return (
        <div className="flex flex-col gap-1 text-xs">
          <div>
            <span className="font-semibold">Emisión: </span>
            {movement_date
              ? format(new Date(movement_date), "dd/MM/yyyy", { locale: es })
              : "-"}
          </div>
          <div>
            <span className="font-semibold">Traslado: </span>
            {issueDate
              ? format(new Date(issueDate), "dd/MM/yyyy", { locale: es })
              : "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "warehouse_code",
    header: "Origen",
    cell: ({ row }) => {
      const { reference, warehouse_code } = row.original;
      if (!reference) return warehouse_code ?? "-";

      // Si el motivo es "OTROS", mostrar transmitter_name
      const isOtros =
        reference.transfer_reason_id?.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS;

      if (isOtros) {
        return reference.transmitter_name ?? "-";
      }

      // Si es TRASLADO_SEDE, mostrar warehouse_code (almacén)
      return warehouse_code ?? "-";
    },
  },
  {
    accessorKey: "warehouse_destination_code",
    header: "Destino",
    cell: ({ row }) => {
      const { reference, warehouse_destination_code } = row.original;
      if (!reference) return warehouse_destination_code ?? "-";

      // Si el motivo es "OTROS", mostrar receiver_name
      const isOtros =
        reference.transfer_reason_id?.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS;

      if (isOtros) {
        return reference.receiver_name ?? "-";
      }

      // Si es TRASLADO_SEDE, mostrar warehouse_destination_code (almacén)
      return warehouse_destination_code ?? "-";
    },
  },
  {
    id: "transporte_info",
    header: "Transporte",
    cell: ({ row }) => {
      const { reference } = row.original;
      if (!reference) return "-";

      return (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Placa:</span>
            <span className="font-mono">{reference.plate || "-"}</span>
          </div>
          <div className="truncate max-w-[200px]" title={reference.driver_name}>
            <span className="font-semibold">Conductor:</span>{" "}
            {reference.driver_name || "-"}
          </div>
        </div>
      );
    },
  },
  {
    id: "motivo_traslado",
    header: "Motivo Traslado",
    cell: ({ row }) => {
      const { reference } = row.original;
      if (!reference?.transfer_reason_description) return "-";

      return (
        <span
          className="text-sm truncate max-w-[180px] block"
          title={reference.transfer_reason_description}
        >
          {reference.transfer_reason_description}
        </span>
      );
    },
  },
  {
    id: "status_sunat",
    header: () => (
      <TableHeaderWithTooltip
        label="Estado SUNAT"
        tooltip={{
          title: "Estados de SUNAT",
          items: [
            {
              label: "Aceptado por SUNAT",
              indicator: <div className="size-2 rounded-full bg-green-600" />,
            },
            {
              label: "En espera de respuesta",
              indicator: <div className="size-2 rounded-full bg-primary" />,
            },
            {
              label: "Rechazado (>5h sin respuesta)",
              indicator: <div className="size-2 rounded-full bg-destructive" />,
            },
            {
              label: "No enviado",
              indicator: <div className="size-2 rounded-full bg-gray-400" />,
            },
          ],
        }}
      />
    ),
    cell: ({ row }) => {
      const { reference } = row.original;
      if (!reference) return "-";

      const sentAt = reference.sent_at;
      const aceptadaPorSunat = reference.aceptada_por_sunat;
      const WAITING_TIME_HOURS = 5;

      if (sentAt) {
        const sentDate = new Date(sentAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60);

        let variant: "green" | "destructive" | "blue";
        let label: string;
        let icon: LucideIcon;

        if (aceptadaPorSunat === true) {
          variant = "green";
          label = "Aceptado";
          icon = CheckCircle2;
        } else if (
          aceptadaPorSunat === false &&
          hoursDiff > WAITING_TIME_HOURS
        ) {
          variant = "destructive";
          label = "Rechazado";
          icon = XCircle;
        } else {
          variant = "blue";
          label = "En espera";
          icon = CheckCircle2;
        }

        return (
          <div className="flex flex-col gap-1">
            <Badge icon={icon} color={variant} className="w-fit">
              {label}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {format(sentDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </span>
          </div>
        );
      }

      return (
        <Badge color="gray">
          <XCircle className="size-3" />
          No enviado
        </Badge>
      );
    },
  },
  {
    id: "status_recepcion",
    header: "Recepción",
    cell: ({ row }) => {
      const { reference } = row.original;
      if (!reference) return "-";

      const isReceived = reference.is_received;

      return isReceived ? (
        <Badge color="green" icon={CheckCircle2}>
          Recepcionado
        </Badge>
      ) : (
        <Badge color="blue" icon={XCircle}>
          Pendiente
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const { status } = row.original;
      const statusMap: Record<
        string,
        {
          label: string;
          color: "gray" | "green" | "blue" | "red";
          icon: LucideIcon;
        }
      > = {
        DRAFT: { label: "Borrador", color: "gray", icon: BookX },
        APPROVED: { label: "Aprobado", color: "green", icon: BookCheck },
        IN_TRANSIT: { label: "En Tránsito", color: "blue", icon: Send },
        CANCELLED: { label: "Cancelado", color: "red", icon: Ban },
      };

      const statusInfo = statusMap[status] || {
        label: status,
        color: "gray" as const,
        icon: BookX,
      };
      return (
        <Badge color={statusInfo.color} icon={statusInfo.icon}>
          {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    id: "notas_guia",
    header: "Observaciones",
    cell: ({ row }) => {
      const { reference } = row.original;
      if (!reference?.notes) return "-";

      return (
        <span
          className="text-sm text-muted-foreground truncate max-w-[200px] block"
          title={reference.notes}
        >
          {reference.notes}
        </span>
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
        item_type,
      } = row.original;
      const isSent = !!reference?.sent_at;
      const isAcceptedBySunat = reference?.aceptada_por_sunat === true;
      const isReceived = reference?.is_received === true;
      const isAccounted = reference?.is_accounted === true;
      const isCancelled = reference?.status === true;

      const currentWarehouseId = warehouseId ? Number(warehouseId) : null;
      const isOrigin = currentWarehouseId === warehouse_origin_id;
      const isDestination = currentWarehouseId === warehouse_destination_id;

      const canSendToNubefact =
        isOrigin && !isSent && !!onSendToNubefact && !!reference_id;
      const canQueryFromNubefact =
        isOrigin &&
        isSent &&
        !isAcceptedBySunat &&
        !!onQueryFromNubefact &&
        !!reference_id;
      const cantRecordDynamics = item_type === "PRODUCTO";
      const canReceive =
        isDestination &&
        !!permissions.canReceive &&
        !!onReceive &&
        isSent &&
        isAcceptedBySunat;
      //&& !isReceived;
      const canEdit =
        isOrigin && permissions.canUpdate && !!routeUpdate && !isSent;
      const canCancel =
        permissions.canAnnul &&
        ((isAccounted && !!onCancel && isCancelled) ||
          (item_type === "SERVICIO" && isReceived));
      const canDelete = isOrigin && permissions.canDelete && !isSent;

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

          {/* Historial - Solo para GUIA_REMISION */}
          {cantRecordDynamics && (
            <ShippingGuideHistory shippingGuideId={reference_id} />
          )}

          {/* Enviar a Nubefact - Solo origen y si NO ha sido enviado */}
          {canSendToNubefact && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Enviar a Nubefact"
              onClick={() => onSendToNubefact!(reference_id!)}
            >
              <Send className="size-4" />
            </Button>
          )}

          {/* Consultar estado en Nubefact - Solo origen, enviado y NO aceptado */}
          {canQueryFromNubefact && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Consultar estado en SUNAT"
              onClick={() => onQueryFromNubefact!(reference_id!)}
            >
              <RefreshCw className="size-4" />
            </Button>
          )}

          {/* Recepcionar - Solo destino, enviado, aceptado por SUNAT y no recepcionado aún */}
          {canReceive && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Recepcionar"
              onClick={() => onReceive!(row.original)}
            >
              <PackageCheck className="size-4" />
            </Button>
          )}

          {/* Editar - Solo origen, oculto si fue aceptada por SUNAT */}
          {canEdit && (
            <Link to={`${routeUpdate!}/${id}`}>
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

          {/* Cancelar - Solo cuando está contabilizado */}
          {canCancel && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Cancelar"
              onClick={() => onCancel!(id)}
            >
              <Ban className="size-4" />
            </Button>
          )}

          {/* Eliminar - Solo origen, oculto si fue aceptada por SUNAT */}
          {canDelete && <DeleteButton onClick={() => onDelete(id)} />}
        </div>
      );
    },
  },
];
