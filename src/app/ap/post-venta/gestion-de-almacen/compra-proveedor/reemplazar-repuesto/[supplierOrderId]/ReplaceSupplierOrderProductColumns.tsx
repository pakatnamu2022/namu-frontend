import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Replace } from "lucide-react";
import type {
  SupplierOrderDetailsResource,
  SupplierOrderResource,
} from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.interface.ts";

interface Props {
  order: SupplierOrderResource;
  canUpdate: boolean;
  onSelect: (detail: SupplierOrderDetailsResource) => void;
}

export const replaceSupplierOrderProductColumns = ({
  order,
  canUpdate,
  onSelect,
}: Props): ColumnDef<SupplierOrderDetailsResource>[] => [
  {
    id: "index",
    header: "#",
    enableSorting: false,
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "product.code",
    header: "Código",
    cell: ({ row }) => row.original.product?.code || "N/A",
  },
  {
    accessorKey: "product.name",
    header: "Producto",
    cell: ({ row }) => row.original.product?.name || "N/A",
  },
  {
    accessorKey: "unit_measurement.description",
    header: "U.M.",
    cell: ({ row }) =>
      row.original.product!.unit_measurement?.description || "N/A",
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
    cell: ({ getValue }) => getValue() as number,
  },
  {
    accessorKey: "unit_price",
    header: "P. Unit.",
    cell: ({ getValue }) =>
      `${order.type_currency?.symbol}${Number(getValue() as number).toFixed(2)}`,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) =>
      `${order.type_currency?.symbol}${Number(getValue() as number).toFixed(2)}`,
  },
  {
    id: "actions",
    header: "Acción",
    enableSorting: false,
    cell: ({ row }) =>
      canUpdate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(row.original)}
        >
          <Replace className="size-4 mr-2" />
          Reemplazar
        </Button>
      ),
  },
];
