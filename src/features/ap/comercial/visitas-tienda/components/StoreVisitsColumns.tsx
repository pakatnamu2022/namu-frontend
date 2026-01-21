import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { StoreVisitsResource } from "../lib/storeVisits.interface";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { STORE_VISITS } from "../lib/storeVisits.constants";
import { Badge, BadgeColor } from "@/components/ui/badge";

export type StoreVisitsColumns = ColumnDef<StoreVisitsResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const storeVisitsColumns = ({
  onDelete,
  permissions,
}: Props): StoreVisitsColumns[] => [
  {
    accessorKey: "registration_date",
    header: "Fecha de Registro",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "full_name",
    header: "Nombres Completos",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "worker",
    header: "Asesor",
  },
  {
    accessorKey: "vehicle_brand",
    header: "Marca Vehículo",
  },
  {
    accessorKey: "document_type",
    header: "Tipo Documento",
  },
  {
    accessorKey: "num_doc",
    header: "N° Documento",
  },
  {
    accessorKey: "use",
    header: "Condición",
    cell: ({ getValue }) => {
      const condition = getValue() as string;

      const conditionConfig: Record<
        string,
        {
          label: string;
          color: BadgeColor;
          className?: string;
        }
      > = {
        Subido: {
          label: "Subido",
          color: "secondary",
          className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        },
        Atendido: {
          label: "Atendido",
          color: "default",
          className: "bg-green-100 text-green-700 hover:bg-green-200",
        },
        Descartado: {
          label: "Descartado",
          color: "destructive",
          className: "bg-red-100 text-red-700 hover:bg-red-200",
        },
      };

      const config = conditionConfig[condition] || {
        label: condition,
        color: "secondary",
      };

      return (
        <Badge color={config.color} className={config.className}>
          {config.label}
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
      const { id } = row.original;
      const { ROUTE_UPDATE } = STORE_VISITS;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
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

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
