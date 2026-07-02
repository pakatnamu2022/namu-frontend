import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Pencil,
  XCircle,
  CarFront,
  ImageIcon,
  Download,
  Eye,
  Ban,
  PackageCheck,
  Loader2,
  Info,
  Send,
  RefreshCw,
  ShoppingCart,
  LucideIcon,
  ArrowRightLeft,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import type { ControlUnitsResource } from "../lib/controlUnits.interface";
import { CONTROL_UNITS } from "../lib/controlUnits.constants";
import { VEHICLE_PURCHASE_ORDER } from "../../ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import ShippingGuideHistory from "@/features/ap/shipping_guides/components/ShippingGuideHistory";
import { CopyCell } from "@/shared/components/CopyCell";

export type ControlUnitsColumnsType = ColumnDef<ControlUnitsResource>;

interface Props {
  onDelete: (id: number) => void;
  onMarkAsReceived: (id: number) => void;
  onViewDetails: (shipment: ControlUnitsResource) => void;
  onCancel: (id: number) => void;
  onSendToNubefact: (id: number) => void;
  onQueryFromNubefact: (id: number) => void;
  onMigrate?: (id: number) => void;
  permissions: {
    canView: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canSend: boolean;
    canReceive: boolean;
    canGenerate: boolean;
    canMigrate: boolean;
    canAnnul: boolean;
  };
}

// Componente para manejar la carga de imagen
// eslint-disable-next-line react-refresh/only-export-components
const ImagePreview = ({ fileUrl }: { fileUrl: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    // Extraer el nombre del archivo de la URL
    const fileName =
      fileUrl.split("/").pop() || `guia-remision-${Date.now()}.png`;

    // Crear un link temporal y simular click
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex justify-center mb-4 mt-2">
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={handleDownload}
        >
          <Download className="size-4" />
          Descargar imagen
        </Button>
      </div>
      <div className="relative w-full h-[600px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando imagen...
              </p>
            </div>
          </div>
        )}
        <img
          src={fileUrl}
          alt="Guía de remisión"
          className="w-full h-full object-contain"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </>
  );
};

