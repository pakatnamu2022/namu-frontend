import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatMoney } from "@/core/core.function";
import { PurchaseOrderItemTraverse } from "../lib/electronicDocument.interface";

export type PurchaseOrderTraverseItemsColumn =
  ColumnDef<PurchaseOrderItemTraverse>;

export const purchaseOrderTraverseItemsColumns =
  (): PurchaseOrderTraverseItemsColumn[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "emission_date",
      header: "Fecha de Emisión",
      cell: ({ row }) => {
        const po = row.original.purchase_order;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {formatDate(po.emission_date) || "-"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col max-w-[280px]">
            <span className="font-medium text-sm truncate">
              {item.product_name || item.description || "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">
              cod: {item.product_code}
            </span>
            <span className="text-xs text-muted-foreground">
              dyn: {item.product_dyn_code}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "purchase_order",
      header: "Orden de Compra",
      cell: ({ row }) => {
        const po = row.original.purchase_order;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{po.number || "N/A"}</span>
            <span className="text-xs text-muted-foreground">
              {po.supplier?.full_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "saldo_disponible",
      header: "Saldo Disponible",
      cell: ({ row }) => (
        <Badge variant="outline" color="green">
          {row.original.saldo_disponible}
        </Badge>
      ),
    },
    {
      accessorKey: "unit_price",
      header: "P. Unitario",
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.original.unit_price)}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">
          {formatMoney(row.original.total)}
        </span>
      ),
    },
  ];
