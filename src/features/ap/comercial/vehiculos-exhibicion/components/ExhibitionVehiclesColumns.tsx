import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import type { ExhibitionVehiclesResource } from "../lib/exhibitionVehicles.interface";
import { EXHIBITION_VEHICLES } from "../lib/exhibitionVehicles.constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export type ExhibitionVehiclesColumns = ColumnDef<ExhibitionVehiclesResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const exhibitionVehiclesColumns = ({
  onDelete,
  permissions,
}: Props): ExhibitionVehiclesColumns[] => {
  const navigate = useNavigate();
  const { ROUTE } = EXHIBITION_VEHICLES;

  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
    },
    {
      accessorKey: "guia_number",
      header: "N° Guía",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.guia_number}</div>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {row.original.supplier.full_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.supplier.num_doc}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "guia_date",
      header: "Fecha Guía",
      cell: ({ row }) => (
        <span>
          {format(new Date(row.original.guia_date), "dd/MM/yyyy", {
            locale: es,
          })}
        </span>
      ),
    },
    {
      accessorKey: "llegada",
      header: "Fecha Llegada",
      cell: ({ row }) => (
        <span>
          {format(new Date(row.original.llegada), "dd/MM/yyyy", {
            locale: es,
          })}
        </span>
      ),
    },
    {
      accessorKey: "ubicacion",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {row.original.ubicacion.description}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.ubicacion.sede_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "advisor",
      header: "Asesor",
      cell: ({ row }) => (
        <span>
          {row.original.advisor?.nombre_completo || (
            <span className="text-muted-foreground italic">Sin asignar</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "vehicle_status",
      header: "Estado Vehículo",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.vehicle_status}</Badge>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const vehicleItems = row.original.items.filter(
          (item) => item.item_type === "vehicle"
        );
        const equipmentItems = row.original.items.filter(
          (item) => item.item_type === "equipment"
        );

        return (
          <div className="flex flex-col gap-1">
            {vehicleItems.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge color="default" className="w-fit">
                    {vehicleItems.length} Vehículo(s)
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {vehicleItems.map((item) => (
                      <div key={item.id} className="text-xs">
                        {item.vehicle?.vin || item.description}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {equipmentItems.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge color="secondary" className="w-fit">
                    {equipmentItems.length} Equipo(s)
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {equipmentItems.map((item) => (
                      <div key={item.id} className="text-xs">
                        {item.description} (x{item.quantity})
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dua_number",
      header: "DUA",
      cell: ({ row }) => <span>{row.original.dua_number}</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.status ? "green" : "destructive"}>
          {row.original.status ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const record = row.original;

        return (
          <div className="flex items-center gap-1">
            {permissions.canUpdate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`${ROUTE}/actualizar/${record.id}`)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar</p>
                </TooltipContent>
              </Tooltip>
            )}

            {permissions.canDelete && (
              <DeleteButton
                onClick={() => onDelete(record.id)}
              />
            )}
          </div>
        );
      },
    },
  ];
};
