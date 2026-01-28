import { DataTable } from "@/shared/components/DataTable.tsx";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface.ts";
import { InventoryColumns } from "./InventoryColumns.tsx";
import type { SortingState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: InventoryColumns[];
  data: InventoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
}

export default function InventoryTable({
  columns,
  data,
  children,
  isLoading,
  sorting,
  onSortingChange,
  manualSorting,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={onSortingChange}
        manualSorting={manualSorting}
        initialColumnVisibility={{
          quantity: true,
          available_quantity: false,
          reserved_quantity: false,
          quantity_in_transit: false,
          quantity_pending_credit_note: false,
          minimum_stock: false,
          maximum_stock: false,
          stock_status: true,
          last_movement_date: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
