import { DataTable } from "@/shared/components/DataTable";
import { AssignSalesSeriesColumns } from "./AssignSalesSeriesColumns";
import { AssignSalesSeriesResource } from "../lib/assignSalesSeries.interface";

interface Props {
  columns: AssignSalesSeriesColumns[];
  data: AssignSalesSeriesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          series: true,
          correlative_start: true,
          type_receipt: true,
          type_operation: true,
          sede: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
