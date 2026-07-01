import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Pencil,
  XCircle,
  Send,
  CarFront,
  ImageIcon,
  Download,
  Info,
  Loader2,
  RefreshCw,
  PackageCheck,
  Eye,
  Ban,
  LucideIcon,
  ArrowRightLeft,
  BookCheck,
  BookX,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import type { ShipmentsReceptionsResource } from "../lib/shipmentsReceptions.interface";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";
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
import { ButtonAction } from "@/shared/components/ButtonAction";
import ShippingGuideHistory from "@/features/ap/shipping_guides/components/ShippingGuideHistory";
import { CopyCell } from "@/shared/components/CopyCell";

export type ShipmentsReceptionsColumnsType =
  ColumnDef<ShipmentsReceptionsResource>;

interface Props {
  onDelete: (id: number) => void;
  onSendToNubefact: (id: number) => void;
  onQueryFromNubefact: (id: number) => void;
  onMarkAsReceived: (id: number) => void;
  onViewDetails: (shipment: ShipmentsReceptionsResource) => void;
  onCancel: (id: number) => void;
  onMigrate?: (id: number) => void;
  onGeneratePDI: (ap_vehicle_id: number) => void;
  onGenerateInstAccessories: (ap_vehicle_id: number) => void;
  permissions: {
    canView: boolean;
    canSend: boolean;
    canReceive: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canGenerate: boolean;
    canMigrate: boolean;
    canAnnul: boolean;
  };
}

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

export const ShipmentsReceptionsColumns = ({
  onDelete,
  onSendToNubefact,
  onQueryFromNubefact,
  onMarkAsReceived,
  onViewDetails,
  onCancel,
  onMigrate,
  onGeneratePDI,
  onGenerateInstAccessories,
  permissions,
}: Props): ShipmentsReceptionsColumnsType[] => [
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
    accessorKey: "requires_sunat",
    header: "Req. SUNAT",
    cell: ({ row }) => {
      const requires = row.getValue("requires_sunat") as boolean;
      return requires ? (
        <CheckCircle2 className="size-5 text-green-600" />
      ) : (
        <XCircle className="size-5 text-gray-400" />
      );
    },
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

        // Determinar estado y variante
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
    accessorKey: "is_accounted",
    header: "Contabilización",
    cell: ({ row }) => {
      const was_migrated = row.original.migration_status === "completed";
      const value = row.original.is_accounted;
      if (value === true) {
        return (
          <Badge variant="outline" color="green" icon={BookCheck}>
            <span>Contabilizado</span>
          </Badge>
        );
      }
      return (
        <Badge
          color={was_migrated ? "orange" : "gray"}
          variant="outline"
          icon={BookX}
        >
          <span>{was_migrated ? "No Contabilizado" : "No Migrado"}</span>
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
        sent_at,
        aceptada_por_sunat,
        is_received,
        document_type,
        transfer_reason_id,
        ap_vehicle_id,
        status,
      } = row.original;
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = SHIPMENTS_RECEPTIONS;
      const isSent = !!sent_at;
      const isGuiaRemision = document_type === "GUIA_REMISION";
      const isPurchase =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_COMPRA;
      const isTrasladoSede =
        transfer_reason_id.toString() ===
        SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE;
      const isAlreadyReceived = !!is_received;
      const isAcceptedBySunat = aceptada_por_sunat === true;

      /**
       * PERMISSIONS
       */

      const canView = permissions.canView;

      const canSendToNubefact =
        isGuiaRemision && !isSent && permissions.canSend;

      const canConsult =
        isGuiaRemision && isSent && !isAcceptedBySunat && permissions.canView;

      const canViewHistory = isGuiaRemision && permissions.canView;

      const canMarkAsReceived =
        isTrasladoSede &&
        isAcceptedBySunat &&
        !isAlreadyReceived &&
        permissions.canReceive;

      // Solo aplica para guías de remisión de compra, aceptadas por SUNAT y no recibidas
      const canReceive =
        isGuiaRemision &&
        isPurchase &&
        isAcceptedBySunat &&
        !isAlreadyReceived &&
        permissions.canReceive;

      const canEdit =
        permissions.canUpdate &&
        (isGuiaRemision ? !isSent : !isAlreadyReceived);

      const canDelete =
        permissions.canDelete &&
        (isGuiaRemision ? !isSent : !isAlreadyReceived);

      const canMigrate =
        !!onMigrate &&
        row.original.migration_status !== "completed" &&
        permissions.canMigrate;

      const canCancel =
        isGuiaRemision && isAlreadyReceived && status && permissions.canAnnul;

      const canGeneratePDI = !!ap_vehicle_id && permissions.canGenerate;

      const canGenerateAccessories = !!ap_vehicle_id && permissions.canGenerate;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Eye}
            tooltip="Ver detalles"
            onClick={() => onViewDetails(row.original)}
            canRender={canView}
          />

          {canViewHistory && <ShippingGuideHistory shippingGuideId={id} />}

          <ButtonAction
            icon={Send}
            tooltip="Enviar a Nubefact"
            onClick={() => onSendToNubefact(id)}
            canRender={canSendToNubefact}
          />

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
            tooltip="Recepcionar"
            onClick={() => router(`${ABSOLUTE_ROUTE}/checklist/${id}`)}
            canRender={canReceive}
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

          <ButtonAction
            icon={BookCheck}
            tooltip="Generar OT de PDI"
            onClick={() =>
              ap_vehicle_id && onGeneratePDI(Number(ap_vehicle_id))
            }
            canRender={canGeneratePDI}
          />

          <ButtonAction
            icon={PackageCheck}
            tooltip="Generar OT de instalación de accesorios"
            onClick={() =>
              ap_vehicle_id && onGenerateInstAccessories(Number(ap_vehicle_id))
            }
            canRender={canGenerateAccessories}
          />
        </div>
      );
    },
  },
];
