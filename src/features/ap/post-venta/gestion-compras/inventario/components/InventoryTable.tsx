import { DataTable } from "@/shared/components/DataTable";
import { InventoryResource } from "../lib/inventory.interface";
import { InventoryColumns } from "./InventoryColumns";

interface Props {
  columns: InventoryColumns[];
  data: InventoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function InventoryTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
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
