import type { ColumnDef } from "@tanstack/react-table";
import { AssignBrandConsultantResource } from "../lib/assignBrandConsultant.interface";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type AssignBrandConsultantColumns =
  ColumnDef<AssignBrandConsultantResource>;

interface Props {
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
  };
}

export const assignBrandConsultantColumns = ({
  onToggleStatus,
  permissions,
}: Props): AssignBrandConsultantColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
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
    accessorKey: "brand",
    header: "Marca",
  },
  {
    accessorKey: "worker",
    header: "Asesor",
  },
  {
    accessorKey: "sales_target",
    header: "Objetivo",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, status } = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
              thumbClassName="size-4"
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn("h-5 w-9", status ? "bg-primary" : "bg-secondary")}
            />
          )}
        </div>
      );
    },
  },
];
