import { DataTable } from "@/shared/components/DataTable";
import { ProductTransferResource } from "../lib/productTransfer.interface";
import { ProductTransferColumns } from "./ProductTransferColumns";

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
          movement_date: true,
          warehouse_code: true,
          user_name: true,
          notes: true,
          movement_type: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
