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
          id: true,
          movement_date: true,
          warehouse_origin: true,
          warehouse_destination: true,
          transfer_reason: true,
          driver_name: true,
          plate: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
