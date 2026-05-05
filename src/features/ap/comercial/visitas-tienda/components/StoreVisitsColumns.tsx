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
    id: "days_since_registration",
    header: "Días transcurridos",
    cell: ({ row }) => {
      if (row.original.use !== "Subido") return null;
      const value = row.original.registration_date;
      if (!value) return null;
      const diff = Math.floor(
        (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24),
      );
      return <Badge color="amber">{diff} días</Badge>;
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
          color: "blue",
        },
        Atendido: {
          label: "Atendido",
          color: "green",
        },
        Descartado: {
          label: "Descartado",
          color: "red",
        },
      };

      const config = conditionConfig[condition] || {
        label: condition,
        color: "secondary",
      };

      return <Badge color={config.color}>{config.label}</Badge>;
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
