import { DataTable } from "@/shared/components/DataTable";
import { PurchaseOrderProductsResource } from "../lib/purchaseOrderProducts.interface";
import { PurchaseOrderProductsColumns } from "./PurchaseOrderProductsColumns";

interface Props {
  columns: PurchaseOrderProductsColumns[];
  data: PurchaseOrderProductsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseOrderProductsTable({
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
          order_number: true,
          supplier_name: true,
          order_date: true,
          expected_delivery_date: true,
          total_amount: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
