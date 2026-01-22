import { DataTable } from "@/shared/components/DataTable.tsx";
import { AdjustmentsProductListItem } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.interface.ts";
import { AdjustmentsProductColumns } from "./AdjustmentsProductColumns.tsx";

interface Props {
  columns: AdjustmentsProductColumns[];
  data: AdjustmentsProductListItem[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AdjustmentsProductTable({
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
          movement_number: true,
          movement_type: true,
          movement_date: true,
          warehouse_code: true,
          user_name: true,
          notes: false,
          total_items: false,
          total_quantity: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
