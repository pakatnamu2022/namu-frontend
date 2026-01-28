"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Play,
  Fuel,
  Pencil,
  Eye,
  Truck,
  MapPin,
  User,
} from "lucide-react";
import {
  TravelControlColumnsProps,
  TravelControlResource,
} from "../lib/travelControl.interface";
import { TravelControlDetailModal } from "./TravelControlDetailModal";

export type TravelControlColumns = ColumnDef<TravelControlResource>;

export const TravelControlColumns = ({
  onStatusChange,
}: TravelControlColumnsProps): TravelControlColumns[] => [
  {
    enableSorting: false,
    accessorKey: "tripNumber",
    header: "N° Viaje",
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        <span className="font-semibold">{getValue() as string}</span>
      </div>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "plate",
    header: "Placa",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "driver.name",
    header: "Conductor",
    cell: ({ row }) => {
      const driver = row.original.driver;
      return (
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{driver?.name}</span>
        </div>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "route",
    header: "Ruta",
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate max-w-[200px]">{getValue() as string}</span>
      </div>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "client",
    header: "Cliente",
  },
  {
    enableSorting: false,
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as TravelControlResource["status"];

      if (value === "pending") {
        return (
          <Badge color="amber" className="capitalize gap-2">
            <Clock className="size-4" />
            Pendiente
          </Badge>
        );
      }

      if (value === "in_progress") {
        return (
          <Badge color="blue" className="capitalize gap-2">
            <Play className="size-4" />
            En Ruta
          </Badge>
        );
      }

      if (value === "completed") {
        return (
          <Badge color="green" className="capitalize gap-2">
            <CheckCircle className="size-4" />
            Completado
          </Badge>
        );
      }

      if (value === "fuel_pending") {
        return (
          <Badge color="orange" className="capitalize gap-2">
            <Fuel className="size-4" />
            Combustible
          </Badge>
        );
      }

      return <Badge variant="outline">Desconocido</Badge>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "totalKm",
    header: "Km",
    cell: ({ getValue }) => {
      const value = getValue() as number | undefined;
      return value ? (
        <span className="font-semibold">{value} km</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "totalHours",
    header: "Horas",
    cell: ({ getValue }) => {
      const value = getValue() as number | undefined;
      return value ? (
        <span className="font-semibold">{value.toFixed(2)} h</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "tonnage",
    header: "Toneladas",
    cell: ({ getValue }) => {
      const value = getValue() as number | undefined;
      return value ? (
        <span className="font-semibold">{value} ton</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    header: "Acciones",
    cell: ({ row }) => {
      const trip = row.original;
      const { status } = trip;
      const showEdit = status !== "completed";

      return (
        <div className="flex items-center gap-1">
          <TravelControlDetailModal
            trip={trip}
            onStatusChange={onStatusChange}
            trigger={
              <Button
                tooltip="Ver Detalles y Gestionar"
                variant="outline"
                size="icon"
                className="size-7"
                title="Gestionar viaje"
              >
                <Eye className="size-4" />
              </Button>
            }
          />

          {/* Editar */}
          {showEdit && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              title="Editar viaje"
            >
              <Pencil className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
