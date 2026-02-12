import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ManageLeadsResource } from "../lib/manageLeads.interface";
import { Badge, BadgeColor } from "@/components/ui/badge";

export type ManageLeadsColumns = ColumnDef<ManageLeadsResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canDelete: boolean;
  };
}

export const manageLeadsColumns = ({
  onDelete,
  permissions,
}: Props): ManageLeadsColumns[] => [
  {
    accessorKey: "created_at",
    header: "Fecha Registro",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "registration_date",
    header: "Fecha Derco",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "status_num_doc",
    header: "Estado Validación",
    cell: ({ getValue }) => {
      const status = getValue() as string;

      const statusConfig: Record<
        string,
        {
          label: string;
          color: BadgeColor;
        }
      > = {
        PENDIENTE: { label: "Pendiente", color: "gray" },
        VALIDADO: { label: "Validado", color: "green" },
        ERRADO: { label: "Errado", color: "orange" },
        NO_ENCONTRADO: { label: "No Encontrado", color: "red" },
      };

      const config = statusConfig[status] || {
        label: status,
        color: "default",
      };

      return (
        <Badge color={config.color} variant="outline">
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "vehicle_brand",
    header: "Marca",
  },
  {
    accessorKey: "worker",
    header: "Asesor Comercial",
  },
  {
    accessorKey: "district",
    header: "Distrito",
  },
  {
    accessorKey: "model",
    header: "Modelo",
  },
  {
    accessorKey: "version",
    header: "Versión",
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
    accessorKey: "full_name",
    header: "Nombre Completo",
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
    accessorKey: "use",
    header: "Condición",
    cell: ({ getValue }) => {
      const condition = getValue() as string;

      const conditionConfig: Record<
        string,
        {
          label: string;
          color: BadgeColor;
        }
      > = {
        Subido: {
          label: "Subido",
          color: "sky",
        },
        Atendido: {
          label: "Atendido",
          color: "green",
        },
        Descartado: {
          label: "Descartado",
          color: "orange",
        },
      };

      const config = conditionConfig[condition] || {
        label: condition,
        color: "sky",
      };

      return (
        <Badge color={config.color} variant="outline">
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
