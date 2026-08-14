import { DataTable } from "@/shared/components/DataTable";
import { PurchaseOrdersColumns } from "./PurchaseOrdersColumns";
import { PurchaseOrdersResource } from "../lib/purchaseOrders.interface";

interface Props {
  columns: PurchaseOrdersColumns[];
  data: PurchaseOrdersResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseOrdersTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
