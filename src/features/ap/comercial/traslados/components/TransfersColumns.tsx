"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRightLeft, CloudUpload } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";
import ShippingGuideHistory from "@/features/ap/shipping_guides/components/ShippingGuideHistory";
import { BookCheck, BookX } from "lucide-react";
import MigrationStatusBadge from "@/features/ap/facturacion/electronic-documents/components/MigrationStatusBadge";

export type TransfersColumn = ColumnDef<ShipmentsReceptionsResource>;

interface Props {
  onViewDetails: (shipment: ShipmentsReceptionsResource) => void;
  onMigrate?: (id: number) => void;
  onSyncWithDynamics?: (id: number) => void;
}

export const TransfersColumns = ({
  onViewDetails,
  onMigrate,
  onSyncWithDynamics,
}: Props): TransfersColumn[] => [
  {
    accessorKey: "document_number",
    header: "N° Guía Interna",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm font-semibold">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "vehicle.vin",
    header: "VIN",
    cell: ({ getValue }) => {
      const vin = getValue() as string | null | undefined;
      return <span className="font-mono text-sm">{vin || "-"}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return date
        ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })
        : "-";
    },
  },
  {
    accessorKey: "sede_transmitter",
    header: "Sede Origen",
    cell: ({ row }) => {
      const sede = row.original.sede_transmitter;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{sede || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sede_receiver",
    header: "Sede Destino",
    cell: ({ row }) => {
      const sede = row.original.sede_receiver;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{sede || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_received",
    header: "Estado",
    cell: ({ getValue }) => {
      const isReceived = getValue() as boolean | null;
      return isReceived ? (
        <Badge color="green">Recepcionado</Badge>
      ) : (
        <Badge color="blue">En tránsito</Badge>
      );
    },
  },
  {
    accessorKey: "migration_status",
    header: "Migración",
    cell: ({ getValue }) => {
      return <MigrationStatusBadge migration_status={getValue() as string} />;
    },
  },
  {
    accessorKey: "is_accounted",
    header: "Contabilización",
    cell: ({ row }) => {
      const { id, migration_status, is_accounted } = row.original;
      const was_migrated = migration_status === "completed";
      if (is_accounted === true) {
        return (
          <Badge variant="outline" color="green" icon={BookCheck}>
            <span>Contabilizado</span>
          </Badge>
        );
      }

      if (was_migrated && onSyncWithDynamics) {
        return (
          <Button
            variant="outline"
            size="xs"
            color="blue"
            onClick={() => onSyncWithDynamics(id)}
          >
            <CloudUpload className="size-3.5" />
            Sincronizar
          </Button>
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
      const { id, migration_status } = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver detalles"
            onClick={() => onViewDetails(row.original)}
          >
            <Eye className="size-4" />
          </Button>

          <ShippingGuideHistory shippingGuideId={id} />

          {onMigrate && migration_status !== "completed" && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Migrar"
              onClick={() => onMigrate(id)}
            >
              <ArrowRightLeft className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
