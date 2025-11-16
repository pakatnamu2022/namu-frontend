import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SedeResource } from "../lib/sede.interface";
import { SEDE } from "../lib/sede.constants";

export type SedeColumns = ColumnDef<SedeResource>;

const { ROUTE_UPDATE } = SEDE;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
}

export const sedeColumns = ({
  onDelete,
  onToggleStatus,
}: Props): SedeColumns[] => [
  {
    accessorKey: "abreviatura",
    header: "Abreviatura",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "dyn_code",
    header: "Cod. Dynamic",
  },
  {
    accessorKey: "establishment",
    header: "Establecimiento",
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
  },
  {
    accessorKey: "company",
    header: "Empresa",
  },
  {
    accessorKey: "district",
    header: "Distrito",
  },
  {
    accessorKey: "province",
    header: "Provincia",
  },
  {
    accessorKey: "department",
    header: "Departamento",
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
      const router = useRouter();
      const { id, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          <Switch
            checked={status}
            thumbClassName="size-4"
            onCheckedChange={(checked) => onToggleStatus(id, checked)}
            className={cn("h-5 w-9", status ? "bg-primary" : "bg-secondary")}
          />
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router.push(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>

          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
