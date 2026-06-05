"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";
import ShippingGuideHistory from "@/features/ap/shipping_guides/components/ShippingGuideHistory";
import { MIGRATION_STATUS, type MigrationStatusKey } from "@/features/ap/shipping_guides/lib/shippingGuides.constants";

export type TransfersColumn = ColumnDef<ShipmentsReceptionsResource>;

interface Props {
  onViewDetails: (shipment: ShipmentsReceptionsResource) => void;
  onMigrate?: (id: number) => void;
}

export const TransfersColumns = ({
  onViewDetails,
  onMigrate,
}: Props): TransfersColumn[] => [
  {
    accessorKey: "document_number",
    header: "N° Guía Interna",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es }) : "-";
    },
  },
  {
    accessorKey: "sede_transmitter",
    header: "Sede Origen",
    cell: ({ row }) => {
      const sede = row.original.sede_transmitter;
      const desc = row.original.transmitter_description;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{sede || "-"}</span>
          {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "sede_receiver",
    header: "Sede Destino",
    cell: ({ row }) => {
      const sede = row.original.sede_receiver;
      const desc = row.original.receiver_description;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{sede || "-"}</span>
          {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
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
      const status = getValue() as MigrationStatusKey;
      const config = MIGRATION_STATUS[status];
      if (!config) return <Badge color="gray">{status ?? "-"}</Badge>;
      const Icon = config.icon;
      return (
        <Badge color={config.color} icon={Icon}>
          {config.label}
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
