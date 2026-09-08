import type { ColumnDef } from "@tanstack/react-table";
import { ProductShelfResource } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.interface.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { ProductShelfActionCell } from "./ProductShelfActionCell.tsx";

export type ProductShelfColumns = ColumnDef<ProductShelfResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const productShelfColumns = ({
  onUpdate,
  onDelete,
  onManage,
  onToggleStatus,
  permissions,
}: Props): ProductShelfColumns[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "label",
    header: "Nombre",
  },
  {
    accessorKey: "notes",
    header: "Notas",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? value : "-";
    },
  },
  {
    accessorKey: "creator",
    header: "Creado Por",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? value : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
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
    cell: ({ row }) => (
      <ProductShelfActionCell
        row={row.original}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onManage={onManage}
        onToggleStatus={onToggleStatus}
        permissions={permissions}
      />
    ),
  },
];
