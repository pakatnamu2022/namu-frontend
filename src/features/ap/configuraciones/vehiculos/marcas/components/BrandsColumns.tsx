"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandsResource } from "../lib/brands.interface";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BRAND, BRAND_POSTVENTA } from "../lib/brands.constants";

export type BrandColumns = ColumnDef<BrandsResource>;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
  isCommercial?: boolean;
}

export const brandsColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
  isCommercial = true,
}: Props): BrandColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "dyn_code",
    header: "Cod. Dynamics",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "group",
    header: "Grupo",
  },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ getValue }) => {
      const url = getValue() as string;
      return url ? (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-blue-500 shadow">
          <img
            src={url}
            alt="Logo"
            className="w-12 h-12 object-contain rounded-full"
          />
        </div>
      ) : null;
    },
  },
  {
    accessorKey: "logo_min",
    header: "Logo Min",
    cell: ({ getValue }) => {
      const url = getValue() as string;
      return url ? (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-400 shadow">
          <img
            src={url}
            alt="Logo Min"
            className="w-12 h-12 object-contain rounded-full"
          />
        </div>
      ) : null;
    },
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
      const { ROUTE_UPDATE } = isCommercial ? BRAND : BRAND_POSTVENTA;
      const router = useRouter();
      const { id, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
              thumbClassName="size-4"
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn("h-5 w-9", status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router.push(`${ROUTE_UPDATE}/${id}`)}
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
