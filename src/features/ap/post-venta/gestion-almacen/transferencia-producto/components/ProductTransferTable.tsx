import { DataTable } from "@/shared/components/DataTable.tsx";
import { ProductTransferResource } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.interface.ts";
import { ProductTransferColumns } from "./ProductTransferColumns.tsx";

interface Props {
  columns?: ProductTransferColumns[];
  data: ProductTransferResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductTransferTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns || []}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          movement_number: true,
          warehouse_code: true,
          warehouse_destination_code: true,
          user_name: true,
          notes: true,
          movement_type: false,
          total_items: false,
          total_quantity: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
