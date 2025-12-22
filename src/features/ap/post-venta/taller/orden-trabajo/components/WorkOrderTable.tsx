import { DataTable } from "@/shared/components/DataTable";
import { WorkOrderColumns } from "./WorkOrderColumns";
import { WorkOrderResource } from "../lib/workOrder.interface";

interface Props {
  columns: WorkOrderColumns[];
  data: WorkOrderResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WorkOrderTable({
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
          correlative: true,
          vehicle_plate: true,
          vehicle_vin: false,
          mileage: true,
          fuel_level: false,
          opening_date: true,
          estimated_delivery_date: false,
          actual_delivery_date: false,
          is_guarantee: true,
          is_recall: true,
          is_invoiced: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
