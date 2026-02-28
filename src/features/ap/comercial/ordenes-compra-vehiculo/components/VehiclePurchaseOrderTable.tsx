import { DataTable } from "@/shared/components/DataTable";
import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import { VehiclePurchaseOrderColumns } from "./VehiclePurchaseOrderColumns";

interface Props {
  columns: VehiclePurchaseOrderColumns[];
  data: VehiclePurchaseOrderResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehiclePurchaseOrderTable({
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
          number: true,
          number_guide: true,
          supplier: true,
          invoice_series: false,
          invoice_number: false,
          receipt_dynamics: true,
          subtotal: false,
          total: true,
          warehouse: false,
          sede: false,
          status: true,
          credit_note_dynamics: false,
          creator_name: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
