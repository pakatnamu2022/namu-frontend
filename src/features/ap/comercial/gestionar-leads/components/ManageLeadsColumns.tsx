import type { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ManageLeadsResource } from "../lib/manageLeads.interface";
import { Badge } from "@/components/ui/badge";

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
          variant: "default" | "secondary" | "destructive" | "outline";
        }
      > = {
        PENDIENTE: { label: "Pendiente", variant: "secondary" },
        VALIDADO: { label: "Validado", variant: "default" },
        ERRADO: { label: "Errado", variant: "destructive" },
        NO_ENCONTRADO: { label: "No Encontrado", variant: "outline" },
      };

      const config = statusConfig[status] || {
        label: status,
        variant: "secondary",
      };

      return <Badge variant={config.variant}>{config.label}</Badge>;
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
          variant: "default" | "secondary" | "destructive" | "outline";
          className?: string;
        }
      > = {
        Subido: {
          label: "Subido",
          variant: "secondary",
          className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        },
        Atendido: {
          label: "Atendido",
          variant: "default",
          className: "bg-green-100 text-green-700 hover:bg-green-200",
        },
        Descartado: {
          label: "Descartado",
          variant: "destructive",
          className: "bg-red-100 text-red-700 hover:bg-red-200",
        },
      };

      const config = conditionConfig[condition] || {
        label: condition,
        variant: "secondary",
      };

      return (
        <Badge variant={config.variant} className={config.className}>
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
