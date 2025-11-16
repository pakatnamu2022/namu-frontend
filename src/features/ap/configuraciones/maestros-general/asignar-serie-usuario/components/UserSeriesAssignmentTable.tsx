import { DataTable } from "@/shared/components/DataTable";
import { UserSeriesAssignmentColumns } from "./UserSeriesAssignmentColumns";
import { UserSeriesAssignmentResource } from "../lib/userSeriesAssignment.interface";

interface Props {
  columns: UserSeriesAssignmentColumns[];
  data: UserSeriesAssignmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function UserSeriesAssignmentTable({
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
          worker_name: true,
          vouchers: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
