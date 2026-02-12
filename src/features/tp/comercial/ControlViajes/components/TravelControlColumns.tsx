"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Play, Fuel, Pencil, Eye, Truck, MapPin, User} from "lucide-react";
import { TravelControlColumnsProps, TravelControlResource } from "../lib/travelControl.interface";
import { TravelControlDetailModal } from "./TravelControlDetailModal";

export type TravelControlColumns = ColumnDef<TravelControlResource>;

export const TravelControlColumns = ({
  onStatusChange
}: TravelControlColumnsProps): TravelControlColumns[] => [
  {
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
    accessorKey: "plate",
    header: "Placa",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
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
    accessorKey: "client",
    header: "Cliente",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as TravelControlResource["status"];
      
      if (value === "pending") {
        return (
          <Badge variant="outline" className="capitalize gap-2">
            <Clock className="size-4 text-amber-500" />
            Pendiente
          </Badge>
        );
      }
      
      if (value === "in_progress") {
        return (
          <Badge variant="outline" className="capitalize gap-2">
            <Play className="size-4 text-green-500" />
            En Ruta
          </Badge>
        );
      }
      
      if (value === "completed") {
        return (
          <Badge variant="outline" className="capitalize gap-2">
            <CheckCircle className="size-4 text-blue-500" />
            Completado
          </Badge>
        );
      }
      
      if (value === "fuel_pending") {
        return (
          <Badge variant="outline" className="capitalize gap-2">
            <Fuel className="size-4 text-orange-500" />
            Combustible
          </Badge>
        );
      }
      
      return <Badge variant="outline">Desconocido</Badge>;
    },
  },
  {
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
          {status === "completed" && (
            <div className="flex items-center text-xs text-muted-foreground ml-2">
              <CheckCircle className="size-4 mr-1 text-green-600" />
              <span>Completado</span>
            </div>
          )}
        </div>
      );
    },
  },
];