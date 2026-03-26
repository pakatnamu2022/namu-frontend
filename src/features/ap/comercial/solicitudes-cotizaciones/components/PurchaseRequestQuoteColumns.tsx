import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Check,
  Car,
  Link2Off,
  Eye,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";
import { PURCHASE_REQUEST_QUOTE } from "../lib/purchaseRequestQuote.constants";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/shared/components/ButtonAction";
import ExportButtons from "@/shared/components/ExportButtons";

export type PurchaseRequestQuoteColumns =
  ColumnDef<PurchaseRequestQuoteResource>;

interface Props {
  onApprove: (id: number) => void;
  onDownloadPdf: (id: number) => void;
  onAssignVehicle: (purchaseRequestQuote: PurchaseRequestQuoteResource) => void;
  onUnassignVehicle: (id: number) => void;
  onSwapVehicle: (purchaseRequestQuote: PurchaseRequestQuoteResource) => void;
  onViewDetail: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canApprove: boolean;
    canExport: boolean;
    canAssign: boolean;
  };
}

export const purchaseRequestQuoteColumns = ({
  onApprove,
  onDownloadPdf,
  onAssignVehicle,
  onUnassignVehicle,
  onSwapVehicle,
  onViewDetail,
  permissions,
}: Props): PurchaseRequestQuoteColumns[] => [
  {
    accessorKey: "correlative",
    header: "Correlativo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "doc_type_currency",
    header: "Moneda",
  },
  {
    accessorKey: "doc_sale_price",
    header: "P. Venta",
    cell: ({ row }) => (
      <NumberFormat
        prefix={row.original.doc_type_currency}
        value={row.original.doc_sale_price as number}
      />
    ),
  },
  {
    accessorKey: "sale_price",
    header: "P. Venta Vehículo",
    cell: ({ row }) => (
      <NumberFormat
        prefix={row.original.doc_type_currency}
        value={row.original.sale_price}
      />
    ),
  },
  {
    accessorKey: "comment",
    header: "Comentario",
  },
  {
    accessorKey: "holder",
    header: "Titular",
  },
  {
    accessorKey: "client_name",
    header: "Cliente",
  },
  {
    accessorKey: "consultant.name",
    header: "Asesor",
  },
  {
    accessorKey: "is_approved",
    header: "Aprobado",
    cell: ({ getValue }) => {
      const isApproved = getValue() as boolean;
      return (
        <Badge
          color={isApproved ? "green" : "gray"}
          icon={isApproved ? Check : X}
        >
          {isApproved ? "Aprobado" : "Pendiente"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_paid",
    header: "Pagado",
    cell: ({ getValue }) => {
      const is_paid = getValue() as boolean;
      return (
        <Badge color={is_paid ? "green" : "gray"} icon={is_paid ? Check : X}>
          {is_paid ? "Pagado" : "Pendiente Pago"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "exchange_rate",
    header: "Tipo de Cambio",
  },
  {
    accessorKey: "type_currency",
    header: "Moneda",
  },
  {
    accessorKey: "base_selling_price",
    header: "Precio Base",
    cell: ({ getValue }) => <NumberFormat value={getValue() as number} />,
  },
  {
    id: "warranty",
    header: "Garantía",
    cell: ({ row }) => {
      const { warranty_years, warranty_km } = row.original;
      if (!warranty_years || !warranty_km) return "N/A";
      return `${warranty_years} ${warranty_years === 1 ? "año" : "años"} / ${warranty_km.toLocaleString("es-PE")} km`;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "ap_vehicle",
    header: "Vehículo Asignado",
    cell: ({ getValue }) => {
      if (!getValue()) {
        return (
          <p className="text-muted-foreground uppercase text-xs">No asignado</p>
        );
      }
      const vehicle = (getValue() as string)?.split(" - ");
      const model = vehicle[0] || "";
      const vin = vehicle[1] || "";

      return (
        <div className="flex flex-col text-xs">
          <span>{model}</span>
          <span className="font-semibold text-primary">{vin}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id, is_approved } = row.original;
      const { ROUTE_UPDATE } = PURCHASE_REQUEST_QUOTE;
      const isApproved = Boolean(is_approved);
      const hasVehicle = Boolean(row.original.ap_vehicle_id);

      const canAssignVehicle = permissions.canAssign && !hasVehicle;
      const canUnassignVehicle =
        permissions.canAssign && hasVehicle && !row.original.is_paid;
      const canSwapVehicle =
        permissions.canAssign && hasVehicle && !row.original.is_paid;
      const canEdit =
        permissions.canUpdate && !row.original.is_invoiced && !hasVehicle;

      return (
        <div className="flex items-center gap-2">
          {/* PDF - Only show if user has export permission */}
          <ExportButtons
            variant="separate-icon"
            pdfVariant="outline"
            excelVariant="outline"
            onPdfDownload={() => onDownloadPdf(id)}
            disablePdf={!permissions.canExport}
          />
          {/* View Detail */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver Detalle"
            onClick={() => onViewDetail(row.original.id)}
          >
            <Eye className="size-5" />
          </Button>
          {/* Assign Vehicle */}
          {canAssignVehicle && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Asignar Vehículo"
              onClick={() => onAssignVehicle(row.original)}
            >
              <Car className="size-5" />
            </Button>
          )}
          {/* Swap Vehicle */}
          {canSwapVehicle && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Cambiar Vehículo"
              onClick={() => onSwapVehicle(row.original)}
            >
              <ArrowLeftRight className="size-5" />
            </Button>
          )}
          {/* Unassign Vehicle */}
          {canUnassignVehicle && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Desasignar Vehículo"
              onClick={() => onUnassignVehicle(id)}
            >
              <Link2Off className="size-5" />
            </Button>
          )}
          {/* Edit - Only show if user has update permission */}
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Approve - Only show if user has approve permission */}
          <ButtonAction
            variant="outline"
            className="size-7"
            tooltip="Confirmar"
            color="emerald"
            onClick={() => onApprove(id)}
            canRender={!isApproved && permissions.canApprove}
            icon={Check}
          />
        </div>
      );
    },
  },
];
