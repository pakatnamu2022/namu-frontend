import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { CAMPAIGN } from "../lib/campaign.constants";
import { CampaignResource } from "../lib/campaign.interface";

export type CampaignColumns = ColumnDef<CampaignResource>;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const campaignColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
}: Props): CampaignColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "area",
    header: "Área",
    cell: ({ row }) => {
      const area = row.original.area;
      return area ? area.description : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "start_date",
    header: "Fecha Inicio",
  },
  {
    accessorKey: "end_date",
    header: "Fecha Fin",
  },
  {
    accessorKey: "discount_type",
    header: "Tipo Descuento",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge color="secondary" className="capitalize">
          {value === "fixed" ? "Fijo" : "Porcentaje"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "discount_value",
    header: "Valor Descuento",
    cell: ({ row }) => {
      const { discount_value, discount_type } = row.original;
      return discount_type === "percentage"
        ? `${discount_value}%`
        : `S/ ${discount_value}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean | null;
      if (value === null)
        return <span className="text-muted-foreground">-</span>;
      return (
        <Badge
          color={value ? "default" : "secondary"}
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
      const router = useNavigate();
      const { id, status } = row.original;
      const { ROUTE_UPDATE } = CAMPAIGN;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status ?? false}
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn(status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
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
