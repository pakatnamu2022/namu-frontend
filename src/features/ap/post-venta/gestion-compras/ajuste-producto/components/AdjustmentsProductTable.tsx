import { DataTable } from "@/shared/components/DataTable";
import { AdjustmentsProductListItem } from "../lib/adjustmentsProduct.interface";
import { AdjustmentsProductColumns } from "./AdjustmentsProductColumns";

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
