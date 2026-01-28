import { DataTable } from "@/shared/components/DataTable";
import { PurchaseRequestColumns } from "./PurchaseRequestColumns";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";

interface Props {
  columns: PurchaseRequestColumns[];
  data: PurchaseRequestResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseRequestTable({
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
          request_number: true,
          request_date: true,
          delivery_date: true,
          priority: true,
          status: true,
          requested_by: true,
          observations: false,
          has_supplier_order: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