export const ControlUnitsColumns = ({
  onDelete,
  onMarkAsReceived,
  onViewDetails,
  onCancel,
  onSendToNubefact,
  onQueryFromNubefact,
  onMigrate,
  permissions,
}: Props): ControlUnitsColumnsType[] => [
  {
    accessorKey: "document_number",
    header: "Número Doc.",
    cell: ({ row }) => {
      const number = row.getValue("document_number") as string;
      const type = row.getValue("document_type") as string;
      return (
        <div className="flex flex-col items-start w-fit">
          <span className="font-mono text-sm font-semibold">
            <span> {number}</span>
          </span>
          <span className="text-xs">
            {type === "GUIA_REMISION" ? "Guía Remisión" : "Guía Traslado"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    cell: ({ row }) => {
      const type = row.getValue("document_type") as string;
      return (
        <Badge color={type === "GUIA_REMISION" ? "default" : "secondary"}>
          {type === "GUIA_REMISION" ? "Guía Remisión" : "Guía Traslado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;
      const issueDate = row.getValue("issue_date") as string;
      return (
        <div className="flex flex-col gap-1 text-xs">
          <div>
            <span className="font-semibold">Emisión: </span>
            {createdAt
              ? format(new Date(createdAt), "dd/MM/yyyy", { locale: es })
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
    accessorKey: "entities",
    header: "",
    cell: ({ row }) => {
      const transmitter = row.original.transmitter_name;
      const receiver = row.original.receiver_name;
      return (
        <div className="flex flex-col gap-1 text-xs">
          <div>
            <span className="font-semibold">Remitente: </span>
            <span title={transmitter}>{transmitter}</span>
          </div>
          <div>
            <span className="font-semibold">Destinatario: </span>
            <span title={receiver}>{receiver}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ row }) => {
      const vin = row.original.vehicle?.vin;
      return vin ? <CopyCell value={vin} /> : "-";
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "-";
    },
  },
  {
    accessorKey: "issue_date",
    header: "Fecha Translado",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string;
      return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "-";
    },
  },
  {
    accessorKey: "transfer_reason_description",
    header: "Motivo de traslado",
    cell: ({ row }) => {
      const reason = row.getValue("transfer_reason_description") as string;
      return (
        <span className="text-sm" title={reason}>
          {reason}
        </span>
      );
    },
  },
  {
    accessorKey: "document_series",
    header: "Serie",
  },
  {
    accessorKey: "issuer_type",
    header: "Tipo Emisor",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("issuer_type")}</Badge>
    ),
  },
  {
    accessorKey: "plate",
    header: "Placa",
  },
  {
    accessorKey: "driver_name",
    header: "Conductor",
  },
  {
    accessorKey: "license",
    header: "Licencia",
  },
  {
    accessorKey: "file_url",
    header: "Archivo",
    cell: ({ row }) => {
      const fileUrl = row.getValue("file_url") as string | null;

      if (!fileUrl) {
        return (
          <Badge color="muted" icon={XCircle}>
            Sin archivo
          </Badge>
        );
      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <ImageIcon className="size-4" />
              Ver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full">
            <VisuallyHidden>
              <DialogTitle>Guía de remisión</DialogTitle>
            </VisuallyHidden>
            <ImagePreview fileUrl={fileUrl} />
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "is_received",
    header: "Recepción",
    cell: ({ row }) => {
      const isReceived = row.getValue("is_received") as boolean;

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
    accessorKey: "sent_at",
    id: "sent_at",
    meta: {
      title: "Enviado SUNAT",
    },
    header: () => (
      <div className="flex items-center gap-1.5">
        <span>Enviado SUNAT</span>
        <Badge
          variant="ghost"
          tooltipVariant="muted"
          tooltip={
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-2">Estados de SUNAT</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-600" />
                  <span>Aceptado por SUNAT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>En espera de respuesta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-destructive" />
                  <span>Rechazado (&gt;5h sin respuesta)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-gray-400" />
                  <span>No enviado</span>
                </div>
              </div>
            </div>
          }
        >
          <Info className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </Badge>
      </div>
    ),
    cell: ({ row }) => {
      const sentAt = row.getValue("sent_at") as string | null;
      const aceptadaPorSunat = row.original.aceptada_por_sunat;
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
    accessorKey: "notes",
    header: "Nota Guía",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string;
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {notes}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "note_received",
    header: "Nota Recepción",
    cell: ({ row }) => {
      const notes = row.getValue("note_received") as string;
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {notes}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "cancellation_reason",
    header: "Motivo Anulación",
    cell: ({ row }) => {
      const notes = row.getValue("cancellation_reason") as string;
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {notes}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return (
        <Badge
          color={status ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {status ? "Activo" : "Cancelado"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const {
        id,
        is_received,
        transfer_reason_id,
        status,
        sent_at,
        aceptada_por_sunat,
        requires_sunat,
      } = row.original;
      const isConsignment = !!row.original.is_consignment;
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = CONTROL_UNITS;
      const isPurchase =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA;
      const isTrasladoSede =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE;
      const isAlreadyReceived = !!is_received;
      const isAcceptedBySunat = !!(sent_at && aceptada_por_sunat === true);

      const receiveTooltip = "Recepcionar";

      /**
       * PERMISSIONS
       */

      // Para enviar a Nubefact: requiere ser enviado a SUNAT, no haber sido enviado aún y tener permiso de envío
      const canSendToNubefact =
        requires_sunat && !sent_at && permissions.canSend;

      // Para COMPRA o CONSIGNACIÓN: aceptada por SUNAT y NO estar recibido
      const canReceive =
        (isPurchase || isConsignment) &&
        isAcceptedBySunat &&
        !isAlreadyReceived &&
        permissions.canReceive;

      // Para ver detalles: requiere permiso de visualización
      const canView = permissions.canView;

      // Para consultar estado en SUNAT: requiere ser enviado a SUNAT y no estar aceptado por SUNAT
      const canConsult =
        requires_sunat &&
        !!sent_at &&
        !isAcceptedBySunat &&
        permissions.canView;

      const canViewHistory = isAcceptedBySunat && permissions.canView;
      const canMarkAsReceived =
        isTrasladoSede && !isAlreadyReceived && permissions.canReceive;

      const canGeneratePurchaseOrder =
        isConsignment &&
        isAcceptedBySunat &&
        isAlreadyReceived &&
        permissions.canGenerate;

      const canEdit =
        permissions.canUpdate && !isAlreadyReceived && !isAcceptedBySunat;

      const canDelete =
        permissions.canDelete && !isAlreadyReceived && !isAcceptedBySunat;

      const canMigrate =
        !!onMigrate &&
        isAlreadyReceived &&
        isAcceptedBySunat &&
        permissions.canMigrate;

      const canCancel =
        permissions.canAnnul &&
        isAlreadyReceived &&
        isAcceptedBySunat &&
        status;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Eye}
            canRender={canView}
            tooltip="Ver detalles"
            onClick={() => onViewDetails(row.original)}
          />

          {canViewHistory && <ShippingGuideHistory shippingGuideId={id} />}

          {canSendToNubefact && (
            <ConfirmationDialog
              title="Confirmar envío a Nubefact"
              description="¿Está seguro de que desea enviar esta guía a Nubefact/SUNAT? Esta acción no se puede deshacer."
              onConfirm={() => onSendToNubefact(id)}
              icon="info"
              confirmText="Sí, enviar"
              cancelText="No, cancelar"
              trigger={<ButtonAction icon={Send} tooltip="Enviar a Nubefact" />}
            />
          )}

          <ButtonAction
            icon={RefreshCw}
            tooltip="Consultar estado en SUNAT"
            onClick={() => onQueryFromNubefact(id)}
            canRender={canConsult}
          />

          <ButtonAction
            icon={PackageCheck}
            tooltip="Marcar como recibido"
            onClick={() => onMarkAsReceived(id)}
            canRender={canMarkAsReceived}
          />

          <ButtonAction
            icon={CarFront}
            tooltip={receiveTooltip}
            onClick={() =>
              canReceive && router(`${ABSOLUTE_ROUTE}/checklist/${id}`)
            }
            disabled={!canReceive}
            canRender={canReceive}
          />

          <ButtonAction
            icon={ShoppingCart}
            tooltip="Generar Orden de Compra de Consignación"
            onClick={() =>
              router(`${VEHICLE_PURCHASE_ORDER.ROUTE_ADD}?consignment_id=${id}`)
            }
            canRender={canGeneratePurchaseOrder}
          />

          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            canRender={canEdit}
          />

          {canDelete && <DeleteButton onClick={() => onDelete(id)} />}

          <ButtonAction
            icon={ArrowRightLeft}
            tooltip="Migrar"
            onClick={() => onMigrate && onMigrate(id)}
            canRender={canMigrate}
          />

          <ButtonAction
            icon={Ban}
            tooltip="Cancelar guía"
            onClick={() => onCancel(id)}
            color="red"
            canRender={canCancel}
          />
        </div>
      );
    },
  },
];
