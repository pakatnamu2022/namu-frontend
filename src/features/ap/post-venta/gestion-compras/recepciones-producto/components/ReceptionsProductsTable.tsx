import { DataTable } from "@/shared/components/DataTable";
import { ReceptionResource } from "../lib/receptions-products.interface";
import { ReceptionsProductsColumns } from "./ReceptionsProductsColumns";

interface Props {
  columns: ReceptionsProductsColumns[];
  data: ReceptionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ReceptionsProductsTable({
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
          purchase_order_number: true,
          reception_date: true,
          warehouse_name: true,
          supplier_invoice_number: true,
          shipping_guide_number: true,
          received_by_name: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
