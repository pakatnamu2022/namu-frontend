import { DataTable } from "@/shared/components/DataTable";
import { WorkOrderColumns } from "./WorkOrderColumns";
import { WorkOrderResource } from "../lib/workOrder.interface";
import type { RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: WorkOrderColumns[];
  data: WorkOrderResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean;
  getRowId?: (row: WorkOrderResource) => string;
}

export default function WorkOrderTable({
  columns,
  data,
  children,
  isLoading,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection,
  getRowId,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        enableRowSelection={enableRowSelection}
        getRowId={getRowId as any}
        initialColumnVisibility={{
          correlative: true,
          vehicle_plate: true,
          vehicle_vin: false,
          dates: true,
          actual_delivery_date: true,
          is_guarantee: true,
          is_recall: true,
          has_management_discount: false,
          is_invoiced: false,
          is_delivery: false,
          created_by_name: true,
          delivery_by_name: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
