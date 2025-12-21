import { DataTable } from "@/shared/components/DataTable";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { PerDiemRequestColumns } from "./PerDiemRequestColumns";

interface Props {
  columns: PerDiemRequestColumns[];
  data: PerDiemRequestResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PerDiemRequestTable({
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
          code: true,
          employee_id: true,
          start_date: true,
          end_date: true,
          days_count: true,
          total_budget: true,
          status: true,
          paid: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
